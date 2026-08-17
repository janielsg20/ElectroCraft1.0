import { useEffect, useState } from "react";
import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { runNativeSelfTest, type NativeSelfTestResult } from "../src/poc/native-self-test";
import { NativeCanonicalRenderer, type NativeCanonicalNode } from "../src/render/native-renderer";

const fixture: NativeCanonicalNode = {
  id: "root",
  type: "Container",
  children: [
    { id: "title", type: "Text", text: "POC técnico — Native runtime" },
    { id: "button", type: "Button", label: "Acción canónica", actionId: "noop" },
    { id: "list", type: "List", items: [{ id: "one", label: "Container / Text / Button / List" }] },
  ],
};

export default function PocHome() {
  const [result, setResult] = useState<NativeSelfTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    runNativeSelfTest().then(setResult).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)));
  }, []);
  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <NativeCanonicalRenderer node={fixture} />
      <View accessibilityLabel="native-runtime-validation">
        <Text>{error ? `M00.7 runtime ERROR: ${error}` : result ? "M00.7 runtime OK" : "M00.7 runtime ejecutando"}</Text>
        {result ? <Text>{JSON.stringify(result)}</Text> : null}
      </View>
      <Link href="/(tabs)">Abrir flujo Refine Native</Link>
      <Link href="/guarded">Abrir ruta protegida</Link>
    </ScrollView>
  );
}
