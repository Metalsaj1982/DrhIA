// Equipos: requiere Supabase. Sin las variables VITE_SUPABASE_*, la sección Equipos lo explica y no inventa datos.
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anon ? createClient(url, anon) : null;
export const cloudEnabled = Boolean(supabase);

export async function getUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user || null;
}

export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/equipo` },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase?.auth.signOut();
}

export async function myTeams() {
  const { data, error } = await supabase
    .from('team_members')
    .select('role, display_name, teams(id, name, code)')
    .order('joined_at');
  if (error) throw error;
  return (data || []).map((row) => ({ ...row.teams, role: row.role, me: row.display_name }));
}

export async function createTeam(name, displayName) {
  const { data, error } = await supabase.rpc('create_team', { team_name: name, member_name: displayName });
  if (error) throw error;
  return data;
}

export async function joinTeam(code, displayName) {
  const { data, error } = await supabase.rpc('join_team', { team_code: code.trim().toUpperCase(), member_name: displayName });
  if (error) throw error;
  return data;
}

export async function pushCheckin(day, done, total) {
  if (!supabase) return;
  const user = await getUser();
  if (!user) return;
  await supabase.from('checkins').upsert({ user_id: user.id, day, done, total }, { onConflict: 'user_id,day' });
}

// Tablero del equipo: últimos 7 días de cada miembro.
export async function teamBoard(teamId, fromDay) {
  const { data, error } = await supabase.rpc('team_board', { tid: teamId, from_day: fromDay });
  if (error) throw error;
  return data || [];
}
