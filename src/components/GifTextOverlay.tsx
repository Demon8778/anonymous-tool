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
}

export default function GifTextOverlay({ 
  gifSrc, 
  overlays, 
  activeOverlayId, 
  onOverlayUpdate, 
  onOverlaySelect 
}: GifTextOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedOverlayId, setDraggedOverlayId] = useState<string | null>(null);
  const [gifDimensions, setGifDimensions] = useState({ width: 0, height: 0 });
  
  const previewRef = useRef<HTMLImageElement>(null);

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
    
    // Constrain to preview bounds
    const constrainedX = Math.max(0, Math.min(newX, previewRect.width - 20));
    const constrainedY = Math.max(0, Math.min(newY, previewRect.height - 20));
    
    onOverlayUpdate?.(draggedOverlayId, {
      position: { x: constrainedX, y: constrainedY }
    });
  }, [isDragging, draggedOverlayId, dragOffset, onOverlayUpdate]);

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

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>, overlayId: string) => {
    const newText = e.currentTarget.textContent || '';
    onOverlayUpdate?.(overlayId, { text: newText });
  };

  const handleImageLoad = () => {
    if (previewRef.current) {
      const { naturalWidth, naturalHeight } = previewRef.current;
      setGifDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only deselect if clicking on the container itself, not on text overlays
    if (e.target === e.currentTarget) {
      onOverlaySelect?.(null);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <img 
        ref={previewRef}
        src={gifSrc} 
        alt="GIF Preview"
        onLoad={handleImageLoad}
        style={{ display: 'block' }}
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
        {overlays.map((overlay) => (
          <div
            key={overlay.id}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => handleTextChange(e, overlay.id)}
            onMouseDown={(e) => handleMouseDown(e, overlay.id)}
            style={{
              position: 'absolute',
              top: `${overlay.position.y}px`,
              left: `${overlay.position.x}px`,
              cursor: isDragging && draggedOverlayId === overlay.id ? 'grabbing' : 'move',
              color: overlay.style.color,
              fontSize: `${overlay.style.fontSize}px`,
              fontWeight: overlay.style.fontWeight,
              textShadow: `${overlay.style.strokeWidth}px ${overlay.style.strokeWidth}px 0px ${overlay.style.strokeColor}`,
              opacity: overlay.style.opacity,
              userSelect: 'none',
              outline: activeOverlayId === overlay.id ? '2px solid #3b82f6' : 'none',
              minWidth: '20px',
              minHeight: `${overlay.style.fontSize}px`,
              whiteSpace: 'nowrap',
              pointerEvents: 'auto'
            }}
          >
            {overlay.text}
          </div>
        ))}
      </div>
      
      {/* Debug info */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        GIF Size: {gifDimensions.width}x{gifDimensions.height}
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