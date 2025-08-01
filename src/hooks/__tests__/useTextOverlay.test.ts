import { renderHook, act } from '@testing-library/react';
import { useTextOverlay } from '../useTextOverlay';
import type { TextOverlay } from '@/lib/types/textOverlay';

// Mock the text overlay utils
jest.mock('@/lib/utils/textOverlayUtils', () => ({
  createTextOverlay: jest.fn((text = 'Test', position = { x: 50, y: 50 }) => ({
    id: 'test-id',
    text,
    position,
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      opacity: 1,
      fontWeight: 'normal' as const,
      textAlign: 'center' as const,
    },
    isDragging: false,
  })),
  updateTextOverlayPosition: jest.fn((overlay, position) => ({
    ...overlay,
    position,
  })),
  getSnapPositions: jest.fn(() => []),
  findNearestSnapPosition: jest.fn(() => null),
}));

describe('useTextOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty overlays by default', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    expect(result.current.overlays).toEqual([]);
    expect(result.current.activeOverlayId).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('adds a new overlay successfully', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    act(() => {
      const id = result.current.addOverlay('Test Text');
      expect(id).toBe('test-id');
    });
    
    expect(result.current.overlays).toHaveLength(1);
    expect(result.current.activeOverlayId).toBe('test-id');
    expect(result.current.error).toBeNull();
  });

  it('handles maximum overlay limit', () => {
    const { result } = renderHook(() => useTextOverlay([], { maxOverlays: 1 }));
    
    // Add first overlay
    act(() => {
      result.current.addOverlay('First');
    });
    
    // Try to add second overlay (should fail)
    act(() => {
      const id = result.current.addOverlay('Second');
      expect(id).toBe('');
    });
    
    expect(result.current.overlays).toHaveLength(1);
    expect(result.current.error).toContain('Maximum number of overlays');
  });

  it('removes overlay successfully', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    // Add overlay first
    act(() => {
      result.current.addOverlay('Test');
    });
    
    // Remove overlay
    act(() => {
      result.current.removeOverlay('test-id');
    });
    
    expect(result.current.overlays).toHaveLength(0);
    expect(result.current.activeOverlayId).toBeNull();
  });

  it('updates overlay text', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    // Add overlay first
    act(() => {
      result.current.addOverlay('Original');
    });
    
    // Update text
    act(() => {
      result.current.updateOverlayText('test-id', 'Updated');
    });
    
    expect(result.current.overlays[0].text).toBe('Updated');
  });

  it('validates text input', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    // Add overlay first
    act(() => {
      result.current.addOverlay('Test');
    });
    
    // Try to update with invalid text
    act(() => {
      result.current.updateOverlayText('test-id', 123 as any);
    });
    
    expect(result.current.error).toBe('Text must be a string');
  });

  it('clears error state', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    // Trigger an error
    act(() => {
      result.current.updateOverlayText('non-existent', 123 as any);
    });
    
    expect(result.current.error).toBeTruthy();
    
    // Clear error
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('exports and imports overlays', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    // Add overlay
    act(() => {
      result.current.addOverlay('Test');
    });
    
    // Export
    let exportedData: string = '';
    act(() => {
      exportedData = result.current.exportOverlays();
    });
    
    expect(exportedData).toContain('Test');
    
    // Clear overlays
    act(() => {
      result.current.clearAllOverlays();
    });
    
    expect(result.current.overlays).toHaveLength(0);
    
    // Import
    act(() => {
      const success = result.current.importOverlays(exportedData);
      expect(success).toBe(true);
    });
    
    expect(result.current.overlays).toHaveLength(1);
  });

  it('handles invalid import data', () => {
    const { result } = renderHook(() => useTextOverlay());
    
    act(() => {
      const success = result.current.importOverlays('invalid json');
      expect(success).toBe(false);
    });
    
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('JSON');
  });
});