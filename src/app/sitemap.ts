import { MetadataRoute } from 'next';
import { getAllDocSlugs } from '@/lib/docs';
import { getLocale } from '@/lib/i18n';

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

  if (locale === 'es') {
    routes.push(
      {
        url: `${baseUrl}/mejor-app-para-leer-la-biblia`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/mejor-pagina-para-leer-la-biblia`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/mejor-app-para-leer-libros`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/mejor-hosting`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/biblia-online-gratis`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/biblia-reina-valera-online`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/biblia-sin-internet`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/escuchar-la-biblia`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      }
    );
  }

  const slugs = getAllDocSlugs();

  const docRoutes = slugs.map((slug) => ({
    url: `${baseUrl}/${slug.join('/')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...routes, ...docRoutes];
}
