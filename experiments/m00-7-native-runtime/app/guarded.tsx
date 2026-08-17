import { Redirect } from "expo-router";
import { Text } from "react-native";
import { useNativeRuntimeStore } from "../src/state/runtime-store";

export default function GuardedScreen() {
  const authenticated = useNativeRuntimeStore((state) => state.authenticated);
  if (!authenticated) {
    console.log("M007_ROUTE_GUARD_REDIRECT_SIGNIN");
    return <Redirect href="/signin" />;
  }
  return <Text>Ruta protegida autorizada</Text>;
}
