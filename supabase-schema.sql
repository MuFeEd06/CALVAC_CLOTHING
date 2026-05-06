-- ============================================================
-- CALVAC — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── CATEGORIES ─────────────────────────────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz default now()
);

-- Seed default categories
insert into categories (name, slug) values
  ('Jackets', 'jackets'),
  ('Tees', 'tees'),
  ('Pants', 'pants'),
  ('Hoodies', 'hoodies'),
  ('Accessories', 'accessories');

-- ─── PRODUCTS ───────────────────────────────────────────────
create table products (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  slug           text not null unique,
  description    text,
  price          numeric(10,2) not null,
  compare_price  numeric(10,2),
  category_id    uuid references categories(id) on delete set null,
  images         text[] default '{}',
  sizes          text[] default '{}',
  colors         jsonb default '[]',   -- [{name, hex, price?}]
  stock          integer default 0,
  is_featured    boolean default false,
  is_active      boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index on products(category_id);
create index on products(is_active, is_featured);
create index on products(slug);

-- ─── ORDERS ─────────────────────────────────────────────────
create table orders (
  id                uuid primary key default uuid_generate_v4(),
  order_number      text not null unique,
  customer_name     text not null,
  customer_phone    text not null,
  customer_address  text,
  items             jsonb not null default '[]',
  subtotal          numeric(10,2) not null,
  status            text not null default 'pending'
                    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  whatsapp_sent_at  timestamptz,
  notes             text,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index on orders(status);
create index on orders(created_at desc);

-- ─── SITE SETTINGS ──────────────────────────────────────────
create table site_settings (
  id                  uuid primary key default uuid_generate_v4(),
  brand_name          text default 'CALVAC',
  whatsapp_number     text default '919999999999',
  hero_headline       text default 'where - style',
  hero_subheadline    text default 'lives - now',
  hero_description    text default 'Explore curated collections, exclusive drops and everyday essentials all thoughtfully designed in one stylish shopping destination.',
  announcement_text   text,
  instagram_url       text,
  facebook_url        text,
  updated_at          timestamptz default now()
);

-- Seed default settings (only one row ever)
insert into site_settings (brand_name, whatsapp_number) values ('CALVAC', '919999999999');

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
-- Products & categories: public read, auth write
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table site_settings enable row level security;

-- Public can read active products
create policy "Public read products" on products
  for select using (is_active = true);

-- Public can read categories
create policy "Public read categories" on categories
  for select using (true);

-- Public can read site settings
create policy "Public read settings" on site_settings
  for select using (true);

-- Public can insert orders (for checkout)
create policy "Public insert orders" on orders
  for insert with check (true);

-- Authenticated (admin) can do everything
create policy "Admin all products" on products
  for all using (auth.role() = 'authenticated');

create policy "Admin all categories" on categories
  for all using (auth.role() = 'authenticated');

create policy "Admin all orders" on orders
  for all using (auth.role() = 'authenticated');

create policy "Admin all settings" on site_settings
  for all using (auth.role() = 'authenticated');

-- ─── STORAGE ────────────────────────────────────────────────
-- Run these in the Supabase Storage UI or via this SQL:
-- 1. Create a bucket called "product-images" with public access ON
-- The Next.js app uploads to this bucket via supabase.storage

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

create trigger settings_updated_at before update on site_settings
  for each row execute function update_updated_at();
