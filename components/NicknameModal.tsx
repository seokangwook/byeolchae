'use client';
import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import type { Messages, Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
  messages: Messages;
  userId: string;
  onSaved: (nickname: string) => void;
}

export default function NicknameModal({ locale, messages: m, userId, onSaved }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function save() {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 20) {
      setError(m.auth.nickname_error);
      return;
    }
    // Only allow Korean, English letters, numbers, underscore
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(trimmed)) {
      setError(m.auth.nickname_error);
      return;
    }
    // Block profanity keywords (basic filter - server-side moderation handles the rest)
    const blocked = ['admin', 'administrator', 'byeolchae', 'revely'];
    if (blocked.some((b) => trimmed.toLowerCase().includes(b))) {
      setError(m.auth.nickname_error);
      return;
    }

    setLoading(true);
    setError('');
    const supabase = getSupabaseBrowser();

    const { error: upsertErr } = await supabase.from('profiles').upsert({
      id: userId,
      nickname: trimmed,
    }, { onConflict: 'id' });

    if (upsertErr) {
      setError(m.auth.nickname_error);
      setLoading(false);
      return;
    }

    // Create byeolchae_profile skeleton
    await supabase.from('byeolchae_profiles').upsert({
      user_id: userId,
    }, { onConflict: 'user_id' });

    onSaved(trimmed);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark/40 backdrop-blur-sm">
      <div className="byeolchae-card w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-bark text-center">✏️ {m.auth.nickname_title}</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder={m.auth.nickname_placeholder}
          maxLength={20}
          className="byeolchae-input"
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          onClick={save}
          disabled={loading || !value.trim()}
          className="byeolchae-btn-primary w-full"
        >
          {loading ? m.common.loading : m.auth.nickname_save}
        </button>
      </div>
    </div>
  );
}
