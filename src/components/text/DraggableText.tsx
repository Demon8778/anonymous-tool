/**
 * DraggableText component with touch-friendly drag-and-drop for mobile
 */

'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import type { TextOverlay, Position } from '@/lib/types/textOverlay';
import { 
  getTextStyles, 
  pixelsToPosition, 
  getDragHandleSize,
  getTextBounds 
} from '@/lib/utils/textOverlayUtils';
import { cn } from '@/lib/utils';

interface DraggableTextProps {
  overlay: TextOverlay;
  containerWidth: number;
  containerHeight: number;
  isActive: boolean;
  onPositionChange: (position: Position) => void;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  className?: string;
}

export function DraggableText({
  overlay,
  containerWidth,
  containerHeight,
  isActive,
  onPositionChange,
  onSelect,
  onDragStart,
  onDragEnd,
  className,
}: DraggableTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });

  // SIMPLE POSITIONING: Convert percentage to pixels
  const pixelPosition = {
    x: (overlay.position.x / 100) * containerWidth,
    y: (overlay.position.y / 100) * containerHeight,
  };
  
  console.log(`Preview: "${overlay.text}" at ${overlay.position.x}%, ${overlay.position.y}% -> ${pixelPosition.x}px, ${pixelPosition.y}px`);

  // Handle drag start (mouse and touch)
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!textRef.current) return;

    const rect = textRef.current.getBoundingClientRect();
    const containerRect = textRef.current.parentElement?.getBoundingClientRect();
    
    if (!containerRect) return;

    // Calculate offset from cursor/touch to element center
    const elementCenterX = rect.left + rect.width / 2 - containerRect.left;
    const elementCenterY = rect.top + rect.height / 2 - containerRect.top;
    const touchX = clientX - containerRect.left;
    const touchY = clientY - containerRect.top;

    setDragOffset({
      x: touchX - elementCenterX,
      y: touchY - elementCenterY,
    });

    dragStartRef.current = { x: clientX, y: clientY };
    setIsDragging(true);
    onDragStart();
    onSelect();
  }, [onDragStart, onSelect]);

  // Handle drag move
  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !textRef.current) return;

    const containerRect = textRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    // Calculate new position relative to container
    const newX = clientX - containerRect.left - dragOffset.x;
    const newY = clientY - containerRect.top - dragOffset.y;

    // Convert to percentage
    const newPosition = pixelsToPosition(newX, newY, containerWidth, containerHeight);
    onPositionChange(newPosition);
  }, [isDragging, dragOffset, containerWidth, containerHeight, onPositionChange]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    onDragEnd();
  }, [isDragging, onDragEnd]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    if (touch) {
      handleDragStart(touch.clientX, touch.clientY);
    }
  }, [handleDragStart]);

  // Global mouse/touch move and end handlers
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Handle click to select (without dragging)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only select if we didn't drag
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartRef.current.x, 2) + 
      Math.pow(e.clientY - dragStartRef.current.y, 2)
    );
    
    if (dragDistance < 5) { // 5px threshold for click vs drag
      onSelect();
    }
  }, [onSelect]);

  const textStyles = getTextStyles(overlay.style);
  const handleSize = getDragHandleSize();

  return (
    <div
      ref={textRef}
      className={cn(
        'absolute cursor-move select-none transition-all duration-300 touch-manipulation',
        'hover:scale-105 active:scale-95 focus-ring',
        isActive && 'ring-2 ring-primary ring-offset-2 ring-offset-transparent shadow-lg',
        isDragging && 'z-50 scale-110 shadow-2xl',
        className
      )}
      style={{
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        transform: 'translate(0, 0)', // No transform - match FFmpeg's top-left positioning
        ...textStyles,
        pointerEvents: 'auto', // Ensure text overlay captures pointer events
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`Text overlay: ${overlay.text || 'Empty text'}`}
    >
      {/* Enhanced text content */}
      <div
        className={cn(
          'relative px-3 py-2 rounded-lg transition-all duration-300',
          isActive && 'glass ring-1 ring-primary/20 shadow-lg',
          isDragging && 'bg-primary/10 backdrop-blur-md'
        )}
      >
        <span className={cn(
          'relative z-10',
          overlay.text ? 'opacity-100' : 'opacity-60 italic'
        )}>
          {overlay.text || 'Empty Text'}
        </span>
        
        {/* Text glow effect when active */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-lg opacity-30 animate-pulse-gentle"
            style={{
              background: `linear-gradient(135deg, ${overlay.style.color}20, transparent)`,
              filter: 'blur(4px)',
            }}
          />
        )}
      </div>

      {/* Enhanced drag handles for touch devices */}
      {isActive && (
        <>
          {/* Corner handles with responsive touch targets */}
          <div
            className="absolute -top-2 -left-2 bg-gradient-to-br from-primary to-primary/80 rounded-full border-2 border-white shadow-lg cursor-move touch-manipulation hover:scale-110 transition-transform duration-200 animate-scale-in"
            style={{ 
              width: handleSize, 
              height: handleSize,
              minWidth: '20px',
              minHeight: '20px'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          <div
            className="absolute -top-2 -right-2 bg-gradient-to-br from-primary to-primary/80 rounded-full border-2 border-white shadow-lg cursor-move touch-manipulation hover:scale-110 transition-transform duration-200 animate-scale-in"
            style={{ 
              width: handleSize, 
              height: handleSize, 
              animationDelay: '0.1s',
              minWidth: '20px',
              minHeight: '20px'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          <div
            className="absolute -bottom-2 -left-2 bg-gradient-to-br from-primary to-primary/80 rounded-full border-2 border-white shadow-lg cursor-move touch-manipulation hover:scale-110 transition-transform duration-200 animate-scale-in"
            style={{ 
              width: handleSize, 
              height: handleSize, 
              animationDelay: '0.2s',
              minWidth: '20px',
              minHeight: '20px'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          <div
            className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary to-primary/80 rounded-full border-2 border-white shadow-lg cursor-move touch-manipulation hover:scale-110 transition-transform duration-200 animate-scale-in"
            style={{ 
              width: handleSize, 
              height: handleSize, 
              animationDelay: '0.3s',
              minWidth: '20px',
              minHeight: '20px'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          
          {/* Center drag handle for easier mobile interaction */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-primary/80 to-primary/60 rounded-full border-2 border-white shadow-md cursor-move touch-manipulation hover:scale-110 transition-all duration-200 animate-scale-in opacity-80 hover:opacity-100"
            style={{ animationDelay: '0.4s' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute inset-1 bg-white/30 rounded-full" />
          </div>
        </>
      )}

      {/* Enhanced gradient background for visual polish */}
      {isActive && (
        <>
          <div 
            className="absolute inset-0 -z-10 rounded-lg opacity-20 animate-pulse-gentle bg-gradient-to-br from-primary/40 to-accent/40"
            style={{
              filter: 'blur(12px)',
              transform: 'scale(1.3)',
            }}
          />
          <div 
            className="absolute inset-0 -z-20 rounded-lg opacity-10"
            style={{
              background: `radial-gradient(circle, ${overlay.style.color}40, transparent)`,
              filter: 'blur(20px)',
              transform: 'scale(1.5)',
            }}
          />
        </>
      )}
      
      {/* Dragging state overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
      )}
    </div>
  );
}