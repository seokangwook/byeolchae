'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Messages, Locale } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';
import Header from './Header';
import Footer from './Footer';
import GuestbookSection from './GuestbookSection';
import AdSlot from './AdSlot';
import AuthModal from './AuthModal';
import SupportModal from './SupportModal';

interface Props {
  locale: Locale;
  messages: Messages;
  owner: { id: string; nickname: string; avatar_url?: string | null };
  byeolchaeProfile: {
    bio?: string;
    theme_color?: string;
    bgm_url?: string;
  } | null;
  posts: any[];
  guestbook: any[];
  supporter: { tier: string; expires_at: string } | null;
  viewer: User | null;
}

const THEME_COLORS: Record<string, string> = {
  cream:  '#FAF6F0',
  rose:   '#FFF0F3',
  sky:    '#F0F6FF',
  sage:   '#F0FFF4',
  lavender: '#F5F0FF',
  mocha:  '#FFF8F0',
};

export default function ByeolchaeHomeClient({
  locale, messages: m, owner, byeolchaeProfile, posts, guestbook, supporter, viewer,
}: Props) {
  const [showAuth, setShowAuth] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const isOwner = viewer?.id === owner.id;
  const themeColor = THEME_COLORS[byeolchaeProfile?.theme_color ?? 'cream'] ?? THEME_COLORS.cream;
  const activeTier = supporter && new Date(supporter.expires_at) > new Date() ? supporter.tier : null;

  const tierBadge =
    activeTier === 'gold'   ? m.profile.supporter_badge_gold :
    activeTier === 'silver' ? m.profile.supporter_badge_silver :
    activeTier === 'bronze' ? m.profile.supporter_badge_bronze : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: themeColor }}>
      <Header locale={locale} messages={m} user={viewer} nickname={isOwner ? owner.nickname : undefined} />

      {/* Profile hero */}
      <div className="border-b border-sand/60 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6">
          {owner.avatar_url ? (
            <Image
              src={owner.avatar_url}
              alt={owner.nickname}
              width={80}
              height={80}
              className="rounded-full border-4 border-sand object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center text-3xl border-4 border-parchment">
              ⭐
            </div>
          )}
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-2xl font-bold text-bark">
              {owner.nickname}
              {tierBadge && <span className="ml-2 text-sm font-normal">{tierBadge}</span>}
            </h1>
            {byeolchaeProfile?.bio && (
              <p className="text-mocha text-sm leading-relaxed">{byeolchaeProfile.bio}</p>
            )}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {isOwner && (
                <Link href={`/${locale}/${owner.nickname}/write`} className="byeolchae-btn-primary text-sm px-4 py-1.5">
                  ✏️ 글 쓰기
                </Link>
              )}
              {isOwner && (
                <Link href={`/${locale}/me`} className="byeolchae-btn-ghost text-sm px-4 py-1.5">
                  🎨 꾸미기
                </Link>
              )}
              {!isOwner && viewer && (
                <FriendButton locale={locale} targetNickname={owner.nickname} messages={m} />
              )}
              {!isOwner && (
                <button onClick={() => viewer ? setShowSupport(true) : setShowAuth(true)} className="byeolchae-btn-ghost text-sm px-4 py-1.5">
                  ☕ {m.support.coffee_copy}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 grid md:grid-cols-3 gap-6">
        {/* Posts feed (2/3 width) */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-bark text-lg">📝 게시글</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-mocha/50">{m.post.no_posts}</p>
          ) : (
            posts.map((post, idx) => (
              <div key={post.id}>
                <Link href={`/${locale}/${owner.nickname}/${post.id}`} className="byeolchae-card block hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-bark mb-1">{post.title}</h3>
                  <p className="text-sm text-mocha line-clamp-2">{post.body}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-mocha/40">{new Date(post.created_at).toLocaleDateString(locale)}</span>
                    <span className="text-xs text-mocha/40">{m.post.view_count.replace('{count}', String(post.view_count ?? 0))}</span>
                  </div>
                </Link>
                {/* 인-피드 광고: 7개마다 */}
                {(idx + 1) % 7 === 0 && (
                  <AdSlot slot="8901234567" format="fluid" className="my-4" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar (1/3 width) */}
        <aside className="space-y-6">
          {/* 데스크탑 사이드바 광고 */}
          <AdSlot slot="9012345678" format="rectangle" className="hidden md:block" />

          <GuestbookSection
            locale={locale}
            messages={m}
            hostNickname={owner.nickname}
            entries={guestbook}
            viewer={viewer}
            isOwner={isOwner}
          />

          {/* 프로필 푸터 배너 광고 */}
          <AdSlot slot="0123456789" format="horizontal" className="mt-2" />
        </aside>
      </main>

      <Footer locale={locale} messages={m} />

      {showAuth && <AuthModal locale={locale} messages={m} onClose={() => setShowAuth(false)} />}
      {showSupport && <SupportModal locale={locale} messages={m} onClose={() => setShowSupport(false)} />}
    </div>
  );
}

function FriendButton({ locale, targetNickname, messages: m }: { locale: Locale; targetNickname: string; messages: Messages }) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'sent'>('idle');

  async function sendRequest() {
    setStatus('pending');
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', target_nickname: targetNickname }),
    });
    setStatus(res.ok ? 'sent' : 'idle');
  }

  return (
    <button
      onClick={sendRequest}
      disabled={status !== 'idle'}
      className="byeolchae-btn-ghost text-sm px-4 py-1.5"
    >
      {status === 'sent' ? m.friend.friend_request_sent : status === 'pending' ? m.common.loading : `👥 ${m.friend.add_friend}`}
    </button>
  );
}
