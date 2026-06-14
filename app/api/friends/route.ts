import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, target_nickname, friend_id } = await req.json();

  if (action === 'request') {
    const { data: target } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', target_nickname)
      .single();
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (target.id === user.id) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });

    const { error } = await supabase.from('byeolchae_friends').upsert({
      from_user: user.id,
      to_user: target.id,
      status: 'pending',
    }, { onConflict: 'from_user,to_user' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify target
    supabase.from('byeolchae_notifications').insert({
      user_id: target.id,
      type: 'friend_request',
      ref_id: user.id,
    }).then(() => {});

    return NextResponse.json({ ok: true });
  }

  if (action === 'accept') {
    const { error } = await supabase
      .from('byeolchae_friends')
      .update({ status: 'accepted' })
      .eq('id', friend_id)
      .eq('to_user', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Get from_user to create reverse record + notify
    const { data: fr } = await supabase
      .from('byeolchae_friends')
      .select('from_user')
      .eq('id', friend_id)
      .single();
    if (fr) {
      await supabase.from('byeolchae_friends').upsert({
        from_user: user.id,
        to_user: fr.from_user,
        status: 'accepted',
      }, { onConflict: 'from_user,to_user' });
      supabase.from('byeolchae_notifications').insert({
        user_id: fr.from_user,
        type: 'friend_accept',
        ref_id: user.id,
      }).then(() => {});
    }
    return NextResponse.json({ ok: true });
  }

  if (action === 'reject') {
    await supabase.from('byeolchae_friends').delete().eq('id', friend_id).eq('to_user', user.id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
