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

  // Convert percentage position to pixels
  const pixelPosition = {
    x: (overlay.position.x / 100) * containerWidth,
    y: (overlay.position.y / 100) * containerHeight,
  };

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
    handleDragStart(touch.clientX, touch.clientY);
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
        'absolute cursor-move select-none transition-all duration-200',
        'hover:scale-105 active:scale-95',
        isActive && 'ring-2 ring-blue-400 ring-offset-2 ring-offset-transparent',
        isDragging && 'z-50 scale-110 shadow-lg',
        className
      )}
      style={{
        left: `${pixelPosition.x}px`,
        top: `${pixelPosition.y}px`,
        transform: 'translate(-50%, -50%)',
        ...textStyles,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {/* Text content */}
      <div
        className={cn(
          'relative px-2 py-1 rounded',
          isActive && 'bg-blue-500/10 backdrop-blur-sm'
        )}
      >
        {overlay.text || 'Empty Text'}
      </div>

      {/* Drag handles for touch devices */}
      {isActive && (
        <>
          {/* Corner handles */}
          <div
            className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-move touch-manipulation"
            style={{ width: handleSize, height: handleSize }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-move touch-manipulation"
            style={{ width: handleSize, height: handleSize }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-move touch-manipulation"
            style={{ width: handleSize, height: handleSize }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md cursor-move touch-manipulation"
            style={{ width: handleSize, height: handleSize }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </>
      )}

      {/* Gradient background for visual polish */}
      {isActive && (
        <div 
          className="absolute inset-0 -z-10 rounded-lg opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
            filter: 'blur(8px)',
            transform: 'scale(1.2)',
          }}
        />
      )}
    </div>
  );
}