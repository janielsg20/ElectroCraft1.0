import { validateCanonicalDocument, assertNoPuckInternals } from "./canonical-document.mjs";

export const puckConfigContract = Object.freeze({
  components: {
    Container: {
      fields: {
        semanticElement: { type: "select", options: ["div", "main", "section", "article"] },
        gap: { type: "number" },
        children: { type: "slot", allow: ["Container", "Text", "Button"] }
      },
      defaultProps: { semanticElement: "div", gap: 16, children: [] }
    },
    Text: { fields: { text: { type: "text" } }, defaultProps: { text: "Texto" } },
    Button: {
      fields: { label: { type: "text" }, actionId: { type: "text" } },
      defaultProps: { label: "Botón", actionId: "" }
    }
  }
});

const nodeToPuck = (node) => {
  const props = { id: node.id, ...structuredClone(node.props) };
  if (node.type === "Container") props.children = node.children.map(nodeToPuck);
  return { type: node.type, props };
};

export function canonicalToPuckData(document) {
  validateCanonicalDocument(document);
  return {
    root: { props: { title: document.id } },
    content: document.nodes.map(nodeToPuck)
  };
}

const puckToNode = (component) => {
  if (!component || !["Container", "Text", "Button"].includes(component.type)) {
    throw new Error(`Componente Puck no mapeable: ${component?.type}`);
  }
  const { id, children = [], ...rest } = component.props || {};
  if (!id) throw new Error(`Componente Puck sin id: ${component.type}`);
  return {
    id,
    type: component.type,
    props: structuredClone(rest),
    children: component.type === "Container" ? children.map(puckToNode) : []
  };
};

export function puckDataToCanonical(data, documentId = "screen-home") {
  if (!data || !Array.isArray(data.content)) throw new Error("Puck Data inválido");
  const document = {
    schemaVersion: 1,
    id: documentId,
    kind: "screen",
    nodes: data.content.map(puckToNode)
  };
  validateCanonicalDocument(document);
  assertNoPuckInternals(document);
  return document;
}

export function createOnActionSync({ onDocument, documentId = "screen-home" }) {
  if (typeof onDocument !== "function") throw new TypeError("onDocument requerido");
  return (action, newState, previousState) => {
    if (!action || typeof action.type !== "string") throw new Error("PuckAction inválida");
    const document = puckDataToCanonical(newState.data, documentId);
    onDocument(document, { actionType: action.type, previousState });
    return document;
  };
}
