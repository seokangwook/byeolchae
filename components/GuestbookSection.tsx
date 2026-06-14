'use client';
import { useState } from 'react';
import type { Messages, Locale } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';

interface GuestEntry {
  id: string;
  content: string;
  is_private: boolean;
  created_at: string;
  profiles: { nickname: string; avatar_url: string | null } | null;
}

interface Props {
  locale: Locale;
  messages: Messages;
  hostNickname: string;
  entries: GuestEntry[];
  viewer: User | null;
  isOwner: boolean;
}

export default function GuestbookSection({ locale, messages: m, hostNickname, entries: initial, viewer, isOwner }: Props) {
  const [entries, setEntries] = useState(initial);
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!content.trim() || content.length > 140) return;
    setSubmitting(true);
    const res = await fetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host_nickname: hostNickname, content: content.trim(), is_private: isPrivate }),
    });
    if (res.ok) {
      const { data } = await res.json();
      setEntries([{ ...data, profiles: null }, ...entries]);
      setContent('');
    }
    setSubmitting(false);
  }

  async function deleteEntry(id: string) {
    const res = await fetch('/api/guestbook', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setEntries(entries.filter((e) => e.id !== id));
  }

  return (
    <section className="byeolchae-card space-y-4">
      <h2 className="font-bold text-bark text-lg">📖 {m.guestbook.title}</h2>

      {viewer ? (
        <div className="space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={m.guestbook.placeholder}
            maxLength={140}
            rows={3}
            className="byeolchae-input resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-mocha cursor-pointer">
              <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
              {m.guestbook.private_label}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-mocha/50">{m.guestbook.char_limit.replace('{count}', String(content.length))}</span>
              <button onClick={submit} disabled={submitting || !content.trim()} className="byeolchae-btn-primary text-sm px-4 py-1.5">
                {m.guestbook.submit}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-mocha/60">{m.guestbook.leave_message}</p>
      )}

      {entries.length === 0 ? (
        <p className="text-sm text-mocha/50 text-center py-4">{m.guestbook.empty}</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="border-b border-sand/60 pb-3 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-mocha">
                  {entry.profiles?.nickname ?? '익명'}{entry.is_private ? ' 🔒' : ''}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-mocha/40">
                    {new Date(entry.created_at).toLocaleDateString(locale)}
                  </span>
                  {(isOwner || viewer?.id) && (
                    <button onClick={() => deleteEntry(entry.id)} className="text-[10px] text-red-400 hover:text-red-600">
                      {m.common.delete}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-bark leading-relaxed">{entry.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
