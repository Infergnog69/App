-- Port of the prototype's features: profiles, likes, messages and demo orders.
-- How to apply: Supabase > SQL Editor > paste this whole file > Run. Once only,
-- after 0001_listings.sql.

-- =========================================================
-- 1. Profiles: the public face of each account.
--    Never contains the email address.
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Thành viên newd' check (char_length(display_name) between 1 and 50),
  username text unique check (username ~ '^[a-z0-9_.]{3,30}$'),
  location text check (char_length(location) <= 50),
  bio text check (char_length(bio) <= 300),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can view profiles"
  on public.profiles for select using (true);

create policy "Users can edit their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Create a profile automatically for every new account, using the name typed
-- on the sign up form (if any).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Thành viên newd')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts made before this file was run get a profile too.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- =========================================================
-- 2. Listings: add a location and a like counter.
-- =========================================================
alter table public.listings
  add column location text check (
    location in ('TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng')
  ),
  add column like_count integer not null default 0 check (like_count >= 0);

-- Sellers may edit their listing's details, but not its like counter.
revoke update on public.listings from authenticated, anon;
grant update (title, brand, size, condition, category, price, description, photo_paths, location)
  on public.listings to authenticated;

-- =========================================================
-- 3. Favourites ("Đã thích").
-- =========================================================
create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;

-- You see your own likes; sellers see who liked their items (for notifications).
create policy "See own likes and likes on own listings"
  on public.favorites for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = (select auth.uid())
    )
  );

create policy "Users like as themselves"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users remove their own likes"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Keep listings.like_count in step with the favorites table.
create function public.update_like_count()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set like_count = like_count + 1 where id = new.listing_id;
  else
    update public.listings set like_count = greatest(like_count - 1, 0) where id = old.listing_id;
  end if;
  return null;
end;
$$;

create trigger favorites_count
  after insert or delete on public.favorites
  for each row execute function public.update_like_count();

-- =========================================================
-- 4. Conversations and messages between buyer and seller.
-- =========================================================
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  buyer_last_read_at timestamptz not null default now(),
  seller_last_read_at timestamptz not null default 'epoch',
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

create index conversations_buyer_idx on public.conversations (buyer_id);
create index conversations_seller_idx on public.conversations (seller_id);

alter table public.conversations enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));

-- A buyer starts a conversation about someone else's listing.
create policy "Buyers can start conversations"
  on public.conversations for insert to authenticated
  with check (
    (select auth.uid()) = buyer_id
    and seller_id = (select l.seller_id from public.listings l where l.id = listing_id)
  );

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants can read messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );

create policy "Participants can send messages as themselves"
  on public.messages for insert to authenticated
  with check (
    (select auth.uid()) = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and (select auth.uid()) in (c.buyer_id, c.seller_id)
    )
  );

-- Bump the conversation to the top of the inbox when a message arrives.
create function public.touch_conversation()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return null;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- "I've read this conversation": only changes your own read marker.
create function public.mark_conversation_read(conversation uuid)
returns void
language sql
security definer set search_path = ''
as $$
  update public.conversations
  set buyer_last_read_at = case when buyer_id = auth.uid() then now() else buyer_last_read_at end,
      seller_last_read_at = case when seller_id = auth.uid() then now() else seller_last_read_at end
  where id = conversation and auth.uid() in (buyer_id, seller_id);
$$;

-- Unread messages per conversation, for the logged-in user.
create function public.unread_counts()
returns table (conversation_id uuid, unread integer)
language sql
stable
security invoker set search_path = ''
as $$
  select c.id, count(m.id)::integer
  from public.conversations c
  join public.messages m on m.conversation_id = c.id
  where m.sender_id <> auth.uid()
    and m.created_at > case when c.buyer_id = auth.uid() then c.buyer_last_read_at else c.seller_last_read_at end
  group by c.id;
$$;

-- =========================================================
-- 5. Demo orders: "Mua ngay" in test mode. No real money moves.
-- =========================================================
create table public.demo_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_price integer not null default 0,
  shipping integer not null default 30000,
  total integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.demo_orders enable row level security;

create policy "Buyers and sellers can view their demo orders"
  on public.demo_orders for select to authenticated
  using (
    (select auth.uid()) = buyer_id
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = (select auth.uid())
    )
  );

create policy "Buyers can place demo orders"
  on public.demo_orders for insert to authenticated
  with check ((select auth.uid()) = buyer_id);

-- Prices always come from the listing, never from the buyer's browser.
create function public.price_demo_order()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  listing record;
begin
  select price, seller_id into listing from public.listings where id = new.listing_id;
  if listing.seller_id = new.buyer_id then
    raise exception 'You cannot buy your own listing';
  end if;
  new.item_price := listing.price;
  new.shipping := 30000;
  new.total := listing.price + 30000;
  return new;
end;
$$;

create trigger demo_orders_price
  before insert on public.demo_orders
  for each row execute function public.price_demo_order();
