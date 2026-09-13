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

-- Allow anonymous read access to app_documents (since CMS content and media are public anyway)
grant select on public.app_documents to anon, authenticated;

create policy "Allow read access to app documents for everyone"
  on public.app_documents
  for select
  to anon, authenticated
  using (true);

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
