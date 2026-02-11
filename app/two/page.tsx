"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { RecipeCard } from "../../components/RecipeCard";
import { addIngredient, loadInventory } from "../../lib/inventory";
import { bucketize, scoreRecipes } from "../../lib/engine";

export default function Page() {
  const [inv, setInv] = useState<Set<string>>(new Set());

  useEffect(() => setInv(loadInventory()), []);

  const scored = useMemo(() => scoreRecipes(inv), [inv]);
  const { twoAway } = useMemo(() => bucketize(scored), [scored]);

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">Two Away — still close. Great for planning your next bottle.</div>
      <div className="hr" />
      <div className="grid">
        {twoAway.map((x) => (
          <RecipeCard
            key={x.recipe.id}
            item={x}
            mode="two"
            onAddMissing={(id) => setInv(addIngredient(inv, id))}
          />
        ))}
        {twoAway.length === 0 && (
          <div className="card">
            <h3>No 2-away drinks yet</h3>
            <div className="subtle">That’s actually fine — your bar is either minimal or already strong.</div>
          </div>
        )}
      </div>
    </>
  );
}
