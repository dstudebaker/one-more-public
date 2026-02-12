import { getAccessToken } from "./auth";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");

export type CloudItem = {
  ingredientId: string;
  name: string;
  qty: number;
  unit?: string;
};

export async function fetchCloudInventory(): Promise<CloudItem[] | null> {
  const token = await getAccessToken();
  if (!token) return null;
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE is not set");

  const res = await fetch(`${API_BASE}/inventory`, {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`GET /inventory failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

export async function saveCloudInventory(items: CloudItem[]): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE is not set");

  const res = await fetch(`${API_BASE}/inventory`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  if (!res.ok) throw new Error(`POST /inventory failed: ${res.status}`);
  return true;
}

/**
 * Back-compat helpers used by inventoryStore.ts
 *
 * The UI stores inventory as a Set of ingredientIds, while the API shape is an
 * array of CloudItem records. These helpers bridge the two shapes.
 */
export async function loadInventoryFromCloud(): Promise<Set<string> | null> {
  const items = await fetchCloudInventory();
  if (!items) return null;
  return new Set(items.map((x) => x.ingredientId));
}

export async function saveInventoryToCloud(inv: Set<string>): Promise<boolean> {
  const items: CloudItem[] = Array.from(inv).map((ingredientId) => ({
    ingredientId,
    name: ingredientId,
    qty: 1,
  }));
  return saveCloudInventory(items);
}
