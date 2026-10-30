do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid;
begin
  insert into auth.users(id) values(a),(b);
  insert into public.profiles(id,auth_user_id,name) values(a,a,'Uji Hapus'),(b,b,'Uji Tetap');
  insert into public.user_progress_backup(user_identifier,records) values('inbox_'||a,'{}'),('inbox_'||b,jsonb_build_object('requests',jsonb_build_array(jsonb_build_object('fromId',a,'fromName','Uji Hapus'))));
  perform set_config('request.jwt.claim.sub',a::text,true);
  c:=public.publish_crossword('Uji','Uji','[{"word":"KOPI","clue":"Minuman"},{"word":"IKAN","clue":"Hewan air"},{"word":"NASI","clue":"Makanan"}]');
  perform set_config('request.jwt.claim.sub',b::text,true);
  perform public.report_crossword(c);
  perform set_config('request.jwt.claim.sub','',true);
  perform public.report_crossword(c);
  perform set_config('request.jwt.claim.sub',b::text,true);
  perform public.delete_user_account();
  if exists(select 1 from auth.users where id=b) then raise exception 'Reporter deletion failed'; end if;
  perform set_config('request.jwt.claim.sub',a::text,true);
  insert into public.user_progress_backup(user_identifier,records) values('test_cleanup_'||a,jsonb_build_object('id',a));
  perform public.delete_user_account();
  if not exists(select 1 from public.user_progress_backup where user_identifier='test_cleanup_'||a and records='{}'::jsonb) then raise exception 'Crafted backup blocked deletion'; end if;
  if exists(select 1 from public.published_crosswords where id=c) then raise exception 'Authored content retained'; end if;
  if exists(select 1 from public.user_progress_backup where user_identifier='inbox_'||a) then raise exception 'Inbox retained'; end if;
  if has_function_privilege('anon','public.delete_user_account()','execute') then raise exception 'Anonymous deletion execution enabled'; end if;
end $$;
