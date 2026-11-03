-- Esquema de Supabase de Notas de Cursos (proyecto yxvdpqzpiqkkcucdyywt).
-- Foto reconstruida del estado actual; los secretos NO van aquí (viven en public.app_secrets).

create extension if not exists pg_cron;
create extension if not exists pg_net;

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path to '' as $$
begin new.updated_at = clock_timestamp(); return new; end $$;

create table public.cycles(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null, archived boolean not null default false, deleted boolean not null default false,
  updated_at timestamptz not null default now());
create table public.courses(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  cycle_id uuid, name text not null, abbr text not null, color text not null default '#4f8cff',
  days smallint[] not null default '{}', sort integer not null default 0, deleted boolean not null default false,
  updated_at timestamptz not null default now());
create table public.sessions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  course_id uuid not null, number integer not null, date date not null, content text not null default '',
  deleted boolean not null default false, updated_at timestamptz not null default now());
create table public.tasks(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  course_id uuid, title text not null, due_date date not null, due_time time,
  done boolean not null default false, snooze_until date, snoozes integer not null default 0,
  deleted boolean not null default false, updated_at timestamptz not null default now());
create table public.settings(
  user_id uuid primary key default auth.uid() references auth.users(id),
  notify_time time not null default '06:00', timezone text not null default 'America/Lima',
  updated_at timestamptz not null default now());

-- Cada usuario solo ve y cambia sus filas; updated_at lo pone el servidor (lo usa la sincronización)
do $$ declare t text; begin
  foreach t in array array['cycles','courses','sessions','tasks','settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "solo mis filas" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format('create trigger touch_%s before insert or update on public.%I for each row execute function public.touch_updated_at()', t, t);
    execute format('create index %s_sync_idx on public.%I (user_id, updated_at)', t, t);
  end loop;
end $$;

-- Avisos push: solo los usa la función "push" con service_role
create table public.push_subs(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique, sub jsonb not null, created_at timestamptz not null default now());
create index push_subs_user_idx on public.push_subs(user_id);
create table public.app_secrets(name text primary key, value text not null); -- vapid_public, vapid_private (las crea la función), cron_secret
alter table public.push_subs enable row level security;
alter table public.app_secrets enable row level security;
revoke all on public.push_subs, public.app_secrets from anon, authenticated;
grant select, insert on public.app_secrets to service_role;
insert into public.app_secrets(name,value) values ('cron_secret', encode(extensions.gen_random_bytes(32),'hex'));
grant select, insert, update, delete on public.push_subs to service_role;
grant select on public.tasks, public.courses to service_role;

-- Aviso diario 6:00 a. m. Lima = 11:00 UTC
select cron.schedule('avisos-diarios', '0 11 * * *', $$select net.http_post(
  url := 'https://yxvdpqzpiqkkcucdyywt.supabase.co/functions/v1/push',
  headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',(select value from public.app_secrets where name='cron_secret')),
  body := '{}'::jsonb, timeout_milliseconds := 30000)$$);
