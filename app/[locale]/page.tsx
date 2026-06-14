import { getSupabaseServer } from '@/lib/supabase-server';
import { getMessages, isSupportedLocale, type Locale } from '@/lib/i18n';
import LandingClient from '@/components/LandingClient';
import { notFound } from 'next/navigation';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single();
    nickname = data?.nickname ?? null;
  }

  const m = getMessages(locale as Locale);
  return <LandingClient locale={locale as Locale} messages={m} user={user} nickname={nickname} />;
}
