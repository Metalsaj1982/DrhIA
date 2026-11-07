-- Apex Council: equipos. Ejecuta esto en Supabase → SQL Editor.
-- Los datos personales (meta, hábitos) se quedan en el dispositivo; a la nube solo sube
-- cuántos hábitos completó cada persona por día, para el tablero del equipo.

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  code text not null unique,
  owner uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table if not exists public.checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  done int not null check (done >= 0),
  total int not null check (total >= 0),
  primary key (user_id, day)
);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.checkins enable row level security;

-- Helper sin recursión de RLS.
create or replace function public.is_member(tid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from team_members where team_id = tid and user_id = auth.uid());
$$;

drop policy if exists "teams_read" on public.teams;
create policy "teams_read" on public.teams for select using (public.is_member(id));

drop policy if exists "members_read" on public.team_members;
create policy "members_read" on public.team_members for select using (public.is_member(team_id));

drop policy if exists "members_leave" on public.team_members;
create policy "members_leave" on public.team_members for delete using (user_id = auth.uid());

drop policy if exists "checkins_own" on public.checkins;
create policy "checkins_own" on public.checkins for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Crear equipo: genera un código de 6 caracteres y te deja como líder.
create or replace function public.create_team(team_name text, member_name text)
returns public.teams language plpgsql security definer set search_path = public as $$
declare t teams; new_code text;
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  loop
    new_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));
    exit when not exists (select 1 from teams where code = new_code);
  end loop;
  insert into teams (name, code, owner) values (team_name, new_code, auth.uid()) returning * into t;
  insert into team_members (team_id, user_id, display_name, role) values (t.id, auth.uid(), member_name, 'leader');
  return t;
end $$;

-- Unirse con código.
create or replace function public.join_team(team_code text, member_name text)
returns public.teams language plpgsql security definer set search_path = public as $$
declare t teams;
begin
  if auth.uid() is null then raise exception 'Inicia sesión primero'; end if;
  select * into t from teams where code = upper(team_code);
  if t.id is null then raise exception 'Ese código no existe. Revísalo con tu líder.'; end if;
  insert into team_members (team_id, user_id, display_name)
  values (t.id, auth.uid(), member_name)
  on conflict (team_id, user_id) do update set display_name = excluded.display_name;
  return t;
end $$;

-- Tablero: cualquier miembro ve los totales diarios de su equipo (no ve metas ni hábitos).
create or replace function public.team_board(tid uuid, from_day date)
returns table (user_id uuid, display_name text, role text, day date, done int, total int)
language sql security definer stable set search_path = public as $$
  select m.user_id, m.display_name, m.role, c.day, c.done, c.total
  from team_members m
  left join checkins c on c.user_id = m.user_id and c.day >= from_day
  where m.team_id = tid and public.is_member(tid)
  order by m.display_name, c.day;
$$;

grant execute on function public.create_team(text, text) to authenticated;
grant execute on function public.join_team(text, text) to authenticated;
grant execute on function public.team_board(uuid, date) to authenticated;
