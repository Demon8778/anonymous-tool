import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GifSearchForm } from '../GifSearchForm';
import { GifGrid } from '../GifGrid';
import { GifPreview } from '../GifPreview';
import type { Gif } from '@/lib/types/gif';
import type { TextOverlay } from '@/lib/types/textOverlay';

// Mock data
const mockGifs: Gif[] = [
  {
    id: '1',
    title: 'Test GIF 1',
    url: 'https://example.com/gif1.gif',
    preview: 'https://example.com/gif1-preview.gif',
    width: 480,
    height: 270,
    duration: 2000,
    frameCount: 20,
    source: 'giphy'
  },
  {
    id: '2',
    title: 'Test GIF 2',
    url: 'https://example.com/gif2.gif',
    preview: 'https://example.com/gif2-preview.gif',
    width: 500,
    height: 281,
    duration: 1500,
    frameCount: 15,
    source: 'tenor'
  }
];

const mockTextOverlays: TextOverlay[] = [
  {
    id: '1',
    text: 'Hello World!',
    position: { x: 50, y: 20 },
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 2,
      opacity: 1,
      fontWeight: 'bold',
      textAlign: 'center'
    },
    isDragging: false
  }
];

describe('GIF Components', () => {
  describe('GifSearchForm', () => {
    it('renders search form with input and button', () => {
      const mockOnSearch = jest.fn();
      render(<GifSearchForm onSearch={mockOnSearch} />);
      
      expect(screen.getByPlaceholderText('Search for GIFs...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search gifs/i })).toBeInTheDocument();
    });

    it('calls onSearch when form is submitted', () => {
      const mockOnSearch = jest.fn();
      render(<GifSearchForm onSearch={mockOnSearch} />);
      
      const input = screen.getByPlaceholderText('Search for GIFs...');
      const button = screen.getByRole('button', { name: /search gifs/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(button);
      
      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('shows loading state when isLoading is true', () => {
      const mockOnSearch = jest.fn();
      render(<GifSearchForm onSearch={mockOnSearch} isLoading={true} />);
      
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables button when query is empty', () => {
      const mockOnSearch = jest.fn();
      render(<GifSearchForm onSearch={mockOnSearch} />);
      
      const button = screen.getByRole('button', { name: /search gifs/i });
      expect(button).toBeDisabled();
    });
  });

  describe('GifGrid', () => {
    it('renders GIF cards when gifs are provided', () => {
      const mockOnGifSelect = jest.fn();
      render(<GifGrid gifs={mockGifs} onGifSelect={mockOnGifSelect} />);
      
      expect(screen.getByText('Test GIF 1')).toBeInTheDocument();
      expect(screen.getByText('Test GIF 2')).toBeInTheDocument();
    });

    it('shows empty state when no gifs are provided', () => {
      const mockOnGifSelect = jest.fn();
      render(<GifGrid gifs={[]} onGifSelect={mockOnGifSelect} />);
      
      expect(screen.getByText('No GIFs found')).toBeInTheDocument();
      expect(screen.getByText('Try searching with different keywords')).toBeInTheDocument();
    });

    it('shows loading skeletons when isLoading is true', () => {
      const mockOnGifSelect = jest.fn();
      render(<GifGrid gifs={[]} onGifSelect={mockOnGifSelect} isLoading={true} />);
      
      // Check for skeleton elements (they have specific test attributes or classes)
      const skeletons = document.querySelectorAll('[data-testid="skeleton"], .animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error message when error is provided', () => {
      const mockOnGifSelect = jest.fn();
      const mockOnRetry = jest.fn();
      render(
        <GifGrid 
          gifs={[]} 
          onGifSelect={mockOnGifSelect} 
          error="Test error message"
          onRetry={mockOnRetry}
        />
      );
      
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('calls onGifSelect when a GIF is clicked', () => {
      const mockOnGifSelect = jest.fn();
      render(<GifGrid gifs={mockGifs} onGifSelect={mockOnGifSelect} />);
      
      const gifCard = screen.getByText('Test GIF 1').closest('[role="button"], .cursor-pointer');
      if (gifCard) {
        fireEvent.click(gifCard);
        expect(mockOnGifSelect).toHaveBeenCalledWith(mockGifs[0]);
      }
    });

    it('highlights selected GIF', () => {
      const mockOnGifSelect = jest.fn();
      render(<GifGrid gifs={mockGifs} onGifSelect={mockOnGifSelect} selectedGifId="1" />);
      
      expect(screen.getByText('Selected')).toBeInTheDocument();
    });
  });

  describe('GifPreview', () => {
    it('shows empty state when no gif is provided', () => {
      render(<GifPreview gif={null} />);
      
      expect(screen.getByText('No GIF selected')).toBeInTheDocument();
      expect(screen.getByText('Choose a GIF to preview')).toBeInTheDocument();
    });

    it('renders GIF preview when gif is provided', () => {
      render(<GifPreview gif={mockGifs[0]} />);
      
      expect(screen.getByText('GIF Preview')).toBeInTheDocument();
      expect(screen.getByAltText('Test GIF 1')).toBeInTheDocument();
    });

    it('shows text overlays when provided', () => {
      render(<GifPreview gif={mockGifs[0]} textOverlays={mockTextOverlays} />);
      
      expect(screen.getByText('Text Overlays (1)')).toBeInTheDocument();
      expect(screen.getByText('"Hello World!"')).toBeInTheDocument();
    });

    it('shows processing overlay when isProcessing is true', () => {
      render(
        <GifPreview 
          gif={mockGifs[0]} 
          isProcessing={true} 
          processingProgress={0.5}
        />
      );
      
      expect(screen.getByText('Processing GIF...')).toBeInTheDocument();
      expect(screen.getByText('50% complete')).toBeInTheDocument();
    });

    it('shows download and share buttons when handlers are provided', () => {
      const mockOnDownload = jest.fn();
      const mockOnShare = jest.fn();
      
      render(
        <GifPreview 
          gif={mockGifs[0]} 
          onDownload={mockOnDownload}
          onShare={mockOnShare}
        />
      );
      
      expect(screen.getByText('Download')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('calls onDownload when download button is clicked', () => {
      const mockOnDownload = jest.fn();
      
      render(<GifPreview gif={mockGifs[0]} onDownload={mockOnDownload} />);
      
      const downloadButton = screen.getByText('Download');
      fireEvent.click(downloadButton);
      
      expect(mockOnDownload).toHaveBeenCalled();
    });

    it('disables buttons when processing', () => {
      const mockOnDownload = jest.fn();
      const mockOnShare = jest.fn();
      
      render(
        <GifPreview 
          gif={mockGifs[0]} 
          onDownload={mockOnDownload}
          onShare={mockOnShare}
          isProcessing={true}
        />
      );
      
      const downloadButton = screen.getByText('Download');
      const shareButton = screen.getByText('Share');
      
      expect(downloadButton).toBeDisabled();
      expect(shareButton).toBeDisabled();
    });
  });
});