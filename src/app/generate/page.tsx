"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Download, 
  Share2, 
  RotateCcw, 
  Play, 
  Pause, 
  Settings, 
  Sparkles,
  Zap,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PageHeader, PageHeaderActions } from '@/components/layout/PageHeader';
import { TextOverlayEditor } from '@/components/text/TextOverlayEditor';
import { DraggableText } from '@/components/text/DraggableText';
import { SharingControls } from '@/components/gif/SharingControls';
import { useTextOverlay } from '@/hooks/useTextOverlay';
import { getGifProcessingService } from '@/lib/services/gifProcessingService';
import type { Gif, ProcessedGif, ProcessingProgress } from '@/lib/types/gif';
import type { TextOverlay } from '@/lib/types/textOverlay';
import { cn } from '@/lib/utils';

interface GenerationPageState {
  selectedGif: Gif | null;
  processedGif: ProcessedGif | null;
  isProcessing: boolean;
  processingProgress: ProcessingProgress;
  isPlaying: boolean;
  error: string | null;
  showSuccessAnimation: boolean;
}

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const previewRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [state, setState] = useState<GenerationPageState>({
    selectedGif: null,
    processedGif: null,
    isProcessing: false,
    processingProgress: { progress: 0, stage: 'loading' },
    isPlaying: true,
    error: null,
    showSuccessAnimation: false,
  });

  // Initialize from URL params
  useEffect(() => {
    const gifId = searchParams.get('gif');
    if (gifId && !state.selectedGif) {
      // In a real app, you'd fetch the GIF by ID
      // For now, we'll create a mock GIF
      const mockGif: Gif = {
        id: gifId,
        title: 'Selected GIF',
        url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
        preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif',
        width: 480,
        height: 270,
        duration: 2000,
        frameCount: 20,
        source: 'giphy',
      };
      setState(prev => ({ ...prev, selectedGif: mockGif }));
    }
  }, [searchParams, state.selectedGif]);

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

  // Handle GIF processing
  const handleProcessGif = useCallback(async () => {
    if (!state.selectedGif || overlays.length === 0) {
      toast({
        title: "Cannot Process GIF",
        description: "Please select a GIF and add at least one text overlay.",
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
      const processedGif = await processingService.processGif(state.selectedGif, validOverlays);
      
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
  }, [state.selectedGif, overlays, toast]);

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
    if (!previewRef.current || !state.selectedGif) {
      return { width: 400, height: 300 };
    }
    
    const rect = previewRef.current.getBoundingClientRect();
    const aspectRatio = state.selectedGif.width / state.selectedGif.height;
    
    let width = rect.width;
    let height = width / aspectRatio;
    
    if (height > rect.height) {
      height = rect.height;
      width = height * aspectRatio;
    }
    
    return { width, height };
  }, [state.selectedGif]);

  const previewDimensions = getPreviewDimensions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  GIF Generator
                </h1>
                <p className="text-white/80 text-sm">
                  Add text overlays to your GIF
                </p>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="hidden sm:flex items-center gap-4 opacity-30">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
              <Zap className="h-8 w-8 text-white animate-bounce" />
              <Settings className="h-6 w-6 text-white animate-pulse delay-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* No GIF Selected State */}
        {!state.selectedGif && (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto bg-white/80 backdrop-blur-sm border-white/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                    <Info className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No GIF Selected
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please select a GIF from the search page to get started.
                  </p>
                  <Button
                    onClick={() => router.push('/search')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go to Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content - Split Screen Layout */}
        {state.selectedGif && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Panel - GIF Preview */}
            <div className="space-y-6">
              {/* GIF Preview Card */}
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Preview
                    </CardTitle>
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
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* GIF Display with Text Overlays */}
                  <div 
                    ref={previewRef}
                    className="relative aspect-video bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-lg overflow-hidden group"
                    onClick={() => setActiveOverlay(null)}
                  >
                    {/* GIF Image */}
                    <img
                      src={state.isPlaying ? state.selectedGif.url : state.selectedGif.preview}
                      alt={state.selectedGif.title}
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
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                        <div className="text-center text-white">
                          <div className="w-16 h-16 mx-auto mb-4 relative">
                            <Loader2 className="w-16 h-16 animate-spin text-blue-500" />
                          </div>
                          <p className="text-lg font-medium mb-2">Processing GIF...</p>
                          <p className="text-sm text-white/80 mb-4">
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
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-lg animate-pulse">
                        <div className="text-center text-white">
                          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500 animate-bounce" />
                          <p className="text-lg font-medium">Success!</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GIF Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span>{state.selectedGif.width} × {state.selectedGif.height}</span>
                      {state.selectedGif.duration && (
                        <span>{(state.selectedGif.duration / 1000).toFixed(1)}s</span>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {state.selectedGif.source.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{overlays.length} text overlay{overlays.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Generate Button */}
                    <Button
                      onClick={handleProcessGif}
                      disabled={state.isProcessing || overlays.length === 0}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3"
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

                    {/* Download Button */}
                    {state.processedGif && (
                      <>
                        <Separator />
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download GIF
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Error Alert */}
              {state.error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
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
            <div className="space-y-6">
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
                className="h-[600px]"
              />

              {/* Sharing Controls */}
              {state.processedGif && (
                <SharingControls 
                  gif={state.processedGif} 
                  className="bg-white/90 backdrop-blur-sm border-white/20 shadow-xl"
                />
              )}

              {/* Tips Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                  <p>• Click and drag text overlays to reposition them</p>
                  <p>• Use the Style tab to customize fonts, colors, and effects</p>
                  <p>• Add multiple text layers for complex designs</p>
                  <p>• Preview your changes in real-time on the left</p>
                  {state.processedGif && <p>• Use the sharing controls to share your creation</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Visual Footer Divider */}
        <div className="mt-16 pt-8 border-t border-gradient-to-r from-transparent via-gray-200 to-transparent">
          <div className="text-center text-gray-500 text-sm">
            <p>Create amazing GIFs with custom text overlays • Powered by FFmpeg WASM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  );
}