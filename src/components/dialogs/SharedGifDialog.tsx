"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Share2, 
  X,
  Eye,
  Calendar,
  Sparkles,
  Clock,
  Palette,
  Star,
  AlertTriangle,
  Home,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import type { SharedGif } from '@/lib/types/gif';
import type { SharedGifDialogProps } from '@/lib/types/dialog';
import { cn } from '@/lib/utils';
import { DESIGN_TOKENS } from '@/lib/constants/designTokens';
import Link from 'next/link';

interface SharedGifDialogState {
  sharedGif: SharedGif | null;
  loading: boolean;
  error: string | null;
  copiedLink: boolean;
}

export function SharedGifDialog({ 
  shareId, 
  isOpen, 
  onClose 
}: SharedGifDialogProps) {
  const { toast } = useToast();
  
  const [state, setState] = useState<SharedGifDialogState>({
    sharedGif: null,
    loading: false,
    error: null,
    copiedLink: false,
  });

  // Fetch shared GIF data
  const fetchSharedGif = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`/api/share?id=${id}`);
      const result = await response.json();

      if (!result.success) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: result.error || 'Failed to load shared GIF' 
        }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        sharedGif: result.data, 
        loading: false 
      }));

    } catch (error) {
      console.error('Error fetching shared GIF:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load shared GIF' 
      }));
    }
  }, []);

  // Reset state when dialog opens/closes or shareId changes
  useEffect(() => {
    if (isOpen && shareId) {
      setState({
        sharedGif: null,
        loading: false,
        error: null,
        copiedLink: false,
      });
      fetchSharedGif(shareId);
    } else if (!isOpen) {
      setState({
        sharedGif: null,
        loading: false,
        error: null,
        copiedLink: false,
      });
    }
  }, [isOpen, shareId, fetchSharedGif]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!state.sharedGif) return;

    try {
      const link = document.createElement('a');
      link.href = state.sharedGif.gif.processedUrl;
      link.download = `${state.sharedGif.gif.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_shared.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Download started',
        description: 'Your shared GIF is being downloaded...',
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'There was an error downloading the GIF.',
        variant: 'destructive',
      });
    }
  }, [state.sharedGif, toast]);

  // Handle copy current URL
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState(prev => ({ ...prev, copiedLink: true }));
      toast({
        title: 'Link copied!',
        description: 'The share link has been copied to your clipboard.',
      });
      setTimeout(() => {
        setState(prev => ({ ...prev, copiedLink: false }));
      }, 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy link to clipboard.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    setState({
      sharedGif: null,
      loading: false,
      error: null,
      copiedLink: false,
    });
    onClose();
  }, [onClose]);

  // Loading state
  if (state.loading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className={cn(
            "max-w-md w-[95vw] p-0 gap-0",
            "bg-background border shadow-lg",
            // Mobile: full screen
            "sm:w-[95vw] sm:max-w-md",
            // Desktop: modal
            "lg:w-[500px] lg:max-w-[500px]"
          )}
        >
          <div className="p-12 text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-muted border-t-primary mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">Loading shared GIF...</p>
              <p className="text-sm text-muted-foreground">Preparing your amazing creation</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (state.error || !state.sharedGif) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent 
          className={cn(
            "max-w-lg w-[95vw] p-0 gap-0",
            "bg-background border shadow-lg",
            // Mobile: full screen
            "sm:w-[95vw] sm:max-w-lg",
            // Desktop: modal
            "lg:w-[600px] lg:max-w-[600px]"
          )}
        >
          {/* Error Header */}
          <DialogHeader className="bg-destructive text-destructive-foreground p-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  GIF Not Found
                </DialogTitle>
                <DialogDescription className="text-destructive-foreground/80">
                  This shared GIF could not be found
                </DialogDescription>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-destructive-foreground hover:bg-destructive-foreground/20 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Error Content */}
          <div className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Oops! GIF Not Found</h3>
                <p className="text-muted-foreground">
                  This shared GIF seems to have wandered off into the digital void
                </p>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {state.error || 'This shared GIF could not be found or may have expired.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Don't worry! Here are some things you can try:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Check if the link was copied correctly
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  The GIF might have expired
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Create your own amazing GIF instead!
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="group"
              >
                <Home className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Link href="/generate" className="block">
                <Button 
                  className="w-full group"
                  onClick={handleClose}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create New GIF
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Success state - show shared GIF
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          "max-w-4xl w-[95vw] h-[95vh] max-h-[95vh] p-0 gap-0",
          "bg-background border shadow-lg",
          // Mobile: full screen
          "sm:w-[95vw] sm:h-[95vh]",
          // Desktop: modal
          "lg:w-[90vw] lg:h-[90vh] lg:max-w-4xl"
        )}
      >
        {/* Header */}
        <DialogHeader className="bg-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
                  Shared GIF
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-bold truncate">
                {state.sharedGif.metadata.title || state.sharedGif.gif.title}
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                {state.sharedGif.metadata.description || 
                 `A custom GIF with ${state.sharedGif.gif.textOverlays.length} text overlay${state.sharedGif.gif.textOverlays.length !== 1 ? 's' : ''}`}
              </DialogDescription>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-full">
            {/* Left Panel - GIF Display */}
            <div className="lg:col-span-2 space-y-4 flex flex-col">
              {/* GIF Preview */}
              <div className="flex-1 bg-card border rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Shared Creation
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1 border">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {new Date(state.sharedGif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-full px-3 py-1 border">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Shared</span>
                    </div>
                  </div>
                </div>

                {/* GIF Display */}
                <div className="relative group">
                  <div className="bg-muted rounded-lg overflow-hidden shadow-inner relative">
                    <img
                      src={state.sharedGif.gif.processedUrl}
                      alt={state.sharedGif.gif.title}
                      className="w-full h-auto max-h-96 object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* GIF Metadata */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  <div className="bg-muted p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-primary/20 rounded-full">
                        <Eye className="h-3 w-3 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground text-xs">Dimensions</p>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                      {state.sharedGif.gif.width} × {state.sharedGif.gif.height}
                    </p>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-primary/20 rounded-full">
                        <Palette className="h-3 w-3 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground text-xs">Text Overlays</p>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                      {state.sharedGif.gif.textOverlays.length} overlay{state.sharedGif.gif.textOverlays.length !== 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-primary/20 rounded-full">
                        <Clock className="h-3 w-3 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground text-xs">Processing</p>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                      {state.sharedGif.gif.processingTime}ms
                    </p>
                  </div>

                  <div className="bg-muted p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1 bg-primary/20 rounded-full">
                        <Star className="h-3 w-3 text-primary" />
                      </div>
                      <p className="font-semibold text-foreground text-xs">File Size</p>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">
                      {Math.round(state.sharedGif.gif.fileSize / 1024)}KB
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-card border rounded-lg shadow-sm p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    onClick={handleDownload} 
                    className="group"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download GIF
                  </Button>
                  <Button 
                    onClick={handleCopyLink} 
                    variant="outline" 
                    className="group"
                  >
                    {state.copiedLink ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-primary animate-bounce" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Panel - Sidebar */}
            <div className="space-y-6">
              {/* Text Overlays Display */}
              {state.sharedGif.gif.textOverlays.length > 0 && (
                <div className="bg-card border rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Palette className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-card-foreground">Text Overlays</h3>
                  </div>
                  <div className="space-y-3">
                    {state.sharedGif.gif.textOverlays.map((overlay) => (
                      <div key={overlay.id} className="bg-muted p-3 rounded-lg border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground mb-2 text-sm truncate">
                              "{overlay.text}"
                            </p>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <Badge variant="secondary">
                                {Math.round(overlay.position.x)}%, {Math.round(overlay.position.y)}%
                              </Badge>
                              <Badge variant="secondary">
                                {overlay.style.fontSize}px
                              </Badge>
                            </div>
                          </div>
                          <div 
                            className="w-4 h-4 rounded-full border shadow-sm shrink-0"
                            style={{ backgroundColor: overlay.style.color }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Create Your Own Card */}
              <div className="bg-card border rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-card-foreground">Create Your Own</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  Inspired by this creation? Join thousands of creators making amazing GIFs with custom text overlays!
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Search from millions of GIFs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Add custom text overlays</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Share with friends instantly</span>
                  </div>
                </div>

                <Link href="/generate" className="block">
                  <Button 
                    className="w-full group"
                    onClick={handleClose}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Start Creating
                  </Button>
                </Link>
              </div>

              {/* Stats Card */}
              <div className="bg-card border rounded-lg shadow-sm p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-card-foreground">GIF Stats</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-center bg-muted p-3 rounded-lg">
                    <p className="text-lg font-bold text-foreground">
                      {new Date(state.sharedGif.gif.processedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Created On</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-muted p-2 rounded-lg">
                      <p className="text-sm font-bold text-foreground">{state.sharedGif.gif.width}px</p>
                      <p className="text-xs text-muted-foreground">Width</p>
                    </div>
                    <div className="bg-muted p-2 rounded-lg">
                      <p className="text-sm font-bold text-foreground">{state.sharedGif.gif.height}px</p>
                      <p className="text-xs text-muted-foreground">Height</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}