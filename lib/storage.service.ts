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

export function emitStorageChange(key: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tf-storage-change", { detail: { key } }));
}

export class StorageService<T extends { id: string }> {
  constructor(private key: string) {}

  getAll(): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  getById(id: string): T | null {
    return this.getAll().find((item) => item.id === id) ?? null;
  }

  create(data: Omit<T, "id"> & { id?: string }): T {
    const item = { ...data, id: data.id ?? crypto.randomUUID() } as T;
    const all = this.getAll();
    all.unshift(item);
    localStorage.setItem(this.key, JSON.stringify(all));
    emitStorageChange(this.key);
    return item;
  }

  update(id: string, data: Partial<T>): T | null {
    const all = this.getAll();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...data };
    localStorage.setItem(this.key, JSON.stringify(all));
    emitStorageChange(this.key);
    return all[idx];
  }

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((item) => item.id !== id);
    if (filtered.length === all.length) return false;
    localStorage.setItem(this.key, JSON.stringify(filtered));
    emitStorageChange(this.key);
    return true;
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
    localStorage.setItem(this.key, JSON.stringify(data));
    emitStorageChange(this.key);
  }
}
