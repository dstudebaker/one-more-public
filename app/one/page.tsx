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
  const { oneAway } = useMemo(() => bucketize(scored), [scored]);

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">One Away — add one ingredient and you’re in business.</div>
      <div className="hr" />
      <div className="grid">
        {oneAway.map((x) => (
          <RecipeCard
            key={x.recipe.id}
            item={x}
            mode="one"
            onAddMissing={(id) => setInv(addIngredient(inv, id))}
          />
        ))}
        {oneAway.length === 0 && (
          <div className="card">
            <h3>No 1-away drinks yet</h3>
            <div className="subtle">Add a few core items in <strong>My Bar</strong> to light this up.</div>
          </div>
        )}
      </div>
    </>
  );
}
