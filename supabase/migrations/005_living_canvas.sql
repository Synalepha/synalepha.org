-- Living canvas foundations: a signature Right Now object, intentional circles,
-- and quarantined media metadata. Media is never publicly readable until an
-- authorized moderator approves it.

create table if not exists public.right_now (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  feeling text not null default '' check(char_length(feeling) <= 80),
  note text not null default '' check(char_length(note) <= 280),
  song_title text check(song_title is null or char_length(song_title) <= 160),
  visibility public.profile_visibility not null default 'private',
  updated_at timestamptz not null default now()
);

create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check(name in ('My People','Close Friends','Family')),
  created_at timestamptz not null default now(),
  unique(owner_id,name)
);

create table if not exists public.circle_members (
  circle_id uuid not null references public.circles(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key(circle_id,member_id)
);

alter table public.media add column if not exists alt_text text;
alter table public.media add column if not exists processing_state text not null default 'quarantined';
alter table public.media add column if not exists metadata_stripped boolean not null default false;
alter table public.media add column if not exists width integer;
alter table public.media add column if not exists height integer;
alter table public.media add column if not exists focal_x numeric(5,4);
alter table public.media add column if not exists focal_y numeric(5,4);
alter table public.media add constraint media_alt_text_length check(alt_text is null or char_length(alt_text)<=500) not valid;
alter table public.media add constraint media_processing_state_valid check(processing_state in ('quarantined','processing','ready','failed')) not valid;

alter table public.right_now enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;

create policy "right now follows page privacy" on public.right_now for select using(
  owner_id=auth.uid() or public.is_admin() or (
    public.can_view_profile(owner_id,auth.uid()) and
    (visibility='public' or (visibility='friends' and public.are_friends(owner_id,auth.uid())))
  )
);
create policy "owners manage right now" on public.right_now for all
  using(owner_id=auth.uid()) with check(owner_id=auth.uid());

create policy "owners read circles" on public.circles for select using(owner_id=auth.uid());
create policy "owners manage circles" on public.circles for all using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "owners read circle members" on public.circle_members for select using(
  exists(select 1 from public.circles c where c.id=circle_id and c.owner_id=auth.uid())
);
create policy "owners add accepted people" on public.circle_members for insert with check(
  exists(select 1 from public.circles c where c.id=circle_id and c.owner_id=auth.uid())
  and public.are_friends(auth.uid(),member_id)
  and not public.is_blocked(auth.uid(),member_id)
);
create policy "owners remove circle members" on public.circle_members for delete using(
  exists(select 1 from public.circles c where c.id=circle_id and c.owner_id=auth.uid())
);

-- The existing media trigger forces uploads to pending moderation. These
-- additional checks prevent an unprocessed asset from becoming visible.
create or replace function public.enforce_media_readiness()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.moderation_state='approved' and
     (new.processing_state<>'ready' or not new.metadata_stripped or coalesce(trim(new.alt_text),'')='') then
    raise exception 'Media must be processed, stripped, and described before approval' using errcode='23514';
  end if;
  return new;
end $$;
drop trigger if exists media_readiness_guard on public.media;
create trigger media_readiness_guard before insert or update on public.media
for each row execute function public.enforce_media_readiness();

create index if not exists right_now_updated_idx on public.right_now(updated_at desc);
create index if not exists circle_members_member_idx on public.circle_members(member_id);
