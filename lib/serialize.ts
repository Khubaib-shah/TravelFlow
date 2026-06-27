const DATE_FIELDS = new Set([
  "createdAt",
  "updatedAt",
  "travelDate",
  "departureDate",
  "returnDate",
  "lastLoginAt",
  "passportExpiry",
  "date",
  "performedAt",
  "lastContactedAt",
]);

export function serializeForStorage<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, v) => (v instanceof Date ? v.toISOString() : v))
  );
}

export function reviveDates<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as T;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (DATE_FIELDS.has(key) && typeof val === "string") {
        result[key] = new Date(val);
      } else if (typeof val === "object" && val !== null) {
        result[key] = reviveDates(val);
      } else {
        result[key] = val;
      }
    }
    return result as T;
  }
  return value;
}

export function reviveList<T>(items: T[]): T[] {
  return items.map((item) => reviveDates(item));
}
