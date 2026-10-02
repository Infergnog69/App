# Learning log

## 2026-10-02: Step 1, project setup

- **Built:** reviewed the ChatGPT prototype, moved it into `prototype/`, and started a fresh Next.js app with a first Newd home page in the brand colours.
- **Concepts:** repository, branch, commit, pull request; `.gitignore` and why secrets live in `.env.local`; what a framework (Next.js) and a backend service (Supabase) do.
- **Claude Code features:** permissions (Claude only sees repos you grant), Plan mode (Shift+Tab), CLAUDE.md as project memory.
- **Next:** install Node.js and Git on your laptop and run the app locally; then step 2, sign up and log in with Supabase.

## 2026-10-02: Step 2, sign up and log in

- **Built:** sign up (`/signup`), log in (`/login`) and log out with Supabase, plus a header showing who's logged in.
- **Concepts:** environment variables (`.env.local`), hashing passwords, cookies and sessions, server actions (code that runs on the server when a form is sent), dev vs production projects.
- **Privacy:** we only store an email; passwords are hashed by Supabase. Dev project is in London with test data only; a live project for Vietnam (Singapore) comes later, after legal advice.
- **Claude Code features:** Plan mode before a bigger feature.
- **Next:** create listings with photos (step 3), starting with a `profiles` and `listings` table in the database.
