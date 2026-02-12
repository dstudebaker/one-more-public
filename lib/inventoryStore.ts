"use client";

import { useSyncExternalStore } from "react";

const KEY = "one_more_inventory_v1";
const listeners = new Set<() => void>();

// ✅ Cached snapshot so getSnapshot is referentially stable
let cached: Set<string> = new Set();

function emit() {
  for (const l of listeners) l();
}

function readFromStorage(): Set<string> {
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

function writeToStorage(inv: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(inv.values())));
}

// Initialize cache on first load (client-side)
if (typeof window !== "undefined") {
  cached = readFromStorage();

  // Keep cache in sync across tabs/windows
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      cached = readFromStorage();
      emit();
    }
  });
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot() {
  return cached; // ✅ stable reference unless we update cached
}

export function setInventory(inv: Set<string>) {
  cached = new Set(inv);
  writeToStorage(cached);
  emit();
}

export function toggleIngredient(ingredientId: string) {
  const next = new Set(cached);
  if (next.has(ingredientId)) next.delete(ingredientId);
  else next.add(ingredientId);
  setInventory(next);
}

export function addIngredient(ingredientId: string) {
  const next = new Set(cached);
  next.add(ingredientId);
  setInventory(next);
}

export function useInventory() {
  return useSyncExternalStore(subscribe,

