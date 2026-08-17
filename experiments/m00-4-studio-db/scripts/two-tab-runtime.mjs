import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { createServer } from "vite";

const root = new URL("..", import.meta.url).pathname;
const artifactPath = join(root, "artifacts/two-tab-runtime.json");
await mkdir(join(root, "artifacts"), { recursive: true });

const server = await createServer({
  root,
  server: { host: "127.0.0.1", port: 4173, strictPort: true },
  optimizeDeps: {
    include: [
      "@electric-sql/pglite",
      "@electric-sql/pglite/worker",
      "drizzle-orm",
      "drizzle-orm/pglite",
    ],
  },
  logLevel: "warn",
});
await server.listen();

const result = {
  status: "RUNNING",
  browser: "chromium",
  url: "http://127.0.0.1:4173/harness/",
  checks: {},
  tabs: {},
  transientNavigationRetries: 0,
};

async function waitHarnessReady(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForFunction(() => document.documentElement.dataset.m004Ready === "true");
}

async function invoke(page, operationName, argument) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await waitHarnessReady(page);
      return await page.evaluate(
        async ({ operationName: name, argument: value }) => window.__M004[name](value),
        { operationName, argument },
      );
    } catch (error) {
      lastError = error;
      const message = String(error?.message ?? error);
      if (!/Execution context was destroyed|navigation|Target page, context or browser has been closed/i.test(message)) {
        throw error;
      }
      result.transientNavigationRetries += 1;
      await page.waitForTimeout(150);
    }
  }
  throw lastError;
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  // Warm the Vite dependency graph and the persistent PGlite filesystem before
  // opening the two clients used for the actual multi-tab contract. Vite can
  // legitimately reload once while optimizing browser dependencies.
  const warmup = await context.newPage();
  await warmup.goto(result.url, { waitUntil: "networkidle" });
  await invoke(warmup, "readProbe");
  await invoke(warmup, "closeClient");
  await warmup.close();
  result.checks.viteAndPgliteWarmup = true;

  const pageA = await context.newPage();
  const pageB = await context.newPage();

  for (const page of [pageA, pageB]) {
    page.on("console", (message) => {
      if (message.type() === "error") console.error(`browser console: ${message.text()}`);
    });
    await page.goto(result.url, { waitUntil: "networkidle" });
    await waitHarnessReady(page);
  }

  // Initialize both clients before assertions so leader election/migrations are
  // complete and the measurements below exercise stable concurrent clients.
  const initialA = await invoke(pageA, "readProbe");
  const initialB = await invoke(pageB, "readProbe");
  assert.equal(initialA.ready, true);
  assert.equal(initialB.ready, true);
  result.checks.bothClientsReady = true;

  const writeA = await invoke(pageA, "writeProbe", { writerTabId: "tab-a", sequence: 1 });
  const readB = await invoke(pageB, "readProbe");
  assert.equal(readB.row.payload.writerTabId, "tab-a");
  assert.equal(readB.row.payload.sequence, 1);
  result.checks.tabAWriteVisibleInTabB = true;

  const writeB = await invoke(pageB, "writeProbe", { writerTabId: "tab-b", sequence: 2 });
  const readA = await invoke(pageA, "readProbe");
  assert.equal(readA.row.payload.writerTabId, "tab-b");
  assert.equal(readA.row.payload.sequence, 2);
  result.checks.tabBWriteVisibleInTabA = true;

  result.tabs.a = { tabId: writeA.tabId, ready: writeA.ready, isLeader: readA.isLeader };
  result.tabs.b = { tabId: writeB.tabId, ready: writeB.ready, isLeader: readB.isLeader };
  assert.equal(result.tabs.a.ready, true);
  assert.equal(result.tabs.b.ready, true);
  assert.notEqual(result.tabs.a.tabId, result.tabs.b.tabId);
  result.checks.twoDistinctWorkerClients = true;

  await invoke(pageA, "closeClient");
  await invoke(pageB, "closeClient");
  await pageA.reload({ waitUntil: "networkidle" });
  await waitHarnessReady(pageA);
  const reopened = await invoke(pageA, "readProbe");
  assert.equal(reopened.row.payload.writerTabId, "tab-b");
  assert.equal(reopened.row.payload.sequence, 2);
  result.checks.closeReopenPersistence = true;

  await invoke(pageA, "closeClient");
  result.status = "PASS_TWO_TAB";
  await writeFile(artifactPath, JSON.stringify(result, null, 2));
  console.log(`PASS two-tab runtime real: ${JSON.stringify(result)}`);
} catch (error) {
  result.status = "FAIL_TWO_TAB";
  result.error = String(error?.stack ?? error);
  await writeFile(artifactPath, JSON.stringify(result, null, 2));
  throw error;
} finally {
  await browser?.close();
  await server.close();
}
