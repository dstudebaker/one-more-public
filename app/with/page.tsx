"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { INGREDIENTS } from "../../lib/data";
import { loadInventory } from "../../lib/inventory";
import { scoreRecipes, recipesWithIngredients } from "../../lib/engine";
import { RecipeCard } from "../../components/RecipeCard";

export default function Page() {
  const [inv, setInv] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setInv(loadInventory());
  }, []);

  const scored = useMemo(() => scoreRecipes(inv), [inv]);

  const selectable = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return INGREDIENTS
      .filter((i) => inv.has(i.id)) // only show what user has
      .filter((i) =>
        !qq ? true : i.name.toLowerCase().includes(qq)
      )
      .slice(0, 40);
  }, [inv, q]);

  const results = useMemo(
    () => recipesWithIngredients(scored, selected),
    [scored, selected]
  );

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  return (
    <>
      <Header />
      <TopNav />

      <div className="subtle">
        Select ingredients you want to use. Only shows drinks you can make right now.
      </div>
      <div className="hr" />

      <input
        className="input"
        placeholder="Search your ingredients…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="meta" style={{ marginTop: 10 }}>
        {selected.length === 0 ? (
          <span className="pill">Select 1+ ingredients</span>
        ) : (
          selected.map((id) => {
            const name =
              INGREDIENTS.find((x) => x.id === id)?.name || id;
            return (
              <button
                key={id}
                className="pill"
                onClick={() => toggle(id)}
                type="button"
              >
                {name} ✕
              </button>
            );
          })
        )}
      </div>

      <div className="hr" />
      <div className="subtle">Tap to include:</div>

      <div className="meta" style={{ marginTop: 10 }}>
        {selectable.map((i) => (
          <button
            key={i.id}
            className={
              "pill" + (selected.includes(i.id) ? " one" : "")
            }
            type="button"
            onClick={() => toggle(i.id)}
          >
            {i.name}
          </button>
        ))}
        {selectable.length === 0 && (
          <span className="pill">
            Add ingredients in “My Bar” first.
          </span>
        )}
      </div>

      <div className="hr" />
      <div className="subtle">
        Matching recipes: <strong>{results.length}</strong>
      </div>
      <div className="hr" />

      <div className="grid">
        {results.map((x) => (
          <RecipeCard
            key={x.recipe.id}
            item={x}
            mode="make"
          />
        ))}
        {results.length === 0 && (
          <div className="card">
            <h3>No matches</h3>
            <div className="subtle">
              Try selecting fewer ingredients.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
