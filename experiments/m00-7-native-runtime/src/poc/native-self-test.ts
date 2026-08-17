import Storage from "expo-sqlite/kv-store";
import { electroCraftDataProvider } from "../data/electrocraft-data-provider";
import { ensureNativeSchema } from "../db/runtime";
import { RUNTIME_STATE_KEY, useNativeRuntimeStore } from "../state/runtime-store";

export type NativeSelfTestResult = {
  status: "PASS_NATIVE_RUNTIME";
  sqlite: true;
  drizzle: true;
  dataProvider: true;
  zustandPersistence: true;
  recordCount: number;
};

export async function runNativeSelfTest(): Promise<NativeSelfTestResult> {
  await ensureNativeSchema();
  await electroCraftDataProvider.create({
    resource: "content_records",
    variables: { id: "m007-self-test", modelKey: "article", title: "POC Native" },
  });
  const listed = await electroCraftDataProvider.getList({ resource: "content_records", pagination: { mode: "off" } });
  await useNativeRuntimeStore.persist.rehydrate();
  useNativeRuntimeStore.setState({ draftCount: 7 });
  await new Promise((resolve) => setTimeout(resolve, 80));
  const persisted = await Storage.getItem(RUNTIME_STATE_KEY);
  if (!persisted || !persisted.includes('"draftCount":7')) throw new Error("Zustand SQLite persistence did not round-trip");
  const result: NativeSelfTestResult = {
    status: "PASS_NATIVE_RUNTIME",
    sqlite: true,
    drizzle: true,
    dataProvider: true,
    zustandPersistence: true,
    recordCount: listed.total,
  };
  console.log("M007_NATIVE_RUNTIME_PASS", JSON.stringify(result));
  return result;
}
