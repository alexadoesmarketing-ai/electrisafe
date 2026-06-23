# ElectriSafe AI — Vercel Deployment

Electrical diagnostic app for OnLehane Electric LLC.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → import your repo
3. Add environment variable in Vercel dashboard:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
4. Deploy — done

## Local development

```bash
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

## How it works

- Frontend: Next.js 14 App Router + React
- API: `/api/diagnose` proxies requests to Anthropic — key never exposed to browser
- Diagnosis: Claude Sonnet with NEC code knowledge baked into system prompt
