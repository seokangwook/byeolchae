import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { moderateText } from '@/lib/moderation';

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { post_id, content } = await req.json();
  if (!content || content.length > 500) return NextResponse.json({ error: 'Invalid content' }, { status: 400 });

  const moderation_status = await moderateText(content);

  const { data, error } = await supabase.from('byeolchae_comments').insert({
    post_id,
    author_user: user.id,
    content,
    moderation_status,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify post owner
  if (moderation_status === 'approved') {
    const { data: post } = await supabase
      .from('byeolchae_posts')
      .select('author_user')
      .eq('id', post_id)
      .single();
    if (post && post.author_user !== user.id) {
      supabase.from('byeolchae_notifications').insert({
        user_id: post.author_user,
        type: 'comment',
        ref_id: data.id,
      }).then(() => {});
    }
  }

  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabase
    .from('byeolchae_comments')
    .delete()
    .eq('id', id)
    .eq('author_user', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
