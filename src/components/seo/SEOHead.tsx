import Head from 'next/head'
import { siteConfig } from '@/lib/seo'

interface SEOHeadProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  noIndex?: boolean
  children?: React.ReactNode
}

export function SEOHead({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  children,
}: SEOHeadProps) {
  const metaTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const metaDescription = description || siteConfig.description
  const metaImage = image || siteConfig.ogImage
  const metaUrl = url ? `${siteConfig.url}${url}` : siteConfig.url

  return (
    <Head>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={siteConfig.keywords.join(', ')} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      <meta name="twitter:creator" content="@compressverse" />
      <meta name="twitter:site" content="@compressverse" />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Additional meta tags */}
      <meta name="author" content={siteConfig.creator} />
      <meta name="publisher" content={siteConfig.publisher} />
      <meta name="category" content={siteConfig.category} />
      
      {children}
    </Head>
  )
}