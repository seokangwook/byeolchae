export const SUPPORTED_LOCALES = [
  'ko', 'en', 'ja',
  'zh-CN', 'zh-TW',
  'es', 'pt-BR',
  'fr', 'de', 'it', 'ru',
  'ar', 'id', 'hi', 'vi', 'th',
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: Locale = 'ko';

export const LOCALE_META: Record<Locale, { nativeName: string; dir: 'ltr' | 'rtl'; htmlLang: string }> = {
  ko:      { nativeName: '한국어',              dir: 'ltr', htmlLang: 'ko' },
  en:      { nativeName: 'English',           dir: 'ltr', htmlLang: 'en' },
  ja:      { nativeName: '日本語',              dir: 'ltr', htmlLang: 'ja' },
  'zh-CN': { nativeName: '简体中文',            dir: 'ltr', htmlLang: 'zh-CN' },
  'zh-TW': { nativeName: '繁體中文',            dir: 'ltr', htmlLang: 'zh-TW' },
  es:      { nativeName: 'Español',           dir: 'ltr', htmlLang: 'es' },
  'pt-BR': { nativeName: 'Português (BR)',    dir: 'ltr', htmlLang: 'pt-BR' },
  fr:      { nativeName: 'Français',          dir: 'ltr', htmlLang: 'fr' },
  de:      { nativeName: 'Deutsch',           dir: 'ltr', htmlLang: 'de' },
  it:      { nativeName: 'Italiano',          dir: 'ltr', htmlLang: 'it' },
  ru:      { nativeName: 'Русский',           dir: 'ltr', htmlLang: 'ru' },
  ar:      { nativeName: 'العربية',           dir: 'rtl', htmlLang: 'ar' },
  id:      { nativeName: 'Bahasa Indonesia',  dir: 'ltr', htmlLang: 'id' },
  hi:      { nativeName: 'हिन्दी',               dir: 'ltr', htmlLang: 'hi' },
  vi:      { nativeName: 'Tiếng Việt',        dir: 'ltr', htmlLang: 'vi' },
  th:      { nativeName: 'ภาษาไทย',            dir: 'ltr', htmlLang: 'th' },
};

export function isSupportedLocale(s: string): s is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(s);
}

export function pickLocaleFromHeader(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header.split(',').map((p) => {
    const [tag, q = 'q=1'] = p.trim().split(';');
    const quality = parseFloat(q.replace('q=', '')) || 1;
    return { tag: tag.trim(), quality };
  }).sort((a, b) => b.quality - a.quality);

  for (const { tag } of parts) {
    if (isSupportedLocale(tag)) return tag as Locale;
    const lower = tag.toLowerCase();
    const upperRegion = lower.replace(/^([a-z]{2})-([a-z]{2,3})$/, (_m, a, b) => `${a}-${b.toUpperCase()}`);
    if (isSupportedLocale(upperRegion)) return upperRegion as Locale;
    const base = lower.split('-')[0];
    if (base === 'zh') return lower.includes('tw') || lower.includes('hk') ? 'zh-TW' : 'zh-CN';
    if (base === 'pt') return 'pt-BR';
    if (isSupportedLocale(base)) return base as Locale;
  }
  return DEFAULT_LOCALE;
}

import koMsgs from '@/messages/ko.json';
import enMsgs from '@/messages/en.json';
import jaMsgs from '@/messages/ja.json';
import zhCNMsgs from '@/messages/zh-CN.json';
import zhTWMsgs from '@/messages/zh-TW.json';
import esMsgs from '@/messages/es.json';
import ptBRMsgs from '@/messages/pt-BR.json';
import frMsgs from '@/messages/fr.json';
import deMsgs from '@/messages/de.json';
import itMsgs from '@/messages/it.json';
import ruMsgs from '@/messages/ru.json';
import arMsgs from '@/messages/ar.json';
import idMsgs from '@/messages/id.json';
import hiMsgs from '@/messages/hi.json';
import viMsgs from '@/messages/vi.json';
import thMsgs from '@/messages/th.json';

export interface Messages {
  common: {
    brand: string;
    tagline: string;
    login: string;
    logout: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    submit: string;
    back: string;
    loading: string;
    error: string;
    success: string;
    powered_by: string;
    operated_by: string;
  };
  landing: {
    hero_title: string;
    hero_sub: string;
    hero_cta: string;
    feature_1_title: string;
    feature_1_sub: string;
    feature_2_title: string;
    feature_2_sub: string;
    feature_3_title: string;
    feature_3_sub: string;
    my_byeolchae: string;
  };
  profile: {
    edit_profile: string;
    bio_placeholder: string;
    theme_label: string;
    bgm_label: string;
    save_profile: string;
    supporter_badge_bronze: string;
    supporter_badge_silver: string;
    supporter_badge_gold: string;
  };
  guestbook: {
    title: string;
    placeholder: string;
    submit: string;
    private_label: string;
    char_limit: string;
    empty: string;
    leave_message: string;
  };
  post: {
    write_title: string;
    title_placeholder: string;
    body_placeholder: string;
    image_label: string;
    submit: string;
    view_count: string;
    comment_title: string;
    comment_placeholder: string;
    comment_submit: string;
    no_posts: string;
    read_more: string;
  };
  friend: {
    title: string;
    add_friend: string;
    pending: string;
    accept: string;
    reject: string;
    blocked: string;
    no_friends: string;
    friend_request_sent: string;
  };
  notification: {
    title: string;
    guestbook: string;
    comment: string;
    friend_request: string;
    friend_accept: string;
    mark_read: string;
    empty: string;
  };
  support: {
    title: string;
    subtitle: string;
    bronze_label: string;
    bronze_desc: string;
    silver_label: string;
    silver_desc: string;
    gold_label: string;
    gold_desc: string;
    coffee_copy: string;
    pay_button: string;
  };
  auth: {
    login_title: string;
    login_subtitle: string;
    google_login: string;
    nickname_title: string;
    nickname_placeholder: string;
    nickname_save: string;
    nickname_error: string;
  };
  moderation: {
    flagged_message: string;
  };
}

const MESSAGES: Record<Locale, Messages> = {
  ko:      koMsgs as Messages,
  en:      enMsgs as Messages,
  ja:      jaMsgs as Messages,
  'zh-CN': zhCNMsgs as Messages,
  'zh-TW': zhTWMsgs as Messages,
  es:      esMsgs as Messages,
  'pt-BR': ptBRMsgs as Messages,
  fr:      frMsgs as Messages,
  de:      deMsgs as Messages,
  it:      itMsgs as Messages,
  ru:      ruMsgs as Messages,
  ar:      arMsgs as Messages,
  id:      idMsgs as Messages,
  hi:      hiMsgs as Messages,
  vi:      viMsgs as Messages,
  th:      thMsgs as Messages,
};

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}

export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
