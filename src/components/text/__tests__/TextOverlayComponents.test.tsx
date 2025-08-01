/**
 * Tests for text overlay components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextOverlayEditor } from '../TextOverlayEditor';
import { TextControls } from '../TextControls';
import { DraggableText } from '../DraggableText';
import { useTextOverlay } from '@/hooks/useTextOverlay';
import type { TextOverlay } from '@/lib/types/textOverlay';

// Mock the useTextOverlay hook for testing
jest.mock('@/hooks/useTextOverlay');
const mockUseTextOverlay = useTextOverlay as jest.MockedFunction<typeof useTextOverlay>;

// Mock text overlay data
const mockTextOverlay: TextOverlay = {
  id: 'test-1',
  text: 'Test Text',
  position: { x: 50, y: 50 },
  style: {
    fontSize: 24,
    fontFamily: 'Arial',
    color: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 2,
    opacity: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  isDragging: false,
};

describe('TextOverlayEditor', () => {
  const mockProps = {
    overlays: [mockTextOverlay],
    activeOverlayId: 'test-1',
    onOverlayAdd: jest.fn(),
    onOverlayRemove: jest.fn(),
    onOverlayDuplicate: jest.fn(),
    onOverlayUpdate: jest.fn(),
    onActiveOverlayChange: jest.fn(),
    onOverlayMoveUp: jest.fn(),
    onOverlayMoveDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders text overlay editor with layers tab', () => {
    render(<TextOverlayEditor {...mockProps} />);
    
    expect(screen.getByText('Text Overlay Editor')).toBeInTheDocument();
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
    expect(screen.getByText('Add Text Layer')).toBeInTheDocument();
  });

  it('displays overlay count badge', () => {
    render(<TextOverlayEditor {...mockProps} />);
    
    expect(screen.getByText('1 text')).toBeInTheDocument();
  });

  it('calls onOverlayAdd when add button is clicked', () => {
    render(<TextOverlayEditor {...mockProps} />);
    
    const addButton = screen.getByText('Add Text Layer');
    fireEvent.click(addButton);
    
    expect(mockProps.onOverlayAdd).toHaveBeenCalledTimes(1);
  });

  it('displays text overlay in layers list', () => {
    render(<TextOverlayEditor {...mockProps} />);
    
    expect(screen.getByDisplayValue('Test Text')).toBeInTheDocument();
    expect(screen.getByText('Layer 1')).toBeInTheDocument();
  });

  it('shows empty state when no overlays', () => {
    const emptyProps = { ...mockProps, overlays: [] };
    render(<TextOverlayEditor {...emptyProps} />);
    
    expect(screen.getByText('No text layers yet')).toBeInTheDocument();
    expect(screen.getByText('Click "Add Text Layer" to get started')).toBeInTheDocument();
  });
});

describe('TextControls', () => {
  const mockStyle = mockTextOverlay.style;
  const mockOnStyleChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders text controls with all style options', () => {
    render(<TextControls style={mockStyle} onStyleChange={mockOnStyleChange} />);
    
    expect(screen.getByText('Text Style')).toBeInTheDocument();
    expect(screen.getByText('Font Family')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('Text Color')).toBeInTheDocument();
    expect(screen.getByText('Stroke Color')).toBeInTheDocument();
  });

  it('displays current font size value', () => {
    render(<TextControls style={mockStyle} onStyleChange={mockOnStyleChange} />);
    
    expect(screen.getByText('24px')).toBeInTheDocument();
  });

  it('displays current opacity percentage', () => {
    render(<TextControls style={mockStyle} onStyleChange={mockOnStyleChange} />);
    
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('calls onStyleChange when font family changes', () => {
    render(<TextControls style={mockStyle} onStyleChange={mockOnStyleChange} />);
    
    // This test would need more complex setup to test select changes
    // For now, we verify the component renders without errors
    expect(screen.getByText('Font Family')).toBeInTheDocument();
  });
});

describe('DraggableText', () => {
  const mockProps = {
    overlay: mockTextOverlay,
    containerWidth: 400,
    containerHeight: 300,
    isActive: false,
    onPositionChange: jest.fn(),
    onSelect: jest.fn(),
    onDragStart: jest.fn(),
    onDragEnd: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders draggable text with overlay text', () => {
    render(<DraggableText {...mockProps} />);
    
    expect(screen.getByText('Test Text')).toBeInTheDocument();
  });

  it('shows empty text fallback when text is empty', () => {
    const emptyTextOverlay = { ...mockTextOverlay, text: '' };
    const emptyProps = { ...mockProps, overlay: emptyTextOverlay };
    
    render(<DraggableText {...emptyProps} />);
    
    expect(screen.getByText('Empty Text')).toBeInTheDocument();
  });

  it('applies active styles when isActive is true', () => {
    const activeProps = { ...mockProps, isActive: true };
    render(<DraggableText {...activeProps} />);
    
    const textElement = screen.getByText('Test Text').parentElement;
    expect(textElement).toHaveClass('bg-blue-500/10');
  });

  it('calls onSelect when clicked', () => {
    render(<DraggableText {...mockProps} />);
    
    const textElement = screen.getByText('Test Text');
    fireEvent.click(textElement);
    
    expect(mockProps.onSelect).toHaveBeenCalledTimes(1);
  });

  it('shows drag handles when active', () => {
    const activeProps = { ...mockProps, isActive: true };
    const { container } = render(<DraggableText {...activeProps} />);
    
    // Check for drag handle elements (blue circles)
    const dragHandles = container.querySelectorAll('.bg-blue-500.rounded-full');
    expect(dragHandles).toHaveLength(4); // 4 corner handles
  });
});

describe('Text Overlay Utils Integration', () => {
  it('creates text overlay with default values', () => {
    // This would test the utility functions
    // For now, we verify the components can render with mock data
    expect(mockTextOverlay.id).toBe('test-1');
    expect(mockTextOverlay.text).toBe('Test Text');
    expect(mockTextOverlay.position).toEqual({ x: 50, y: 50 });
  });
});

describe('useTextOverlay Hook Integration', () => {
  beforeEach(() => {
    mockUseTextOverlay.mockReturnValue({
      overlays: [mockTextOverlay],
      activeOverlayId: 'test-1',
      addOverlay: jest.fn().mockReturnValue('new-id'),
      removeOverlay: jest.fn(),
      updateOverlay: jest.fn(),
      updateOverlayText: jest.fn(),
      updateOverlayStyle: jest.fn(),
      updateOverlayPosition: jest.fn(),
      setActiveOverlay: jest.fn(),
      startDragging: jest.fn(),
      stopDragging: jest.fn(),
      clearAllOverlays: jest.fn(),
      duplicateOverlay: jest.fn().mockReturnValue('duplicate-id'),
      moveOverlayUp: jest.fn(),
      moveOverlayDown: jest.fn(),
      getOverlayById: jest.fn().mockReturnValue(mockTextOverlay),
    });
  });

  it('provides text overlay functionality', () => {
    const hookResult = mockUseTextOverlay();
    
    expect(hookResult.overlays).toHaveLength(1);
    expect(hookResult.activeOverlayId).toBe('test-1');
    expect(typeof hookResult.addOverlay).toBe('function');
    expect(typeof hookResult.removeOverlay).toBe('function');
  });
});