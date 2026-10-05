# newd

Newd is a C2C (consumer to consumer) marketplace for second-hand clothes in Vietnam.
People list clothes they no longer wear, and others browse, chat and buy.

## Stack

- **Next.js** (React + TypeScript): builds the pages and the server side of the app.
- **Supabase**: login, the database (listings, profiles, likes, chats, demo orders) and photo storage.
- **Vercel** (later): hosting, so the app is on the internet.

## Run it on your computer

You need [Node.js](https://nodejs.org) (the LTS version) and [Git](https://git-scm.com).

```bash
git clone https://github.com/Infergnog69/App.git
cd App
npm install       # downloads the packages listed in package.json
npm run dev       # starts the app
```

On Windows PowerShell, type `npm.cmd` instead of `npm`.

Before the first run, connect it to Supabase:

1. Copy `.env.example` to a new file called `.env.local`.
2. In your Supabase project, open **Project Settings → API Keys** and copy the **publishable** key, and the **Project URL**.
3. Paste them into `.env.local`, save, and restart `npm run dev`.

Never put the **secret** (service_role) key in this app.

## Database changes

Database changes live in `supabase/migrations/`, numbered in order. To apply one, open your Supabase project's **SQL Editor**, paste the whole file and click **Run**, once.

Then open http://localhost:3000 in your browser. Press `Ctrl+C` in the terminal to stop it.

## Check the code

```bash
npm test          # runs the automated tests (price rules, search, profiles etc.)
npm run lint      # looks for common mistakes
npm run build     # checks the whole app compiles
```

## Folders

- `app/`: the pages, one folder per address:
  - `app/page.tsx` home, `app/search` Tìm kiếm, `app/sell` Đăng bán, `app/listings/[id]` one listing.
  - `app/messages` inbox and notifications, `app/messages/[id]` one chat.
  - `app/profile` your profile, `app/profile/edit` edit it, `app/profile/[id]` someone else's.
  - `app/login` and `app/signup` the account pages.
- `app/actions/` and `app/auth/actions.ts`: code that runs on the server when you press a button (like, send a message, demo order, save profile, log in).
- `app/globals.css`: the whole look of the app, copied from the prototype. Brand colours are at the top.
- `components/`: pieces shared by several pages (header, bottom bar, listing card, chat, filters).
- `lib/supabase/`: the connection to Supabase. `lib/data.ts`: the database reads pages share.
- `lib/listings.ts`, `lib/search.ts`, `lib/profile.ts`, `lib/format.ts`: rules and helpers, each with a `.test.ts` file.
- `supabase/migrations/`: database changes, applied in Supabase's SQL Editor.
- `proxy.ts`: runs before every page to keep the login session fresh.
- `public/`: images and files served as-is.
- `prototype/`: the original ChatGPT browser prototype (v0.2.1), kept as a design reference.
- `docs/LEARNING_LOG.md`: what we built and learned each session.

## Payments

Checkout is a **demo only**: "Mua ngay" saves a test order, and no money moves.

## Secrets

Real keys go in `.env.local`, which Git ignores. `.env.example` shows which keys are needed, with fake values.
