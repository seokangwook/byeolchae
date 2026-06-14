import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { moderateText } from '@/lib/moderation';

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, body, image_urls } = await req.json();
  if (!title || title.length > 100) return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
  if (!body || body.length > 5000) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const combined = `${title}\n${body}`;
  const moderation_status = await moderateText(combined);

  const { data, error } = await supabase.from('byeolchae_posts').insert({
    author_user: user.id,
    title,
    body,
    image_urls: image_urls ?? [],
    moderation_status,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabase
    .from('byeolchae_posts')
    .delete()
    .eq('id', id)
    .eq('author_user', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
