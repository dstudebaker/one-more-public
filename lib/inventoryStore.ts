"use client";

import { useSyncExternalStore } from "react";
import { loadInventoryFromCloud, saveInventoryToCloud } from "./cloudInventory";

const KEY = "one_more_inventory_v1";
const listeners = new Set<() => void>();

let cached: Set<string> = new Set();
let saveTimer: any = null;

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

// init cache from local storage
if (typeof window !== "undefined") {
  cached = readFromStorage();

  // cross-tab updates
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
  return cached;
}

function scheduleCloudSave(inv: Set<string>) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveInventoryToCloud(inv).catch(() => {});
  }, 750);
}

export function setInventory(inv: Set<string>, opts?: { skipCloudSave?: boolean }) {
  cached = new Set(inv);
  writeToStorage(cached);
  emit();
  if (!opts?.skipCloudSave) scheduleCloudSave(cached);
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

/**
 * Call this AFTER Amplify is configured and the user is signed in.
 * Merge cloud + local (never wipe local), then converge by saving merged to cloud.
 */
export async function hydrateInventoryFromCloud() {
  try {
    const cloud = await loadInventoryFromCloud();
    if (!cloud) return;

    const local = cached;
    const merged = new Set([...local, ...cloud]);

    // Update local + UI, but don't immediately save again from setInventory debounce.
    setInventory(merged, { skipCloudSave: true });

    // Converge cloud to merged value
    await saveInventoryToCloud(merged);
  } catch {
    // ignore (not signed in, transient, etc.)
  }
}

export function useInventory() {
  return useSyncExternalStore(subscribe, getSnapshot, () => new Set());
}
