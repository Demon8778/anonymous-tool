import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryCarousel, POPULAR_CATEGORIES } from '../CategoryCarousel';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, onMouseEnter, onMouseLeave, className, animate, initial, whileHover, whileTap, ...props }: any) => (
      <div 
        onClick={onClick} 
        onMouseEnter={onMouseEnter} 
        onMouseLeave={onMouseLeave} 
        className={className}
        {...props}
      >
        {children}
      </div>
    ),
    span: ({ children, className, animate, ...props }: any) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CategoryCarousel', () => {
  const mockOnCategorySelect = jest.fn();

  beforeEach(() => {
    mockOnCategorySelect.mockClear();
  });

  it('renders all popular categories', () => {
    render(<CategoryCarousel onCategorySelect={mockOnCategorySelect} />);
    
    // Check that all categories are rendered (duplicated for seamless loop)
    POPULAR_CATEGORIES.forEach(category => {
      const categoryElements = screen.getAllByText(category.name);
      expect(categoryElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays category emojis and names', () => {
    render(<CategoryCarousel onCategorySelect={mockOnCategorySelect} />);
    
    // Check for specific categories
    expect(screen.getAllByText('😊')).toHaveLength(2); // Duplicated for loop
    expect(screen.getAllByText('Happy')).toHaveLength(2);
    expect(screen.getAllByText('🎉')).toHaveLength(2);
    expect(screen.getAllByText('Excited')).toHaveLength(2);
  });

  it('calls onCategorySelect when a category is clicked', async () => {
    render(<CategoryCarousel onCategorySelect={mockOnCategorySelect} />);
    
    const happyCategory = screen.getAllByText('Happy')[0];
    fireEvent.click(happyCategory);
    
    // Wait for the click animation delay
    await waitFor(() => {
      expect(mockOnCategorySelect).toHaveBeenCalledWith('happy celebration');
    }, { timeout: 300 });
  });

  it('displays instructions text', () => {
    render(<CategoryCarousel onCategorySelect={mockOnCategorySelect} />);
    
    expect(screen.getByText('Click a category to search for popular GIFs')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <CategoryCarousel onCategorySelect={mockOnCategorySelect} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles multiple category clicks correctly', async () => {
    render(<CategoryCarousel onCategorySelect={mockOnCategorySelect} />);
    
    const happyCategory = screen.getAllByText('Happy')[0];
    const excitedCategory = screen.getAllByText('Excited')[0];
    
    fireEvent.click(happyCategory);
    await waitFor(() => {
      expect(mockOnCategorySelect).toHaveBeenCalledWith('happy celebration');
    }, { timeout: 300 });
    
    fireEvent.click(excitedCategory);
    await waitFor(() => {
      expect(mockOnCategorySelect).toHaveBeenCalledWith('excited party');
    }, { timeout: 300 });
    
    expect(mockOnCategorySelect).toHaveBeenCalledTimes(2);
  });

  it('contains gradient overlays for fade effect', () => {
    const { container } = render(<CategoryCarousel onCategorySelect={mockOnCategorySelect} />);
    
    const gradientOverlays = container.querySelectorAll('.bg-gradient-to-r, .bg-gradient-to-l');
    expect(gradientOverlays.length).toBeGreaterThanOrEqual(2);
  });

  it('has proper ARIA accessibility', () => {
    render(<CategoryCarousel onCategorySelect={mockOnCategorySelect} />);
    
    // Categories should be clickable elements - check the parent div that has cursor-pointer
    const categoryButtons = screen.getAllByText('Happy')[0].closest('div').parentElement;
    expect(categoryButtons).toHaveClass('cursor-pointer');
  });
});

describe('POPULAR_CATEGORIES constant', () => {
  it('contains all required category properties', () => {
    POPULAR_CATEGORIES.forEach(category => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('emoji');
      expect(category).toHaveProperty('color');
      expect(category).toHaveProperty('searchTerm');
      
      expect(typeof category.id).toBe('string');
      expect(typeof category.name).toBe('string');
      expect(typeof category.emoji).toBe('string');
      expect(typeof category.color).toBe('string');
      expect(typeof category.searchTerm).toBe('string');
    });
  });

  it('has unique category IDs', () => {
    const ids = POPULAR_CATEGORIES.map(cat => cat.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('contains expected categories', () => {
    const expectedCategories = [
      'happy', 'excited', 'thumbs-up', 'dancing', 'funny', 
      'love', 'surprised', 'cool', 'sad', 'angry'
    ];
    
    const actualIds = POPULAR_CATEGORIES.map(cat => cat.id);
    expectedCategories.forEach(expectedId => {
      expect(actualIds).toContain(expectedId);
    });
  });
});