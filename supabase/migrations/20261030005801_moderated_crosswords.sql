-- Content is private until a moderator approves it in Supabase.
create table public.published_crosswords (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(title) between 1 and 100),
  category text not null check (length(category) between 1 and 80),
  words jsonb not null check (jsonb_typeof(words) = 'array' and jsonb_array_length(words) between 3 and 8),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
create index on public.published_crosswords(author_id, created_at desc);
create table public.crossword_reports (
  id uuid primary key default gen_random_uuid(),
  crossword_id uuid not null references public.published_crosswords(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete cascade,
  reason text not null check (reason in ('offensive','harassment','other')),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now(),
  unique nulls not distinct (crossword_id, reporter_id)
);
create table public.crossword_author_blocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  primary key (user_id, author_id)
);
create table public.crossword_author_bans (
  author_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.published_crosswords enable row level security;
alter table public.crossword_reports enable row level security;
alter table public.crossword_author_blocks enable row level security;
alter table public.crossword_author_bans enable row level security;
revoke all on public.published_crosswords, public.crossword_reports, public.crossword_author_blocks, public.crossword_author_bans from anon, authenticated;
grant all on public.published_crosswords, public.crossword_reports, public.crossword_author_blocks, public.crossword_author_bans to service_role;

create function public.publish_crossword(p_title text, p_category text, p_words jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_id uuid; v_word jsonb;
begin
  if v_uid is null or not exists(select 1 from auth.users where id=v_uid) then raise exception 'Sign in required'; end if;
  if exists(select 1 from public.crossword_author_bans where author_id=v_uid) then raise exception 'Publishing suspended'; end if;
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text, 0));
  if (select count(*) from public.published_crosswords where author_id=v_uid and created_at > now()-interval '1 day') >= 20 then raise exception 'Daily publishing limit reached'; end if;
  if p_title is null or p_category is null or p_words is null or jsonb_typeof(p_words)<>'array' or jsonb_array_length(p_words) not between 3 and 8 then raise exception 'Invalid crossword'; end if;
  for v_word in select value from jsonb_array_elements(p_words) loop
    if jsonb_typeof(v_word)<>'object' or jsonb_typeof(v_word->'word') is distinct from 'string' or jsonb_typeof(v_word->'clue') is distinct from 'string' or coalesce(v_word->>'word','') !~ '^[A-Z]{2,30}$' or length(coalesce(v_word->>'clue','')) not between 1 and 300 then raise exception 'Invalid word or clue'; end if;
  end loop;
  insert into public.published_crosswords(author_id,title,category,words) values(v_uid,trim(p_title),trim(p_category),p_words) returning id into v_id;
  return v_id;
end $$;

create function public.read_published_crossword(p_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id',c.id,'authorId',c.author_id,'title',c.title,'category',c.category,'wordsList',c.words,'status',c.status)
  from public.published_crosswords c
  where c.id=p_id and (c.status='approved' or (c.status='pending' and c.author_id=auth.uid()))
  and not exists(select 1 from public.crossword_author_bans b where b.author_id=c.author_id)
  and not exists(select 1 from public.crossword_author_blocks b where b.user_id=auth.uid() and b.author_id=c.author_id);
$$;

create function public.report_crossword(p_id uuid, p_reason text default 'offensive')
returns void language plpgsql security definer set search_path = '' as $$
declare v_author uuid;
begin
  select author_id into v_author from public.published_crosswords where id=p_id;
  if v_author is null then raise exception 'Crossword not found'; end if;
  insert into public.crossword_reports(crossword_id,reporter_id,reason) values(p_id,auth.uid(),p_reason) on conflict (crossword_id,reporter_id) do nothing;
  if auth.uid() is not null then
    insert into public.crossword_author_blocks(user_id,author_id) values(auth.uid(),v_author) on conflict do nothing;
  end if;
end $$;
revoke all on function public.publish_crossword(text,text,jsonb) from public, anon, authenticated;
revoke all on function public.read_published_crossword(uuid) from public, anon, authenticated;
revoke all on function public.report_crossword(uuid,text) from public, anon, authenticated;
grant execute on function public.publish_crossword(text,text,jsonb) to authenticated;
grant execute on function public.read_published_crossword(uuid), public.report_crossword(uuid,text) to anon, authenticated;
