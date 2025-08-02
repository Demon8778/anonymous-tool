import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CompressVerse - GIF Text Editor',
    short_name: 'CompressVerse',
    description: 'Create amazing GIFs with custom text overlays. Search, edit, and share animated GIFs instantly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#8B5CF6',
    orientation: 'portrait-primary',
    categories: ['entertainment', 'graphics', 'social'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    screenshots: [
      {
        src: '/og-image.jpg',
        sizes: '1200x630',
        type: 'image/jpeg',
        form_factor: 'wide',
        label: 'CompressVerse GIF Editor Interface',
      },
    ],
  }
}