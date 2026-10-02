# newd

Newd is a C2C (consumer to consumer) marketplace for second-hand clothes in Vietnam.
People list clothes they no longer wear, and others browse, chat and buy.

## Stack

- **Next.js** (React + TypeScript): builds the pages and the server side of the app.
- **Supabase** (coming in step 2): login, database and photo storage.
- **Vercel** (later): hosting, so the app is on the internet.

## Run it on your computer

You need [Node.js](https://nodejs.org) (the LTS version) and [Git](https://git-scm.com).

```bash
git clone https://github.com/Infergnog69/App.git
cd App
npm install       # downloads the packages listed in package.json
npm run dev       # starts the app
```

Then open http://localhost:3000 in your browser. Press `Ctrl+C` in the terminal to stop it.

## Check the code

```bash
npm run lint      # looks for common mistakes
npm run build     # checks the whole app compiles
```

## Folders

- `app/`: the pages. `app/page.tsx` is the home page.
- `public/`: images and files served as-is.
- `prototype/`: the original ChatGPT browser prototype (v0.2.1), kept as a design reference.
- `docs/LEARNING_LOG.md`: what we built and learned each session.

## Secrets

Real keys go in `.env.local`, which Git ignores. `.env.example` shows which keys are needed, with fake values.
