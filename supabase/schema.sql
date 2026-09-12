create table if not exists public.guest_passes (
id text primary key,
token text not null unique,
active boolean not null default true,
check_in_date date not null,
check_out_date date not null,
pass jsonb not null,
created_at timestamptz not null default now(),
guest_name text,
guest_surname text,
guest_phone text,
message_channel text default 'whatsapp' check (message_channel in ('whatsapp', 'sms')),
message_sent_at timestamptz,
guest_link text,
public_base_url text default 'https://casa-aurora-in-valtellina.vercel.app',
booking_ref text,
source text,
created_by text
);
create index if not exists guest_passes_token_idx on public.guest_passes(token);
create index if not exists guest_passes_phone_idx on public.guest_passes(guest_phone);
create index if not exists guest_passes_message_sent_idx on public.guest_passes(message_sent_at);
create table if not exists public.app_documents (
key text primary key,
value jsonb not null,
updated_at timestamptz not null default now()
);
create table if not exists public.ical_sources (
id uuid primary key default gen_random_uuid(),
name text not null,
property_name text,
provider text not null default 'bedandbreakfast',
url text not null,
active boolean not null default true,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);
create table if not exists public.ical_events (
id uuid primary key default gen_random_uuid(),
source_id uuid not null references public.ical_sources(id) on delete cascade,
external_uid text not null,
summary text,
starts_at timestamptz not null,
ends_at timestamptz not null,
status text not null default 'confirmed',
raw_event jsonb,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
unique (source_id, external_uid)
);
create index if not exists ical_sources_active_idx on public.ical_sources(active);
create index if not exists ical_events_starts_idx on public.ical_events(starts_at);
alter table public.guest_passes enable row level security;
alter table public.app_documents enable row level security;
alter table public.ical_sources enable row level security;
alter table public.ical_events enable row level security;
revoke all on public.guest_passes from anon, authenticated;
revoke all on public.app_documents from anon, authenticated;
revoke all on public.ical_sources from anon, authenticated;
revoke all on public.ical_events from anon, authenticated;
-- The server accesses these tables only with SUPABASE_SERVICE_ROLE_KEY.
-- Never expose that key in Vite/browser variables.
