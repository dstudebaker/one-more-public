"use client";

import Link from "next/link";
import { INGREDIENT_BY_ID } from "../lib/data";
import type { ScoredRecipe } from "../lib/engine";

export function RecipeCard({
  item,
  mode,
  onAddMissing,
}: {
  item: ScoredRecipe;
  mode: "make" | "one" | "two" | "many";
  onAddMissing?: (ingredientId: string) => void;
}) {
  const missing = item.missingIds.map((id) => INGREDIENT_BY_ID[id]?.name || id);
  const missingCount = item.missingIds.length;

  const pill =
    mode === "make" ? (
      <span className="pill good">Ready</span>
    ) : mode === "one" ? (
      <span className="pill one">1 away</span>
    ) : mode === "two" ? (
      <span className="pill two">2 away</span>
    ) : (
      <span className="pill">{`${missingCount} away`}</span>
    );

  return (
    <div className="card">
      <div className="kv">
        <h3 style={{ margin: 0 }}>
          <Link href={`/recipe/${item.recipe.id}`}>{item.recipe.name}</Link>
        </h3>
        {pill}
      </div>

      <div className="subtle">
        {item.recipe.tags.slice(0, 3).join(" · ")}
        {item.recipe.glass ? ` · ${item.recipe.glass}` : ""}
      </div>

      {mode !== "make" && (
        <div className="meta" style={{ marginTop: 10 }}>
          <span className="pill">{`Missing: ${missing.join(", ")}`}</span>
        </div>
      )}

      <div className="btnrow">
        <Link className="btn ghost" href={`/recipe/${item.recipe.id}`}>
          View
        </Link>

        {mode !== "make" && onAddMissing && item.missingIds[0] && (
          <button
            className="btn"
            type="button"
            onClick={() => onAddMissing(item.missingIds[0])}
            title="Add missing ingredient to My Bar"
          >
            Add missing
          </button>
        )}
      </div>
    </div>
  );
}
