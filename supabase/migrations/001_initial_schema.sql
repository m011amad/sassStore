-- Initial schema for multi-tenant SaaS ecommerce platform
-- Run: npx supabase db push  (or paste into Supabase SQL editor)

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────

create table public.merchants (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  subdomain     text unique not null,
  custom_domain text unique,
  branding      jsonb not null default '{}',
  plan          text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  stripe_id     text unique,
  created_at    timestamptz not null default now()
);

create table public.products (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid references public.merchants(id) on delete cascade not null,
  name        text not null,
  description text,
  price       integer not null check (price >= 0),  -- stored in cents
  stock       integer not null default 0 check (stock >= 0),
  images      text[] not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.customers (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid references public.merchants(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete set null,
  email       text not null,
  name        text,
  created_at  timestamptz not null default now(),
  unique (tenant_id, email)
);

create table public.orders (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid references public.merchants(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete set null,
  status      text not null default 'pending'
              check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total       integer not null check (total >= 0),  -- stored in cents
  items       jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────

create index merchants_subdomain_idx     on public.merchants(subdomain);
create index merchants_custom_domain_idx on public.merchants(custom_domain) where custom_domain is not null;
create index merchants_user_id_idx       on public.merchants(user_id);
create index products_tenant_id_idx      on public.products(tenant_id);
create index orders_tenant_id_idx        on public.orders(tenant_id);
create index orders_customer_id_idx      on public.orders(customer_id);
create index customers_tenant_id_idx     on public.customers(tenant_id);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

alter table public.merchants enable row level security;
alter table public.products   enable row level security;
alter table public.customers  enable row level security;
alter table public.orders     enable row level security;

-- Proxy/middleware needs to read merchants by subdomain/custom_domain for tenant resolution.
-- This is safe: branding and subdomain are public store metadata.
create policy "merchants_public_read"
  on public.merchants for select to anon, authenticated
  using (true);

-- Merchants can only mutate their own record
create policy "merchants_update_own"
  on public.merchants for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "merchants_insert_own"
  on public.merchants for insert to authenticated
  with check (user_id = auth.uid());

-- Products: public read (storefronts are public), merchant manages their own
create policy "products_public_read"
  on public.products for select to anon, authenticated
  using (true);

create policy "products_manage_own"
  on public.products for all to authenticated
  using (
    tenant_id in (select id from public.merchants where user_id = auth.uid())
  )
  with check (
    tenant_id in (select id from public.merchants where user_id = auth.uid())
  );

-- Customers: merchant manages their own tenant's customers
create policy "customers_manage_own"
  on public.customers for all to authenticated
  using (
    tenant_id in (select id from public.merchants where user_id = auth.uid())
  )
  with check (
    tenant_id in (select id from public.merchants where user_id = auth.uid())
  );

-- Customers can read their own record
create policy "customers_read_own"
  on public.customers for select to authenticated
  using (user_id = auth.uid());

-- Orders: merchant manages their own tenant's orders
create policy "orders_manage_own"
  on public.orders for all to authenticated
  using (
    tenant_id in (select id from public.merchants where user_id = auth.uid())
  )
  with check (
    tenant_id in (select id from public.merchants where user_id = auth.uid())
  );

-- Customers can read their own orders
create policy "orders_read_own_customer"
  on public.orders for select to authenticated
  using (
    customer_id in (select id from public.customers where user_id = auth.uid())
  );
