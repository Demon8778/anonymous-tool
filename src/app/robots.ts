import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/_next/', '/test-results/'],
    },
    sitemap: 'https://compressverse.com/sitemap.xml',
  }
}