'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Messages, Locale } from '@/lib/i18n';
import NotificationBell from './NotificationBell';
import LocaleSwitcher from './LocaleSwitcher';

interface Props {
  locale: Locale;
  messages: Messages;
  user?: { id: string } | null;
  nickname?: string | null;
}

export default function Header({ locale, messages: m, user, nickname }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-sand">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="font-bold text-bark text-lg tracking-tight">
          ⭐ {m.common.brand}
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {user && nickname && (
            <Link href={`/${locale}/${nickname}`} className="text-mocha hover:text-bark transition-colors">
              {m.landing.my_byeolchae}
            </Link>
          )}
          <Link href={`/${locale}/notice`} className="text-mocha hover:text-bark transition-colors">
            공지
          </Link>
          {user && (
            <>
              <Link href={`/${locale}/friends`} className="text-mocha hover:text-bark transition-colors">
                {m.friend.title}
              </Link>
              <Link href={`/${locale}/me`} className="text-mocha hover:text-bark transition-colors">
                꾸미기
              </Link>
              <NotificationBell locale={locale} messages={m} />
            </>
          )}
          <LocaleSwitcher locale={locale} currentPath={pathname} />
        </nav>
      </div>
    </header>
  );
}
