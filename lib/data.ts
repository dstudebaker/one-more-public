import ingredients from "../data/ingredients.json";
import recipes from "../data/recipes.json";

export type IngredientType =
  | "spirit"
  | "liqueur"
  | "fortified"
  | "juice"
  | "syrup"
  | "bitters"
  | "mixer"
  | "garnish"
  | "other";

export type Ingredient = {
  id: string;
  name: string;
  type: IngredientType;
  aliases?: string[];
};

export type RecipeIngredient = {
  ingredientId: string;
  amountText: string;
  optional: boolean;
  garnish: boolean;
};

export type Recipe = {
  id: string;
  name: string;
  tags: string[];
  glass?: string;
  instructions: string;
  ingredients: RecipeIngredient[];
};

export const INGREDIENTS = ingredients as Ingredient[];
export const RECIPES = recipes as Recipe[];

export const INGREDIENT_BY_ID: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i])
);

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(
  RECIPES.map((r) => [r.id, r])
);
