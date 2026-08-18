// @ts-check
/** @typedef {'exact'|'adapted'|'blocked'} CapabilityLevel */
/** @typedef {{capability:string,level:CapabilityLevel,note:string}} CapabilityItem */
/** @typedef {{target:'capacitor'|'lamp'|'wordpress',items:CapabilityItem[],summary:{exact:number,adapted:number,blocked:number}}} CapabilityResult */

const matrix = {
  capacitor: [
    ['screen.container-text','exact','El Web runtime conserva Container/Text.'],
    ['form','exact','Formulario HTML del runtime web.'],
    ['route','adapted','La ruta vive dentro del WebView de Capacitor.'],
    ['internal-data','adapted','El POC conserva contrato; persistencia final depende del perfil Web elegido.'],
    ['screen-state','exact','Estado de pantalla permanece en JavaScript.'],
    ['action-graph','adapted','Los nodos se compilan a handlers del runtime web.'],
    ['role','adapted','La autorización real se resuelve en el boundary de datos/servidor.'],
  ],
  lamp: [
    ['screen.container-text','exact','HTML semántico renderizado por PHP.'],
    ['form','adapted','POST server-side protegido por Slim-CSRF.'],
    ['route','exact','ElectroCraftRouteDefinition se mapea a Slim 4.'],
    ['internal-data','adapted','Appointment se persiste con PDO/MySQL y statements preparados.'],
    ['screen-state','adapted','Draft de pantalla permanece en cliente/request, no se fuerza a PHP global.'],
    ['action-graph','adapted','Validar/crear/refrescar se divide en handler + respuesta HTTP.'],
    ['role','adapted','Capability de rol se aplica como policy/middleware en el runtime final.'],
  ],
  wordpress: [
    ['screen.container-text','adapted','Container/Text se mapean a bloques core.'],
    ['form','adapted','Form requiere bloque dinámico del Companion Plugin por semántica server-side.'],
    ['route','adapted','La pantalla pública se expresa como template; API usa REST nativa.'],
    ['internal-data','adapted','Appointment se mapea a CPT con show_in_rest.'],
    ['screen-state','adapted','Draft interactivo queda en JS/HTML; contenido persistente en WordPress.'],
    ['action-graph','adapted','Mutation usa REST/nonce/capability checks.'],
    ['role','adapted','Role capability se mapea a capacidades nativas de WordPress.'],
  ],
};

/** @param {'capacitor'|'lamp'|'wordpress'} target @returns {CapabilityResult} */
export function analyzeTargetCapabilities(target) {
  const rows = matrix[target];
  if (!rows) throw new Error(`Unknown target: ${target}`);
  const items = rows.map(([capability,level,note])=>({capability,level:/** @type {CapabilityLevel} */(level),note}));
  const summary = { exact:0, adapted:0, blocked:0 };
  for (const item of items) summary[item.level] += 1;
  return {target,items,summary};
}

export function analyzeAllTargets() {
  return /** @type {const} */ (['capacitor','lamp','wordpress']).map(analyzeTargetCapabilities);
}
