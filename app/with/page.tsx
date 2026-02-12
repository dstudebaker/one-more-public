"use client";

import { useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { RecipeCard } from "../../components/RecipeCard";
import { useInventory } from "../../lib/inventoryStore";
import { INGREDIENTS, INGREDIENT_BY_ID } from "../../lib/data";
import { recipesWithIngredients, scoreRecipes } from "../../lib/engine";

/**
 * Recipes With:
 * - pick 1+ ingredients (from the user's current inventory)
 * - show recipes that include ALL selected ingredients
 */
export default function WithPage() {
  const inv = useInventory(); // Set<string> of ingredient ids you have
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const invList = useMemo(() => Array.from(inv), [inv]);

  const invIngredients = useMemo(() => {
    // Only ingredients that exist in the master list AND are in your inventory
    const set = new Set(invList);
    return INGREDIENTS.filter((i) => set.has(i.id));
  }, [invList]);

  const filteredInvIngredients = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return invIngredients;

    return invIngredients.filter((i) => {
      const name = i.name.toLowerCase();
      const aliases = (i.aliases || []).map((a) => a.toLowerCase());
      return (
        name.includes(needle) || aliases.some((a) => a.includes(needle))
      );
    });
  }, [invIngredients, q]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const scored = useMemo(() => scoreRecipes(inv), [inv]);

  const results = useMemo(() => {
    if (selectedIds.length === 0) return [];
    return recipesWithIngredients(scored, selectedIds);
  }, [scored, selectedIds]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearSelected() {
    setSelected(new Set());
  }

  return (
    <>
      <Header />
      <TopNav />

      <div className="subtle" style={{ marginTop: 10 }}>
        Pick ingredients you want the recipe to include.
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your ingredients…"
          style={{
            flex: "1 1 260px",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            color: "inherit",
          }}
        />

        <button
          onClick={clearSelected}
          disabled={selected.size === 0}
          className="btn"
          style={{ opacity: selected.size === 0 ? 0.5 : 1 }}
        >
          Clear
        </button>
      </div>

      {/* Selected chips */}
      {selected.size > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {selectedIds.map((id) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="chip active"
              title="Click to remove"
            >
              {INGREDIENT_BY_ID[id]?.name ?? id} ✕
            </button>
          ))}
        </div>
      )}

      {/* Ingredient picker */}
      <div style={{ marginTop: 14 }}>
        {invIngredients.length === 0 ? (
          <div className="subtle">
            You don’t have any ingredients yet. Add some in <b>My Bar</b>.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 8,
              marginTop: 8,
            }}
          >
            {filteredInvIngredients.map((i) => {
              const active = selected.has(i.id);
              return (
                <button
                  key={i.id}
                  onClick={() => toggle(i.id)}
                  className={"chip" + (active ? " active" : "")}
                  style={{ justifyContent: "space-between" }}
                >
                  <span>{i.name}</span>
                  <span style={{ opacity: 0.7, fontSize: 12 }}>
                    {active ? "Selected" : "Add"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results */}
      <div style={{ marginTop: 18 }}>
        {selectedIds.length === 0 ? (
          <div className="subtle">Select one or more ingredients to see recipes.</div>
        ) : (
          <div className="subtle" style={{ marginBottom: 10 }}>
            Showing {results.length} recipe{results.length === 1 ? "" : "s"} that include{" "}
            {selectedIds.length} ingredient{selectedIds.length === 1 ? "" : "s"}.
          </div>
        )}

        <div className="grid">
          {results.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      </div>
    </>
  );
}
