"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Share2, 
  RotateCcw, 
  Play, 
  Pause, 
  X,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { TextOverlayEditor } from '@/components/text/TextOverlayEditor';
import { DraggableText } from '@/components/text/DraggableText';
import { useTextOverlay } from '@/hooks/useTextOverlay';
import { getGifProcessingService } from '@/lib/services/gifProcessingService';
import type { Gif, ProcessedGif, ProcessingProgress } from '@/lib/types/gif';
import type { GifEditorDialogProps } from '@/lib/types/dialog';
import { cn } from '@/lib/utils';
import { DESIGN_TOKENS } from '@/lib/constants/designTokens';

interface GifEditorState {
  processedGif: ProcessedGif | null;
  isProcessing: boolean;
  processingProgress: ProcessingProgress;
  isPlaying: boolean;
  error: string | null;
  showSuccessAnimation: boolean;
}

export function GifEditorDialog({ 
  gif, 
  isOpen, 
  onClose, 
  onGifGenerated 
}: GifEditorDialogProps) {
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [state, setState] = useState<GifEditorState>({
    processedGif: null,
    isProcessing: false,
    processingProgress: { progress: 0, stage: 'loading' },
    isPlaying: true,
    error: null,
    showSuccessAnimation: false,
  });

  // Text overlay management
  const {
    overlays,
    activeOverlayId,
    addOverlay,
    removeOverlay,
    updateOverlay,
    setActiveOverlay,
    startDragging,
    stopDragging,
    duplicateOverlay,
    moveOverlayUp,
    moveOverlayDown,
    clearAllOverlays,
  } = useTextOverlay();

  // Reset state when dialog opens/closes or gif changes
  useEffect(() => {
    if (isOpen && gif) {
      setState({
        processedGif: null,
        isProcessing: false,
        processingProgress: { progress: 0, stage: 'loading' },
        isPlaying: true,
        error: null,
        showSuccessAnimation: false,
      });
      clearAllOverlays();
    }
  }, [isOpen, gif, clearAllOverlays]);

  // Handle GIF processing
  const handleProcessGif = useCallback(async () => {
    if (!gif || overlays.length === 0) {
      toast({
        title: "Cannot Process GIF",
        description: "Please add at least one text overlay.",
        variant: "destructive",
      });
      return;
    }

    const validOverlays = overlays.filter(overlay => overlay.text.trim().length > 0);
    if (validOverlays.length === 0) {
      toast({
        title: "No Text to Add",
        description: "Please add some text to your overlays before processing.",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      error: null,
      processingProgress: { progress: 0, stage: 'loading' }
    }));

    try {
      const processingService = getGifProcessingService();
      
      // Subscribe to progress updates
      const unsubscribe = processingService.onProgressUpdate((progress) => {
        setState(prev => ({ ...prev, processingProgress: progress }));
      });

      // Process the GIF
      const processedGif = await processingService.processGif(gif, validOverlays);
      
      // Cleanup subscription
      unsubscribe();

      setState(prev => ({ 
        ...prev, 
        processedGif,
        isProcessing: false,
        showSuccessAnimation: true,
        processingProgress: { progress: 1, stage: 'complete' }
      }));

      // Show success animation briefly
      setTimeout(() => {
        setState(prev => ({ ...prev, showSuccessAnimation: false }));
      }, 3000);

      // Notify parent component
      onGifGenerated(processedGif);

      toast({
        title: "GIF Generated Successfully!",
        description: "Your GIF with text overlays is ready to download.",
      });

    } catch (error) {
      console.error('Processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: errorMessage,
        processingProgress: { progress: 0, stage: 'loading' }
      }));

      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [gif, overlays, onGifGenerated, toast]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!state.processedGif) return;

    try {
      const link = document.createElement('a');
      link.href = state.processedGif.processedUrl;
      link.download = `${state.processedGif.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_with_text.gif`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your GIF is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading your GIF.",
        variant: "destructive",
      });
    }
  }, [state.processedGif, toast]);

  // Handle reset
  const handleReset = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      processedGif: null, 
      error: null,
      showSuccessAnimation: false,
      processingProgress: { progress: 0, stage: 'loading' }
    }));
    clearAllOverlays();
    
    toast({
      title: "Reset Complete",
      description: "All text overlays have been cleared.",
    });
  }, [clearAllOverlays, toast]);

  // Handle text overlay position updates
  const handleOverlayPositionChange = useCallback((id: string, position: { x: number; y: number }) => {
    updateOverlay(id, { position });
  }, [updateOverlay]);

  // Handle adding new overlay
  const handleAddOverlay = useCallback(() => {
    addOverlay();
  }, [addOverlay]);

  // Get preview dimensions
  const getPreviewDimensions = useCallback(() => {
    if (!previewRef.current || !gif) {
      return { width: 400, height: 300 };
    }
    
    const rect = previewRef.current.getBoundingClientRect();
    const aspectRatio = gif.width / gif.height;
    
    let width = rect.width;
    let height = width / aspectRatio;
    
    if (height > rect.height) {
      height = rect.height;
      width = height * aspectRatio;
    }
    
    return { width, height };
  }, [gif]);

  const previewDimensions = getPreviewDimensions();

  if (!gif) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "max-w-7xl w-[95vw] h-[95vh] max-h-[95vh] p-0 gap-0",
          "bg-background border shadow-lg",
          // Mobile: full screen
          "sm:w-[95vw] sm:h-[95vh]",
          // Desktop: modal
          "lg:w-[90vw] lg:h-[90vh] lg:max-w-7xl"
        )}
      >
        {/* Header */}
        <DialogHeader className="bg-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">
                GIF Editor
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                Add text overlays to your GIF
              </DialogDescription>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
            {/* Left Panel - GIF Preview */}
            <div className="space-y-4 flex flex-col">
              {/* GIF Preview */}
              <div className="flex-1 bg-card border rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Preview
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                      className="h-8 w-8 p-0"
                    >
                      {state.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="h-8 w-8 p-0"
                      disabled={state.isProcessing}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* GIF Display with Text Overlays */}
                <div 
                  ref={previewRef}
                  className="relative aspect-video bg-muted rounded-lg overflow-hidden group"
                  onClick={() => setActiveOverlay(null)}
                >
                  {/* GIF Image */}
                  <img
                    src={state.isPlaying ? gif.url : gif.preview}
                    alt={gif.title}
                    className="w-full h-full object-contain"
                  />

                  {/* Text Overlays */}
                  {overlays.map((overlay) => (
                    <DraggableText
                      key={overlay.id}
                      overlay={overlay}
                      containerWidth={previewDimensions.width}
                      containerHeight={previewDimensions.height}
                      isActive={activeOverlayId === overlay.id}
                      onPositionChange={(position) => handleOverlayPositionChange(overlay.id, position)}
                      onSelect={() => setActiveOverlay(overlay.id)}
                      onDragStart={() => startDragging(overlay.id)}
                      onDragEnd={() => stopDragging(overlay.id)}
                    />
                  ))}

                  {/* Processing Overlay */}
                  {state.isProcessing && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                      <div className="text-center text-foreground">
                        <div className="w-16 h-16 mx-auto mb-4 relative">
                          <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        </div>
                        <p className="text-lg font-medium mb-2">Processing GIF...</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {state.processingProgress.stage === 'loading' && 'Loading FFmpeg...'}
                          {state.processingProgress.stage === 'processing' && 'Adding text overlays...'}
                          {state.processingProgress.stage === 'encoding' && 'Encoding final GIF...'}
                          {state.processingProgress.stage === 'complete' && 'Complete!'}
                        </p>
                        <Progress 
                          value={state.processingProgress.progress * 100} 
                          className="w-48 mx-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Success Animation */}
                  {state.showSuccessAnimation && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center rounded-lg animate-pulse">
                      <div className="text-center text-foreground">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
                        <p className="text-lg font-medium">Success!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* GIF Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <div className="flex items-center gap-4">
                    <span>{gif.width} × {gif.height}</span>
                    {gif.duration && (
                      <span>{(gif.duration / 1000).toFixed(1)}s</span>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {gif.source.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{overlays.length} text overlay{overlays.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-card border rounded-lg shadow-sm p-4">
                <div className="space-y-3">
                  {/* Generate Button */}
                  <Button
                    onClick={handleProcessGif}
                    disabled={state.isProcessing || overlays.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {state.isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Generate GIF
                      </>
                    )}
                  </Button>

                  {/* Download and Share Buttons */}
                  {state.processedGif && (
                    <>
                      <Separator />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            // This will be handled by the parent component
                            // which can open the sharing dialog
                            onGifGenerated(state.processedGif);
                          }}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Error Alert */}
              {state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Processing Error</AlertTitle>
                  <AlertDescription>
                    {state.error}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProcessGif}
                      className="mt-2 ml-0"
                    >
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Right Panel - Text Overlay Editor */}
            <div className="flex flex-col">
              <TextOverlayEditor
                overlays={overlays}
                activeOverlayId={activeOverlayId}
                onOverlayAdd={handleAddOverlay}
                onOverlayRemove={removeOverlay}
                onOverlayDuplicate={duplicateOverlay}
                onOverlayUpdate={updateOverlay}
                onActiveOverlayChange={setActiveOverlay}
                onOverlayMoveUp={moveOverlayUp}
                onOverlayMoveDown={moveOverlayDown}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}