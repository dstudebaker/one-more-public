// lib/inventoryStore.ts
"use client";

import { useSyncExternalStore } from "react";

const KEY = "one_more_inventory_v1";
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function read(): Set<string> {
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

function write(inv: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(inv.values())));
  emit(); // ✅ same-tab update
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot() {
  return read();
}

export function setInventory(inv: Set<string>) {
  write(inv);
}

export function toggleIngredient(ingredientId: string) {
  const next = new Set(read());
  if (next.has(ingredientId)) next.delete(ingredientId);
  else next.add(ingredientId);
  write(next);
}

export function addIngredient(ingredientId: string) {
  const next = new Set(read());
  next.add(ingredientId);
  write(next);
}

// React hook used by pages/components
export function useInventory() {
  return useSyncExternalStore(subscribe, getSnapshot, () => new Set());
}
