import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'CompressVerse - Create Amazing GIFs with Custom Text Overlays'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #10B981 100%)',
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              marginBottom: 20,
              background: 'linear-gradient(90deg, #fff 0%, #e0e7ff 100%)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            CompressVerse
          </div>
          <div
            style={{
              fontSize: 36,
              marginBottom: 20,
              opacity: 0.9,
            }}
          >
            Create Amazing GIFs with Custom Text Overlays
          </div>
          <div
            style={{
              fontSize: 24,
              opacity: 0.8,
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            Search millions of GIFs • Add custom text • Customize fonts & colors • Share instantly
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}