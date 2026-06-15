import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getMessages, isSupportedLocale, type Locale } from '@/lib/i18n';
import FriendsClient from '@/components/FriendsClient';
import { notFound } from 'next/navigation';

export default async function FriendsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}?login=1`);

  const [sentRes, receivedRes, friendsRes] = await Promise.all([
    supabase
      .from('byeolchae_friends')
      .select('id, to_user, status, created_at, profiles!to_user(nickname)')
      .eq('from_user', user.id),
    supabase
      .from('byeolchae_friends')
      .select('id, from_user, status, created_at, profiles!from_user(nickname)')
      .eq('to_user', user.id)
      .eq('status', 'pending'),
    supabase
      .from('byeolchae_friends')
      .select('id, from_user, to_user, profiles!to_user(nickname)')
      .eq('from_user', user.id)
      .eq('status', 'accepted'),
  ]);

  const m = getMessages(locale as Locale);
  return (
    <FriendsClient
      locale={locale as Locale}
      messages={m}
      userId={user.id}
      sent={sentRes.data ?? []}
      received={receivedRes.data ?? []}
      friends={friendsRes.data ?? []}
    />
  );
}
