"use client";

import { useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { RecipeCard } from "../../components/RecipeCard";
import { INGREDIENTS, type Ingredient } from "../../lib/data";
import { bucketize, scoreRecipes, type ScoredRecipe } from "../../lib/engine";
import {
  useInventory,
  toggleIngredient,
  addIngredient,
} from "../../lib/inventoryStore";

type IngredientId = Ingredient["id"];

export default function WithPage() {
  const inv = useInventory();

  // Ingredients picked for “include these” filtering (in addition to whatever is in inventory).
  const [selected, setSelected] = useState<Set<IngredientId>>(new Set());

  const toggleSelected = (id: IngredientId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Score ALL recipes against current inventory (make now / 1 away / 2 away, etc.)
  const scored = useMemo(() => scoreRecipes(inv), [inv]);

  // If user selected ingredients, filter to recipes that contain ALL selected ingredients
  // (required OR optional).
  const filtered = useMemo(() => {
    const want = Array.from(selected);
    if (want.length === 0) return scored;

    return scored.filter((r) => {
      const allIds = r.recipe.ingredients.map((i) => i.ingredientId);
      return want.every((id) => allIds.includes(id));
    });
  }, [scored, selected]);

  // Bucket into make/1/2 plus a "3+ away" bucket
  const buckets = useMemo(() => {
    const base = bucketize(filtered);
    const moreAway = filtered.filter((r) => r.missingIds.length > 2);
    return { ...base, moreAway };
  }, [filtered]);

  return (
    <>
      <Header />
      <TopNav />

      <div className="container">
        <h1>All recipes</h1>

        {/* Filter selection */}
        <div className="card">
          <h2>Filter by ingredients</h2>
          <p className="subtle">
            Pick one or more ingredients to see recipes that include them. Results
            are grouped by how close you are based on your current inventory.
          </p>

          <div className="pillGrid">
            {INGREDIENTS.map((ing) => {
              const id = ing.id as IngredientId;
              const isPicked = selected.has(id);

              return (
                <button
                  key={id}
                  type="button"
                  className={"pill " + (isPicked ? "on" : "off")}
                  onClick={() => toggleSelected(id)}
                  title={ing.name}
                >
                  {ing.name}
                </button>
              );
            })}
          </div>

          {selected.size > 0 && (
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                className="link"
                onClick={() => setSelected(new Set())}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="stack">
          <Section
            title="Make now"
            emptyText={selected.size ? "No recipes match your filter." : ""}
            items={buckets.makeNow}
            mode="make"
            onAddMissing={addIngredient}
          />
          <Section
            title="1 away"
            emptyText=""
            items={buckets.oneAway}
            mode="one"
            onAddMissing={addIngredient}
          />
          <Section
            title="2 away"
            emptyText=""
            items={buckets.twoAway}
            mode="two"
            onAddMissing={addIngredient}
          />
          <Section
            title="3+ away"
            emptyText=""
            items={buckets.moreAway}
            mode="two"
            onAddMissing={addIngredient}
          />
        </div>

        {/* Inventory toggles */}
        <div className="card">
          <h2>Your inventory</h2>
          <p className="subtle">
            Tap to toggle what you currently have (this is what determines the
            Make now / 1 away / 2 away grouping).
          </p>

          <div className="pillGrid">
            {INGREDIENTS.map((ing) => {
              const id = ing.id as IngredientId;
              const onHand = inv.has(id);

              return (
                <button
                  key={id}
                  type="button"
                  className={"pill " + (onHand ? "on" : "off")}
                  onClick={() => toggleIngredient(id)}
                  title={ing.name}
                >
                  {ing.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 16px;
        }
        h1 {
          margin: 8px 0 16px;
          font-size: 26px;
        }
        .subtle {
          opacity: 0.75;
          margin: 8px 0 0;
        }
        .card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px;
          margin: 16px 0;
          background: rgba(255, 255, 255, 0.02);
        }
        .stack {
          display: grid;
          gap: 16px;
        }
        .pillGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }
        .pill {
          border-radius: 999px;
          padding: 8px 12px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.04);
          color: inherit;
          cursor: pointer;
        }
        .pill.on {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.12);
        }
        .pill.off {
          opacity: 0.9;
        }
        .link {
          background: none;
          border: none;
          padding: 0;
          color: inherit;
          text-decoration: underline;
          cursor: pointer;
          opacity: 0.85;
        }
      `}</style>
    </>
  );
}

function Section({
  title,
  emptyText,
  items,
  mode,
  onAddMissing,
}: {
  title: string;
  emptyText: string;
  items: ScoredRecipe[];
  mode: "make" | "one" | "two";
  onAddMissing: (ingredientId: string) => void;
}) {
  return (
    <div className="card">
      <h2>{title}</h2>

      {items.length === 0 ? (
        emptyText ? <p className="subtle">{emptyText}</p> : null
      ) : (
        <div className="grid">
          {items.map((r) => (
            <RecipeCard
              key={r.recipe.id}
              item={r}
              mode={mode}
              onAddMissing={onAddMissing}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        h2 {
          margin: 0 0 10px;
          font-size: 18px;
        }
        .grid {
          display: grid;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}
