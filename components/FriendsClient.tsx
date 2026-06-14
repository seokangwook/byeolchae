'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Messages, Locale } from '@/lib/i18n';
import Header from './Header';
import Footer from './Footer';

interface Props {
  locale: Locale;
  messages: Messages;
  userId: string;
  sent: any[];
  received: any[];
  friends: any[];
}

export default function FriendsClient({ locale, messages: m, userId, sent: initialSent, received: initialReceived, friends: initialFriends }: Props) {
  const [received, setReceived] = useState(initialReceived);
  const [friends, setFriends] = useState(initialFriends);
  const [searchNick, setSearchNick] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  async function respondToRequest(friendId: string, action: 'accept' | 'reject') {
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, friend_id: friendId }),
    });
    if (res.ok) {
      const removed = received.find((r) => r.id === friendId);
      setReceived(received.filter((r) => r.id !== friendId));
      if (action === 'accept' && removed) {
        setFriends([...friends, { ...removed, from_user: userId, to_user: removed.from_user }]);
      }
    }
  }

  async function sendRequest() {
    if (!searchNick.trim()) return;
    setSending(true);
    setSendResult(null);
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', target_nickname: searchNick.trim() }),
    });
    setSendResult(res.ok ? m.friend.friend_request_sent : m.common.error);
    setSending(false);
    setSearchNick('');
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header locale={locale} messages={m} user={{ id: userId } as any} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-bark">👥 {m.friend.title}</h1>

        {/* 일촌 신청 */}
        <section className="byeolchae-card space-y-3">
          <h2 className="font-semibold text-bark">일촌 신청하기</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchNick}
              onChange={(e) => setSearchNick(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
              placeholder="닉네임 입력"
              className="byeolchae-input flex-1"
            />
            <button onClick={sendRequest} disabled={sending || !searchNick.trim()} className="byeolchae-btn-primary whitespace-nowrap">
              {m.friend.add_friend}
            </button>
          </div>
          {sendResult && <p className="text-sm text-mocha">{sendResult}</p>}
        </section>

        {/* 받은 신청 */}
        {received.length > 0 && (
          <section className="byeolchae-card space-y-3">
            <h2 className="font-semibold text-bark">받은 일촌 신청 ({received.length})</h2>
            <ul className="space-y-2">
              {received.map((r) => (
                <li key={r.id} className="flex items-center justify-between border-b border-sand/60 pb-2 last:border-0">
                  <span className="text-sm font-medium text-bark">
                    {(r.profiles as any)?.nickname ?? r.from_user}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => respondToRequest(r.id, 'accept')} className="byeolchae-btn-primary text-xs px-3 py-1">{m.friend.accept}</button>
                    <button onClick={() => respondToRequest(r.id, 'reject')} className="byeolchae-btn-ghost text-xs px-3 py-1">{m.friend.reject}</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 일촌 목록 */}
        <section className="byeolchae-card space-y-3">
          <h2 className="font-semibold text-bark">일촌 ({friends.length})</h2>
          {friends.length === 0 ? (
            <p className="text-sm text-mocha/50">{m.friend.no_friends}</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {friends.map((f) => {
                const nick = (f.profiles as any)?.nickname ?? f.to_user;
                return (
                  <li key={f.id}>
                    <Link href={`/${locale}/${nick}`} className="byeolchae-card flex items-center gap-2 hover:shadow-md transition-shadow p-3">
                      <div className="w-8 h-8 rounded-full bg-sand flex items-center justify-center text-sm">⭐</div>
                      <span className="text-sm text-bark font-medium truncate">{nick}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
      <Footer locale={locale} messages={m} />
    </div>
  );
}
