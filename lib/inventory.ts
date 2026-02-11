const KEY = "one_more_inventory_v1";

export function loadInventory(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

export function saveInventory(inv: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(inv.values())));
}

export function toggleIngredient(inv: Set<string>, ingredientId: string): Set<string> {
  const next = new Set(inv);
  if (next.has(ingredientId)) next.delete(ingredientId);
  else next.add(ingredientId);
  saveInventory(next);
  return next;
}

export function addIngredient(inv: Set<string>, ingredientId: string): Set<string> {
  const next = new Set(inv);
  next.add(ingredientId);
  saveInventory(next);
  return next;
}
