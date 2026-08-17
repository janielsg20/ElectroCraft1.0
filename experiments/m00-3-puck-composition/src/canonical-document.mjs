const ALLOWED_TYPES = new Set(["Container", "Text", "Button"]);
const FORBIDDEN_KEYS = new Set([
  "zones", "indexes", "ui", "selectedItem", "history", "draggedItem",
  "destinationZone", "sourceZone", "readOnly", "puck", "Puck"
]);

export function makeSectionPreset(id = "section") {
  return {
    id,
    type: "Container",
    props: { semanticElement: "section", gap: 16 },
    children: []
  };
}

export function validateCanonicalDocument(document) {
  if (!document || document.schemaVersion !== 1 || document.kind !== "screen") {
    throw new Error("ElectroCraftDocument inválido");
  }
  if (!Array.isArray(document.nodes)) throw new Error("nodes debe ser un arreglo");
  const ids = new Set();
  const visit = (node) => {
    if (!node || !ALLOWED_TYPES.has(node.type)) throw new Error(`Tipo canónico no soportado: ${node?.type}`);
    if (!node.id || ids.has(node.id)) throw new Error(`ID inválido o duplicado: ${node.id}`);
    ids.add(node.id);
    if (!node.props || typeof node.props !== "object" || Array.isArray(node.props)) throw new Error(`props inválidas: ${node.id}`);
    if (!Array.isArray(node.children)) throw new Error(`children inválido: ${node.id}`);
    for (const key of Object.keys(node)) {
      if (FORBIDDEN_KEYS.has(key)) throw new Error(`Internal Puck prohibido: ${key}`);
    }
    for (const key of Object.keys(node.props)) {
      if (FORBIDDEN_KEYS.has(key)) throw new Error(`Internal Puck prohibido en props: ${key}`);
    }
    node.children.forEach(visit);
  };
  document.nodes.forEach(visit);
  return true;
}

export function assertNoPuckInternals(value) {
  const walk = (current, path = "$") => {
    if (!current || typeof current !== "object") return;
    for (const [key, child] of Object.entries(current)) {
      if (FORBIDDEN_KEYS.has(key)) throw new Error(`Internal Puck detectado en ${path}.${key}`);
      walk(child, `${path}.${key}`);
    }
  };
  walk(value);
  return true;
}
