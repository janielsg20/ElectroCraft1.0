import { useList, type BaseRecord, type HttpError } from "@refinedev/core";
import { FlatList, Text, View } from "react-native";

type NativeRecord = BaseRecord & { id: string; modelKey?: string; title?: string };

export default function NativeListScreen() {
  const { result, query } = useList<NativeRecord, HttpError>({ resource: "content_records", pagination: { mode: "off" } });
  if (query.isLoading) return <Text>Cargando…</Text>;
  if (query.isError) return <Text>Error: {query.error.message}</Text>;
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Lista nativa Refine + Expo SQLite</Text>
      <FlatList
        data={result.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <Text>{String(item.title ?? item.id)}</Text>}
        ListEmptyComponent={<Text>Sin registros</Text>}
      />
    </View>
  );
}
