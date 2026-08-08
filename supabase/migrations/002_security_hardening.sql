-- Roomtone authorization hardening. This migration preserves existing rows.

create or replace function public.is_admin(check_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.admins where user_id=check_user) $$;

create or replace function public.are_friends(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.friendships
    where status='accepted' and ((requester_id=a and addressee_id=b) or (requester_id=b and addressee_id=a))
  )
$$;

create or replace function public.is_blocked(a uuid, b uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.blocks
    where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a)
  )
$$;

create or replace function public.can_view_profile(owner uuid, viewer uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.profiles p
    where p.id=owner and not p.is_suspended
      and not public.is_blocked(owner,viewer)
      and (p.id=viewer or p.visibility='public' or (p.visibility='friends' and public.are_friends(p.id,viewer)) or public.is_admin(viewer))
  )
$$;

revoke all on function public.is_admin(uuid) from public;
revoke all on function public.are_friends(uuid,uuid) from public;
revoke all on function public.is_blocked(uuid,uuid) from public;
revoke all on function public.can_view_profile(uuid,uuid) from public;
grant execute on function public.can_view_profile(uuid,uuid) to anon, authenticated;
grant execute on function public.are_friends(uuid,uuid), public.is_blocked(uuid,uuid), public.is_admin(uuid) to authenticated;

drop policy if exists "public profiles are readable" on profiles;
create policy "profile privacy" on profiles for select using(public.can_view_profile(id,auth.uid()));

drop policy if exists "participants update friendship" on friendships;
drop policy if exists "request friendship" on friendships;
create policy "request pending friendship" on friendships for insert
  with check(requester_id=auth.uid() and status='pending' and not public.is_blocked(requester_id,addressee_id));
create policy "addressee answers request" on friendships for update
  using(addressee_id=auth.uid() and status='pending')
  with check(addressee_id=auth.uid() and status in ('accepted','declined'));
create policy "participants remove friendship" on friendships for delete
  using(auth.uid() in (requester_id,addressee_id));

drop policy if exists "top eight public" on top_friends;
drop policy if exists "owner manages top eight" on top_friends;
create policy "visible top eight" on top_friends for select
  using(public.can_view_profile(owner_id,auth.uid()) and not public.is_blocked(owner_id,friend_id));
create policy "owner adds accepted friends" on top_friends for insert
  with check(owner_id=auth.uid() and public.are_friends(owner_id,friend_id) and not public.is_blocked(owner_id,friend_id));
create policy "owner reorders top eight" on top_friends for update
  using(owner_id=auth.uid())
  with check(owner_id=auth.uid() and public.are_friends(owner_id,friend_id) and not public.is_blocked(owner_id,friend_id));
create policy "owner removes top eight" on top_friends for delete using(owner_id=auth.uid());

drop policy if exists "bulletins visible signed in" on bulletins;
create policy "friend bulletins" on bulletins for select to authenticated
  using(author_id=auth.uid() or (public.are_friends(author_id,auth.uid()) and not public.is_blocked(author_id,auth.uid())) or public.is_admin());

drop policy if exists "comments public" on profile_comments;
drop policy if exists "members comment" on profile_comments;
create policy "comments follow profile privacy" on profile_comments for select
  using(public.can_view_profile(profile_id,auth.uid()) and not public.is_blocked(author_id,auth.uid()));
create policy "members comment where allowed" on profile_comments for insert
  with check(author_id=auth.uid() and public.can_view_profile(profile_id,auth.uid()) and not public.is_blocked(profile_id,author_id));

drop policy if exists "published blogs visible" on blog_posts;
create policy "blogs follow profile privacy" on blog_posts for select
  using(author_id=auth.uid() or (published and public.can_view_profile(author_id,auth.uid())));

drop policy if exists "albums readable" on albums;
create policy "albums follow privacy" on albums for select using(
  owner_id=auth.uid() or (visibility='public' and public.can_view_profile(owner_id,auth.uid()))
  or (visibility='friends' and public.are_friends(owner_id,auth.uid()) and not public.is_blocked(owner_id,auth.uid()))
  or public.is_admin()
);

create or replace function public.enforce_media_moderation()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin(auth.uid()) then
    if tg_op='INSERT' then new.moderation_state := 'pending';
    elsif new.moderation_state is distinct from old.moderation_state then
      raise exception 'Only moderators can change media moderation state' using errcode='42501';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists media_moderation_guard on media;
create trigger media_moderation_guard before insert or update on media for each row execute function public.enforce_media_moderation();
drop policy if exists "approved media readable" on media;
drop policy if exists "owners add media" on media;
create policy "approved media follows album privacy" on media for select using(
  owner_id=auth.uid() or public.is_admin() or
  (moderation_state='approved' and public.can_view_profile(owner_id,auth.uid()) and
   (album_id is null or exists(select 1 from public.albums a where a.id=album_id)))
);
create policy "owners add pending media" on media for insert with check(owner_id=auth.uid() and moderation_state='pending');
create policy "owners update media metadata" on media for update using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "moderators manage media" on media for all using(public.is_admin()) with check(public.is_admin());

create or replace function public.is_conversation_member(check_conversation uuid, check_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.conversation_members where conversation_id=check_conversation and user_id=check_user) $$;
revoke all on function public.is_conversation_member(uuid,uuid) from public;
grant execute on function public.is_conversation_member(uuid,uuid) to authenticated;

create policy "members create conversations" on conversations for insert to authenticated with check(true);
create policy "members read conversations" on conversations for select using(
  public.is_conversation_member(id,auth.uid())
);
drop policy if exists "conversation membership" on conversation_members;
create policy "members read conversation roster" on conversation_members for select using(
  public.is_conversation_member(conversation_id,auth.uid())
);
create policy "members update own read marker" on conversation_members for update
  using(user_id=auth.uid()) with check(user_id=auth.uid());

create or replace function public.start_conversation(other_user uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
  if auth.uid() is null or other_user=auth.uid() or public.is_blocked(auth.uid(),other_user)
     or not exists(select 1 from profiles where id=other_user and not is_suspended) then
    raise exception 'Conversation is not allowed' using errcode='42501';
  end if;
  insert into conversations default values returning id into new_id;
  insert into conversation_members(conversation_id,user_id) values(new_id,auth.uid()),(new_id,other_user);
  return new_id;
end $$;
revoke all on function public.start_conversation(uuid) from public;
grant execute on function public.start_conversation(uuid) to authenticated;

create policy "moderators read admins" on admins for select using(user_id=auth.uid() or public.is_admin());
create or replace function public.is_super_admin(check_user uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admins where user_id=check_user and role='admin') $$;
revoke all on function public.is_super_admin(uuid) from public;
grant execute on function public.is_super_admin(uuid) to authenticated;
create policy "admins manage roles" on admins for all using(public.is_super_admin()) with check(public.is_super_admin());
create policy "moderators read reports" on reports for select using(reporter_id=auth.uid() or public.is_admin());
create policy "moderators update reports" on reports for update using(public.is_admin()) with check(public.is_admin());
create policy "moderators read notifications" on notifications for select using(user_id=auth.uid() or public.is_admin());

create or replace function public.notify_activity()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_table_name='friendships' and tg_op='INSERT' then
    insert into notifications(user_id,actor_id,kind,entity_id) values(new.addressee_id,new.requester_id,'friend_request',new.requester_id);
  elsif tg_table_name='profile_comments' and tg_op='INSERT' and new.profile_id<>new.author_id then
    insert into notifications(user_id,actor_id,kind,entity_id) values(new.profile_id,new.author_id,'profile_comment',new.id);
  end if;
  return new;
end $$;
drop trigger if exists notify_friend_request on friendships;
create trigger notify_friend_request after insert on friendships for each row execute function public.notify_activity();
drop trigger if exists notify_profile_comment on profile_comments;
create trigger notify_profile_comment after insert on profile_comments for each row execute function public.notify_activity();

alter table albums add constraint albums_title_length check(char_length(title) between 1 and 160) not valid;
alter table media add constraint media_moderation_state_valid check(moderation_state in ('pending','approved','rejected')) not valid;
alter table media add constraint media_mime_type_length check(char_length(mime_type) between 1 and 120) not valid;
alter table media add constraint media_caption_length check(caption is null or char_length(caption)<=2000) not valid;
alter table reports add constraint reports_target_type_valid check(target_type in ('profile','bulletin','blog','comment','message','media')) not valid;
alter table reports add constraint reports_reason_length check(char_length(reason) between 1 and 160) not valid;
alter table reports add constraint reports_details_length check(details is null or char_length(details)<=5000) not valid;
alter table notifications add constraint notifications_kind_length check(char_length(kind) between 1 and 80) not valid;
alter table profiles add constraint profiles_location_lengths check(
  (city is null or char_length(city)<=80) and (region is null or char_length(region)<=80) and (country is null or char_length(country)<=80)
) not valid;

create or replace function public.new_user_profile() returns trigger language plpgsql security definer set search_path=public as $$
declare base_username text; candidate text; suffix integer := 0;
begin
  base_username := 'member_' || substr(replace(new.id::text,'-',''),1,12);
  candidate := base_username;
  while exists(select 1 from profiles where username=candidate) loop
    suffix := suffix+1; candidate := left(base_username,24-length(suffix::text)-1)||'_'||suffix::text;
  end loop;
  insert into profiles(id,username,display_name)
  values(new.id,candidate,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'New Member'),50));
  return new;
end $$;
