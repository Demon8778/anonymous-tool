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

    const [scaleFactor, setScaleFactor] = useState(1);
    const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    const previewRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);
    
    // Double-tap detection for mobile
    const lastTapRef = useRef<{ time: number; overlayId: string | null }>({ time: 0, overlayId: null });
    const DOUBLE_TAP_DELAY = 300; // milliseconds

    // Unified pointer event handlers for both mouse and touch
    const handlePointerDown = (e: React.PointerEvent, overlayId: string) => {
        e.stopPropagation();
        
        // Don't prevent default on touch events to allow tap detection
        if (e.pointerType !== 'touch') {
            e.preventDefault();
        }

        const overlay = overlays.find(o => o.id === overlayId);
        if (!overlay || !previewRef.current) return;

        // Capture the pointer to ensure we get all subsequent events
        e.currentTarget.setPointerCapture(e.pointerId);

        // Capture the element and coordinates before the timeout
        const currentTarget = e.currentTarget;
        const clientX = e.clientX;
        const clientY = e.clientY;

        // Add a small delay before starting drag to allow for double-tap detection
        setTimeout(() => {
            if (!editingOverlayId && currentTarget) { // Only start dragging if not editing and element exists
                setIsDragging(true);
                setDraggedOverlayId(overlayId);

                const overlayRect = currentTarget.getBoundingClientRect();

                setDragOffset({
                    x: clientX - overlayRect.left,
                    y: clientY - overlayRect.top
                });
            }
        }, e.pointerType === 'touch' ? 100 : 0); // Small delay for touch events

        onOverlaySelect?.(overlayId);
    };

    const handlePointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging || !draggedOverlayId || !previewRef.current) return;

        e.preventDefault();

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

    const handlePointerUp = useCallback(() => {
        setIsDragging(false);
        setDraggedOverlayId(null);
    }, []);

    // Add global pointer event listeners
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('pointermove', handlePointerMove);
            document.addEventListener('pointerup', handlePointerUp);

            return () => {
                document.removeEventListener('pointermove', handlePointerMove);
                document.removeEventListener('pointerup', handlePointerUp);
            };
        }
    }, [isDragging, handlePointerMove, handlePointerUp]);

    const handleOverlayClick = (e: React.MouseEvent, overlayId: string) => {
        e.stopPropagation();
        onOverlaySelect?.(overlayId);
    };

    const handleOverlayDoubleClick = (e: React.MouseEvent, overlayId: string) => {
        e.stopPropagation();
        setEditingOverlayId(overlayId);
        onOverlaySelect?.(overlayId);

        // Focus the input after a short delay to ensure it's rendered
        setTimeout(() => {
            editInputRef.current?.focus();
            editInputRef.current?.select();
        }, 10);
    };

    // Custom tap handler for mobile double-tap detection
    const handleOverlayTap = (e: React.TouchEvent | React.MouseEvent, overlayId: string) => {
        try {
            e.stopPropagation();
            
            const currentTime = Date.now();
            const lastTap = lastTapRef.current;
            
            // Check if this is a double-tap
            if (
                lastTap.overlayId === overlayId && 
                currentTime - lastTap.time < DOUBLE_TAP_DELAY
            ) {
                // Double-tap detected - start editing
                console.log('Double-tap detected on mobile for overlay:', overlayId);
                setEditingOverlayId(overlayId);
                onOverlaySelect?.(overlayId);
                
                // Focus the input after a short delay to ensure it's rendered
                setTimeout(() => {
                    if (editInputRef.current) {
                        editInputRef.current.focus();
                        editInputRef.current.select();
                    }
                }, 50); // Slightly longer delay for mobile
                
                // Reset tap tracking
                lastTapRef.current = { time: 0, overlayId: null };
            } else {
                // Single tap - just select
                onOverlaySelect?.(overlayId);
                
                // Update tap tracking
                lastTapRef.current = { time: currentTime, overlayId };
                
                console.log('Single tap on overlay:', overlayId, 'at time:', currentTime);
            }
        } catch (error) {
            console.error('Error in handleOverlayTap:', error);
        }
    };

    // Alternative: Long press to edit (fallback for mobile)
    const handleLongPress = (overlayId: string) => {
        try {
            console.log('Long press detected for overlay:', overlayId);
            setEditingOverlayId(overlayId);
            onOverlaySelect?.(overlayId);
            
            setTimeout(() => {
                if (editInputRef.current) {
                    editInputRef.current.focus();
                    editInputRef.current.select();
                }
            }, 50);
        } catch (error) {
            console.error('Error in handleLongPress:', error);
        }
    };

    // Long press detection
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    
    const handleTouchStart = (e: React.TouchEvent, overlayId: string) => {
        try {
            e.stopPropagation();
            
            // Start long press timer
            longPressTimerRef.current = setTimeout(() => {
                handleLongPress(overlayId);
            }, 500); // 500ms for long press
        } catch (error) {
            console.error('Error in handleTouchStart:', error);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent, overlayId: string) => {
        try {
            // Clear long press timer
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
            
            // Handle tap detection
            handleOverlayTap(e, overlayId);
        } catch (error) {
            console.error('Error in handleTouchEnd:', error);
        }
    };

    const handleEditComplete = (overlayId: string, newText: string) => {
        onOverlayUpdate?.(overlayId, { text: newText });
        setEditingOverlayId(null);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, overlayId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEditComplete(overlayId, e.currentTarget.value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setEditingOverlayId(null);
        }
    };

    const handleEditBlur = (e: React.FocusEvent<HTMLInputElement>, overlayId: string) => {
        handleEditComplete(overlayId, e.target.value);
    };

    const updateDimensions = useCallback(() => {
        if (previewRef.current) {
            const { naturalWidth, naturalHeight } = previewRef.current;
            const { width: displayWidth, height: displayHeight } = previewRef.current.getBoundingClientRect();

            setGifDimensions({ width: naturalWidth, height: naturalHeight });

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
        setImageError(false);
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

    // Cleanup effect to clear any pending timeouts
    useEffect(() => {
        return () => {
            if (longPressTimerRef.current) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
            }
        };
    }, []);

    const handleContainerClick = (e: React.MouseEvent) => {
        // Only deselect if clicking on the container itself, not on text overlays
        if (e.target === e.currentTarget) {
            onOverlaySelect?.(null);
            setEditingOverlayId(null);
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
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
            {imageError ? (
                <div style={{
                    width: '300px',
                    height: '200px',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundColor: '#f9f9f9',
                    color: '#666'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🖼️</div>
                    <div style={{ fontSize: '14px', textAlign: 'center' }}>
                        Failed to load GIF<br />
                        <small>Please try uploading again</small>
                    </div>
                </div>
            ) : (
                <img
                    ref={previewRef}
                    src={gifSrc}
                    alt="GIF Preview"
                    onLoad={handleImageLoad}
                    onError={(e) => {
                        console.error('Failed to load GIF:', gifSrc);
                        console.error('Image error:', e);
                        setImageError(true);
                    }}
                    style={{ 
                        display: 'block', 
                        maxWidth: '100%', 
                        height: 'auto',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '4px',
                        position: 'relative',
                        zIndex: 0 // Ensure image is behind overlay but visible
                    }}
                />
            )}

            {/* Overlay container */}
            {/* Invisible click area for deselection */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'auto',
                    background: 'transparent',
                    zIndex: 1
                }}
                onClick={handleContainerClick}
            />
            
            {/* Text overlays container */}
            <div
                className={`gif-overlay-container ${isDragging ? 'dragging' : ''}`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none', // Don't block clicks, only text elements should be clickable
                    background: 'transparent',
                    zIndex: 2
                }}
            >
                {/* Text Overlays */}
                {overlays.map((overlay) => {
                    const responsiveStyle = getResponsiveStyle(overlay);
                    const isEditing = editingOverlayId === overlay.id;

                    return (
                        <div
                            key={overlay.id}
                            className={`gif-text-overlay ${isEditing ? 'editing' : ''}`}
                            onPointerDown={(e) => handlePointerDown(e, overlay.id)}
                            onClick={(e) => handleOverlayClick(e, overlay.id)}
                            onDoubleClick={(e) => handleOverlayDoubleClick(e, overlay.id)}
                            onTouchStart={(e) => handleTouchStart(e, overlay.id)}
                            onTouchEnd={(e) => handleTouchEnd(e, overlay.id)}
                            style={{
                                position: 'absolute',
                                top: `${overlay.position.y * scaleFactor}px`,
                                left: `${overlay.position.x * scaleFactor}px`,
                                cursor: isDragging && draggedOverlayId === overlay.id ? 'grabbing' : 'move',
                                color: overlay.style.color,
                                fontWeight: overlay.style.fontWeight,
                                opacity: overlay.style.opacity,
                                outline: activeOverlayId === overlay.id ? '2px solid #3b82f6' : 'none',
                                outlineOffset: '2px',
                                // Add subtle visual hint for mobile editing
                                boxShadow: activeOverlayId === overlay.id ? 
                                    '0 0 0 1px rgba(59, 130, 246, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)' : 
                                    'none',
                                minWidth: '20px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'auto', // Only text overlays should capture pointer events
                                zIndex: 3, // Ensure text is above everything
                                padding: '2px 4px',
                                borderRadius: '2px',
                                transition: 'outline 0.2s ease',
                                ...responsiveStyle
                            }}
                        >
                            {isEditing ? (
                                <input
                                    ref={editInputRef}
                                    type="text"
                                    defaultValue={overlay.text}
                                    onKeyDown={(e) => handleEditKeyDown(e, overlay.id)}
                                    onBlur={(e) => handleEditBlur(e, overlay.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'inherit',
                                        fontSize: 'inherit',
                                        fontWeight: 'inherit',
                                        fontFamily: 'inherit',
                                        textShadow: 'inherit',
                                        padding: 0,
                                        margin: 0,
                                        width: `${Math.max(100, (overlay.text?.length || 10) * (responsiveStyle.fontSize ? parseInt(responsiveStyle.fontSize) * 0.6 : 14))}px`,
                                        cursor: 'text'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span>
                                    {overlay.text || 'Empty Text'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>


        </div>
    );
}