import { Button, Text, View } from "react-native";
import { useNativeRuntimeStore } from "../src/state/runtime-store";

export default function SignInScreen() {
  const setAuthenticated = useNativeRuntimeStore((state) => state.setAuthenticated);
  return (
    <View style={{ padding: 24, gap: 16 }}>
      <Text>Inicio de sesión requerido</Text>
      <Button title="Autorizar POC" onPress={() => setAuthenticated(true)} />
    </View>
  );
}
