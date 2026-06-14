import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { moderateText } from '@/lib/moderation';

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { host_nickname, content, is_private } = await req.json();
  if (!content || content.length > 140) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }

  const { data: hostProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('nickname', host_nickname)
    .single();
  if (!hostProfile) return NextResponse.json({ error: 'Host not found' }, { status: 404 });

  const moderation_status = await moderateText(content);

  const { data, error } = await supabase.from('byeolchae_guestbook').insert({
    host_user: hostProfile.id,
    author_user: user.id,
    content,
    is_private: Boolean(is_private),
    moderation_status,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notification (fire-and-forget)
  if (moderation_status === 'approved' && hostProfile.id !== user.id) {
    supabase.from('byeolchae_notifications').insert({
      user_id: hostProfile.id,
      type: 'guestbook',
      ref_id: data.id,
    }).then(() => {});
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabase
    .from('byeolchae_guestbook')
    .delete()
    .eq('id', id)
    .or(`author_user.eq.${user.id},host_user.eq.${user.id}`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
