'use client';
import { createContext, useContext } from 'react';
import type { Messages, Locale } from './i18n';

interface I18nCtx { locale: Locale; m: Messages }
const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ locale, messages, children }: {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ locale, m: messages }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
