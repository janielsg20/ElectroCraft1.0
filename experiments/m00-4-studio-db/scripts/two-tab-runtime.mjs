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
  logLevel: "warn",
});
await server.listen();

const result = {
  status: "RUNNING",
  browser: "chromium",
  url: "http://127.0.0.1:4173/harness/",
  checks: {},
  tabs: {},
};

let browser;
try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const pageA = await context.newPage();
  const pageB = await context.newPage();

  for (const page of [pageA, pageB]) {
    page.on("console", (message) => {
      if (message.type() === "error") console.error(`browser console: ${message.text()}`);
    });
    await page.goto(result.url, { waitUntil: "networkidle" });
    await page.waitForFunction(() => document.documentElement.dataset.m004Ready === "true");
  }

  const writeA = await pageA.evaluate(() => window.__M004.writeProbe({ writerTabId: "tab-a", sequence: 1 }));
  const readB = await pageB.evaluate(() => window.__M004.readProbe());
  assert.equal(readB.row.payload.writerTabId, "tab-a");
  assert.equal(readB.row.payload.sequence, 1);
  result.checks.tabAWriteVisibleInTabB = true;

  const writeB = await pageB.evaluate(() => window.__M004.writeProbe({ writerTabId: "tab-b", sequence: 2 }));
  const readA = await pageA.evaluate(() => window.__M004.readProbe());
  assert.equal(readA.row.payload.writerTabId, "tab-b");
  assert.equal(readA.row.payload.sequence, 2);
  result.checks.tabBWriteVisibleInTabA = true;

  result.tabs.a = { tabId: writeA.tabId, ready: writeA.ready, isLeader: readA.isLeader };
  result.tabs.b = { tabId: writeB.tabId, ready: writeB.ready, isLeader: readB.isLeader };
  assert.equal(result.tabs.a.ready, true);
  assert.equal(result.tabs.b.ready, true);
  assert.notEqual(result.tabs.a.tabId, result.tabs.b.tabId);
  result.checks.twoDistinctWorkerClients = true;

  await pageA.evaluate(() => window.__M004.closeClient());
  await pageB.evaluate(() => window.__M004.closeClient());
  await pageA.reload({ waitUntil: "networkidle" });
  await pageA.waitForFunction(() => document.documentElement.dataset.m004Ready === "true");
  const reopened = await pageA.evaluate(() => window.__M004.readProbe());
  assert.equal(reopened.row.payload.writerTabId, "tab-b");
  assert.equal(reopened.row.payload.sequence, 2);
  result.checks.closeReopenPersistence = true;

  await pageA.evaluate(() => window.__M004.closeClient());
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
