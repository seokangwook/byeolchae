import { getMessages, isSupportedLocale, type Locale } from '@/lib/i18n';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';

export default async function NoticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const m = getMessages(locale as Locale);

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale as Locale} messages={m} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold text-bark mb-6">📢 공지사항</h1>
        <div className="byeolchae-card space-y-4">
          <article>
            <p className="text-xs text-mocha mb-1">2026-06-14</p>
            <h2 className="font-semibold text-bark mb-2">별채홈피 오픈 안내</h2>
            <p className="text-sm text-mocha leading-relaxed">
              별채홈피에 오신 것을 환영합니다! 스레드·인스타가 막혀도 친구들이 언제든 들를 수 있는 공간입니다.
              방명록을 남기고, 일촌을 맺고, 내 별채를 꾸며보세요.
            </p>
          </article>
          <hr className="border-sand" />
          <article>
            <p className="text-xs text-mocha mb-1">추후 예정</p>
            <h2 className="font-semibold text-bark mb-2">광고 도입 안내 (300명 달성 시)</h2>
            <p className="text-sm text-mocha leading-relaxed">
              가입자 300명 달성 시 최소한의 광고가 도입될 예정입니다.
              응원(₩10,000 이상)해 주신 분들은 1년간 광고 없이 이용하실 수 있습니다.
            </p>
          </article>
        </div>
      </main>
      <Footer locale={locale as Locale} messages={m} />
    </div>
  );
}
