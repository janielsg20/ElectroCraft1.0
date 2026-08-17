export type StreamLifecycleState = "Inicial" | "Cargando" | "Completado" | "Error" | "Cancelado" | "Incompleto";

export type StreamLifecycleEvent =
  | { type: "start" }
  | { type: "finish"; finishReason: string }
  | { type: "error" }
  | { type: "abort" };

export function reduceStreamState(current: StreamLifecycleState, event: StreamLifecycleEvent): StreamLifecycleState {
  if (event.type === "start") return "Cargando";
  if (event.type === "error") return "Error";
  if (event.type === "abort") return "Cancelado";
  if (event.type === "finish") {
    if (event.finishReason === "length" || event.finishReason === "content-filter" || event.finishReason === "error") {
      return "Incompleto";
    }
    return "Completado";
  }
  return current;
}
