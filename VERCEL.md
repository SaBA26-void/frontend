# Deploy frontend on Vercel (recommended for Next.js)

## Why Vercel (not Railway) for the frontend
- Built for Next.js App Router
- Free hobby tier is enough for this shop
- Keep Railway for the .NET API + Postgres

## Steps
1. Push the `frontend` repo to GitHub.
2. [vercel.com](https://vercel.com) → New Project → import that repo.
3. Root Directory: leave as repo root (if the repo is only the frontend).
4. Add Environment Variable:
   - Name: `NEXT_PUBLIC_API_BASE_URL`
   - Value: `https://backend-production-1d0d5.up.railway.app`
   - Apply to Production, Preview, Development
5. Deploy.

## After deploy
Open your `*.vercel.app` URL. Categories/products should load from Railway.

Backend CORS already allows:
- `http://localhost:3000`
- any `*.vercel.app` origin

Redeploy the **backend** once after pulling the latest CORS changes.
