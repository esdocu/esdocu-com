import { MetadataRoute } from 'next';
import { getAllDocSlugs } from '@/lib/docs';
import { getLocale } from '@/lib/i18n';
import { getLandingPagesByLocale } from '@/lib/landing-pages';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const locale = getLocale();
  const domain = locale === 'es' ? 'esdocu.com' : `${locale}.esdocu.com`;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${domain}`;

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  const landingPages = getLandingPagesByLocale(locale);
  landingPages.forEach((page) => {
    routes.push({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  });

  const slugs = getAllDocSlugs();

  const docRoutes = slugs.map((slug) => ({
    url: `${baseUrl}/${slug.join('/')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...docRoutes];
}
