-- ============================================================
-- Sepette — Master Supabase Schema
-- Supabase Dashboard > SQL Editor > Run this entire file
-- ============================================================

-- ── 0. Profiles ───────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table public.profiles enable row level security;

drop policy if exists "own_profile" on public.profiles;
create policy "own_profile" on public.profiles
  for all using (auth.uid() = id);

-- ── 1. Addresses ──────────────────────────────────────────
create table if not exists public.addresses (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade not null,
  label      text        not null,
  is_active  boolean     default false,
  created_at timestamptz default now()
);
alter table public.addresses enable row level security;

drop policy if exists "own_addresses" on public.addresses;
create policy "own_addresses" on public.addresses
  for all using (auth.uid() = user_id);

-- ── 2. Restaurants ────────────────────────────────────────
-- Must be created before orders so policies can reference it
create table if not exists public.restaurants (
  id                   uuid        primary key default gen_random_uuid(),
  name                 text        not null,
  slug                 text        unique not null,
  owner_user_id        uuid        references auth.users(id) unique,
  is_open              boolean     default true,
  hours                jsonb       default '[
    {"open":"11:00","close":"22:00"},
    {"open":"11:00","close":"22:00"},
    {"open":"11:00","close":"22:00"},
    {"open":"11:00","close":"22:00"},
    {"open":"11:00","close":"22:00"},
    {"open":"11:00","close":"23:00"},
    {"open":"11:00","close":"23:00"}
  ]'::jsonb,
  unavailable_item_ids text[]      default '{}',
  is_suspended         boolean     default false,
  created_at           timestamptz default now()
);

alter table public.restaurants enable row level security;

drop policy if exists "owner_select" on public.restaurants;
drop policy if exists "owner_update" on public.restaurants;
drop policy if exists "public_read"  on public.restaurants;

create policy "public_read" on public.restaurants
  for select using (true);

create policy "owner_update" on public.restaurants
  for update using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

-- Admin can update any restaurant (for suspend/activate)
drop policy if exists "admin_update_restaurants" on public.restaurants;
create policy "admin_update_restaurants" on public.restaurants
  for update using (true)
  with check (true);

-- ── 3. Couriers ───────────────────────────────────────────
-- Must be created before orders so policies can reference it
create table if not exists public.couriers (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references auth.users(id) on delete cascade unique not null,
  name       text        not null,
  phone      text,
  is_active  boolean     default true,
  created_at timestamptz default now()
);

alter table public.couriers enable row level security;

drop policy if exists "courier_own" on public.couriers;
create policy "courier_own" on public.couriers
  for all using (auth.uid() = user_id);

-- ── 4. Orders ─────────────────────────────────────────────
create table if not exists public.orders (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references auth.users(id) on delete set null,
  restaurant_name   text        not null,
  items             jsonb       not null,
  total             numeric     not null,
  address           text        not null,
  status            text        default 'confirmed',
  scheduled_for     timestamptz,
  estimated_minutes int,
  guest_name        text,
  guest_phone       text,
  courier_id        uuid        references auth.users(id) on delete set null,
  created_at        timestamptz default now()
);

-- Add columns if table already exists (safe to re-run)
alter table public.orders
  add column if not exists scheduled_for     timestamptz,
  add column if not exists estimated_minutes int,
  add column if not exists guest_name        text,
  add column if not exists guest_phone       text,
  add column if not exists courier_id        uuid references auth.users(id) on delete set null;

alter table public.orders enable row level security;

drop policy if exists "own_orders"               on public.orders;
drop policy if exists "guest_insert"             on public.orders;
drop policy if exists "restaurant_owner_select"  on public.orders;
drop policy if exists "restaurant_owner_update"  on public.orders;
drop policy if exists "courier_select"           on public.orders;
drop policy if exists "courier_update"           on public.orders;

-- Logged-in users: full access to their own orders
create policy "own_orders" on public.orders
  for all using (auth.uid() = user_id);

-- Guest orders: anyone can insert (user_id will be null)
create policy "guest_insert" on public.orders
  for insert with check (user_id is null);

-- Restaurant owners: read & update orders for their restaurant
create policy "restaurant_owner_select" on public.orders
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.owner_user_id = auth.uid()
        and r.name = public.orders.restaurant_name
    )
    or user_id = auth.uid()
  );

create policy "restaurant_owner_update" on public.orders
  for update using (
    exists (
      select 1 from public.restaurants r
      where r.owner_user_id = auth.uid()
        and r.name = public.orders.restaurant_name
    )
  );

-- Couriers: read all active orders and update status
create policy "courier_select" on public.orders
  for select using (
    exists (
      select 1 from public.couriers c where c.user_id = auth.uid()
    )
  );

create policy "courier_update" on public.orders
  for update using (
    exists (
      select 1 from public.couriers c where c.user_id = auth.uid()
    )
  );

-- ── 5. Reviews ────────────────────────────────────────────
create table if not exists public.reviews (
  id              uuid        primary key default gen_random_uuid(),
  order_id        uuid        references public.orders(id) on delete cascade not null,
  user_id         uuid        references auth.users(id) on delete set null,
  restaurant_name text        not null,
  rating          int         not null check (rating between 1 and 5),
  speed_rating    int         check (speed_rating between 1 and 5),
  taste_rating    int         check (taste_rating between 1 and 5),
  service_rating  int         check (service_rating between 1 and 5),
  comment         text,
  reviewer_name   text,
  anonymous       boolean     default false,
  created_at      timestamptz default now()
);

alter table public.reviews enable row level security;

drop policy if exists "insert_review"       on public.reviews;
drop policy if exists "public_read_reviews" on public.reviews;
drop policy if exists "owner_delete_review" on public.reviews;

create policy "public_read_reviews" on public.reviews
  for select using (true);

create policy "insert_review" on public.reviews
  for insert with check (true);

create policy "owner_delete_review" on public.reviews
  for delete using (auth.uid() = user_id);

-- ── 6. Menu Items ─────────────────────────────────────────
create table if not exists public.menu_items (
  id            uuid        primary key default gen_random_uuid(),
  restaurant_id uuid        references public.restaurants(id) on delete cascade not null,
  category      text        not null,
  name          text        not null,
  description   text        default '',
  price         numeric     not null,
  image_url     text        default '',
  available     boolean     default true,
  position      int         default 0,
  created_at    timestamptz default now()
);

alter table public.menu_items enable row level security;

drop policy if exists "menu_public_read" on public.menu_items;
drop policy if exists "menu_owner_write" on public.menu_items;

create policy "menu_public_read" on public.menu_items
  for select using (true);

create policy "menu_owner_write" on public.menu_items
  for all using (
    exists (
      select 1 from public.restaurants r
      where r.id = public.menu_items.restaurant_id
        and r.owner_user_id = auth.uid()
    )
  );

-- ── 7. Realtime ───────────────────────────────────────────
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.restaurants;
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.menu_items;

-- ── 7. Seed data ──────────────────────────────────────────
-- Step 1: Create auth users in Dashboard > Authentication > Users
--         (one per restaurant owner + one per courier)
-- Step 2: Replace UUIDs below and uncomment

-- Restaurants:
-- insert into public.restaurants (name, slug, owner_user_id) values
--   ('La Mila',       'la-mila',          '<uuid-lamila-owner>'),
--   ('Pizza Palace',  'pizza-palace-ulm', '<uuid-pizza-owner>'),
--   ('Burger House',  'burger-house-ulm', '<uuid-burger-owner>'),
--   ('Sushi Garden',  'sushi-garden-ulm', '<uuid-sushi-owner>'),
--   ('Don Giovanni',  'don-giovanni-ulm', '<uuid-don-owner>')
-- on conflict (slug) do nothing;

-- Couriers:
-- insert into public.couriers (user_id, name, phone) values
--   ('<uuid-kurye1>', 'Ahmet Yılmaz', '+49 170 0000001'),
--   ('<uuid-kurye2>', 'Mehmet Kaya',  '+49 170 0000002')
-- on conflict (user_id) do nothing;
