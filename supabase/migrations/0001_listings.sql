-- Step 3: listings and listing photos.
-- How to apply: open your Supabase project, go to SQL Editor, paste this whole
-- file, and click Run. Run it once only.

-- 1. The listings table: one row per item for sale.
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  -- Who is selling it. Filled in automatically with the logged-in user's id.
  seller_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  brand text check (char_length(brand) <= 50),
  size text not null check (char_length(size) <= 20),
  condition text not null check (
    condition in ('Mới còn tag', 'Like new', 'Rất tốt', 'Tốt', 'Đã qua sử dụng')
  ),
  category text not null check (
    category in ('women', 'men', 'accessories', 'shoes', 'designer', 'vintage', 'kids')
  ),
  -- Price in Vietnamese dong (no decimals), between 1.000 đ and 100.000.000 đ.
  price integer not null check (price between 1000 and 100000000),
  description text check (char_length(description) <= 1000),
  -- Where the photos live in Storage, e.g. "<seller id>/<random id>.jpg". 1 to 5 photos.
  photo_paths text[] not null check (cardinality(photo_paths) between 1 and 5),
  created_at timestamptz not null default now()
);

-- Makes "newest first" lists fast.
create index listings_created_at_idx on public.listings (created_at desc);

-- 2. Security rules (Row Level Security). With RLS on, nothing is allowed
-- unless a rule below allows it.
alter table public.listings enable row level security;

create policy "Anyone can view listings"
  on public.listings for select
  using (true);

create policy "Sellers can add their own listings"
  on public.listings for insert to authenticated
  with check ((select auth.uid()) = seller_id);

create policy "Sellers can edit their own listings"
  on public.listings for update to authenticated
  using ((select auth.uid()) = seller_id)
  with check ((select auth.uid()) = seller_id);

create policy "Sellers can delete their own listings"
  on public.listings for delete to authenticated
  using ((select auth.uid()) = seller_id);

-- 3. A public photo folder ("bucket"): anyone can view photos,
-- images only, max 5 MB each.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Users may only upload into, and delete from, a folder named after their own id.
create policy "Users upload photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Users delete their own photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
