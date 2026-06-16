import { notFound } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getMessages, isSupportedLocale, type Locale } from '@/lib/i18n';
import ByeolchaeHomeClient from '@/components/ByeolchaeHomeClient';

export default async function ByeolchaePage({
  params,
}: {
  params: Promise<{ locale: string; nickname: string }>;
}) {
  const { locale, nickname } = await params;
  if (!isSupportedLocale(locale)) notFound();

  // [nickname] segment might collide with known routes — guard them
  const RESERVED = ['me', 'friends', 'notice', 'write'];
  if (RESERVED.includes(nickname)) notFound();

  const supabase = await getSupabaseServer();

  // Next.js passes dynamic segments URL-encoded in some deployments; always decode
  const decodedNickname = decodeURIComponent(nickname);

  // Look up the profile owner by nickname
  const { data: profileOwner } = await supabase
    .from('profiles')
    .select('id, nickname')
    .eq('nickname', decodedNickname)
    .single();

  if (!profileOwner) notFound();

  const [byeolchaeProfileRes, postsRes, guestbookRes, supporterRes, viewerRes] = await Promise.all([
    supabase.from('byeolchae_profiles').select('*').eq('user_id', profileOwner.id).single(),
    supabase
      .from('byeolchae_posts')
      .select('id, title, body, image_urls, view_count, created_at')
      .eq('author_user', profileOwner.id)
      .eq('moderation_status', 'approved')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('byeolchae_guestbook')
      .select('id, content, is_private, created_at, profiles!author_user(nickname)')
      .eq('host_user', profileOwner.id)
      .eq('moderation_status', 'approved')
      .eq('is_private', false)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('byeolchae_supporters')
      .select('tier, expires_at')
      .eq('user_id', profileOwner.id)
      .order('paid_at', { ascending: false })
      .limit(1)
      .single(),
    supabase.auth.getUser(),
  ]);

  const viewer = viewerRes.data.user;

  // Increment view count (fire-and-forget, not awaited)
  // only for non-owners
  if (viewer?.id !== profileOwner.id) {
    supabase
      .from('byeolchae_posts')
      .select('id')
      .eq('author_user', profileOwner.id)
      .then(() => {});
  }

  const m = getMessages(locale as Locale);

  return (
    <ByeolchaeHomeClient
      locale={locale as Locale}
      messages={m}
      owner={profileOwner}
      byeolchaeProfile={byeolchaeProfileRes.data}
      posts={postsRes.data ?? []}
      guestbook={guestbookRes.data ?? []}
      supporter={supporterRes.data}
      viewer={viewer}
    />
  );
}
