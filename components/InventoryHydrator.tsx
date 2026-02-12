"use client";

import { useEffect } from "react";
import { hydrateInventoryFromCloud } from "../lib/inventoryStore";

/**
 * Hydrates inventory once auth is ready.
 * On first page load, auth can lag behind UI render, so we retry briefly.
 */
export default function InventoryHydrator() {
  useEffect(() => {
    let cancelled = false;

    // retry a few times (auth/session may not be ready on first render)
    const maxAttempts = 20; // ~40s total
    let attempts = 0;

    const tick = async () => {
      if (cancelled) return;
      attempts += 1;

      const ok = await hydrateInventoryFromCloud();
      if (ok) return; // success; stop retrying

      if (attempts >= maxAttempts) return; // give up quietly
      setTimeout(tick, 2000);
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
