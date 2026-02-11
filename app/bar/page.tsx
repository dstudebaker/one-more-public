"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { INGREDIENTS, type Ingredient } from "../../lib/data";
import { loadInventory, toggleIngredient } from "../../lib/inventory";
import { Toggle } from "../../components/Toggle";

const typeOrder: Record<string, number> = {
  spirit: 1,
  liqueur: 2,
  fortified: 3,
  juice: 4,
  syrup: 5,
  bitters: 6,
  mixer: 7,
  garnish: 8,
  other: 9,
};

export default function Page() {
  const [inv, setInv] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");

  useEffect(() => setInv(loadInventory()), []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return INGREDIENTS
      .filter((i) => (type === "all" ? true : i.type === type))
      .filter((i) => (qq ? i.name.toLowerCase().includes(qq) : true))
      .slice()
      .sort((a, b) => (typeOrder[a.type] - typeOrder[b.type]) || a.name.localeCompare(b.name));
  }, [q, type]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const i of INGREDIENTS) {
      if (inv.has(i.id)) c[i.type] = (c[i.type] || 0) + 1;
    }
    return c;
  }, [inv]);

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">My Bar — check what you have. No quantities, just “on hand”.</div>
      <div className="hr" />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input className="input" placeholder="Search ingredients…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={type} onChange={(e) => setType(e.target.value)} style={{ maxWidth: 220 }}>
          <option value="all">All types</option>
          <option value="spirit">Spirits</option>
          <option value="liqueur">Liqueurs</option>
          <option value="fortified">Fortified</option>
          <option value="juice">Juices</option>
          <option value="syrup">Syrups</option>
          <option value="bitters">Bitters</option>
          <option value="mixer">Mixers</option>
          <option value="garnish">Garnish</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="hr" />
      <div className="subtle">
        Selected: <strong>{inv.size}</strong> ingredients · Spirits {counts.spirit || 0} · Liqueurs {counts.liqueur || 0} · Juices {counts.juice || 0}
      </div>
      <div style={{ marginTop: 12 }}>
        {filtered.map((i) => (
          <div key={i.id} className="row">
            <div className="left">
              <div>{i.name}</div>
              <div className="small">{i.type}</div>
            </div>
            <Toggle on={inv.has(i.id)} onToggle={() => setInv(toggleIngredient(inv, i.id))} />
          </div>
        ))}
      </div>
    </>
  );
}
