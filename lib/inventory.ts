const KEY = "one_more_inventory_v1";

import { fetchCloudInventory, saveCloudInventory } from "./cloudInventory";
import { getAccessToken } from "./auth";

/* ========================
   Local Inventory
======================== */

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

  // 🔥 Automatically sync to cloud (if logged in)
  syncInventoryToCloud().catch(console.error);
}

export function toggleIngredient(
  inv: Set<string>,
  ingredientId: string
): Set<string> {
  const next = new Set(inv);
  if (next.has(ingredientId)) next.delete(ingredientId);
  else next.add(ingredientId);

  saveInventory(next);
  return next;
}

export function addIngredient(
  inv: Set<string>,
  ingredientId: string
): Set<string> {
  const next = new Set(inv);
  next.add(ingredientId);

  saveInventory(next);
  return next;
}

/* ========================
   Cloud Hydration
======================== */

// Pull cloud inventory on startup (if logged in)
export async function hydrateInventoryFromCloud(): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const items = await fetchCloudInventory();
  if (!items) return false;

  const ids = items.map((it) => it.ingredientId);

  localStorage.setItem(KEY, JSON.stringify(ids));
  return true;
}

// Push local inventory to cloud (if logged in)
export async function syncInventoryToCloud(): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const raw = localStorage.getItem(KEY);
  const ids: string[] = raw ? JSON.parse(raw) : [];

  const items = ids.map((ingredientId) => ({
    ingredientId,
    name: "",
    qty: 1,
    unit: "",
  }));

  return await saveCloudInventory(items);
}
