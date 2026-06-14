'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Messages, Locale } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';
import Header from './Header';
import Footer from './Footer';

interface Props {
  locale: Locale;
  messages: Messages;
  user: User | null;
  nickname: string | null;
}

export default function LandingClient({ locale, messages: m, user, nickname }: Props) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} messages={m} user={user} nickname={nickname} />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-cream to-parchment">
        <div className="max-w-xl space-y-6">
          <div className="text-6xl mb-2">⭐</div>
          <h1 className="text-4xl md:text-5xl font-bold text-bark leading-tight">
            {m.landing.hero_title}
          </h1>
          <p className="text-lg text-mocha leading-relaxed">{m.landing.hero_sub}</p>

          {user && nickname ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/${locale}/${nickname}`} className="byeolchae-btn-primary text-base px-6 py-3">
                {m.landing.my_byeolchae} →
              </Link>
              <Link href={`/${locale}/me`} className="byeolchae-btn-ghost text-base px-6 py-3">
                {m.profile.edit_profile}
              </Link>
            </div>
          ) : user && !nickname ? (
            <p className="text-sm text-mocha">닉네임을 설정해주세요 →
              <Link href={`/${locale}/me`} className="underline ml-1">설정하기</Link>
            </p>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="byeolchae-btn-primary text-base px-8 py-3"
            >
              {m.landing.hero_cta}
            </button>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { emoji: '🏡', title: m.landing.feature_1_title, sub: m.landing.feature_1_sub },
            { emoji: '🔖', title: m.landing.feature_2_title, sub: m.landing.feature_2_sub },
            { emoji: '🎨', title: m.landing.feature_3_title, sub: m.landing.feature_3_sub },
          ].map(({ emoji, title, sub }) => (
            <div key={title} className="byeolchae-card text-center space-y-2">
              <div className="text-3xl">{emoji}</div>
              <h3 className="font-bold text-bark">{title}</h3>
              <p className="text-sm text-mocha">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer locale={locale} messages={m} />

      {showAuth && <AuthModal locale={locale} messages={m} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
