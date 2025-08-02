import { generateMetadata } from '@/lib/seo'

export const metadata = generateMetadata({
    title: 'Browse GIFs - Search Millions of GIFs to Edit',
    description: 'Browse and search millions of GIFs from Klipy. Find the perfect GIF for your message and add custom text overlays instantly.',
    url: '/browse',
})

export default function BrowseLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}