-- Visible, enforceable safety controls for discovery, comments, indexing, and age boundaries.

alter table public.profiles add column if not exists comment_permission text not null default 'friends';
alter table public.profiles add column if not exists allow_tags boolean not null default false;
alter table public.profiles add column if not exists discoverable boolean not null default true;
alter table public.profiles add column if not exists search_indexing boolean not null default false;
alter table public.profiles add constraint profiles_comment_permission_valid check(comment_permission in ('everyone','friends','nobody')) not valid;

create or replace function public.is_minor(check_user uuid)
returns boolean language sql stable security definer set search_path=public
as $$
  select coalesce((select birth_date > current_date - interval '18 years' from public.profiles where id=check_user),false)
$$;

create or replace function public.same_age_band(a uuid,b uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select public.is_minor(a)=public.is_minor(b) $$;

revoke all on function public.is_minor(uuid),public.same_age_band(uuid,uuid) from public;
grant execute on function public.is_minor(uuid),public.same_age_band(uuid,uuid) to authenticated;

create or replace function public.can_view_profile(owner uuid, viewer uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$
  select exists(
    select 1 from public.profiles p
    where p.id=owner and not p.is_suspended
      and not public.is_blocked(owner,viewer)
      and (
        p.id=viewer or public.is_admin(viewer)
        or (
          (not public.is_minor(owner) or (viewer is not null and (public.is_minor(viewer) or public.are_friends(owner,viewer))))
          and (p.visibility='public' or (p.visibility='friends' and public.are_friends(p.id,viewer)))
        )
      )
  )
$$;

drop policy if exists "request pending friendship" on friendships;
create policy "request pending friendship" on friendships for insert
  with check(
    requester_id=auth.uid() and status='pending'
    and public.same_age_band(requester_id,addressee_id)
    and not public.is_blocked(requester_id,addressee_id)
  );

drop policy if exists "members comment where allowed" on profile_comments;
create policy "members comment where allowed" on profile_comments for insert
  with check(
    author_id=auth.uid()
    and public.can_view_profile(profile_id,auth.uid())
    and not public.is_blocked(profile_id,author_id)
    and exists(
      select 1 from profiles p where p.id=profile_id and (
        p.id=auth.uid() or p.comment_permission='everyone'
        or (p.comment_permission='friends' and public.are_friends(p.id,auth.uid()))
      )
    )
  );

create or replace function public.protect_profile_safety_fields()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.birth_date is distinct from old.birth_date then
    raise exception 'Birth date cannot be changed through profile editing' using errcode='42501';
  end if;
  if new.birth_date is not null and new.birth_date > current_date - interval '18 years' and new.visibility='public' then
    raise exception 'Profiles for members under 18 cannot be public' using errcode='42501';
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_safety_fields on profiles;
create trigger protect_profile_safety_fields before update on profiles for each row execute function public.protect_profile_safety_fields();

-- Existing minor profiles are closed immediately; future minor profiles already start private in migration 003.
update public.profiles set visibility='private',search_indexing=false
where birth_date is not null and birth_date > current_date - interval '18 years';
