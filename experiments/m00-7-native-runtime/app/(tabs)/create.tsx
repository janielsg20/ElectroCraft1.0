import { useCreate, type BaseRecord, type HttpError } from "@refinedev/core";
import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useNativeRuntimeStore } from "../../src/state/runtime-store";

type NativeRecord = BaseRecord & { id: string; title?: string };
type CreateValues = { modelKey: string; title: string };

export default function NativeCreateScreen() {
  const [title, setTitle] = useState("");
  const incrementDraftCount = useNativeRuntimeStore((state) => state.incrementDraftCount);
  const { mutate, mutation } = useCreate<NativeRecord, HttpError, CreateValues>({ resource: "content_records" });
  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text>Crear registro</Text>
      <TextInput accessibilityLabel="Título" value={title} onChangeText={setTitle} placeholder="Título" style={{ borderWidth: 1, padding: 12 }} />
      <Button
        title={mutation.isPending ? "Guardando…" : "Guardar"}
        disabled={!title.trim() || mutation.isPending}
        onPress={() => mutate(
          { values: { modelKey: "article", title: title.trim() } },
          { onSuccess: () => { incrementDraftCount(); setTitle(""); } },
        )}
      />
      {mutation.isError ? <Text>Error: {mutation.error.message}</Text> : null}
      {mutation.isSuccess ? <Text>Guardado</Text> : null}
    </View>
  );
}
