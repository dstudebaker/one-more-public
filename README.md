# One More (MVP)

Classic whiskey-bar themed cocktail “home inventory” app.

## What’s included
- MVP product spec: `SPEC.md`
- Curated starter dataset: `data/ingredients.json`, `data/recipes.json`
- Next.js app (App Router) that:
  - Lets you toggle “My Bar” ingredients (stored in localStorage)
  - Shows Make Now / One Away / Two Away
  - Shows Unlock suggestions (“Add One More”)

## Run locally
```bash
npm install
npm run dev
```
Then open http://localhost:3000

## Next steps (when you’re ready)
- Replace localStorage with real auth + persistence:
  - Cognito/Amplify for auth
  - DynamoDB for inventory
- Add AI (Bedrock vision) for bottle photo recognition
- Add Stripe monthly + yearly subscriptions
