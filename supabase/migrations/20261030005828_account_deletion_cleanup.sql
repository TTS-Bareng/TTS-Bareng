create schema if not exists tts_private;
revoke all on schema tts_private from public, anon, authenticated;

-- Remove player records recursively while retaining other participants' results.
create function tts_private.remove_player(value jsonb, ids text[])
returns jsonb language plpgsql immutable set search_path = '' as $$
declare result jsonb; k text; v jsonb; cleaned jsonb;
begin
  if jsonb_typeof(value)='object' then
    if value->>'id'=any(ids) or value->>'fromId'=any(ids) or value->'friend'->>'id'=any(ids) then return null; end if;
    result:='{}'::jsonb;
    for k,v in select * from jsonb_each(value) loop
      cleaned:=tts_private.remove_player(v,ids);
      result:=result || jsonb_build_object(k,cleaned);
    end loop;
    return result;
  elsif jsonb_typeof(value)='array' then
    result:='[]'::jsonb;
    for v in select * from jsonb_array_elements(value) loop
      cleaned:=tts_private.remove_player(v,ids);
      if cleaned is not null then result:=result || jsonb_build_array(cleaned); end if;
    end loop;
    return result;
  end if;
  return value;
end $$;
revoke all on function tts_private.remove_player(jsonb,text[]) from public, anon, authenticated;

create or replace function public.delete_user_account()
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); ids text[];
begin
  if v_uid is null or not exists(select 1 from auth.users where id=v_uid) then raise exception 'Not authenticated'; end if;
  select array_agg(distinct x) into ids from (
    select v_uid::text as x union select id::text from public.profiles where auth_user_id=v_uid or id=v_uid
  ) t;
  delete from public.daily_rush_leaderboard where user_id::text=any(ids);
  delete from public.user_progress_backup where user_identifier=any(ids) or user_identifier=any(select 'inbox_'||x from unnest(ids) x);
  update public.user_progress_backup set records=tts_private.remove_player(records,ids) where exists(select 1 from unnest(ids) x where records::text like '%'||x||'%');
  update public.community_tournaments set
    host_name=case when host_id=any(ids) then 'Pemain Dihapus' else host_name end,
    host_id=case when host_id=any(ids) then 'deleted-player' else host_id end,
    players=tts_private.remove_player(players,ids),
    matches=tts_private.remove_player(matches,ids),
    champion=tts_private.remove_player(champion,ids)
  where host_id=any(ids) or exists(select 1 from unnest(ids) x where players::text like '%'||x||'%' or matches::text like '%'||x||'%' or champion::text like '%'||x||'%');
  update public.mabar_rooms set host_id=null,host_name='Pemain Dihapus',status='finished' where host_id=any(ids);
  delete from public.profiles where auth_user_id=v_uid or id=v_uid;
  -- Auth sessions/identities and authored crosswords/reports cascade with the account.
  delete from auth.users where id=v_uid;
end $$;
revoke all on function public.delete_user_account() from public, anon, authenticated;
grant execute on function public.delete_user_account() to authenticated;

