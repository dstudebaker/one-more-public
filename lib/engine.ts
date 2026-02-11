import { INGREDIENT_BY_ID, RECIPES, type Recipe } from "./data";

export type Bucket = "makeNow" | "oneAway" | "twoAway";

export type ScoredRecipe = {
  recipe: Recipe;
  missingIds: string[];
  requiredIds: string[];
};

function requiredIngredientIds(r: Recipe): string[] {
  return r.ingredients
    .filter((x) => !x.optional && !x.garnish)
    .map((x) => x.ingredientId);
}

export function scoreRecipes(inventory: Set<string>): ScoredRecipe[] {
  return RECIPES.map((recipe) => {
    const req = requiredIngredientIds(recipe);
    const missing = req.filter((id) => !inventory.has(id));
    return { recipe, missingIds: missing, requiredIds: req };
  });
}

export function bucketize(scored: ScoredRecipe[]) {
  const makeNow: ScoredRecipe[] = [];
  const oneAway: ScoredRecipe[] = [];
  const twoAway: ScoredRecipe[] = [];

  for (const s of scored) {
    const m = s.missingIds.length;
    if (m === 0) makeNow.push(s);
    else if (m === 1) oneAway.push(s);
    else if (m === 2) twoAway.push(s);
  }

  // Sorting: prioritize drinks that use more of your inventory (more "interesting")
  const byReqDesc = (a: ScoredRecipe, b: ScoredRecipe) => b.requiredIds.length - a.requiredIds.length || a.recipe.name.localeCompare(b.recipe.name);
  makeNow.sort(byReqDesc);
  oneAway.sort((a,b) => a.missingIds[0].localeCompare(b.missingIds[0]) || byReqDesc(a,b));
  twoAway.sort(byReqDesc);

  return { makeNow, oneAway, twoAway };
}

export type UnlockSuggestion = {
  ingredientId: string;
  name: string;
  unlocks: number;
  helpsTwoAway: number;
};

export function unlockSuggestions(scored: ScoredRecipe[], inventory: Set<string>, topN = 10): UnlockSuggestion[] {
  const map = new Map<string, { unlocks: number; helpsTwoAway: number }>();

  for (const s of scored) {
    if (s.missingIds.length === 1) {
      const id = s.missingIds[0];
      if (inventory.has(id)) continue;
      const cur = map.get(id) || { unlocks: 0, helpsTwoAway: 0 };
      cur.unlocks += 1;
      map.set(id, cur);
    } else if (s.missingIds.length === 2) {
      for (const id of s.missingIds) {
        if (inventory.has(id)) continue;
        const cur = map.get(id) || { unlocks: 0, helpsTwoAway: 0 };
        cur.helpsTwoAway += 1;
        map.set(id, cur);
      }
    }
  }

  const out: UnlockSuggestion[] = Array.from(map.entries())
    .map(([ingredientId, v]) => ({
      ingredientId,
      name: INGREDIENT_BY_ID[ingredientId]?.name || ingredientId,
      unlocks: v.unlocks,
      helpsTwoAway: v.helpsTwoAway,
    }))
    .filter((x) => x.unlocks > 0 || x.helpsTwoAway > 0)
    .sort((a, b) => {
      // primary: unlocks (one-away completions), secondary: helpsTwoAway, then name
      return (
        b.unlocks - a.unlocks ||
        b.helpsTwoAway - a.helpsTwoAway ||
        a.name.localeCompare(b.name)
      );
    })
    .slice(0, topN);

  return out;
}

export function recipesWithIngredients(
  scored: ScoredRecipe[],
  selectedIds: string[]
): ScoredRecipe[] {
  // If nothing selected, just return "make now"
  if (selectedIds.length === 0) {
    return scored.filter((s) => s.missingIds.length === 0);
  }

  const selected = new Set(selectedIds);

  return scored
    .filter((s) => s.missingIds.length === 0) // must be makeable now
    .filter((s) => {
      // match against required ingredients only (same logic as score/bucket)
      const req = new Set(s.requiredIds);
      for (const id of selected) {
        if (!req.has(id)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        b.requiredIds.length - a.requiredIds.length ||
        a.recipe.name.localeCompare(b.recipe.name)
    );
}

