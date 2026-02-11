import { Header } from "../../../components/Header";
import { TopNav } from "../../../components/TopNav";
import { INGREDIENT_BY_ID, RECIPE_BY_ID } from "../../../lib/data";

export default function Page({ params }: { params: { id: string } }) {
  const recipe = RECIPE_BY_ID[params.id];
  if (!recipe) {
    return (
      <>
        <Header />
        <TopNav />
        <div className="card">
          <h3>Recipe not found</h3>
          <div className="subtle">No recipe with id: {params.id}</div>
        </div>
      </>
    );
  }

  const required = recipe.ingredients.filter((x) => !x.optional && !x.garnish);
  const optional = recipe.ingredients.filter((x) => x.optional && !x.garnish);
  const garnish = recipe.ingredients.filter((x) => x.garnish);

  const renderIng = (x: any) => {
    const name = INGREDIENT_BY_ID[x.ingredientId]?.name || x.ingredientId;
    return (
      <div key={x.ingredientId} className="row" style={{ justifyContent: "space-between" }}>
        <div className="left">
          <div>{name}</div>
          <div className="small">{x.amountText}</div>
        </div>
        <span className="badge">{x.optional ? "optional" : x.garnish ? "garnish" : "required"}</span>
      </div>
    );
  };

  return (
    <>
      <Header />
      <TopNav />
      <div className="card">
        <h3 style={{ marginTop: 0 }}>{recipe.name}</h3>
        <div className="subtle">
          {recipe.tags.join(" · ")}{recipe.glass ? ` · ${recipe.glass}` : ""}
        </div>
        <div className="hr" />
        <div style={{ fontWeight: 650, marginBottom: 8 }}>Required</div>
        {required.map(renderIng)}
        {optional.length > 0 && (
          <>
            <div className="hr" />
            <div style={{ fontWeight: 650, marginBottom: 8 }}>Optional</div>
            {optional.map(renderIng)}
          </>
        )}
        {garnish.length > 0 && (
          <>
            <div className="hr" />
            <div style={{ fontWeight: 650, marginBottom: 8 }}>Garnish</div>
            {garnish.map(renderIng)}
          </>
        )}
        <div className="hr" />
        <div style={{ fontWeight: 650, marginBottom: 8 }}>Instructions</div>
        <div style={{ color: "var(--text)", lineHeight: 1.6 }}>{recipe.instructions}</div>
      </div>
    </>
  );
}
