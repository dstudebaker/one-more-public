import { INGREDIENT_BY_ID, RECIPES, type Recipe } from "./data";

export type Bucket = "makeNow" | "oneAway" | "twoAway" | "threePlus";

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
  const threePlus: ScoredRecipe[] = [];

  for (const s of scored) {
    const m = s.missingIds.length;
    if (m === 0) makeNow.push(s);
    else if (m === 1) oneAway.push(s);
    else if (m === 2) twoAway.push(s);
    else threePlus.push(s);
  }

  // Sorting
  const byReqDesc = (a: ScoredRecipe, b: ScoredRecipe) =>
    b.requiredIds.length - a.requiredIds.length ||
    a.recipe.name.localeCompare(b.recipe.name);

  makeNow.sort(byReqDesc);

  oneAway.sort(
    (a, b) =>
      (a.missingIds[0] || "").localeCompare(b.missingIds[0] || "") ||
      byReqDesc(a, b)
  );

  twoAway.sort(byReqDesc);

  threePlus.sort(
    (a, b) =>
      a.missingIds.length - b.missingIds.length ||
      byReqDesc(a, b)
  );

  return { makeNow, oneAway, twoAway, threePlus };
}

export type UnlockSuggestion = {
  ingredientId: string;
  name: string;
  unlocks: number;
  helpsTwoAway: number;
};

export function unlockSuggestions(
  scored: ScoredRecipe[],
  inventory: Set<string>,
  topN = 10
): UnlockSuggestion[] {
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

  return Array.from(map.entries())
    .map(([ingredientId, v]) => ({
      ingredientId,
      name: INGREDIENT_BY_ID[ingredientId]?.name || ingredientId,
      unlocks: v.unlocks,
      helpsTwoAway: v.helpsTwoAway,
    }))
    .filter((x) => x.unlocks > 0 || x.helpsTwoAway > 0)
    .sort((a, b) => b.unlocks - a.unlocks || b.helpsTwoAway - a.helpsTwoAway || a.name.localeCompare(b.name))
    .slice(0, topN);
}

/**
 * Treat "Recipes with" as ALL recipes.
 * - If nothing selected: return all recipes (still scored)
 * - If selected: recipe must contain ALL selected ingredientIds
 *   (matches against the full ingredient list, including optional/garnish)
 */
export function recipesWithIngredients(
  scored: ScoredRecipe[],
  selectedIds: string[]
): ScoredRecipe[] {
  if (selectedIds.length === 0) return scored;

  const selected = new Set(selectedIds);

  return scored
    .filter((s) => {
      const allIds = new Set(s.recipe.ingredients.map((x) => x.ingredientId));
      for (const id of selected) {
        if (!allIds.has(id)) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        a.missingIds.length - b.missingIds.length ||
        b.requiredIds.length - a.requiredIds.length ||
        a.recipe.name.localeCompare(b.recipe.name)
    );
}
