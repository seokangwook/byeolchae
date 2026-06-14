import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isSupportedLocale, getMessages, LOCALE_META, type Locale } from '@/lib/i18n';
import { I18nProvider } from '@/lib/i18n-client';
import VersionBadge from '@/components/VersionBadge';

export async function generateStaticParams() {
  return [
    { locale: 'ko' }, { locale: 'en' }, { locale: 'ja' },
    { locale: 'zh-CN' }, { locale: 'zh-TW' }, { locale: 'es' },
    { locale: 'pt-BR' }, { locale: 'fr' }, { locale: 'de' },
    { locale: 'it' }, { locale: 'ru' }, { locale: 'ar' },
    { locale: 'id' }, { locale: 'hi' }, { locale: 'vi' }, { locale: 'th' },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  const m = getMessages(locale as Locale);
  return {
    title: { default: `${m.common.brand} — ${m.common.tagline}`, template: `%s | ${m.common.brand}` },
    description: m.landing.hero_sub,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const messages = getMessages(locale as Locale);
  const meta = LOCALE_META[locale as Locale];

  return (
    <html lang={meta.htmlLang} dir={meta.dir}>
      <body className="font-sans antialiased min-h-screen bg-cream text-bark">
        <I18nProvider locale={locale as Locale} messages={messages}>
          {children}
          <VersionBadge />
        </I18nProvider>
      </body>
    </html>
  );
}
