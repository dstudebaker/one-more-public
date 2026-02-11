"use client";

import { useEffect, useMemo, useState } from "react";
import { loadInventory } from "../lib/inventory";
import AuthStatus from "../components/AuthStatus";

export function Header() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    const inv = loadInventory();
    setCount(inv.size);
    const onStorage = () => setCount(loadInventory().size);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

return (
  <div className="header">
    <div>
      <div className="brand">ONE MORE</div>
      <div className="subtle">Your bar: {count} ingredients</div>
    </div>

    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div className="subtle">one more, but that&apos;s it.</div>
      <AuthStatus />
    </div>
  </div>
);