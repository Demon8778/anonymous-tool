import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function Logo({ size = 32, className = '', animated = true }: LogoProps) {
  const scale = size / 32; // Base scale for 32px
  
  return (
    <div
      className={`relative flex items-center justify-center select-none ${
        animated ? 'transition-all duration-300 hover:scale-110' : ''
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={animated ? 'logo-svg' : ''}
      >
        {/* Background gradient circle */}
        <defs>
          <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id={`glow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Inner shadow */}
          <filter id={`innerShadow-${size}`}>
            <feOffset dx="0" dy="1"/>
            <feGaussianBlur stdDeviation="1" result="offset-blur"/>
            <feFlood floodColor="#000000" floodOpacity="0.2"/>
            <feComposite in2="offset-blur" operator="in"/>
            <feComposite in2="SourceGraphic" operator="over"/>
          </filter>
        </defs>
        
        {/* Outer glow circle */}
        <circle
          cx="16"
          cy="16"
          r="15"
          fill={`url(#gradient-${size})`}
          filter={`url(#glow-${size})`}
          opacity="0.3"
        />
        
        {/* Main background */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill={`url(#gradient-${size})`}
          filter={`url(#innerShadow-${size})`}
        />
        
        {/* Geometric pattern overlay */}
        <g opacity="0.15">
          {/* Hexagonal pattern */}
          <polygon
            points="16,4 24,9 24,19 16,24 8,19 8,9"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
          />
          <polygon
            points="16,8 20,10.5 20,17.5 16,20 12,17.5 12,10.5"
            fill="none"
            stroke="white"
            strokeWidth="0.3"
          />
        </g>
        
        {/* Central "C" with modern design */}
        <g transform="translate(16, 16)">
          {/* Outer C arc */}
          <path
            d="M -4,-6 A 6,6 0 0,0 -4,6 M -4,-6 L -2,-6 M -4,6 L -2,6"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            filter={`url(#glow-${size})`}
          />
          
          {/* Inner accent */}
          <path
            d="M -2,-4 A 4,4 0 0,0 -2,4"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Central dot */}
          <circle
            cx="2"
            cy="0"
            r="1.5"
            fill="white"
            opacity="0.8"
          />
        </g>
        
        {/* Orbiting elements */}
        <g className={animated ? 'orbit-animation' : ''}>
          <circle cx="26" cy="16" r="1" fill="rgba(255,255,255,0.4)" />
          <circle cx="16" cy="6" r="0.8" fill="rgba(255,255,255,0.3)" />
          <circle cx="6" cy="16" r="1.2" fill="rgba(255,255,255,0.5)" />
        </g>
        
        {/* Top highlight */}
        <ellipse
          cx="16"
          cy="8"
          rx="8"
          ry="3"
          fill="rgba(255,255,255,0.2)"
          opacity="0.6"
        />
      </svg>
      
      {/* CSS animations */}
      <style jsx>{`
        .logo-svg:hover .orbit-animation {
          animation: orbit 3s linear infinite;
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .logo-svg {
          filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.3));
        }
        
        .logo-svg:hover {
          filter: drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4));
        }
      `}</style>
    </div>
  );
}