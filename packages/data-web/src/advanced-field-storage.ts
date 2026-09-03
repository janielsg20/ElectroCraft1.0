export const advancedFieldStorageDescriptor = Object.freeze({
  owner: 'PGlite generic content store',
  physicalTable: 'content_records',
  payloadColumn: 'data',
  storage: 'jsonb-generic',
  dynamicDdl: false,
  fieldTables: false,
} as const);

export type AdvancedFieldStorageDescriptor = typeof advancedFieldStorageDescriptor;
