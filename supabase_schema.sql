-- Run this in Supabase Dashboard → SQL Editor

-- Addresses
create table if not exists addresses (
  id         uuid    default gen_random_uuid() primary key,
  user_id    uuid    references auth.users(id) on delete cascade not null,
  label      text    not null,
  is_active  boolean default false,
  created_at timestamptz default now()
);
alter table addresses enable row level security;
create policy "own_addresses" on addresses for all using (auth.uid() = user_id);

-- Orders
create table if not exists orders (
  id              uuid    default gen_random_uuid() primary key,
  user_id         uuid    references auth.users(id) on delete cascade not null,
  restaurant_name text    not null,
  items           jsonb   not null,
  total           numeric not null,
  address         text    not null,
  status          text    default 'confirmed',
  created_at      timestamptz default now()
);
alter table orders enable row level security;
create policy "own_orders" on orders for all using (auth.uid() = user_id);