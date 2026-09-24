create table if not exists public.guest_passes (
  id text primary key,
  token text not null unique,
  active boolean not null default true,
  check_in_date date not null,
  check_out_date date not null,
  pass jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists guest_passes_token_idx on public.guest_passes(token);

create table if not exists public.app_documents (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.guest_passes enable row level security;
alter table public.app_documents enable row level security;

revoke all on public.guest_passes from anon, authenticated;
revoke all on public.app_documents from anon, authenticated;

-- The server accesses these tables only with SUPABASE_SERVICE_ROLE_KEY.
-- Never expose that key in Vite/browser variables.

-- Allow anonymous guests to read their boarding passes from Supabase client-side
grant select on public.guest_passes to anon, authenticated;

create policy "Allow read access to guest passes by token"
  on public.guest_passes
  for select
  to anon, authenticated
  using (true);

-- Allow service_role to perform any operation on guest_passes
create policy "Allow service_role full access on guest_passes"
  on public.guest_passes
  for all
  to service_role
  using (true)
  with check (true);

-- app_documents contains mixed content: public CMS documents (guest guide
-- overrides published by the host) and SENSITIVE server-side configuration
-- (home_assistant_config with the door-opener token, alloggiati_config with
-- police-portal credentials, channel_manager_config). Only the published CMS
-- document may be readable with the public anon key; everything else must be
-- read/written exclusively by the server via SUPABASE_SERVICE_ROLE_KEY.
grant select on public.app_documents to anon, authenticated;

create policy "Allow public read of published CMS edits only"
  on public.app_documents
  for select
  to anon, authenticated
  using (key = 'aurora_visual_cms_edits_v1');

-- Writing CMS edits requires an authenticated host session: the builder saves
-- through the server (POST/PUT /api/cms/edits) which uses the service role key,
-- so anon/authenticated have NO direct INSERT/UPDATE/DELETE here.
-- (Only the service_role policy below grants write access.)

-- Allow service_role to perform any operation on app_documents
create policy "Allow service_role full access on app_documents"
  on public.app_documents
  for all
  to service_role
  using (true)
  with check (true);

-- Table for digital key access logs by guests
create table if not exists public.digital_key_logs (
  id uuid default gen_random_uuid() primary key,
  timestamp timestamptz not null default now(),
  guest_pass_id text references public.guest_passes(id) on delete set null,
  guest_name text not null,
  success boolean not null,
  error_message text,
  source text,
  ip_address text
);

create index if not exists digital_key_logs_guest_pass_id_idx on public.digital_key_logs(guest_pass_id);

alter table public.digital_key_logs enable row level security;
revoke all on public.digital_key_logs from anon, authenticated;

-- Allow service_role to perform any operation on digital_key_logs
create policy "Allow service_role full access on digital_key_logs"
  on public.digital_key_logs
  for all
  to service_role
  using (true)
  with check (true);

-- Table for in-app guest activity tracking (page views, button clicks, feature
-- usage). Written and read only via the server's SUPABASE_SERVICE_ROLE_KEY, so
-- it survives across serverless invocations (unlike a local JSON file on disk,
-- which is reset/ephemeral in serverless deployments such as Vercel - this table
-- is what fixes the "activity disappears after a refresh" issue).
create table if not exists public.guest_activity_log (
  id text primary key,
  pass_id text references public.guest_passes(id) on delete cascade,
  guest_name text not null,
  action text not null,
  detail text,
  session_id text,
  timestamp timestamptz not null default now()
);

create index if not exists guest_activity_log_pass_id_idx on public.guest_activity_log(pass_id);
create index if not exists guest_activity_log_timestamp_idx on public.guest_activity_log(timestamp desc);

alter table public.guest_activity_log enable row level security;
revoke all on public.guest_activity_log from anon, authenticated;

-- Allow service_role to perform any operation on guest_activity_log
create policy "Allow service_role full access on guest_activity_log"
  on public.guest_activity_log
  for all
  to service_role
  using (true)
  with check (true);
