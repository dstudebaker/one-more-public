"use client";

import { useMemo } from "react";
import { useInventory } from "../lib/inventoryStore";

export function Header() {
  const inv = useInventory();
  const count = useMemo(() => inv.size, [inv]);

  return (
    <div className="header">
      <div>
        <div className="brand">ONE MORE</div>
        <div className="subtle">Your bar: {count} ingredients</div>
      </div>
      <div className="subtle">Classic whiskey-bar MVP</div>
    </div>
  );
}
