'use client';
import { useState } from 'react';
import type { Messages, Locale } from '@/lib/i18n';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase';
import Header from './Header';
import Footer from './Footer';
import SupportModal from './SupportModal';

const THEMES = [
  { key: 'cream',    label: '크림',     color: '#FAF6F0' },
  { key: 'rose',     label: '로즈',     color: '#FFF0F3' },
  { key: 'sky',      label: '스카이',   color: '#F0F6FF' },
  { key: 'sage',     label: '세이지',   color: '#F0FFF4' },
  { key: 'lavender', label: '라벤더',   color: '#F5F0FF' },
  { key: 'mocha',    label: '모카',     color: '#FFF8F0' },
];

const PREMIUM_THEMES = [
  { key: 'midnight', label: '미드나잇', color: '#1A1A2E' },
  { key: 'cherry',   label: '체리',     color: '#FFF0F5' },
  { key: 'forest',   label: '포레스트', color: '#F0FFF7' },
];

interface Props {
  locale: Locale;
  messages: Messages;
  user: User;
  profile: { nickname?: string; avatar_url?: string } | null;
  byeolchaeProfile: {
    bio?: string;
    theme_color?: string;
    bgm_url?: string;
  } | null;
  supporter: { tier: string; expires_at: string; ads_disabled_until?: string } | null;
}

export default function ProfileEditorClient({ locale, messages: m, user, profile, byeolchaeProfile, supporter }: Props) {
  const [bio, setBio] = useState(byeolchaeProfile?.bio ?? '');
  const [theme, setTheme] = useState(byeolchaeProfile?.theme_color ?? 'cream');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const isGoldOrSilver = supporter && new Date(supporter.expires_at) > new Date() && ['gold', 'silver'].includes(supporter.tier);
  const nickname = profile?.nickname;

  const activeTierBadge =
    supporter?.tier === 'gold'   ? m.profile.supporter_badge_gold :
    supporter?.tier === 'silver' ? m.profile.supporter_badge_silver :
    supporter?.tier === 'bronze' ? m.profile.supporter_badge_bronze : null;

  async function save() {
    setSaving(true);
    const supabase = getSupabaseBrowser();
    await supabase.from('byeolchae_profiles').upsert({
      user_id: user.id,
      bio,
      theme_color: theme,
    }, { onConflict: 'user_id' });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header locale={locale} messages={m} user={user} nickname={nickname} />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-bark">{m.profile.edit_profile}</h1>

        {/* 현재 응원 상태 */}
        {activeTierBadge && (
          <div className="byeolchae-card bg-parchment flex items-center gap-2">
            <span className="text-sm font-medium text-bark">{activeTierBadge}</span>
            {supporter?.ads_disabled_until && new Date(supporter.ads_disabled_until) > new Date() && (
              <span className="text-xs text-mocha/60">
                · 광고 없음 {new Date(supporter.ads_disabled_until).toLocaleDateString(locale)}까지
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        <div className="byeolchae-card space-y-3">
          <label className="block text-sm font-semibold text-bark">소개글</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={m.profile.bio_placeholder}
            maxLength={100}
            rows={3}
            className="byeolchae-input resize-none"
          />
          <span className="text-xs text-mocha/40 text-right block">{bio.length}/100</span>
        </div>

        {/* Theme */}
        <div className="byeolchae-card space-y-3">
          <label className="block text-sm font-semibold text-bark">{m.profile.theme_label}</label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t.key}
                onClick={() => setTheme(t.key)}
                className={`w-10 h-10 rounded-full border-2 transition-all ${theme === t.key ? 'border-bark scale-110 shadow-md' : 'border-sand'}`}
                style={{ backgroundColor: t.color }}
                title={t.label}
              />
            ))}
          </div>
          {!isGoldOrSilver && (
            <div>
              <p className="text-xs text-mocha mb-2">프리미엄 테마 (응원자 전용)</p>
              <div className="flex flex-wrap gap-2 opacity-40">
                {PREMIUM_THEMES.map((t) => (
                  <div
                    key={t.key}
                    className="w-10 h-10 rounded-full border-2 border-sand cursor-not-allowed relative"
                    style={{ backgroundColor: t.color }}
                    title={`${t.label} (응원 후 이용 가능)`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs">🔒</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isGoldOrSilver && (
            <div className="flex flex-wrap gap-2">
              {PREMIUM_THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${theme === t.key ? 'border-bark scale-110 shadow-md' : 'border-sand'}`}
                  style={{ backgroundColor: t.color }}
                  title={t.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={save} disabled={saving} className="byeolchae-btn-primary flex-1">
            {saved ? `✅ ${m.common.success}` : saving ? m.common.loading : m.profile.save_profile}
          </button>
          <button onClick={() => setShowSupport(true)} className="byeolchae-btn-ghost">
            ☕ {m.support.coffee_copy}
          </button>
        </div>

        {nickname && (
          <div className="text-center">
            <a href={`/${locale}/${nickname}`} className="text-sm text-mocha hover:text-bark underline">
              내 별채 보기 →
            </a>
          </div>
        )}
      </main>
      <Footer locale={locale} messages={m} />
      {showSupport && <SupportModal locale={locale} messages={m} onClose={() => setShowSupport(false)} />}
    </div>
  );
}
