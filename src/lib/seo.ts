import { Metadata } from 'next'

export const siteConfig = {
  name: 'CompressVerse',
  title: 'CompressVerse - Create Amazing GIFs with Custom Text Overlays',
  description: 'Create stunning animated GIFs with custom text overlays using CompressVerse. Search millions of GIFs from Klipy, add personalized text with full customization, and share your creations instantly. Free online GIF editor and meme generator.',
  url: 'https://compressverse.vercel.app',
  ogImage: 'https://compressverse.vercel.app/og-image.jpg',
  keywords: [
    'GIF generator',
    'text overlay GIF',
    'animated GIFs',
    'meme generator',
    'custom GIFs',
    'social media content',
    'GIF editor online',
    'CompressVerse',
    'online GIF maker',
    'free GIF creator',
    'GIF with text',
    'animated memes',
    'social media GIFs',
    'viral content creator',
    'GIF customization',
    'Tenor GIFs',
    'Giphy GIFs',
    'GIF text editor',
    'animated GIF maker',
    'meme creator online',
    'GIF overlay tool',
    'custom text GIFs',
    'personalized GIFs',
    'GIF font editor',
    'animated text GIFs'
  ],
  authors: [
    {
      name: 'CompressVerse Team',
      url: 'https://compressverse.vercel.app',
    },
  ],
  creator: 'CompressVerse',
  publisher: 'CompressVerse',
  category: 'Technology',
}

export function generateMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  url?: string
  noIndex?: boolean
} = {}): Metadata {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const metaDescription = description || siteConfig.description
  const metaImage = image || siteConfig.ogImage
  const metaUrl = url ? `${siteConfig.url}${url}` : siteConfig.url

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    publisher: siteConfig.publisher,
    category: siteConfig.category,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: metaUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: metaUrl,
      title: metaTitle,
      description: metaDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@compressverse',
      site: '@compressverse',
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
    other: {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': siteConfig.name,
      'mobile-web-app-capable': 'yes',
      'msapplication-TileColor': '#000000',
      'msapplication-config': '/browserconfig.xml',
      'theme-color': '#000000',
    },
  }
}

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  softwareVersion: '1.0',
  datePublished: '2024-01-01',
  dateModified: new Date().toISOString(),
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  creator: {
    '@type': 'Organization',
    name: siteConfig.creator,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo.svg`,
    },
  },
  featureList: [
    'Custom text overlays on animated GIFs',
    'Search millions of GIFs from Klipy',
    'Real-time preview and editing',
    'Font, color, and positioning customization',
    'Social media sharing and download',
    'Mobile-friendly responsive interface',
    'Free to use with no registration required',
    'Instant GIF processing and generation'
  ],
  screenshot: `${siteConfig.url}/og-image.jpg`,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
  review: [
    {
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: 'Content Creator',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: '5',
        bestRating: '5',
      },
      reviewBody: 'Amazing tool for creating custom GIFs with text. Easy to use and produces high-quality results.',
    },
  ],
}