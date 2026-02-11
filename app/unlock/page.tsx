"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { addIngredient, loadInventory } from "../../lib/inventory";
import { scoreRecipes, unlockSuggestions } from "../../lib/engine";

export default function Page() {
  const [inv, setInv] = useState<Set<string>>(new Set());

  useEffect(() => setInv(loadInventory()), []);

  const scored = useMemo(() => scoreRecipes(inv), [inv]);
  const suggestions = useMemo(() => unlockSuggestions(scored, inv, 12), [scored, inv]);

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">Unlock — the “one more” ingredients that unlock the most drinks.</div>
      <div className="hr" />

      <div className="grid">
        {suggestions.map((s) => (
          <div key={s.ingredientId} className="card">
            <div className="kv">
              <h3 style={{ margin: 0 }}>{s.name}</h3>
              <div className="pill one">+{s.unlocks} unlocks</div>
            </div>
            <div className="subtle">
              {s.helpsTwoAway > 0 ? `Also helps ${s.helpsTwoAway} two-away drinks.` : "Strong single-bottle unlock."}
            </div>
            <div className="btnrow">
              <button className="btn" type="button" onClick={() => setInv(addIngredient(inv, s.ingredientId))}>
                Add to My Bar
              </button>
            </div>
          </div>
        ))}
        {suggestions.length === 0 && (
          <div className="card">
            <h3>No unlock suggestions</h3>
            <div className="subtle">Either you have almost nothing selected, or you already have everything needed.</div>
          </div>
        )}
      </div>
    </>
  );
}
