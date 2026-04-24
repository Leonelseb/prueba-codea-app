-- Ejecutar en Supabase SQL Editor

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.recibos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  file_url text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.recibos enable row level security;

-- Políticas simples para MVP (revisar para producción)
create policy if not exists "allow service role all users"
  on public.users
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy if not exists "allow service role all recibos"
  on public.recibos
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Crear bucket de storage para recibos
insert into storage.buckets (id, name, public)
values ('recibos', 'recibos', true)
on conflict (id) do nothing;

-- Permisos de lectura pública para previews/URLs
create policy if not exists "public can read receipts bucket"
  on storage.objects
  for select
  using (bucket_id = 'recibos');

create policy if not exists "service role can upload receipts"
  on storage.objects
  for insert
  with check (bucket_id = 'recibos' and auth.role() = 'service_role');
