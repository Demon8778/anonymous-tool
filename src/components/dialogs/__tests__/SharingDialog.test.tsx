import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SharingDialog } from '../SharingDialog';
import { useSharing } from '@/hooks/useSharing';
import { useToast } from '@/hooks/use-toast';
import type { ProcessedGif } from '@/lib/types/gif';

// Mock the hooks
jest.mock('@/hooks/useSharing');
jest.mock('@/hooks/use-toast');

const mockUseSharing = useSharing as jest.MockedFunction<typeof useSharing>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockToast = jest.fn();

const mockProcessedGif: ProcessedGif = {
    id: 'test-gif-1',
    title: 'Test GIF',
    originalUrl: 'https://example.com/original.gif',
    processedUrl: 'https://example.com/processed.gif',
    preview: 'https://example.com/preview.gif',
    width: 480,
    height: 270,
    duration: 2000,
    frameCount: 20,
    source: 'giphy',
    textOverlays: [
        {
            id: 'overlay-1',
            text: 'Hello World',
            position: { x: 50, y: 50 },
            style: {
                fontSize: 24,
                fontFamily: 'Arial',
                color: '#ffffff',
                background: 'transparent',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'center',
                stroke: { color: '#000000', width: 0 },
                shadow: { color: '#000000', blur: 0, offsetX: 0, offsetY: 0 }
            },
            timing: { start: 0, end: 2000 },
            animation: { type: 'none', duration: 0, delay: 0 }
        }
    ],
    createdAt: new Date(),
    metadata: {
        title: 'Test GIF',
        description: 'A test GIF with text overlay'
    }
};

describe('SharingDialog', () => {
    const mockOnClose = jest.fn();
    const mockOnShareComplete = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseToast.mockReturnValue({
            toast: mockToast,
            dismiss: jest.fn(),
            toasts: []
        });

        mockUseSharing.mockReturnValue({
            isCreatingLink: false,
            shareableLink: null,
            socialUrls: null,
            error: null,
            isLoading: false,
            createShareableLink: jest.fn(),
            copyToClipboard: jest.fn(),
            generateSocialUrls: jest.fn(),
            reset: jest.fn(),
            clearError: jest.fn(),
            retryLastOperation: jest.fn()
        });
    });

    it('renders dialog when open', () => {
        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        expect(screen.getByText('Share Your GIF')).toBeInTheDocument();
        expect(screen.getByText('Create a shareable link or share directly to social media')).toBeInTheDocument();
        expect(screen.getByText('Create Shareable Link')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={false}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        expect(screen.queryByText('Share Your GIF')).not.toBeInTheDocument();
    });

    it('displays GIF preview information', () => {
        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        expect(screen.getByText('Test GIF')).toBeInTheDocument();
        expect(screen.getByText('1 text overlay')).toBeInTheDocument();
        expect(screen.getByText('480 × 270')).toBeInTheDocument();
    });

    it('calls createShareableLink when create link button is clicked', async () => {
        const mockCreateShareableLink = jest.fn();

        mockUseSharing.mockReturnValue({
            isCreatingLink: false,
            shareableLink: null,
            socialUrls: null,
            error: null,
            isLoading: false,
            createShareableLink: mockCreateShareableLink,
            copyToClipboard: jest.fn(),
            generateSocialUrls: jest.fn(),
            reset: jest.fn(),
            clearError: jest.fn(),
            retryLastOperation: jest.fn()
        });

        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        const createButton = screen.getByText('Create Shareable Link');
        fireEvent.click(createButton);

        expect(mockCreateShareableLink).toHaveBeenCalledWith(mockProcessedGif);
    });

    it('shows loading state when creating link', () => {
        mockUseSharing.mockReturnValue({
            isCreatingLink: true,
            shareableLink: null,
            socialUrls: null,
            error: null,
            isLoading: true,
            createShareableLink: jest.fn(),
            copyToClipboard: jest.fn(),
            generateSocialUrls: jest.fn(),
            reset: jest.fn(),
            clearError: jest.fn(),
            retryLastOperation: jest.fn()
        });

        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        expect(screen.getByText('Creating Link...')).toBeInTheDocument();
    });

    it('displays shareable link and social buttons when link is created', () => {
        const mockShareableLink = {
            id: 'share-123',
            url: 'https://example.com/share/123',
            expiresAt: new Date('2024-12-31').toISOString(),
            viewCount: 0
        };

        const mockSocialUrls = {
            twitter: 'https://twitter.com/intent/tweet?url=...',
            facebook: 'https://facebook.com/sharer/sharer.php?u=...',
            whatsapp: 'https://wa.me/?text=...',
            email: 'mailto:?subject=...&body=...',
            reddit: 'https://reddit.com/submit?url=...'
        };

        mockUseSharing.mockReturnValue({
            isCreatingLink: false,
            shareableLink: mockShareableLink,
            socialUrls: mockSocialUrls,
            error: null,
            isLoading: false,
            createShareableLink: jest.fn(),
            copyToClipboard: jest.fn(),
            generateSocialUrls: jest.fn(),
            reset: jest.fn(),
            clearError: jest.fn(),
            retryLastOperation: jest.fn()
        });

        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        expect(screen.getByDisplayValue('https://example.com/share/123')).toBeInTheDocument();
        expect(screen.getByText('X')).toBeInTheDocument();
        expect(screen.getByText('WhatsApp')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Reddit')).toBeInTheDocument();
    });

    it('displays error message when there is an error', () => {
        mockUseSharing.mockReturnValue({
            isCreatingLink: false,
            shareableLink: null,
            socialUrls: null,
            error: 'Failed to create shareable link',
            isLoading: false,
            createShareableLink: jest.fn(),
            copyToClipboard: jest.fn(),
            generateSocialUrls: jest.fn(),
            reset: jest.fn(),
            clearError: jest.fn(),
            retryLastOperation: jest.fn()
        });

        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        expect(screen.getByText('Failed to create shareable link')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onShareComplete when Done button is clicked', () => {
        const mockShareableLink = {
            id: 'share-123',
            url: 'https://example.com/share/123',
            expiresAt: new Date('2024-12-31').toISOString(),
            viewCount: 0
        };

        const mockSocialUrls = {
            twitter: 'https://twitter.com/intent/tweet?url=...',
            facebook: 'https://facebook.com/sharer/sharer.php?u=...',
            whatsapp: 'https://wa.me/?text=...',
            email: 'mailto:?subject=...&body=...',
            reddit: 'https://reddit.com/submit?url=...'
        };

        mockUseSharing.mockReturnValue({
            isCreatingLink: false,
            shareableLink: mockShareableLink,
            socialUrls: mockSocialUrls,
            error: null,
            isLoading: false,
            createShareableLink: jest.fn(),
            copyToClipboard: jest.fn(),
            generateSocialUrls: jest.fn(),
            reset: jest.fn(),
            clearError: jest.fn(),
            retryLastOperation: jest.fn()
        });

        render(
            <SharingDialog
                gif={mockProcessedGif}
                isOpen={true}
                onClose={mockOnClose}
                onShareComplete={mockOnShareComplete}
            />
        );

        const doneButton = screen.getByText('Done');
        fireEvent.click(doneButton);

        expect(mockOnShareComplete).toHaveBeenCalledWith({
            shareId: 'share-123',
            shareUrl: 'https://example.com/share/123',
            socialUrls: mockSocialUrls
        });
    });
});