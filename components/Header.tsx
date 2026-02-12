"use client";

import { useMemo } from "react";
import { useInventory } from "../lib/inventoryStore";
import AuthStatus from "./AuthStatus";

export function Header() {
  const inv = useInventory();
  const count = useMemo(() => inv.size, [inv]);

  return (
    <div className="header">
      <div>
        <div className="brand">ONE MORE</div>
        <div className="subtle">Your bar: {count} ingredients</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div className="subtle">one more, but that's it.</div>
        <AuthStatus />
      </div>
    </div>
  );
}