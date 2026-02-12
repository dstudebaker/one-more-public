"use client";

import { useMemo } from "react";
import { Header } from "../../components/Header";
import { TopNav } from "../../components/TopNav";
import { INGREDIENT_BY_ID } from "../../lib/data";
import { useInventory, addIngredient } from "../../lib/inventoryStore";
import { scoreRecipes, unlockSuggestions } from "../../lib/engine";

export default function Page() {
  const inv = useInventory();

  const scored = useMemo(() => scoreRecipes(inv), [inv]);
  const suggestions = useMemo(
    () => unlockSuggestions(scored, inv, 20),
    [scored, inv]
  );

  return (
    <>
      <Header />
      <TopNav />
      <div className="subtle">
        Unlock — best next ingredients to maximize new “Make Now” drinks.
      </div>
      <div className="hr" />

      <div className="grid">
        {suggestions.map((s) => {
          const ing = INGREDIENT_BY_ID[s.id];
          const name = ing?.name ?? s.id;

          return (
            <div key={s.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h3 style={{ margin: 0 }}>{name}</h3>
                  <div className="subtle">
                    Unlocks <strong>{s.unlocks}</strong> drinks
                    {s.helpsTwoAway ? (
                      <>
                        {" "}
                        · Helps <strong>{s.helpsTwoAway}</strong> two-away
                      </>
                    ) : null}
                  </div>
                </div>

                <button className="btn" onClick={() => addIngredient(s.id)}>
                  Add
                </button>
              </div>
            </div>
          );
        })}

        {suggestions.length === 0 && (
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
