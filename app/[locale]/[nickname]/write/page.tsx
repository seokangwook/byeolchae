import { redirect, notFound } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getMessages, isSupportedLocale, type Locale } from '@/lib/i18n';
import WritePostClient from '@/components/WritePostClient';

export default async function WritePage({
  params,
}: {
  params: Promise<{ locale: string; nickname: string }>;
}) {
  const { locale, nickname } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}?login=1`);

  // Only the owner can write on their own byeolchae
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .single();

  if (profile?.nickname !== nickname) redirect(`/${locale}/${nickname}`);

  const m = getMessages(locale as Locale);
  return <WritePostClient locale={locale as Locale} messages={m} user={user} nickname={nickname} />;
}
