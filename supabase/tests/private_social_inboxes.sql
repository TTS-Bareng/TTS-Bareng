select set_config('tts_test.a',gen_random_uuid()::text,true),set_config('tts_test.b',gen_random_uuid()::text,true);
insert into auth.users(id) values(current_setting('tts_test.a')::uuid),(current_setting('tts_test.b')::uuid);
insert into public.profiles(id,auth_user_id,name) values(current_setting('tts_test.a')::uuid,current_setting('tts_test.a')::uuid,'Uji A'),(current_setting('tts_test.b')::uuid,current_setting('tts_test.b')::uuid,'Uji B');
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('tts_test.a'),true);
do $$ begin
 begin
  insert into public.user_progress_backup(user_identifier,records) values('inbox_'||current_setting('tts_test.a'),'{"requests":[]}');
  raise exception 'Forged inbox accepted';
 exception when insufficient_privilege then null;
 end;
end $$;
select public.send_friend_request(current_setting('tts_test.b')::uuid) is not null as sent;
do $$ begin
 if exists(select 1 from public.user_progress_backup where user_identifier='inbox_'||current_setting('tts_test.b')) then raise exception 'Another inbox exposed'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('tts_test.b'),true);
do $$ declare req text; begin
 select records->'requests'->0->>'id' into req from public.user_progress_backup where user_identifier='inbox_'||current_setting('tts_test.b');
 if req is null then raise exception 'Request not delivered'; end if;
 if public.accept_friend_request(req) is null then raise exception 'Accept failed'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('tts_test.a'),true);
do $$ begin
 if not exists(select 1 from public.user_progress_backup where user_identifier='inbox_'||current_setting('tts_test.a') and jsonb_array_length(records->'accepted')=1) then raise exception 'Acceptance missing'; end if;
end $$;
set local role anon;
do $$ begin
 if exists(select 1 from public.user_progress_backup) then raise exception 'Anonymous backup access'; end if;
end $$;
reset role;
