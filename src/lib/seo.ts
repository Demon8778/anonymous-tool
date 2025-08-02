import { Metadata } from 'next'

export const siteConfig = {
  name: 'CompressVerse',
  title: 'CompressVerse - Create Amazing GIFs with Text Overlays',
  description: 'Create stunning animated GIFs with custom text overlays. Search millions of GIFs, add personalized text, and share your creations instantly with our powerful tools.',
  url: 'https://compressverse.com',
  ogImage: 'https://compressverse.com/og-image.jpg',
  keywords: [
    'GIF generator',
    'text overlay',
    'animated GIFs',
    'meme generator',
    'custom GIFs',
    'social media content',
    'GIF editor',
    'CompressVerse',
    'online GIF maker',
    'free GIF creator',
    'GIF with text',
    'animated memes',
    'social media GIFs',
    'viral content creator',
    'GIF customization'
  ],
  authors: [
    {
      name: 'CompressVerse Team',
      url: 'https://compressverse.com',
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
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Organization',
    name: siteConfig.creator,
    url: siteConfig.url,
  },
  featureList: [
    'Custom text overlays on GIFs',
    'Search millions of GIFs',
    'Real-time preview',
    'Social media sharing',
    'Mobile-friendly interface',
    'Free to use'
  ],
}