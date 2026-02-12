"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { Toggle } from "../../components/Toggle";

import { INGREDIENTS } from "../../lib/data";
import { loadInventory } from "../../lib/inventory";
import {
  bucketize,
  recipesWithIngredients,
  scoreRecipes,
  type ScoredRecipe,
} from "../../lib/engine";
import { RecipeCard } from "../../components/RecipeCard";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="sectionTitle">{title}</div>
      {children}
    </div>
  );
}

function ThreePlusCard({ item }: { item: ScoredRecipe }) {
  return (
    <div className="recipeCard">
      <div className="recipeTop">
        <div className="recipeName">
          <Link href={`/recipe/${item.recipe.id}`}>{item.recipe.name}</Link>
        </div>
        <div className="pill">3+ away</div>
      </div>

      <div className="muted">
        Missing{" "}
        <b>
          {item.missingIds.length} / {item.requiredIds.length}
        </b>{" "}
        required ingredients
      </div>

      {item.missingIds.length > 0 && (
        <div className="missing">
          <div className="muted">Missing required:</div>
          <div className="missingList">
            {item.missingIds.slice(0, 8).map((id) => (
              <span key={id} className="chip">
                {id}
              </span>
            ))}
            {item.missingIds.length > 8 && (
              <span className="chip">+{item.missingIds.length - 8} more</span>
            )}
          </div>
        </div>
      )}

      <div className="actions">
        <Link className="btn ghost" href={`/recipe/${item.recipe.id}`}>
          View recipe
        </Link>
      </div>
    </div>
  );
}

export default function Page() {
  // Inventory = what you actually have (used for “away” scoring)
  const [inv, setInv] = useState<Set<string>>(new Set());

  // Selected = ingredient filter on this page (NOT persisted)
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [q, setQ] = useState("");

  useEffect(() => {
    setInv(loadInventory());
  }, []);

  const scored = useMemo(() => scoreRecipes(inv), [inv]);

  // “All Recipes” behavior:
  // - If no ingredient filters selected => show all recipes
  // - If selected => only recipes containing ALL selected ingredients
  const filteredByIngredients = useMemo(() => {
    return recipesWithIngredients(scored, Array.from(selected));
  }, [scored, selected]);

  const filteredBySearch = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return filteredByIngredients;
    return filteredByIngredients.filter((s) =>
      s.recipe.name.toLowerCase().includes(query)
    );
  }, [filteredByIngredients, q]);

  const buckets = useMemo(() => bucketize(filteredBySearch), [filteredBySearch]);

  function toggleSelected(id: string) {
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

      <div className="wrap">
        {/* Ingredient selection FIRST */}
        <Section title="Filter by ingredients">
          <div className="row between">
            <div className="muted">
              Select ingredients to filter recipes. (Uses your saved inventory to
              score “away”.)
            </div>
            <button className="btn ghost" onClick={clearSelected} type="button">
              Clear
            </button>
          </div>

          <div className="chips">
            {INGREDIENTS.map((ing) => {
              // IMPORTANT: Ingredient uses `id` (NOT ingredientId)
              const id = ing.id;
              const on = selected.has(id);

              return (
                <div
                  key={id}
                  className="chip"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Toggle on={on} onToggle={() => toggleSelected(id)} />
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => toggleSelected(id)}
                    style={{ padding: "6px 10px" }}
                  >
                    {ing.name ?? id}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="spacer" />

          {/* Simple search */}
          <div className="row">
            <input
              className="input"
              placeholder="Search recipes…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <div className="muted" style={{ marginLeft: 12 }}>
              Showing <b>{filteredBySearch.length}</b>
            </div>
          </div>
        </Section>

        <div className="spacer" />

        {/* All Recipes results grouped by closeness */}
        <Section title="All Recipes">
          {filteredBySearch.length === 0 ? (
            <div className="muted">No recipes match your filters.</div>
          ) : (
            <>
              {buckets.makeNow.length > 0 && (
                <>
                  <div className="bucketTitle">Make now</div>
                  <div className="grid">
                    {buckets.makeNow.map((r) => (
                      <RecipeCard key={r.recipe.id} item={r} mode="make" />
                    ))}
                  </div>
                  <div className="spacer" />
                </>
              )}

              {buckets.oneAway.length > 0 && (
                <>
                  <div className="bucketTitle">1 away</div>
                  <div className="grid">
                    {buckets.oneAway.map((r) => (
                      <RecipeCard key={r.recipe.id} item={r} mode="one" />
                    ))}
                  </div>
                  <div className="spacer" />
                </>
              )}

              {buckets.twoAway.length > 0 && (
                <>
                  <div className="bucketTitle">2 away</div>
                  <div className="grid">
                    {buckets.twoAway.map((r) => (
                      <RecipeCard key={r.recipe.id} item={r} mode="two" />
                    ))}
                  </div>
                  <div className="spacer" />
                </>
              )}

              {buckets.threePlus.length > 0 && (
                <>
                  <div className="bucketTitle">3+ away</div>
                  <div className="grid">
                    {buckets.threePlus.map((r) => (
                      <ThreePlusCard key={r.recipe.id} item={r} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </Section>
      </div>
    </>
  );
}
