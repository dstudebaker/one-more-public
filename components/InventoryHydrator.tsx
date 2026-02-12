"use client";

import { useEffect } from "react";
import { hydrateInventoryFromCloud } from "../lib/inventoryStore";

/**
 * Runs once per app load to merge local + cloud inventory,
 * then converges by saving merged back to cloud.
 */
export default function InventoryHydrator() {
  useEffect(() => {
    hydrateInventoryFromCloud();
  }, []);

  return null;
}
