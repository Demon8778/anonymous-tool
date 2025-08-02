import { generateMetadata } from '@/lib/seo'

export const metadata = generateMetadata({
  title: 'GIF Editor - Create Custom GIFs with Text Overlays',
  description: 'Create amazing animated GIFs with custom text overlays. Upload your GIF, add personalized text, customize styles, and download your creation instantly.',
  url: '/gif-editor',
})

export default function GifEditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}