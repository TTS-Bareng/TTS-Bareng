create or replace function public.delete_user_account()
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid:=auth.uid(); ids text[];
begin
  if v_uid is null or not exists(select 1 from auth.users where id=v_uid) then raise exception 'Not authenticated'; end if;
  select array_agg(distinct x) into ids from (
    select v_uid::text as x union select id::text from public.profiles where auth_user_id=v_uid or id=v_uid
  ) t;
  delete from public.daily_rush_leaderboard where user_id::text=any(ids);
  delete from tts_private.legacy_social_inbox_archive where user_identifier=any(ids) or user_identifier=any(select 'inbox_'||x from unnest(ids) x);
  update tts_private.legacy_social_inbox_archive set records=coalesce(tts_private.remove_player(records,ids),'{}'::jsonb) where exists(select 1 from unnest(ids) x where records::text like '%'||x||'%');
  delete from public.user_progress_backup where user_identifier=any(ids) or user_identifier=any(select 'inbox_'||x from unnest(ids) x);
  update public.user_progress_backup set records=coalesce(tts_private.remove_player(records,ids),'{}'::jsonb) where exists(select 1 from unnest(ids) x where records::text like '%'||x||'%');
  update public.community_tournaments set
    host_name=case when host_id=any(ids) then 'Pemain Dihapus' else host_name end,
    host_id=case when host_id=any(ids) then 'deleted-player' else host_id end,
    players=coalesce(tts_private.remove_player(players,ids),'[]'::jsonb),
    matches=coalesce(tts_private.remove_player(matches,ids),'[]'::jsonb),
    champion=tts_private.remove_player(champion,ids)
  where host_id=any(ids) or exists(select 1 from unnest(ids) x where players::text like '%'||x||'%' or matches::text like '%'||x||'%' or champion::text like '%'||x||'%');
  update public.mabar_rooms set host_id=null,host_name='Pemain Dihapus',status='finished' where host_id=any(ids);
  delete from public.profiles where auth_user_id=v_uid or id=v_uid;
  -- Auth sessions/identities and authored crosswords/reports cascade with the account.
  delete from auth.users where id=v_uid;
end $$;
revoke all on function public.delete_user_account() from public, anon, authenticated;
grant execute on function public.delete_user_account() to authenticated;

