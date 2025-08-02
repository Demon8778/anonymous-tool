import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 48,
  height: 48,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          position: 'relative',
        }}
      >
        {/* SVG Logo */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          
          {/* Outer glow circle */}
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="url(#gradient)"
            opacity="0.3"
          />
          
          {/* Main background */}
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="url(#gradient)"
          />
          
          {/* Geometric pattern overlay */}
          <g opacity="0.15">
            <polygon
              points="24,8 32,12 32,28 24,32 16,28 16,12"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
            <polygon
              points="24,12 28,14 28,26 24,28 20,26 20,14"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </g>
          
          {/* Central "C" */}
          <g transform="translate(24, 24)">
            <path
              d="M -6,-8 A 8,8 0 0,0 -6,8 M -6,-8 L -3,-8 M -6,8 L -3,8"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M -3,-6 A 6,6 0 0,0 -3,6"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle
              cx="3"
              cy="0"
              r="2"
              fill="white"
              opacity="0.8"
            />
          </g>
          
          {/* Orbiting elements */}
          <circle cx="38" cy="24" r="1.5" fill="rgba(255,255,255,0.4)" />
          <circle cx="24" cy="10" r="1.2" fill="rgba(255,255,255,0.3)" />
          <circle cx="10" cy="24" r="1.8" fill="rgba(255,255,255,0.5)" />
          
          {/* Top highlight */}
          <ellipse
            cx="24"
            cy="14"
            rx="12"
            ry="4"
            fill="rgba(255,255,255,0.2)"
            opacity="0.6"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}