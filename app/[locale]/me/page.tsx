import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getMessages, isSupportedLocale, type Locale } from '@/lib/i18n';
import ProfileEditorClient from '@/components/ProfileEditorClient';
import { notFound } from 'next/navigation';

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}?login=1`);

  const [profileRes, byeolchaeRes, supporterRes] = await Promise.all([
    supabase.from('profiles').select('nickname, avatar_url').eq('id', user.id).single(),
    supabase.from('byeolchae_profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('byeolchae_supporters')
      .select('tier, expires_at, ads_disabled_until')
      .eq('user_id', user.id)
      .order('paid_at', { ascending: false })
      .limit(1)
      .single(),
  ]);

  const m = getMessages(locale as Locale);
  return (
    <ProfileEditorClient
      locale={locale as Locale}
      messages={m}
      user={user}
      profile={profileRes.data}
      byeolchaeProfile={byeolchaeRes.data}
      supporter={supporterRes.data}
    />
  );
}
