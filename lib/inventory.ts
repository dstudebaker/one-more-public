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

import { fetchCloudInventory, saveCloudInventory } from "./cloudInventory";
import { getAccessToken } from "./auth";

// Call on app start: if logged in, pull from cloud and overwrite local cache
export async function hydrateInventoryFromCloud(): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const items = await fetchCloudInventory();
  if (!items) return false;

  // Convert cloud items into your local inventory shape.
  // Assumes your local inventory is stored as a Set of ingredient IDs in localStorage.
  // If your local shape is different, tell me and I’ll adjust this mapping.
  const ids = items.map((it) => it.ingredientId);

  localStorage.setItem("one-more-inventory", JSON.stringify(ids));
  return true;
}

// Call whenever local inventory changes: if logged in, push to cloud
export async function syncInventoryToCloud(): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;

  const raw = localStorage.getItem("one-more-inventory");
  const ids: string[] = raw ? JSON.parse(raw) : [];

  // Minimal payload for now (ingredientId only)
  const items = ids.map((ingredientId) => ({
    ingredientId,
    name: "",
    qty: 1,
    unit: "",
  }));

  return await saveCloudInventory(items);
}

