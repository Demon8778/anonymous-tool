'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    opacity: number;
    fontWeight: 'normal' | 'bold';
  };
}

interface GifTextOverlayProps {
  gifSrc: string;
  overlays: TextOverlay[];
  activeOverlayId: string | null;
  onOverlayUpdate?: (id: string, updates: Partial<TextOverlay>) => void;
  onOverlaySelect?: (id: string | null) => void;
  onScaleFactorChange?: (scaleFactor: number) => void;
}

export default function GifTextOverlay({ 
  gifSrc, 
  overlays, 
  activeOverlayId, 
  onOverlayUpdate, 
  onOverlaySelect,
  onScaleFactorChange
}: GifTextOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedOverlayId, setDraggedOverlayId] = useState<string | null>(null);
  const [gifDimensions, setGifDimensions] = useState({ width: 0, height: 0 });
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState(1);
  
  const previewRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, overlayId: string) => {
    e.stopPropagation();
    
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay || !previewRef.current) return;
    
    setIsDragging(true);
    setDraggedOverlayId(overlayId);
    
    const overlayRect = e.currentTarget.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - overlayRect.left,
      y: e.clientY - overlayRect.top
    });
    
    onOverlaySelect?.(overlayId);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggedOverlayId || !previewRef.current) return;
    
    const previewRect = previewRef.current.getBoundingClientRect();
    const newX = e.clientX - previewRect.left - dragOffset.x;
    const newY = e.clientY - previewRect.top - dragOffset.y;
    
    // Convert display coordinates back to natural coordinates
    const naturalX = newX / scaleFactor;
    const naturalY = newY / scaleFactor;
    
    // Constrain to natural GIF bounds
    const constrainedX = Math.max(0, Math.min(naturalX, gifDimensions.width - 20));
    const constrainedY = Math.max(0, Math.min(naturalY, gifDimensions.height - 20));
    
    onOverlayUpdate?.(draggedOverlayId, {
      position: { x: constrainedX, y: constrainedY }
    });
  }, [isDragging, draggedOverlayId, dragOffset, onOverlayUpdate, scaleFactor, gifDimensions]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedOverlayId(null);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleOverlayClick = (e: React.MouseEvent, overlayId: string) => {
    e.stopPropagation();
    onOverlaySelect?.(overlayId);
  };

  const updateDimensions = useCallback(() => {
    if (previewRef.current) {
      const { naturalWidth, naturalHeight } = previewRef.current;
      const { width: displayWidth, height: displayHeight } = previewRef.current.getBoundingClientRect();
      
      setGifDimensions({ width: naturalWidth, height: naturalHeight });
      setDisplayDimensions({ width: displayWidth, height: displayHeight });
      
      // Calculate scale factor based on display vs natural size
      // Use the smaller ratio to ensure text scales appropriately
      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;
      const scale = Math.min(scaleX, scaleY);
      
      setScaleFactor(scale);
      onScaleFactorChange?.(scale);
    }
  }, [onScaleFactorChange]);

  const handleImageLoad = () => {
    updateDimensions();
  };

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDimensions]);

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the container itself, not on text overlays
    if (e.target === e.currentTarget) {
      onOverlaySelect?.(null);
    }
  };

  // Calculate responsive font size and stroke width
  const getResponsiveStyle = (overlay: TextOverlay) => {
    const responsiveFontSize = overlay.style.fontSize * scaleFactor;
    const responsiveStrokeWidth = overlay.style.strokeWidth * scaleFactor;
    
    return {
      fontSize: `${responsiveFontSize}px`,
      textShadow: `${responsiveStrokeWidth}px ${responsiveStrokeWidth}px 0px ${overlay.style.strokeColor}`,
      minHeight: `${responsiveFontSize}px`
    };
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <img 
        ref={previewRef}
        src={gifSrc} 
        alt="GIF Preview"
        onLoad={handleImageLoad}
        style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
      />
      
      {/* Overlay container */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto'
        }}
        onClick={handleContainerClick}
      >
        {/* Text Overlays */}
        {overlays.map((overlay) => {
          const responsiveStyle = getResponsiveStyle(overlay);
          
          return (
            <div
              key={overlay.id}
              onMouseDown={(e) => handleMouseDown(e, overlay.id)}
              onClick={(e) => handleOverlayClick(e, overlay.id)}
              style={{
                position: 'absolute',
                top: `${overlay.position.y * scaleFactor}px`,
                left: `${overlay.position.x * scaleFactor}px`,
                cursor: isDragging && draggedOverlayId === overlay.id ? 'grabbing' : 'move',
                color: overlay.style.color,
                fontWeight: overlay.style.fontWeight,
                opacity: overlay.style.opacity,
                userSelect: 'none',
                outline: activeOverlayId === overlay.id ? '2px solid #3b82f6' : 'none',
                outlineOffset: '2px',
                minWidth: '20px',
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
                padding: '2px 4px',
                borderRadius: '2px',
                transition: 'outline 0.2s ease',
                ...responsiveStyle
              }}
            >
              {overlay.text || 'Empty Text'}
            </div>
          );
        })}
      </div>
      
      {/* Debug info */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        GIF Size: {gifDimensions.width}x{gifDimensions.height}
        <br />
        Display Size: {Math.round(displayDimensions.width)}x{Math.round(displayDimensions.height)}
        <br />
        Scale Factor: {scaleFactor.toFixed(3)}
        <br />
        Overlays: {overlays.length}
        {activeOverlayId && (
          <>
            <br />
            Active: {overlays.find(o => o.id === activeOverlayId)?.text || 'None'}
          </>
        )}
      </div>
    </div>
  );
}