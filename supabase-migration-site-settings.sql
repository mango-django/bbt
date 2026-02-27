-- Run this in your Supabase SQL Editor (or as a migration)
-- Creates the site_settings table used to store homepage featured product IDs

create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default now()
);

-- Allow the service-role key (used by the admin API) full access
-- (service role bypasses RLS by default — no extra policy needed)

-- Optional: restrict public/anon reads to safe keys only
alter table site_settings enable row level security;

create policy "Public can read site_settings"
  on site_settings for select
  using (true);

-- Only service-role (server-side API) can write — no anon insert/update policy needed
