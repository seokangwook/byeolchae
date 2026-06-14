import { notFound } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getMessages, isSupportedLocale, type Locale } from '@/lib/i18n';
import PostDetailClient from '@/components/PostDetailClient';

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; nickname: string; postId: string }>;
}) {
  const { locale, nickname, postId } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const supabase = await getSupabaseServer();

  const [postRes, commentsRes, viewerRes] = await Promise.all([
    supabase
      .from('byeolchae_posts')
      .select('*, profiles!author_user(nickname, avatar_url)')
      .eq('id', postId)
      .eq('moderation_status', 'approved')
      .single(),
    supabase
      .from('byeolchae_comments')
      .select('id, content, created_at, profiles!author_user(nickname, avatar_url)')
      .eq('post_id', postId)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: true }),
    supabase.auth.getUser(),
  ]);

  if (!postRes.data) notFound();

  // Verify the post belongs to the right nickname
  const postNickname = (postRes.data as any).profiles?.nickname;
  if (postNickname !== nickname) notFound();

  // Increment view count
  supabase.rpc('increment_post_view', { post_id: postId }).then(() => {}, () => {});

  const m = getMessages(locale as Locale);
  return (
    <PostDetailClient
      locale={locale as Locale}
      messages={m}
      post={postRes.data}
      comments={commentsRes.data ?? []}
      viewer={viewerRes.data.user}
      nickname={nickname}
    />
  );
}
