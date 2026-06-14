-- ==============================================
-- 별채홈피 DB 스키마 (Supabase)
-- 실행: Supabase Studio > SQL Editor
-- ==============================================

-- ────────────────────────────────────────────
-- 통합 profiles 테이블 (revely 공통)
-- 이미 있으면 skip, 없으면 생성
-- ────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users on delete cascade,
  nickname    text unique,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  constraint nickname_length check (char_length(nickname) between 2 and 20),
  constraint nickname_format check (nickname ~ '^[가-힣a-zA-Z0-9_]+$')
);

-- 닉네임 업데이트 트리거
create or replace function update_profiles_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_profiles_updated_at();

-- ────────────────────────────────────────────
-- 별채 프로필 (꾸미기)
-- ────────────────────────────────────────────
create table if not exists byeolchae_profiles (
  user_id      uuid primary key references auth.users on delete cascade,
  bio          text check (length(bio) <= 100),
  theme_color  text default 'cream',
  bgm_url      text,
  layout_json  jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create or replace function update_byeolchae_profiles_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists byeolchae_profiles_updated_at on byeolchae_profiles;
create trigger byeolchae_profiles_updated_at
  before update on byeolchae_profiles
  for each row execute function update_byeolchae_profiles_updated_at();

-- ────────────────────────────────────────────
-- 일촌 (친구)
-- ────────────────────────────────────────────
create table if not exists byeolchae_friends (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid references auth.users on delete cascade not null,
  to_user     uuid references auth.users on delete cascade not null,
  status      text check (status in ('pending','accepted','blocked')) default 'pending',
  created_at  timestamptz default now(),
  unique(from_user, to_user)
);

create index if not exists byeolchae_friends_from_user_idx on byeolchae_friends(from_user);
create index if not exists byeolchae_friends_to_user_idx on byeolchae_friends(to_user);

-- ────────────────────────────────────────────
-- 방명록
-- ────────────────────────────────────────────
create table if not exists byeolchae_guestbook (
  id                 uuid primary key default gen_random_uuid(),
  host_user          uuid references auth.users on delete cascade not null,
  author_user        uuid references auth.users on delete cascade not null,
  content            text not null check (length(content) between 1 and 140),
  is_private         boolean default false,
  moderation_status  text check (moderation_status in ('pending','approved','flagged')) default 'pending',
  created_at         timestamptz default now()
);

create index if not exists byeolchae_guestbook_host_user_idx on byeolchae_guestbook(host_user);

-- ────────────────────────────────────────────
-- 게시글
-- ────────────────────────────────────────────
create table if not exists byeolchae_posts (
  id                 uuid primary key default gen_random_uuid(),
  author_user        uuid references auth.users on delete cascade not null,
  title              text not null check (length(title) between 1 and 100),
  body               text not null check (length(body) between 1 and 5000),
  image_urls         text[] default '{}',
  moderation_status  text check (moderation_status in ('pending','approved','flagged')) default 'pending',
  view_count         int default 0,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists byeolchae_posts_author_user_idx on byeolchae_posts(author_user);
create index if not exists byeolchae_posts_created_at_idx on byeolchae_posts(created_at desc);

-- 조회수 increment RPC
create or replace function increment_post_view(post_id uuid)
returns void language plpgsql security definer as $$
begin
  update byeolchae_posts set view_count = view_count + 1 where id = post_id;
end;
$$;

-- ────────────────────────────────────────────
-- 댓글
-- ────────────────────────────────────────────
create table if not exists byeolchae_comments (
  id                 uuid primary key default gen_random_uuid(),
  post_id            uuid references byeolchae_posts on delete cascade not null,
  author_user        uuid references auth.users on delete cascade not null,
  content            text not null check (length(content) between 1 and 500),
  moderation_status  text check (moderation_status in ('pending','approved','flagged')) default 'pending',
  created_at         timestamptz default now()
);

create index if not exists byeolchae_comments_post_id_idx on byeolchae_comments(post_id);

-- ────────────────────────────────────────────
-- 응원 (후원자)
-- ────────────────────────────────────────────
create table if not exists byeolchae_supporters (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users on delete cascade not null,
  tier                text check (tier in ('bronze','silver','gold')) not null,
  amount_krw          int not null,
  toss_payment_key    text,
  paid_at             timestamptz default now(),
  expires_at          timestamptz,
  ads_disabled_until  timestamptz
);

create index if not exists byeolchae_supporters_user_id_idx on byeolchae_supporters(user_id);

-- ────────────────────────────────────────────
-- 알림
-- ────────────────────────────────────────────
create table if not exists byeolchae_notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users on delete cascade not null,
  type        text check (type in ('guestbook','comment','friend_request','friend_accept')) not null,
  ref_id      uuid,
  is_read     boolean default false,
  created_at  timestamptz default now()
);

create index if not exists byeolchae_notifications_user_id_idx on byeolchae_notifications(user_id);
create index if not exists byeolchae_notifications_is_read_idx on byeolchae_notifications(user_id, is_read);

-- ────────────────────────────────────────────
-- RLS 정책
-- ────────────────────────────────────────────

-- profiles RLS
alter table profiles enable row level security;
drop policy if exists "profiles_select_all" on profiles;
create policy "profiles_select_all" on profiles for select using (true);
drop policy if exists "profiles_insert_own" on profiles;
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- byeolchae_profiles RLS
alter table byeolchae_profiles enable row level security;
drop policy if exists "bp_select_all" on byeolchae_profiles;
create policy "bp_select_all" on byeolchae_profiles for select using (true);
drop policy if exists "bp_insert_own" on byeolchae_profiles;
create policy "bp_insert_own" on byeolchae_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "bp_update_own" on byeolchae_profiles;
create policy "bp_update_own" on byeolchae_profiles for update using (auth.uid() = user_id);

-- byeolchae_guestbook RLS
alter table byeolchae_guestbook enable row level security;
drop policy if exists "gb_select_public" on byeolchae_guestbook;
create policy "gb_select_public" on byeolchae_guestbook
  for select using (
    is_private = false
    and moderation_status = 'approved'
    or auth.uid() = host_user
    or auth.uid() = author_user
  );
drop policy if exists "gb_insert_auth" on byeolchae_guestbook;
create policy "gb_insert_auth" on byeolchae_guestbook for insert with check (auth.uid() = author_user);
drop policy if exists "gb_delete_own" on byeolchae_guestbook;
create policy "gb_delete_own" on byeolchae_guestbook
  for delete using (auth.uid() = author_user or auth.uid() = host_user);

-- byeolchae_posts RLS
alter table byeolchae_posts enable row level security;
drop policy if exists "posts_select_approved" on byeolchae_posts;
create policy "posts_select_approved" on byeolchae_posts
  for select using (moderation_status = 'approved' or auth.uid() = author_user);
drop policy if exists "posts_insert_own" on byeolchae_posts;
create policy "posts_insert_own" on byeolchae_posts for insert with check (auth.uid() = author_user);
drop policy if exists "posts_delete_own" on byeolchae_posts;
create policy "posts_delete_own" on byeolchae_posts for delete using (auth.uid() = author_user);

-- byeolchae_comments RLS
alter table byeolchae_comments enable row level security;
drop policy if exists "comments_select_approved" on byeolchae_comments;
create policy "comments_select_approved" on byeolchae_comments
  for select using (moderation_status = 'approved' or auth.uid() = author_user);
drop policy if exists "comments_insert_auth" on byeolchae_comments;
create policy "comments_insert_auth" on byeolchae_comments for insert with check (auth.uid() = author_user);
drop policy if exists "comments_delete_own" on byeolchae_comments;
create policy "comments_delete_own" on byeolchae_comments for delete using (auth.uid() = author_user);

-- byeolchae_friends RLS
alter table byeolchae_friends enable row level security;
drop policy if exists "friends_select_own" on byeolchae_friends;
create policy "friends_select_own" on byeolchae_friends
  for select using (auth.uid() = from_user or auth.uid() = to_user);
drop policy if exists "friends_insert_own" on byeolchae_friends;
create policy "friends_insert_own" on byeolchae_friends for insert with check (auth.uid() = from_user);
drop policy if exists "friends_update_to" on byeolchae_friends;
create policy "friends_update_to" on byeolchae_friends for update using (auth.uid() = to_user or auth.uid() = from_user);
drop policy if exists "friends_delete_own" on byeolchae_friends;
create policy "friends_delete_own" on byeolchae_friends for delete using (auth.uid() = from_user or auth.uid() = to_user);

-- byeolchae_supporters RLS
alter table byeolchae_supporters enable row level security;
drop policy if exists "supporters_select_own" on byeolchae_supporters;
create policy "supporters_select_own" on byeolchae_supporters
  for select using (auth.uid() = user_id);
drop policy if exists "supporters_insert_own" on byeolchae_supporters;
create policy "supporters_insert_own" on byeolchae_supporters for insert with check (auth.uid() = user_id);

-- byeolchae_notifications RLS
alter table byeolchae_notifications enable row level security;
drop policy if exists "notifications_select_own" on byeolchae_notifications;
create policy "notifications_select_own" on byeolchae_notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on byeolchae_notifications;
create policy "notifications_update_own" on byeolchae_notifications for update using (auth.uid() = user_id);

-- ────────────────────────────────────────────
-- Storage bucket
-- ────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('byeolchae', 'byeolchae', true)
  on conflict (id) do nothing;

drop policy if exists "byeolchae_storage_select" on storage.objects;
create policy "byeolchae_storage_select" on storage.objects
  for select using (bucket_id = 'byeolchae');

drop policy if exists "byeolchae_storage_insert" on storage.objects;
create policy "byeolchae_storage_insert" on storage.objects
  for insert with check (bucket_id = 'byeolchae' and auth.role() = 'authenticated');

drop policy if exists "byeolchae_storage_delete_own" on storage.objects;
create policy "byeolchae_storage_delete_own" on storage.objects
  for delete using (bucket_id = 'byeolchae' and auth.uid()::text = (storage.foldername(name))[2]);

-- ────────────────────────────────────────────
-- Supabase Auth redirect URL 추가 필요 (수동)
-- https://byeolchae.revely.company/auth/callback
-- https://[staging-url].vercel.app/auth/callback
-- ────────────────────────────────────────────
