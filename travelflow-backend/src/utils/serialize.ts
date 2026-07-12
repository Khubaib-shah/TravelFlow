import mongoose from "mongoose";

type PlainDoc = Record<string, unknown>;

function asPlainDoc(value: unknown): PlainDoc {
  if (value && typeof value === "object") {
    return value as PlainDoc;
  }
  return {};
}

function transformValue(value: unknown): unknown {
  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(transformValue);
  }
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return toJSON(value);
  }
  return value;
}

export function toJSON(doc: unknown): PlainDoc | null {
  if (!doc) return null;

  const withToJson = doc as { toJSON?: () => PlainDoc; toObject?: () => PlainDoc };
  const obj = withToJson.toJSON?.() ?? withToJson.toObject?.() ?? asPlainDoc(doc);
  const result: PlainDoc = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === "_id") {
      result.id = String(value);
      continue;
    }
    if (key === "__v") continue;
    result[key] = transformValue(value);
  }

  return result;
}

export function toJSONList(docs: unknown[]): PlainDoc[] {
  return docs.map((d) => toJSON(d)!).filter(Boolean);
}

export function isObjectId(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;
}

export function buildIdOrRefFilter(idOrRef: string, refField: string) {
  if (isObjectId(idOrRef)) {
    return { $or: [{ _id: idOrRef }, { [refField]: idOrRef }] };
  }
  return { [refField]: idOrRef };
}
