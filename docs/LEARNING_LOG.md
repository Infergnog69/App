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

## 2026-10-02: Step 3, create and view listings

- **Built:** a `listings` table with security rules, a public photo folder, the Đăng bán page with photo upload, a page per listing, and a "Mới đăng" grid on the home page.
- **Concepts:** database tables and columns, Row Level Security (who may read or change which rows), migrations (database changes saved as files), client vs server code, automated tests.
- **Privacy:** photos are shrunk in the browser before upload, which also strips hidden GPS data; listings never show the seller's email.
- **Tests:** `npm test` checks the price rules and listing validation (11 tests).
- **Next:** browse, search and filter (step 4).

## 2026-10-05: Prototype features ported to the real app

- **Built:** every screen of the prototype on top of Supabase: home with category pills, search with suggestions, sorting and a filter sheet, a full-screen listing page with share, likes, chat with sellers, a demo checkout, notifications, profiles (yours, other people's, and an edit page), and the onboarding card. The prototype's stylesheet is now `app/globals.css`, so the look is the same.
- **Concepts:** database triggers (the database keeps like counts and prices honest by itself), counters and "unread" state, client vs server components, portals (drawing a pop-up straight into the page body), why one big change still goes in several small commits.
- **Privacy:** profiles only show a display name, @username, city and bio, never an email. Chats are only readable by the two people in them. Demo orders never take payment details.
- **Tests:** 30 tests (prices, listing validation, search, profiles, time formatting).
- **Next:** run migration `0002`, try every screen with two test accounts, then decide what to polish.
