"use client";

import "../app/amplify";
import { useEffect } from "react";
import { hydrateInventoryFromCloud } from "../lib/inventoryStore";

export default function AmplifyClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateInventoryFromCloud();
  }, []);

  return <>{children}</>;
}
