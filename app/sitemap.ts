import { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/lib/i18n';

const BASE = 'https://byeolchae.revely.company';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/notice', '/friends', '/me'];
  return SUPPORTED_LOCALES.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${BASE}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.7,
    }))
  );
}
