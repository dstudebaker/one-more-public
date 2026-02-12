"use client";

import { useMemo } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { RecipeCard } from "../../components/RecipeCard";
import { addIngredient, useInventory } from "../../lib/inventoryStore";
import { bucketize, scoreRecipes } from "../../lib/engine";

export default function Page() {
  const inv = useInventory();

  const scored = useMemo(() => scoreRecipes(inv), [inv]);
  const buckets = useMemo(() => bucketize(scored), [scored]);

  // If your engine uses a specific bucket name for Unlock, adjust here.
  // Common pattern: buckets.unlock or buckets.locked
  const unlock = (buckets as any).unlock ?? (buckets as any).locked ?? [];

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">Unlock — drinks you can unlock by adding one ingredient.</div>
      <div className="hr" />
      <div className="grid">
        {unlock.map((x: any) => (
          <RecipeCard
            key={x.recipe.id}
            item={x}
            mode="one"
            onAddMissing={(id: string) => addIngredient(id)}
          />
        ))}
        {unlock.length === 0 && (
          <div className="card">
            <h3>Nothing to unlock yet</h3>
            <div className="subtle">
              Add a few ingredients in <strong>My Bar</strong> and come back.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
