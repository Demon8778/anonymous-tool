import { siteConfig } from '@/lib/seo'

interface StructuredDataProps {
  type?: 'WebApplication' | 'Article' | 'HowTo' | 'FAQPage'
  data?: Record<string, any>
}

export function StructuredData({ type = 'WebApplication', data = {} }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': type,
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      ...data,
    }

    switch (type) {
      case 'WebApplication':
        return {
          ...baseData,
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
      
      case 'HowTo':
        return {
          ...baseData,
          '@type': 'HowTo',
          name: 'How to Create GIFs with Text Overlays',
          description: 'Learn how to create amazing animated GIFs with custom text overlays using CompressVerse',
          totalTime: 'PT5M',
          supply: [
            {
              '@type': 'HowToSupply',
              name: 'Web Browser'
            }
          ],
          tool: [
            {
              '@type': 'HowToTool',
              name: 'CompressVerse GIF Generator'
            }
          ],
          step: [
            {
              '@type': 'HowToStep',
              name: 'Search for GIF',
              text: 'Use our search feature to find the perfect GIF from millions of options',
              image: `${siteConfig.url}/how-to-step-1.jpg`
            },
            {
              '@type': 'HowToStep',
              name: 'Add Text Overlay',
              text: 'Customize your text with fonts, colors, and positioning options',
              image: `${siteConfig.url}/how-to-step-2.jpg`
            },
            {
              '@type': 'HowToStep',
              name: 'Download and Share',
              text: 'Generate your animated GIF and share it on social media or download it',
              image: `${siteConfig.url}/how-to-step-3.jpg`
            }
          ]
        }
      
      default:
        return baseData
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData()),
      }}
    />
  )
}