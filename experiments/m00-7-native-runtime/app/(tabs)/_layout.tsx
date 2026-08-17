import { Tabs } from "expo-router";

export default function TestTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Lista" }} />
      <Tabs.Screen name="create" options={{ title: "Crear" }} />
    </Tabs>
  );
}
