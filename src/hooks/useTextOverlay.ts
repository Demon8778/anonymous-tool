/**
 * Custom hook for managing text overlay state and operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { TextOverlay, Position, TextStyle } from '@/lib/types/textOverlay';
import { 
  createTextOverlay, 
  updateTextOverlayPosition,
  getSnapPositions,
  findNearestSnapPosition 
} from '@/lib/utils/textOverlayUtils';

interface UseTextOverlayOptions {
  maxOverlays?: number;
  enableSnapping?: boolean;
  snapThreshold?: number;
}

interface UseTextOverlayReturn {
  overlays: TextOverlay[];
  activeOverlayId: string | null;
  error: string | null;
  isLoading: boolean;
  addOverlay: (text?: string, position?: Position) => string;
  removeOverlay: (id: string) => void;
  updateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  updateOverlayText: (id: string, text: string) => void;
  updateOverlayStyle: (id: string, style: Partial<TextStyle>) => void;
  updateOverlayPosition: (id: string, position: Position) => void;
  setActiveOverlay: (id: string | null) => void;
  startDragging: (id: string) => void;
  stopDragging: (id: string) => void;
  clearAllOverlays: () => void;
  duplicateOverlay: (id: string) => string | null;
  moveOverlayUp: (id: string) => void;
  moveOverlayDown: (id: string) => void;
  getOverlayById: (id: string) => TextOverlay | undefined;
  clearError: () => void;
  validateOverlay: (overlay: Partial<TextOverlay>) => boolean;
  exportOverlays: () => string;
  importOverlays: (data: string) => boolean;
}

export function useTextOverlay(
  initialOverlays: TextOverlay[] = [],
  options: UseTextOverlayOptions = {}
): UseTextOverlayReturn {
  const {
    maxOverlays = 10,
    enableSnapping = true,
    snapThreshold = 10,
  } = options;

  const [overlays, setOverlays] = useState<TextOverlay[]>(initialOverlays);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<{ width: number; height: number }>({ width: 400, height: 300 });
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validate overlay data
  const validateOverlay = useCallback((overlay: Partial<TextOverlay>): boolean => {
    try {
      if (overlay.text && typeof overlay.text !== 'string') return false;
      if (overlay.position) {
        if (typeof overlay.position.x !== 'number' || typeof overlay.position.y !== 'number') return false;
        if (overlay.position.x < 0 || overlay.position.x > 100) return false;
        if (overlay.position.y < 0 || overlay.position.y > 100) return false;
      }
      if (overlay.style) {
        if (overlay.style.fontSize && (typeof overlay.style.fontSize !== 'number' || overlay.style.fontSize <= 0)) return false;
        if (overlay.style.opacity && (typeof overlay.style.opacity !== 'number' || overlay.style.opacity < 0 || overlay.style.opacity > 1)) return false;
      }
      return true;
    } catch (err) {
      console.error('Overlay validation error:', err);
      return false;
    }
  }, []);

  // Add a new text overlay
  const addOverlay = useCallback((text?: string, position?: Position): string => {
    try {
      if (overlays.length >= maxOverlays) {
        setError(`Maximum number of overlays (${maxOverlays}) reached`);
        return '';
      }

      setError(null);
      const newOverlay = createTextOverlay(text, position);
      
      if (!validateOverlay(newOverlay)) {
        setError('Invalid overlay data');
        return '';
      }

      setOverlays(prev => [...prev, newOverlay]);
      setActiveOverlayId(newOverlay.id);
      return newOverlay.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add overlay';
      setError(errorMessage);
      console.error('Error adding overlay:', err);
      return '';
    }
  }, [overlays.length, maxOverlays, validateOverlay]);

  // Remove a text overlay
  const removeOverlay = useCallback((id: string) => {
    try {
      setError(null);
      setOverlays(prev => {
        const filtered = prev.filter(overlay => overlay.id !== id);
        if (filtered.length === prev.length) {
          setError(`Overlay with ID ${id} not found`);
        }
        return filtered;
      });
      setActiveOverlayId(prev => prev === id ? null : prev);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove overlay';
      setError(errorMessage);
      console.error('Error removing overlay:', err);
    }
  }, []);

  // Update a text overlay with partial updates
  const updateOverlay = useCallback((id: string, updates: Partial<TextOverlay>) => {
    try {
      if (!validateOverlay(updates)) {
        setError('Invalid overlay update data');
        return;
      }

      setError(null);
      setOverlays(prev => {
        const updated = prev.map(overlay => 
          overlay.id === id ? { ...overlay, ...updates } : overlay
        );
        
        // Check if overlay was found and updated
        const overlayExists = prev.some(overlay => overlay.id === id);
        if (!overlayExists) {
          setError(`Overlay with ID ${id} not found`);
        }
        
        return updated;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update overlay';
      setError(errorMessage);
      console.error('Error updating overlay:', err);
    }
  }, [validateOverlay]);

  // Update overlay text
  const updateOverlayText = useCallback((id: string, text: string) => {
    if (typeof text !== 'string') {
      setError('Text must be a string');
      return;
    }
    updateOverlay(id, { text });
  }, [updateOverlay]);

  // Update overlay style
  const updateOverlayStyle = useCallback((id: string, style: Partial<TextStyle>) => {
    try {
      // Create a temporary overlay with the style to validate
      const tempOverlay: TextOverlay = {
        id: 'temp',
        text: 'temp',
        position: { x: 0, y: 0 },
        isDragging: false,
        style: {
          fontSize: 16,
          color: '#ffffff',
          fontFamily: 'Arial',
          fontWeight: 'normal' as const,
          textAlign: 'center' as const,
          strokeColor: '#000000',
          strokeWidth: 0,
          opacity: 1,
          ...style
        }
      };
      
      if (!validateOverlay(tempOverlay)) {
        setError('Invalid style data');
        return;
      }

      setError(null);
      setOverlays(prev => prev.map(overlay => 
        overlay.id === id 
          ? { ...overlay, style: { ...overlay.style, ...style } }
          : overlay
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update overlay style';
      setError(errorMessage);
      console.error('Error updating overlay style:', err);
    }
  }, [validateOverlay]);

  // Update overlay position with optional snapping
  const updateOverlayPosition = useCallback((id: string, position: Position) => {
    try {
      if (!validateOverlay({ position })) {
        setError('Invalid position data');
        return;
      }

      setError(null);
      setOverlays(prev => prev.map(overlay => {
        if (overlay.id !== id) return overlay;

        let finalPosition = position;

        // Apply snapping if enabled
        if (enableSnapping) {
          try {
            const snapPositions = getSnapPositions(
              containerRef.current.width, 
              containerRef.current.height
            );
            const snapPosition = findNearestSnapPosition(position, snapPositions, snapThreshold);
            if (snapPosition) {
              finalPosition = snapPosition;
            }
          } catch (snapError) {
            console.warn('Snapping failed, using original position:', snapError);
          }
        }

        return updateTextOverlayPosition(
          overlay,
          finalPosition,
          containerRef.current.width,
          containerRef.current.height
        );
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update overlay position';
      setError(errorMessage);
      console.error('Error updating overlay position:', err);
    }
  }, [enableSnapping, snapThreshold, validateOverlay]);

  // Set active overlay
  const setActiveOverlay = useCallback((id: string | null) => {
    try {
      if (id && !overlays.some(overlay => overlay.id === id)) {
        setError(`Overlay with ID ${id} not found`);
        return;
      }
      setError(null);
      setActiveOverlayId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set active overlay';
      setError(errorMessage);
      console.error('Error setting active overlay:', err);
    }
  }, [overlays]);

  // Start dragging an overlay
  const startDragging = useCallback((id: string) => {
    updateOverlay(id, { isDragging: true });
    setActiveOverlayId(id);
  }, [updateOverlay]);

  // Stop dragging an overlay
  const stopDragging = useCallback((id: string) => {
    updateOverlay(id, { isDragging: false });
  }, [updateOverlay]);

  // Clear all overlays
  const clearAllOverlays = useCallback(() => {
    try {
      setError(null);
      setOverlays([]);
      setActiveOverlayId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear overlays';
      setError(errorMessage);
      console.error('Error clearing overlays:', err);
    }
  }, []);

  // Duplicate an overlay
  const duplicateOverlay = useCallback((id: string): string | null => {
    try {
      if (overlays.length >= maxOverlays) {
        setError(`Maximum number of overlays (${maxOverlays}) reached`);
        return null;
      }

      const overlay = overlays.find(o => o.id === id);
      if (!overlay) {
        setError(`Overlay with ID ${id} not found`);
        return null;
      }

      setError(null);
      const duplicatedOverlay = createTextOverlay(
        overlay.text,
        { x: Math.min(overlay.position.x + 5, 95), y: Math.min(overlay.position.y + 5, 95) }
      );
      duplicatedOverlay.style = { ...overlay.style };

      setOverlays(prev => [...prev, duplicatedOverlay]);
      setActiveOverlayId(duplicatedOverlay.id);
      return duplicatedOverlay.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate overlay';
      setError(errorMessage);
      console.error('Error duplicating overlay:', err);
      return null;
    }
  }, [overlays, maxOverlays]);

  // Move overlay up in z-index (later in array)
  const moveOverlayUp = useCallback((id: string) => {
    try {
      setError(null);
      setOverlays(prev => {
        const index = prev.findIndex(overlay => overlay.id === id);
        if (index === -1) {
          setError(`Overlay with ID ${id} not found`);
          return prev;
        }
        if (index === prev.length - 1) {
          setError('Overlay is already at the top');
          return prev;
        }

        const newOverlays = [...prev];
        [newOverlays[index], newOverlays[index + 1]] = [newOverlays[index + 1], newOverlays[index]];
        return newOverlays;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move overlay up';
      setError(errorMessage);
      console.error('Error moving overlay up:', err);
    }
  }, []);

  // Move overlay down in z-index (earlier in array)
  const moveOverlayDown = useCallback((id: string) => {
    try {
      setError(null);
      setOverlays(prev => {
        const index = prev.findIndex(overlay => overlay.id === id);
        if (index === -1) {
          setError(`Overlay with ID ${id} not found`);
          return prev;
        }
        if (index === 0) {
          setError('Overlay is already at the bottom');
          return prev;
        }

        const newOverlays = [...prev];
        [newOverlays[index], newOverlays[index - 1]] = [newOverlays[index - 1], newOverlays[index]];
        return newOverlays;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move overlay down';
      setError(errorMessage);
      console.error('Error moving overlay down:', err);
    }
  }, []);

  // Get overlay by ID
  const getOverlayById = useCallback((id: string): TextOverlay | undefined => {
    try {
      return overlays.find(overlay => overlay.id === id);
    } catch (err) {
      console.error('Error getting overlay by ID:', err);
      return undefined;
    }
  }, [overlays]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Export overlays as JSON string
  const exportOverlays = useCallback((): string => {
    try {
      return JSON.stringify(overlays, null, 2);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export overlays';
      setError(errorMessage);
      console.error('Error exporting overlays:', err);
      return '[]';
    }
  }, [overlays]);

  // Import overlays from JSON string
  const importOverlays = useCallback((data: string): boolean => {
    try {
      setIsLoading(true);
      setError(null);
      
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) {
        setError('Invalid data format: expected array');
        return false;
      }

      // Validate each overlay
      for (const overlay of parsed) {
        if (!validateOverlay(overlay)) {
          setError('Invalid overlay data in import');
          return false;
        }
      }

      setOverlays(parsed);
      setActiveOverlayId(null);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import overlays';
      setError(errorMessage);
      console.error('Error importing overlays:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [validateOverlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      cleanupTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, [error]);

  return {
    overlays,
    activeOverlayId,
    error,
    isLoading,
    addOverlay,
    removeOverlay,
    updateOverlay,
    updateOverlayText,
    updateOverlayStyle,
    updateOverlayPosition,
    setActiveOverlay,
    startDragging,
    stopDragging,
    clearAllOverlays,
    duplicateOverlay,
    moveOverlayUp,
    moveOverlayDown,
    getOverlayById,
    clearError,
    validateOverlay,
    exportOverlays,
    importOverlays,
  };
}