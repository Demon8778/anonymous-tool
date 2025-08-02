"use client";

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Download,
    RotateCcw,
    Play,
    Pause,
    Settings,
    Sparkles,
    Zap,
    CheckCircle,
    AlertCircle,
    Info,
    Loader2,
    Search,
    ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TextOverlayEditor } from '@/components/text/TextOverlayEditor';
import { DraggableText } from '@/components/text/DraggableText';
import { SharingControls } from '@/components/gif/SharingControls';
import { GifSearchForm } from '@/components/gif/GifSearchForm';
import { UnifiedGifGrid } from '@/components/gif/UnifiedGifGrid';
import { GifEditorDialog } from '@/components/dialogs/GifEditorDialog';
import { SharingDialog } from '@/components/dialogs/SharingDialog';
import { useTextOverlay } from '@/hooks/useTextOverlay';
import { useGifSearch } from '@/hooks/useGifSearch';
import { useDialogState } from '@/hooks/useDialogState';
import { getGifProcessingService } from '@/lib/services/gifProcessingService';
import type { Gif, ProcessedGif, ProcessingProgress } from '@/lib/types/gif';

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

    // Tab state for search/generate
    const [activeTab, setActiveTab] = useState<'search' | 'generate'>('search');

    // Search functionality
    const {
        searchResults,
        allGifs,
        isLoading: isSearchLoading,
        isLoadingMore,
        hasMore,
        loadMoreGifs,
        error: searchError,
        currentQuery,
        performSearch,
        setCurrentQuery,
        selectedGif: searchSelectedGif,
        setSelectedGif: setSearchSelectedGif,
    } = useGifSearch();
    // Dialog management
    const {
        dialogs,
        openGifEditor,
        openSharing,
        closeDialog,
        closeAllDialogs,
    } = useDialogState();

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
            setActiveTab('generate');
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

    // Initialize default text overlay when GIF is selected but no overlays exist
    // (Only when not coming from GIF selection, which already adds one)
    useEffect(() => {
        if (state.selectedGif && overlays.length === 0 && !searchSelectedGif) {
            addOverlay('Your Text Here', { x: 50, y: 50 });
        }
    }, [state.selectedGif, overlays.length, addOverlay, searchSelectedGif]);

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

    // Handle search
    const handleSearch = useCallback(async (query: string) => {
        setCurrentQuery(query);
        await performSearch(query);
    }, [setCurrentQuery, performSearch]);

    // Handle GIF selection from search
    const handleGifSelect = useCallback((gif: Gif) => {
        setSearchSelectedGif(gif);
        setState(prev => ({ 
            ...prev, 
            selectedGif: gif,
            // Reset processing state when new GIF is selected
            processedGif: null,
            error: null,
            showSuccessAnimation: false,
            processingProgress: { progress: 0, stage: 'loading' }
        }));
        setActiveTab('generate');

        // Clear existing overlays and add a default text overlay
        clearAllOverlays();
        setTimeout(() => {
            addOverlay('Your Text Here', { x: 50, y: 50 });
        }, 100);

        toast({
            title: "GIF Selected",
            description: "You can now add text overlays and generate your custom GIF.",
        });
    }, [setSearchSelectedGif, toast, clearAllOverlays, addOverlay]);

    // Handle opening GIF editor dialog
    const handleOpenGifEditor = useCallback((gif: Gif) => {
        const gifWithContext = {
            ...gif,
            selectedAt: new Date(),
            searchQuery: currentQuery,
        };
        openGifEditor(gifWithContext);
    }, [openGifEditor, currentQuery]);

    // Handle processed GIF from dialog
    const handleGifGenerated = useCallback((processedGif: ProcessedGif) => {
        setState(prev => ({ ...prev, processedGif }));
        openSharing(processedGif);
    }, [openSharing]);

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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80">
                <div className="absolute inset-0 bg-background/20" />

                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'search' | 'generate')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="search" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Search GIFs
                        </TabsTrigger>
                        <TabsTrigger value="generate" className="flex items-center gap-2" disabled={!state.selectedGif}>
                            <Zap className="h-4 w-4" />
                            Generate
                        </TabsTrigger>
                    </TabsList>

                    {/* Search Tab */}
                    <TabsContent value="search" className="space-y-8">
                        {/* Search Form */}
                        <GifSearchForm
                            onSearch={handleSearch}
                            isLoading={isSearchLoading}
                            initialQuery={currentQuery || searchParams.get('search') || ""}
                            placeholder="Search for GIFs to customize..."
                        />

                        {/* Search Results */}
                        {searchResults && (
                            <div className="space-y-6">

                                <UnifiedGifGrid
                                    gifs={allGifs}
                                    onGifSelect={handleGifSelect}
                                    selectedGifId={searchSelectedGif?.id}
                                    isLoading={isSearchLoading}
                                    isLoadingMore={isLoadingMore}
                                    hasMore={hasMore}
                                    onLoadMore={loadMoreGifs}
                                    error={searchError}
                                    onRetry={() => performSearch(currentQuery)}
                                    enableInfiniteScroll={true}
                                    defaultLayoutMode="masonry"
                                    showLayoutToggle={false}
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* Generate Tab */}
                    <TabsContent value="generate" className="space-y-8">
                        {!state.selectedGif ? (
                            <div className="text-center py-16">
                                <Card className="max-w-md mx-auto bg-card/80 backdrop-blur-sm border-border/20">
                                    <CardContent className="p-8">
                                        <div className="mb-6">
                                            <div className="inline-flex p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full mb-4">
                                                <Info className="h-8 w-8 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold text-foreground mb-2">
                                                No GIF Selected
                                            </h3>
                                            <p className="text-muted-foreground mb-6">
                                                Please search and select a GIF to get started with text overlays.
                                            </p>
                                            <Button
                                                onClick={() => setActiveTab('search')}
                                                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                            >
                                                <Search className="h-4 w-4 mr-2" />
                                                Search GIFs
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            /* Main Content - Split Screen Layout */
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Panel - GIF Preview */}
                                {/* Left Panel - Combined Preview + Actions */}
<div className="space-y-6">
  <Card className="bg-card/90 backdrop-blur-sm border-border/20 shadow-xl">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
            <img
              src={state.selectedGif.preview}
              alt={state.selectedGif.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground truncate">
              {state.selectedGif.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {state.selectedGif.width} × {state.selectedGif.height}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('search')}
        >
          Change GIF
        </Button>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      {/* GIF Display */}
      <div
        ref={previewRef}
        className="relative aspect-video bg-muted rounded-lg overflow-hidden group"
        onClick={(e) => {
          // Only deselect if clicking on the container itself, not on text overlays
          if (e.target === e.currentTarget) {
            setActiveOverlay(null);
          }
        }}
      >
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
            onPositionChange={(pos) => handleOverlayPositionChange(overlay.id, pos)}
            onSelect={() => setActiveOverlay(overlay.id)}
            onDragStart={() => startDragging(overlay.id)}
            onDragEnd={() => stopDragging(overlay.id)}
          />
        ))}
        {/* Processing Overlay */}
        {state.isProcessing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-foreground">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-lg font-medium mb-2">Processing GIF...</p>
              <p className="text-sm text-muted-foreground mb-4">
                {state.processingProgress.stage === 'loading' && 'Loading FFmpeg...'}
                {state.processingProgress.stage === 'processing' && 'Adding text overlays...'}
                {state.processingProgress.stage === 'encoding' && 'Encoding final GIF...'}
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
            <CheckCircle className="w-16 h-16 text-primary animate-bounce" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleProcessGif}
          disabled={state.isProcessing || overlays.length === 0}
          className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 py-3"
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
        {state.processedGif && (
          <Button onClick={handleDownload} variant="outline" className="flex-1 py-3">
            <Download className="mr-2 h-5 w-5" />
            Download
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Processing Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            {state.error}
            <Button onClick={handleProcessGif} variant="outline" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
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
                                            className="bg-card/90 backdrop-blur-sm border-border/20 shadow-xl"
                                        />
                                    )}

                                    {/* Tips Card */}
                                    <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Info className="h-5 w-5 text-primary" />
                                                Tips
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm text-muted-foreground">
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
                    </TabsContent>
                </Tabs>

                {/* Dialogs */}
                {dialogs.gifEditor.isOpen && dialogs.gifEditor.data && (
                    <GifEditorDialog
                        gif={dialogs.gifEditor.data}
                        isOpen={dialogs.gifEditor.isOpen}
                        onClose={() => closeDialog('gifEditor')}
                        onGifGenerated={handleGifGenerated}
                    />
                )}

                {dialogs.sharing.isOpen && dialogs.sharing.data && (
                    <SharingDialog
                        gif={dialogs.sharing.data}
                        isOpen={dialogs.sharing.isOpen}
                        onClose={() => closeDialog('sharing')}
                        onShareComplete={(result) => {
                            toast({
                                title: "Share Complete",
                                description: "Your GIF has been shared successfully!",
                            });
                            closeDialog('sharing');
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-foreground">Loading...</p>
                </div>
            </div>
        }>
            <GeneratePageContent />
        </Suspense>
    );
}