create unique index user_progress_backup_identifier_unique on public.user_progress_backup(user_identifier);
-- Preserve legacy data privately for investigation; it is not authenticated authority.
create table tts_private.legacy_social_inbox_archive as
 select id,user_identifier,records,now() as archived_at from public.user_progress_backup where user_identifier like 'inbox\_%' escape '\';
revoke all on tts_private.legacy_social_inbox_archive from public,anon,authenticated;
alter table tts_private.legacy_social_inbox_archive enable row level security;
update public.user_progress_backup set records=records-'requests'-'accepted' where user_identifier like 'inbox\_%' escape '\';
drop policy "Public progress backup read" on public.user_progress_backup;
drop policy "Public progress backup insert" on public.user_progress_backup;
drop policy "Public progress backup update" on public.user_progress_backup;
create policy "Read own backup" on public.user_progress_backup for select to authenticated using(user_identifier in ((select auth.uid())::text, 'inbox_'||(select auth.uid())::text));
create policy "Insert own backup" on public.user_progress_backup for insert to authenticated with check(user_identifier=(select auth.uid())::text);
create policy "Update own backup" on public.user_progress_backup for update to authenticated using(user_identifier=(select auth.uid())::text) with check(user_identifier=(select auth.uid())::text);

create function tts_private.friend_profile(p_id uuid) returns jsonb
language sql stable set search_path='' as $$
 select jsonb_build_object('id',p.id,'name',p.name,'avatar',p.avatar,'eloRating',coalesce(p.elo_rating,1000),'stars',p.stars,'isVip',coalesce(p.is_vip,false),'addedAt',now())
 from public.profiles p join auth.users u on u.id=p.id where p.id=p_id;
$$;
revoke all on function tts_private.friend_profile(uuid) from public,anon,authenticated;

create function public.send_friend_request(p_target uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me jsonb; req jsonb; inbox text:='inbox_'||p_target;
begin
  me:=tts_private.friend_profile(auth.uid());
  if me is null or p_target=auth.uid() or tts_private.friend_profile(p_target) is null then raise exception 'Valid signed-in accounts required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
  if (select count(*) from public.user_progress_backup where records->'requests' @> jsonb_build_array(jsonb_build_object('fromId',auth.uid())) and updated_at>now()-interval '1 day')>=50 then raise exception 'Daily request limit reached'; end if;
  req:=jsonb_build_object('id',gen_random_uuid(),'fromId',auth.uid(),'fromName',me->>'name','fromAvatar',me->>'avatar','eloRating',me->'eloRating','stars',me->'stars','sentAt',now());
  insert into public.user_progress_backup(user_identifier,records,backup_version)
  values(inbox,jsonb_build_object('requests',jsonb_build_array(req)),'social_v1')
  on conflict(user_identifier) do update set records=jsonb_set(user_progress_backup.records,'{requests}',
    case when user_progress_backup.records->'requests' @> jsonb_build_array(jsonb_build_object('fromId',auth.uid())) then user_progress_backup.records->'requests'
    else jsonb_build_array(req)||coalesce(user_progress_backup.records->'requests','[]'::jsonb) end),updated_at=now();
  return req;
end $$;

create function public.accept_friend_request(p_request text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare me jsonb; req jsonb; friend jsonb; inbox text:='inbox_'||auth.uid(); v_records jsonb;
begin
  me:=tts_private.friend_profile(auth.uid());
  if me is null then raise exception 'Sign in required'; end if;
  select b.records into v_records from public.user_progress_backup b where user_identifier=inbox for update;
  select r into req from jsonb_array_elements(coalesce(v_records->'requests','[]'::jsonb)) r where r->>'id'=p_request;
  if req is null then raise exception 'Request not found'; end if;
  friend:=tts_private.friend_profile((req->>'fromId')::uuid);
  if friend is null then raise exception 'Sender no longer available'; end if;
  update public.user_progress_backup set records=jsonb_set(v_records,'{requests}',coalesce((select jsonb_agg(r) from jsonb_array_elements(v_records->'requests') r where r->>'id'<>p_request),'[]'::jsonb)),updated_at=now() where user_identifier=inbox;
  insert into public.user_progress_backup(user_identifier,records,backup_version) values('inbox_'||(req->>'fromId'),jsonb_build_object('accepted',jsonb_build_array(jsonb_build_object('friend',me,'acceptedAt',now()))),'social_v1')
  on conflict(user_identifier) do update set records=jsonb_set(user_progress_backup.records,'{accepted}',jsonb_build_array(jsonb_build_object('friend',me,'acceptedAt',now()))||coalesce(user_progress_backup.records->'accepted','[]'::jsonb)),updated_at=now();
  return friend;
end $$;
revoke all on function public.send_friend_request(uuid),public.accept_friend_request(text) from public,anon,authenticated;
grant execute on function public.send_friend_request(uuid),public.accept_friend_request(text) to authenticated;

create function public.decline_friend_request(p_request text) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 update public.user_progress_backup b set records=jsonb_set(b.records,'{requests}',coalesce((select jsonb_agg(r) from jsonb_array_elements(coalesce(b.records->'requests','[]'::jsonb)) r where r->>'id'<>p_request),'[]'::jsonb)),updated_at=now()
 where user_identifier='inbox_'||auth.uid();
end $$;
create function public.consume_friend_acceptances() returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_records jsonb; accepted jsonb;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 select b.records into v_records from public.user_progress_backup b where user_identifier='inbox_'||auth.uid() for update;
 accepted:=coalesce(v_records->'accepted','[]'::jsonb);
 update public.user_progress_backup b set records=jsonb_set(b.records,'{accepted}','[]'::jsonb),updated_at=now() where user_identifier='inbox_'||auth.uid();
 return accepted;
end $$;
revoke all on function public.decline_friend_request(text),public.consume_friend_acceptances() from public,anon,authenticated;
grant execute on function public.decline_friend_request(text),public.consume_friend_acceptances() to authenticated;

