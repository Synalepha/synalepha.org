-- Age-aware defaults and friendship-gated messaging.

create or replace function public.new_user_profile() returns trigger language plpgsql security definer set search_path=public as $$
declare base_username text; candidate text; suffix integer := 0; supplied_birth_date date; supplied_minor boolean;
begin
  base_username := 'member_' || substr(replace(new.id::text,'-',''),1,12);
  candidate := base_username;
  while exists(select 1 from profiles where username=candidate) loop
    suffix := suffix+1; candidate := left(base_username,24-length(suffix::text)-1)||'_'||suffix::text;
  end loop;
  begin supplied_birth_date := (new.raw_user_meta_data->>'birth_date')::date; exception when others then supplied_birth_date := null; end;
  supplied_minor := coalesce((new.raw_user_meta_data->>'is_minor')::boolean,false);
  insert into profiles(id,username,display_name,birth_date,visibility)
  values(new.id,candidate,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'New Member'),50),supplied_birth_date,case when supplied_minor then 'private'::profile_visibility else 'public'::profile_visibility end);
  return new;
end $$;

create or replace function public.start_conversation(other_user uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare new_id uuid;
begin
  if auth.uid() is null or other_user=auth.uid() or public.is_blocked(auth.uid(),other_user)
     or not public.are_friends(auth.uid(),other_user)
     or not exists(select 1 from profiles where id=other_user and not is_suspended) then
    raise exception 'Conversation is not allowed' using errcode='42501';
  end if;
  insert into conversations default values returning id into new_id;
  insert into conversation_members(conversation_id,user_id) values(new_id,auth.uid()),(new_id,other_user);
  return new_id;
end $$;
revoke all on function public.start_conversation(uuid) from public;
grant execute on function public.start_conversation(uuid) to authenticated;
