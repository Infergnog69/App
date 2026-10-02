@AGENTS.md

# Newd: notes for Claude

- Owner is new to coding: explain what and why before each task, add a short "What you just learned" after.
- Stack: Next.js (App Router, TypeScript, plain CSS modules) + Supabase (from step 2). Deploy on Vercel later.
- Run locally: `npm run dev`. Checks: `npm test`, `npm run lint` and `npm run build`. User is on Windows: tell them `npm.cmd`.
- Database changes: new numbered SQL file in `supabase/migrations/`; the user runs it in the Supabase SQL Editor. Always enable Row Level Security on new tables.
- UI text is Vietnamese. Brand colours live in `app/globals.css`.
- `prototype/` is the old ChatGPT prototype: design reference only, don't build on it.
- Never commit secrets: real keys go in `.env.local`; keep `.env.example` with fake values.
- Git: work on a branch, small commits, open a PR. Never force-push or merge to main without asking.
