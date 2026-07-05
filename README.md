# Tanoto Foundation — TFID Portfolio Assessment (Next.js + Supabase)

Cloud-backed version of the TFID Portfolio Review tool: 6‑Factor Strategic Assessment,
5‑Stage Maturity, Micro–Meso–Macro Level of Change, Pathway to Scale, the 1–2 page
Summary sheet, Analytics, and the Portfolio/Project filter + CRUD (add/edit/delete).

Data lives in **Supabase** (Postgres) so it is shared across devices/team in real time,
instead of a single browser's localStorage.

---

## 1) Create the database (Supabase)

Two tables, namespaced `pa_` so they do **not** collide with the tables already in the
`tfid_portfolioassessment` project.

Open **Supabase → your project → SQL Editor** and run, in order:

1. `supabase/schema.sql`  — creates `pa_projects`, `pa_assessments`, indexes, triggers, RLS + policies.
2. `supabase/seed.sql`    — inserts the 38 Workbook programs/projects (ids `tfid-001…tfid-038`).

(You can also let the app self-seed on first load if the tables are empty, but running
`seed.sql` gives deterministic ids and is recommended.)

## 2) Environment variables

Copy `.env.local.example` → `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://fnucbxvueboqkqifidqz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / publishable key>
```

Find the key in **Supabase → Settings → API → Project API keys → `anon` (publishable)**.

## 3) Run locally

```bash
npm install
cp .env.local.example .env.local   # then edit values
npm run dev                        # http://localhost:3000
```

## 4) Publish (Vercel)

1. Push this folder to a **GitHub** repo (GitHub web editor works fine).
2. In **Vercel → New Project → Import** the repo.
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in
   **Project → Settings → Environment Variables** (Production + Preview).
4. Deploy. Framework preset = Next.js (auto-detected). No extra build config needed.

---

## Security (please read)

- The app uses the **anon/publishable key** in the browser with **permissive RLS policies**
  (any client with the key can read/write `pa_projects` / `pa_assessments`). This is typical
  for an internal, unlisted tool but is **not** access-controlled. If the data is sensitive,
  add **Supabase Auth** and restrict the policies to authenticated users (or specific roles).
- Separately: the `tfid_portfolioassessment` project currently has **RLS disabled** on its
  other tables (`strategy_map, accountability, outcomes, programs, app_users, indicators`),
  which exposes them to anyone holding that project's anon key. That is independent of this
  app — review and enable RLS there when you're ready (enabling RLS *without* policies will
  block your other app, so add policies at the same time).

## Architecture notes (transparency)

- **Pragmatic port:** the battle-tested single-file app is mounted inside a Next.js client
  component (`app/page.jsx` → `lib/app.js`); only the **storage layer** was swapped from
  localStorage to Supabase. This preserves all QA-passed behaviour (scoring, filters, delete,
  summary sheet) rather than rewriting ~1,000 lines into React components.
- **Persistence:** each assessment is stored as a single `jsonb` `data` column keyed by
  `project_id`, matching the app's in-memory shape. Edits autosave on a **700 ms debounce**;
  saves **reconcile** (upsert current rows + delete removed ones), so add/edit/delete/reset/
  import/clear all stay in sync. A small status chip in the top bar shows *Saving… / Saved /
  failed*.
- **No Prisma here (by design):** because the UI autosaves heavily and stores a JSON blob,
  the Supabase JS client on the client side is simpler and avoids a server round-trip per
  keystroke. If you'd prefer the Prisma + two-URL pattern you use elsewhere (for a server API
  or typed schema), I can add it.

## Data model

`pa_projects(id text pk, portfolio, name, category, description, stage, level, pic, sort_order, created_at, updated_at)`

`pa_assessments(project_id text pk → pa_projects.id on delete cascade, data jsonb, updated_at)`
