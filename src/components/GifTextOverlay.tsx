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

    const previewRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    // Unified pointer event handlers for both mouse and touch
    const handlePointerDown = (e: React.PointerEvent, overlayId: string) => {
        e.stopPropagation();
        e.preventDefault();

        const overlay = overlays.find(o => o.id === overlayId);
        if (!overlay || !previewRef.current) return;

        // Capture the pointer to ensure we get all subsequent events
        e.currentTarget.setPointerCapture(e.pointerId);

        setIsDragging(true);
        setDraggedOverlayId(overlayId);

        const overlayRect = e.currentTarget.getBoundingClientRect();

        setDragOffset({
            x: e.clientX - overlayRect.left,
            y: e.clientY - overlayRect.top
        });

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
                className={`gif-container ${isDragging ? 'dragging' : ''}`}
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
                    const isEditing = editingOverlayId === overlay.id;

                    return (
                        <div
                            key={overlay.id}
                            className={`gif-text-overlay ${isEditing ? 'editing' : ''}`}
                            onPointerDown={(e) => handlePointerDown(e, overlay.id)}
                            onClick={(e) => handleOverlayClick(e, overlay.id)}
                            onDoubleClick={(e) => handleOverlayDoubleClick(e, overlay.id)}
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
                                minWidth: '20px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'auto',
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