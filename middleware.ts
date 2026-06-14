import { NextRequest, NextResponse } from 'next/server';
import { isSupportedLocale, pickLocaleFromHeader, SUPPORTED_LOCALES } from './lib/i18n';

export const config = {
  matcher: ['/((?!_next|api|auth|favicon.ico|ads.txt|robots.txt|sitemap.xml|opengraph-image|.*\\..*).*)'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const firstSeg = pathname.split('/')[1];
  if (isSupportedLocale(firstSeg)) return NextResponse.next();

  const cookieLocale = req.cookies.get('byeolchae_locale')?.value;
  const acceptLanguage = req.headers.get('accept-language');

  const locale = (cookieLocale && isSupportedLocale(cookieLocale))
    ? cookieLocale
    : pickLocaleFromHeader(acceptLanguage);

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const _DEBUG_LOCALES = SUPPORTED_LOCALES;
