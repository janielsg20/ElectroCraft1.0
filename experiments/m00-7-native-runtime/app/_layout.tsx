import { Refine } from "@refinedev/core";
import { Stack } from "expo-router";
import { electroCraftDataProvider } from "../src/data/electrocraft-data-provider";

export default function RootLayout() {
  return (
    <Refine dataProvider={electroCraftDataProvider} resources={[{ name: "content_records" }]}>
      <Stack>
        <Stack.Screen name="index" options={{ title: "POC técnico" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="guarded" options={{ title: "Guarded" }} />
        <Stack.Screen name="signin" options={{ title: "Acceso" }} />
      </Stack>
    </Refine>
  );
}
