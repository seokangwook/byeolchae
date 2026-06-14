'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, LOCALE_META, type Locale } from '@/lib/i18n';

interface Props { locale: Locale; currentPath: string }

export default function LocaleSwitcher({ locale, currentPath }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function switchLocale(next: Locale) {
    document.cookie = `byeolchae_locale=${next}; path=/; max-age=31536000; SameSite=Lax`;
    const newPath = currentPath.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, `/${next}`);
    router.push(newPath);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-mocha hover:text-bark px-2 py-1 rounded-lg hover:bg-parchment transition-colors"
        aria-label="Change language"
      >
        {LOCALE_META[locale].nativeName}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-sand rounded-xl shadow-lg z-50 py-1 min-w-36 max-h-60 overflow-y-auto">
          {SUPPORTED_LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-parchment transition-colors ${l === locale ? 'text-bark font-medium' : 'text-mocha'}`}
            >
              {LOCALE_META[l].nativeName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
