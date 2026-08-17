import type {
  BaseRecord,
  CreateParams,
  CreateResponse,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetListParams,
  GetListResponse,
  GetOneParams,
  GetOneResponse,
  HttpError,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import {
  deleteContentRecord,
  getContentRecord,
  listContentRecords,
  upsertContentRecord,
  type ElectroCraftContentRecord,
} from "../db/runtime";

const RESOURCE = "content_records";
let sequence = 0;

function resourceError(resource: string): HttpError {
  return { message: `Unsupported native resource: ${resource}`, statusCode: 400 };
}
function assertResource(resource: string) {
  if (resource !== RESOURCE) throw resourceError(resource);
}
function toBaseRecord(record: ElectroCraftContentRecord): BaseRecord {
  return { id: record.id, modelKey: record.modelKey, ...record.data };
}
function nextId() {
  sequence += 1;
  return `native-${Date.now()}-${sequence}`;
}

export const electroCraftDataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({ resource }: GetListParams): Promise<GetListResponse<TData>> => {
    assertResource(resource);
    const records = await listContentRecords();
    console.log("M007_REFINE_GET_LIST", records.length);
    return { data: records.map(toBaseRecord) as TData[], total: records.length };
  },
  getOne: async <TData extends BaseRecord = BaseRecord>({ resource, id }: GetOneParams): Promise<GetOneResponse<TData>> => {
    assertResource(resource);
    const record = await getContentRecord(String(id));
    if (!record) throw { message: `Record ${String(id)} not found`, statusCode: 404 } satisfies HttpError;
    return { data: toBaseRecord(record) as TData };
  },
  create: async <TData extends BaseRecord = BaseRecord, TVariables = Record<string, unknown>>({ resource, variables }: CreateParams<TVariables>): Promise<CreateResponse<TData>> => {
    assertResource(resource);
    const values = variables as Record<string, unknown>;
    const now = new Date().toISOString();
    const record: ElectroCraftContentRecord = {
      id: typeof values.id === "string" ? values.id : nextId(),
      modelKey: typeof values.modelKey === "string" ? values.modelKey : "article",
      data: Object.fromEntries(Object.entries(values).filter(([key]) => key !== "id" && key !== "modelKey")),
      createdAt: now,
      updatedAt: now,
    };
    await upsertContentRecord(record);
    return { data: toBaseRecord(record) as TData };
  },
  update: async <TData extends BaseRecord = BaseRecord, TVariables = Record<string, unknown>>({ resource, id, variables }: UpdateParams<TVariables>): Promise<UpdateResponse<TData>> => {
    assertResource(resource);
    const current = await getContentRecord(String(id));
    if (!current) throw { message: `Record ${String(id)} not found`, statusCode: 404 } satisfies HttpError;
    const values = variables as Record<string, unknown>;
    const updated: ElectroCraftContentRecord = {
      ...current,
      modelKey: typeof values.modelKey === "string" ? values.modelKey : current.modelKey,
      data: { ...current.data, ...Object.fromEntries(Object.entries(values).filter(([key]) => key !== "id" && key !== "modelKey")) },
      updatedAt: new Date().toISOString(),
    };
    await upsertContentRecord(updated);
    return { data: toBaseRecord(updated) as TData };
  },
  deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = Record<string, unknown>>({ resource, id }: DeleteOneParams<TVariables>): Promise<DeleteOneResponse<TData>> => {
    assertResource(resource);
    const removed = await deleteContentRecord(String(id));
    if (!removed) throw { message: `Record ${String(id)} not found`, statusCode: 404 } satisfies HttpError;
    return { data: toBaseRecord(removed) as TData };
  },
  getApiUrl: () => "electrocraft://native-sqlite",
};
