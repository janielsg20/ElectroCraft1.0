// @ts-check
/** @typedef {'string'|'datetime'|'enum'} FieldType */
/** @typedef {{name:string,type:FieldType,required:boolean,values?:string[]}} ModelField */
/** @typedef {{id:string,label:string,capabilities:string[]}} RoleDef */

export const exportIrPoc = Object.freeze({
  schemaVersion: '0.1.0',
  projectId: 'electrocraft-m00-10-parity',
  locale: 'es',
  screen: {
    id: 'appointments',
    title: 'Citas',
    route: '/appointments',
    tree: {
      id: 'root', type: 'Container', children: [
        { id: 'title', type: 'Text', text: 'Citas' },
        { id: 'appointment-form', type: 'Form', model: 'Appointment', submitAction: 'createAppointment' },
      ],
    },
  },
  model: {
    name: 'Appointment',
    fields: /** @type {ModelField[]} */ ([
      { name: 'id', type: 'string', required: true },
      { name: 'clientName', type: 'string', required: true },
      { name: 'startsAt', type: 'datetime', required: true },
      { name: 'status', type: 'enum', required: true, values: ['pending', 'confirmed', 'done'] },
    ]),
  },
  query: { id: 'listAppointments', source: 'internal', model: 'Appointment', operation: 'list', orderBy: ['startsAt:asc'] },
  state: { id: 'appointmentDraft', scope: 'screen', initial: { clientName: '', startsAt: '', status: 'pending' } },
  actionGraph: {
    id: 'createAppointment',
    trigger: 'form.submit',
    nodes: [
      { id: 'validate', kind: 'validate', schema: 'Appointment' },
      { id: 'create', kind: 'data.create', model: 'Appointment', after: ['validate'] },
      { id: 'refresh', kind: 'query.invalidate', queryId: 'listAppointments', after: ['create'] },
    ],
  },
  role: /** @type {RoleDef} */ ({ id: 'staff', label: 'Personal', capabilities: ['appointments:read', 'appointments:write'] }),
});

/** @param {unknown} value @returns {unknown} */
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(/** @type {Record<string,unknown>} */(value)).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,stable(v)]));
  }
  return value;
}

export function exportIrFingerprint(ir = exportIrPoc) {
  const text = JSON.stringify(stable(ir));
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ code, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(16).padStart(8,'0')}${h2.toString(16).padStart(8,'0')}`;
}

export function assertCanonicalIr(ir = exportIrPoc) {
  if (ir.model.name !== 'Appointment') throw new Error('Canonical model must be Appointment.');
  if (ir.screen.route !== '/appointments') throw new Error('Canonical route mismatch.');
  if (ir.screen.tree.type !== 'Container') throw new Error('Root must be Container.');
  const types = ir.screen.tree.children.map((node)=>node.type);
  for (const required of ['Text','Form']) if (!types.includes(required)) throw new Error(`Missing canonical ${required}.`);
  if (ir.actionGraph.nodes.length < 3) throw new Error('ActionGraph fixture is incomplete.');
  if (!ir.role.capabilities.includes('appointments:write')) throw new Error('Role fixture lacks write capability.');
  return true;
}
