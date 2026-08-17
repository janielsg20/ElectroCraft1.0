import { Button, FlatList, Text, View } from "react-native";

export type NativeCanonicalNode =
  | { id: string; type: "Container"; children: NativeCanonicalNode[] }
  | { id: string; type: "Text"; text: string }
  | { id: string; type: "Button"; label: string; actionId?: string }
  | { id: string; type: "List"; items: Array<{ id: string; label: string }> };

export function NativeCanonicalRenderer({ node, onAction }: { node: NativeCanonicalNode; onAction?: (actionId: string) => void }) {
  switch (node.type) {
    case "Container":
      return <View style={{ gap: 12 }}>{node.children.map((child) => <NativeCanonicalRenderer key={child.id} node={child} onAction={onAction} />)}</View>;
    case "Text":
      return <Text>{node.text}</Text>;
    case "Button":
      return <Button title={node.label} onPress={() => node.actionId && onAction?.(node.actionId)} />;
    case "List":
      return <FlatList data={node.items} keyExtractor={(item) => item.id} renderItem={({ item }) => <Text>{item.label}</Text>} />;
  }
}
