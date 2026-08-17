import { createBrowserStudioDbClient } from "../src/browser/client.mjs";
import { upsertProject, saveProjectObject, getProjectObject } from "../src/repository.mjs";

const request = document.querySelector("#request");
const result = document.querySelector("#result");
const validation = document.querySelector("#validation");
const run = document.querySelector("#run");
const tabId = crypto.randomUUID();
let handlePromise;

async function getHandle() {
  handlePromise ??= createBrowserStudioDbClient();
  return handlePromise;
}

async function ensureProject(db) {
  await upsertProject(db, { id: "m00-4-browser", name: "M00.4 Browser", status: "active", metadata: {} });
}

async function writeProbe(payload = {}) {
  const { client, db } = await getHandle();
  await ensureProject(db);
  await saveProjectObject(db, {
    projectId: "m00-4-browser",
    objectId: "shared-worker-probe",
    kind: "diagnostic",
    // `version` is the small integer schema/object format version. Temporal or
    // write-order data belongs in the canonical payload, never in this column.
    version: 1,
    payload: {
      writerTabId: payload.writerTabId ?? tabId,
      sequence: payload.sequence ?? 0,
      writtenAt: new Date().toISOString(),
    },
  });
  const row = await getProjectObject(db, "m00-4-browser", "shared-worker-probe");
  return { row, ready: client.ready, isLeader: client.isLeader, tabId };
}

async function readProbe() {
  const { client, db } = await getHandle();
  await ensureProject(db);
  const row = await getProjectObject(db, "m00-4-browser", "shared-worker-probe");
  return { row, ready: client.ready, isLeader: client.isLeader, tabId };
}

async function closeClient() {
  if (!handlePromise) return;
  const { close } = await handlePromise;
  await close();
  handlePromise = undefined;
}

window.__M004 = { tabId, writeProbe, readProbe, closeClient };

document.documentElement.dataset.m004Ready = "true";

run.addEventListener("click", async () => {
  request.textContent = JSON.stringify({ tabId, action: "write/read shared object" }, null, 2);
  try {
    const probe = await writeProbe({ writerTabId: tabId, sequence: Date.now() });
    result.textContent = JSON.stringify(probe.row, null, 2);
    validation.textContent = JSON.stringify({ ready: probe.ready, isLeader: probe.isLeader, tabId }, null, 2);
  } catch (error) {
    validation.textContent = `ERROR: ${error?.stack ?? error}`;
  }
});
