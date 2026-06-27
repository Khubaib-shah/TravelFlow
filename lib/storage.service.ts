export const STORAGE_KEYS = {
  LEADS: "tf_leads",
  CUSTOMERS: "tf_customers",
  BOOKINGS: "tf_bookings",
  SUPPLIERS: "tf_suppliers",
  EXPENSES: "tf_expenses",
  BRANCHES: "tf_branches",
  USERS: "tf_users",
  ACTIVITIES: "tf_activities",
  NOTES: "tf_notes",
  DOCUMENTS: "tf_documents",
  SEEDED: "tf_seeded",
  ROLES: "tf_roles",
} as const;

const MAX_WRITE_RETRIES = 3;

type StorableRecord = { id: string; updatedAt?: string };

export function emitStorageChange(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tf-storage-change", { detail: { key } }));
}

function installCrossTabStorageListener() {
  if (typeof window === "undefined") return;
  const flag = "__tfStorageListenerInstalled" as const;
  if ((window as Window & { [flag]?: boolean })[flag]) return;
  (window as Window & { [flag]?: boolean })[flag] = true;

  window.addEventListener("storage", (event) => {
    if (event.key?.startsWith("tf_")) {
      emitStorageChange(event.key);
    }
  });
}

installCrossTabStorageListener();

export class StorageService<T extends StorableRecord> {
  constructor(private key: string) {}

  private readRaw(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }

  private parse(raw: string | null): T[] {
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  private commit(next: T[], expectedRaw: string | null): boolean {
    if (typeof window === "undefined") return false;
    const currentRaw = this.readRaw();
    if (currentRaw !== expectedRaw) return false;
    localStorage.setItem(this.key, JSON.stringify(next));
    return true;
  }

  private withRetry<R>(operation: (all: T[], snapshotRaw: string | null) => R | null): R | null {
    for (let attempt = 0; attempt < MAX_WRITE_RETRIES; attempt++) {
      const snapshotRaw = this.readRaw();
      const all = this.parse(snapshotRaw);
      const result = operation(all, snapshotRaw);
      if (result !== null) return result;
    }

    const snapshotRaw = this.readRaw();
    const all = this.parse(snapshotRaw);
    return operation(all, snapshotRaw);
  }

  getAll(): T[] {
    return this.parse(this.readRaw());
  }

  getById(id: string): T | null {
    return this.getAll().find((item) => item.id === id) ?? null;
  }

  create(data: Omit<T, "id"> & { id?: string }): T {
    const timestamp = new Date().toISOString();
    const item = {
      ...data,
      id: data.id ?? crypto.randomUUID(),
      updatedAt: (data as StorableRecord).updatedAt ?? timestamp,
    } as T;

    for (let attempt = 0; attempt < MAX_WRITE_RETRIES; attempt++) {
      const snapshotRaw = this.readRaw();
      const all = this.parse(snapshotRaw);
      const next = [item, ...all];
      if (this.commit(next, snapshotRaw)) {
        emitStorageChange(this.key);
        return item;
      }
    }

    const snapshotRaw = this.readRaw();
    const all = this.parse(snapshotRaw);
    const next = [item, ...all];
    localStorage.setItem(this.key, JSON.stringify(next));
    emitStorageChange(this.key);
    return item;
  }

  update(id: string, data: Partial<T>): T | null {
    if (!this.getById(id)) return null;

    return this.withRetry<T | null>((all, snapshotRaw) => {
      const idx = all.findIndex((item) => item.id === id);
      if (idx === -1) return null;

      const updated = {
        ...all[idx],
        ...data,
        updatedAt: (data as StorableRecord).updatedAt ?? new Date().toISOString(),
      } as T;

      const next = [...all];
      next[idx] = updated;

      if (!this.commit(next, snapshotRaw)) return null;
      emitStorageChange(this.key);
      return updated;
    });
  }

  delete(id: string): boolean {
    const deleted = this.withRetry<boolean>((all, snapshotRaw) => {
      const next = all.filter((item) => item.id !== id);
      if (next.length === all.length) return false;
      if (!this.commit(next, snapshotRaw)) return null;
      emitStorageChange(this.key);
      return true;
    });

    return deleted ?? false;
  }

  query(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  seed(data: T[]): void {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(this.key)) return;
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  replaceAll(data: T[]): void {
    if (typeof window === "undefined") return;

    const replaced = this.withRetry<boolean>((_, snapshotRaw) => {
      if (!this.commit(data, snapshotRaw)) return null;
      emitStorageChange(this.key);
      return true;
    });

    if (!replaced) {
      localStorage.setItem(this.key, JSON.stringify(data));
      emitStorageChange(this.key);
    }
  }
}
