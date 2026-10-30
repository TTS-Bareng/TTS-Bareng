-- Run inside a transaction after the moderation migration, then roll back.
do $$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); c uuid;
begin
  insert into auth.users(id) values(a),(b);
  perform set_config('request.jwt.claim.sub',a::text,true);
  begin
    perform public.publish_crossword('Uji','Uji','[{"word":"KOPI","clue":123},{"word":"IKAN","clue":"Hewan air"},{"word":"NASI","clue":"Makanan"}]');
    raise exception 'Malformed clue accepted';
  exception when others then
    if sqlerrm='Malformed clue accepted' then raise; end if;
  end;
  c:=public.publish_crossword('Uji Moderasi','Uji','[{"word":"KOPI","clue":"Minuman"},{"word":"IKAN","clue":"Hewan air"},{"word":"NASI","clue":"Makanan"}]');
  if public.read_published_crossword(c) is null then raise exception 'Author cannot preview pending content'; end if;
  perform set_config('request.jwt.claim.sub',b::text,true);
  if public.read_published_crossword(c) is not null then raise exception 'Unreviewed content visible'; end if;
  update public.published_crosswords set status='approved' where id=c;
  if public.read_published_crossword(c) is null then raise exception 'Approved content unavailable'; end if;
  perform public.report_crossword(c);
  if public.read_published_crossword(c) is not null then raise exception 'Blocked author visible'; end if;
  if not exists(select 1 from public.crossword_reports where crossword_id=c and status='open') then raise exception 'Report not queued'; end if;
  if has_function_privilege('anon','public.publish_crossword(text,text,jsonb)','execute') then raise exception 'Anonymous publishing allowed'; end if;
  if has_table_privilege('anon','public.crossword_reports','select') then raise exception 'Private reports exposed'; end if;
end $$;
