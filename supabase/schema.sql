-- Portfolio Assessment (TFID) schema — namespaced pa_ to avoid collision with existing tables.
-- Run this in Supabase -> SQL Editor (project: tfid_strategicperformance), then run seed.sql.

create table if not exists public.pa_projects (
  id          text primary key,
  portfolio   text not null,
  name        text not null,
  category    text,
  description text,
  stage       text,
  level       text,
  pic         text,
  sort_order  integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.pa_assessments (
  project_id text primary key references public.pa_projects(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists pa_projects_portfolio_idx on public.pa_projects (portfolio);
create index if not exists pa_projects_sort_idx on public.pa_projects (sort_order);

create or replace function public.pa_touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists pa_projects_touch on public.pa_projects;
create trigger pa_projects_touch before update on public.pa_projects
  for each row execute function public.pa_touch_updated_at();

drop trigger if exists pa_assessments_touch on public.pa_assessments;
create trigger pa_assessments_touch before update on public.pa_assessments
  for each row execute function public.pa_touch_updated_at();

-- RLS: explicit permissive policies for an internal tool using the anon/publishable key.
-- Harden later with Supabase Auth (see README "Security").
alter table public.pa_projects   enable row level security;
alter table public.pa_assessments enable row level security;

drop policy if exists pa_projects_rw on public.pa_projects;
create policy pa_projects_rw on public.pa_projects
  for all to anon, authenticated using (true) with check (true);

drop policy if exists pa_assessments_rw on public.pa_assessments;
create policy pa_assessments_rw on public.pa_assessments
  for all to anon, authenticated using (true) with check (true);
