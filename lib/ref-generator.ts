export function generateRef(prefix: "BK" | "LD" | "CUS" | "INV" | "EXP" | "SUP"): string {
  const year = new Date().getFullYear();
  const key = `tf_seq_${prefix}`;
  const current = parseInt(localStorage.getItem(key) ?? "0", 10);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return `${prefix}-${year}-${String(next).padStart(3, "0")}`;
}
