create extension if not exists pgcrypto;
create type public.profile_visibility as enum ('public','friends','private');
create type public.friendship_status as enum ('pending','accepted','declined');
create type public.report_status as enum ('open','reviewing','resolved','dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text check (char_length(display_name)<=50), bio text check (char_length(bio)<=5000),
  city text, region text, country text, birth_date date, avatar_url text, header_url text,
  mood text check(char_length(mood)<=80), profile_song_url text, profile_song_title text,
  theme jsonb not null default '{"preset":"classic","colors":{}}', visibility profile_visibility not null default 'public',
  is_artist boolean not null default false, is_suspended boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.friendships (
  requester_id uuid references profiles(id) on delete cascade, addressee_id uuid references profiles(id) on delete cascade,
  status friendship_status not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(requester_id,addressee_id), check(requester_id<>addressee_id)
);
create table public.top_friends (owner_id uuid references profiles(id) on delete cascade, friend_id uuid references profiles(id) on delete cascade, position smallint check(position between 1 and 8), primary key(owner_id,position), unique(owner_id,friend_id));
create table public.blocks (blocker_id uuid references profiles(id) on delete cascade, blocked_id uuid references profiles(id) on delete cascade, created_at timestamptz default now(), primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id));
create table public.bulletins (id uuid primary key default gen_random_uuid(),author_id uuid not null references profiles(id) on delete cascade,body text not null check(char_length(body) between 1 and 2000),expires_at timestamptz default(now()+interval '10 days'),created_at timestamptz default now());
create table public.blog_posts (id uuid primary key default gen_random_uuid(),author_id uuid not null references profiles(id) on delete cascade,slug text not null,title text not null check(char_length(title)<=160),body text not null check(char_length(body)<=50000),published boolean default false,created_at timestamptz default now(),updated_at timestamptz default now(),unique(author_id,slug));
create table public.profile_comments (id uuid primary key default gen_random_uuid(),profile_id uuid not null references profiles(id) on delete cascade,author_id uuid not null references profiles(id) on delete cascade,body text not null check(char_length(body) between 1 and 3000),created_at timestamptz default now());
create table public.conversations (id uuid primary key default gen_random_uuid(),created_at timestamptz default now());
create table public.conversation_members (conversation_id uuid references conversations(id) on delete cascade,user_id uuid references profiles(id) on delete cascade,last_read_at timestamptz,primary key(conversation_id,user_id));
create table public.messages (id uuid primary key default gen_random_uuid(),conversation_id uuid not null references conversations(id) on delete cascade,sender_id uuid not null references profiles(id) on delete cascade,body text not null check(char_length(body) between 1 and 10000),created_at timestamptz default now(),deleted_at timestamptz);
create table public.albums (id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles(id) on delete cascade,title text not null,visibility profile_visibility default 'public',created_at timestamptz default now());
create table public.media (id uuid primary key default gen_random_uuid(),owner_id uuid not null references profiles(id) on delete cascade,album_id uuid references albums(id) on delete set null,storage_path text not null,mime_type text not null,caption text,moderation_state text default 'pending',created_at timestamptz default now());
create table public.notifications (id bigint generated always as identity primary key,user_id uuid not null references profiles(id) on delete cascade,actor_id uuid references profiles(id) on delete cascade,kind text not null,entity_id uuid,payload jsonb default '{}',read_at timestamptz,created_at timestamptz default now());
create table public.reports (id uuid primary key default gen_random_uuid(),reporter_id uuid not null references profiles(id) on delete cascade,target_type text not null,target_id uuid not null,reason text not null,details text,status report_status default 'open',created_at timestamptz default now(),reviewed_by uuid references profiles(id),reviewed_at timestamptz);
create table public.admins (user_id uuid primary key references profiles(id) on delete cascade,role text not null check(role in('moderator','admin')));

create index on bulletins(author_id,created_at desc);create index on blog_posts(author_id,created_at desc);create index on profile_comments(profile_id,created_at desc);create index on messages(conversation_id,created_at);create index on notifications(user_id,created_at desc);create index on reports(status,created_at);
alter table profiles enable row level security;alter table friendships enable row level security;alter table top_friends enable row level security;alter table blocks enable row level security;alter table bulletins enable row level security;alter table blog_posts enable row level security;alter table profile_comments enable row level security;alter table conversations enable row level security;alter table conversation_members enable row level security;alter table messages enable row level security;alter table albums enable row level security;alter table media enable row level security;alter table notifications enable row level security;alter table reports enable row level security;alter table admins enable row level security;

create policy "public profiles are readable" on profiles for select using (visibility='public' or id=auth.uid());
create policy "users update self" on profiles for update using(id=auth.uid()) with check(id=auth.uid());
create policy "friendships visible to participants" on friendships for select using(auth.uid() in(requester_id,addressee_id));
create policy "request friendship" on friendships for insert with check(requester_id=auth.uid());
create policy "participants update friendship" on friendships for update using(auth.uid() in(requester_id,addressee_id));
create policy "top eight public" on top_friends for select using(true);create policy "owner manages top eight" on top_friends for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "blocks private" on blocks for all using(blocker_id=auth.uid()) with check(blocker_id=auth.uid());
create policy "bulletins visible signed in" on bulletins for select to authenticated using(true);create policy "author posts bulletin" on bulletins for insert with check(author_id=auth.uid());create policy "author deletes bulletin" on bulletins for delete using(author_id=auth.uid());
create policy "published blogs visible" on blog_posts for select using(published or author_id=auth.uid());create policy "authors manage blogs" on blog_posts for all using(author_id=auth.uid()) with check(author_id=auth.uid());
create policy "comments public" on profile_comments for select using(true);create policy "members comment" on profile_comments for insert with check(author_id=auth.uid());create policy "comment author or profile owner deletes" on profile_comments for delete using(author_id=auth.uid() or profile_id=auth.uid());
create policy "conversation membership" on conversation_members for select using(user_id=auth.uid());
create policy "members read messages" on messages for select using(exists(select 1 from conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));
create policy "members send messages" on messages for insert with check(sender_id=auth.uid() and exists(select 1 from conversation_members cm where cm.conversation_id=messages.conversation_id and cm.user_id=auth.uid()));
create policy "albums readable" on albums for select using(visibility='public' or owner_id=auth.uid());create policy "owners manage albums" on albums for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "approved media readable" on media for select using(moderation_state='approved' or owner_id=auth.uid());create policy "owners add media" on media for insert with check(owner_id=auth.uid());create policy "owners delete media" on media for delete using(owner_id=auth.uid());
create policy "own notifications" on notifications for select using(user_id=auth.uid());create policy "own notification update" on notifications for update using(user_id=auth.uid());
create policy "create report" on reports for insert with check(reporter_id=auth.uid());create policy "see own reports" on reports for select using(reporter_id=auth.uid());

create or replace function public.new_user_profile() returns trigger language plpgsql security definer set search_path=public as $$begin insert into profiles(id,username,display_name) values(new.id,'member_'||substr(new.id::text,1,8),coalesce(new.raw_user_meta_data->>'display_name','New Member'));return new;end$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.new_user_profile();
