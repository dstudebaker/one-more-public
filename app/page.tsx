"use client";

import { useMemo } from "react";
import { Header } from "../components/Header";
import { TopNav } from "../components/TopNav";
import { RecipeCard } from "../components/RecipeCard";
import { useInventory } from "../lib/inventoryStore";
import { bucketize, scoreRecipes } from "../lib/engine";

export default function Page() {
  const inv = useInventory();

  const scored = useMemo(() => scoreRecipes(inv), [inv]);
  const buckets = useMemo(() => bucketize(scored), [scored]);

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">Make Now — cocktails you can make with what you have.</div>
      <div className="hr" />
      <div className="grid">
        {buckets.makeNow.map((x) => (
          <RecipeCard key={x.recipe.id} item={x} mode="make" />
        ))}
        {buckets.makeNow.length === 0 && (
          <div className="card">
            <h3>Nothing ready yet</h3>
            <div className="subtle">
              Go to <strong>My Bar</strong> and toggle a few ingredients. Start with Vodka, Gin, Lime Juice, Simple Syrup.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
