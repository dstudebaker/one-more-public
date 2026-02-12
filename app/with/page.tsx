"use client";

import { useMemo } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { RecipeCard } from "../../components/RecipeCard";
import { useInventory } from "../../lib/inventoryStore";
import { bucketize, scoreRecipes } from "../../lib/engine";

export default function Page() {
  const inv = useInventory();

  const scored = useMemo(() => scoreRecipes(inv), [inv]);
  const buckets = useMemo(() => bucketize(scored), [scored]);

  // If your engine bucket name is different, adjust here.
  const withBucket = (buckets as any).with ?? (buckets as any).makeNow ?? [];

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">With — cocktails you can make with your current bar.</div>
      <div className="hr" />
      <div className="grid">
        {withBucket.map((x: any) => (
          <RecipeCard key={x.recipe.id} item={x} mode="make" />
        ))}
        {withBucket.length === 0 && (
          <div className="card">
            <h3>Nothing here yet</h3>
            <div className="subtle">
              Add a few core ingredients in <strong>My Bar</strong>.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
