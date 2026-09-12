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
