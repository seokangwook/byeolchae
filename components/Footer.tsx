import Link from 'next/link';
import type { Messages, Locale } from '@/lib/i18n';

interface Props { locale: Locale; messages: Messages }

export default function Footer({ locale, messages: m }: Props) {
  return (
    <footer className="mt-auto border-t border-sand bg-parchment py-6 text-center text-xs text-mocha/60">
      <p className="mb-1">
        <span className="font-medium text-mocha">{m.common.brand}</span>
        {' · '}
        <Link href={`/${locale}/notice`} className="hover:text-bark transition-colors">공지</Link>
        {' · '}
        <a href="https://revely.company/privacy" className="hover:text-bark transition-colors">개인정보처리방침</a>
      </p>
      <p>{m.common.operated_by}</p>
    </footer>
  );
}
