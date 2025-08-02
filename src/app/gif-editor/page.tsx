'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Plus, Download, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import GifTextOverlay from '@/components/GifTextOverlay';
import TextControlsDialog from '@/components/dialogs/TextControlsDialog';
import { getFFmpegProcessor } from '@/lib/utils/ffmpegUtils';

interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    opacity: number;
    fontWeight: 'normal' | 'bold';
  };
}

function GifEditorContent() {
  const searchParams = useSearchParams();
  const [gifSrc, setGifSrc] = useState('/your.gif'); // Default placeholder
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Processing...');
  const [processedGifUrl, setProcessedGifUrl] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [isTextControlsOpen, setIsTextControlsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobileLayout, setIsMobileLayout] = useState(false);

  // Handle GIF URL from query parameter
  useEffect(() => {
    const gifUrl = searchParams.get('gif');
    if (gifUrl) {
      setGifSrc(decodeURIComponent(gifUrl));
      setProcessedGifUrl(null);
      setOverlays([]);
      setActiveOverlayId(null);

      // Add initial text overlay when GIF is loaded from URL
      setTimeout(() => {
        addTextOverlay();
      }, 100);
    }
  }, [searchParams]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitor screen size for layout changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileLayout(window.innerWidth < 1280); // xl breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const addTextOverlay = () => {
    // Limit to maximum 2 text overlays
    if (overlays.length >= 2) {
      return;
    }

    const newOverlay: TextOverlay = {
      id: `overlay-${Date.now()}`,
      text: overlays.length === 0 ? 'First Text' : 'Second Text',
      position: { x: 50, y: 50 + overlays.length * 60 },
      style: {
        fontSize: 24,
        color: '#ffffff',
        strokeColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        fontWeight: 'normal'
      }
    };

    setOverlays(prev => [...prev, newOverlay]);
    setActiveOverlayId(newOverlay.id);
    // Reset processed result when adding text
    setProcessedGifUrl(null);
  };

  const removeTextOverlay = (id: string) => {
    setOverlays(prev => prev.filter(overlay => overlay.id !== id));
    if (activeOverlayId === id) {
      setActiveOverlayId(null);
    }
    // Reset processed result when removing text
    setProcessedGifUrl(null);
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setOverlays(prev => prev.map(overlay =>
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
    // Reset processed result when any change is made
    setProcessedGifUrl(null);
  };

  const updateOverlayStyle = (id: string, styleUpdates: Partial<TextOverlay['style']>) => {
    setOverlays(prev => prev.map(overlay =>
      overlay.id === id
        ? { ...overlay, style: { ...overlay.style, ...styleUpdates } }
        : overlay
    ));
    // Reset processed result when any change is made
    setProcessedGifUrl(null);
  };

  const handleGifUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Uploading GIF file:', file.name, file.type, file.size);
      const url = URL.createObjectURL(file);
      console.log('Created blob URL:', url);
      setGifSrc(url);
      setProcessedGifUrl(null); // Clear previous processed result
      setOverlays([]); // Reset overlays when new GIF is uploaded
      setActiveOverlayId(null); // Reset active overlay

      // Add initial text overlay when GIF is uploaded
      setTimeout(() => {
        addTextOverlay();
      }, 100);
    }
  };

  const processGif = async (retryCount = 0) => {
    if (!isOnline) {
      alert('You appear to be offline. Please check your internet connection and try again.');
      return;
    }

    if (overlays.length === 0 || gifSrc === '/your.gif') {
      alert('Please upload a GIF and add some text first');
      return;
    }

    const validOverlays = overlays.filter(overlay => overlay.text.trim());
    if (validOverlays.length === 0) {
      alert('Please add some text to your overlays');
      return;
    }

    setIsProcessing(true);

    try {
      setProcessingStatus('Initializing processing engine...');
      const processor = getFFmpegProcessor();
      await processor.initialize();

      setProcessingStatus('Processing GIF with text overlays...');

      // Get the actual GIF dimensions from the preview image
      const previewImg = document.querySelector('img[alt="GIF Preview"]') as HTMLImageElement;
      const gifWidth = previewImg?.naturalWidth || 1;
      const gifHeight = previewImg?.naturalHeight || 1;

      // Convert overlays to the format expected by FFmpeg processor
      const processedOverlays = validOverlays.map(overlay => ({
        text: overlay.text,
        position: {
          x: (overlay.position.x / gifWidth) * 100, // Convert to percentage based on actual GIF size
          y: (overlay.position.y / gifHeight) * 100
        },
        style: {
          fontSize: overlay.style.fontSize,
          color: overlay.style.color,
          strokeColor: overlay.style.strokeColor,
          strokeWidth: overlay.style.strokeWidth,
          opacity: overlay.style.opacity,
          fontWeight: overlay.style.fontWeight,
          fontFamily: 'Arial', // Add required properties
          textAlign: 'left' as const
        },
        id: overlay.id,
        isDragging: false
      }));

      const result = await processor.processGifWithText(gifSrc, processedOverlays);

      setProcessingStatus('Finalizing...');
      // Create blob URL for processed GIF
      const blob = new Blob([result.data], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      setProcessedGifUrl(url);

      // Scroll to result section after processing
      setTimeout(() => {
        const resultSection = document.getElementById('processed-result');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

    } catch (error) {
      console.error('Processing failed:', error);

      let errorMessage = 'Processing failed. Please try again.';
      let shouldRetry = false;

      if (error && typeof error === 'object' && 'message' in error) {
        const errorMsg = (error as Error).message;

        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('net::ERR_QUIC_PROTOCOL_ERROR')) {
          errorMessage = 'Network error: Unable to load processing engine. Please check your internet connection and try again.';
          shouldRetry = retryCount < 2; // Allow up to 2 retries for network errors
        } else if (errorMsg.includes('Failed to load FFmpeg')) {
          errorMessage = 'Failed to load video processing engine. This might be due to network issues. Please refresh the page and try again.';
          shouldRetry = retryCount < 1; // Allow 1 retry for FFmpeg loading errors
        } else if (errorMsg.includes('timeout')) {
          errorMessage = 'Processing timed out. Please try with a smaller GIF or check your internet connection.';
        } else if (errorMsg.includes('memory') || errorMsg.includes('Memory')) {
          errorMessage = 'Not enough memory to process this GIF. Please try with a smaller file.';
        }
      }

      if (shouldRetry) {
        console.log(`Retrying processing (attempt ${retryCount + 1})...`);
        setIsProcessing(false);
        // Wait a bit before retrying
        setTimeout(() => {
          processGif(retryCount + 1);
        }, 1000);
        return;
      }

      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadGif = () => {
    if (!processedGifUrl) return;

    const link = document.createElement('a');
    link.href = processedGifUrl;
    link.download = 'processed-gif.gif';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            GIF Text Editor - Add Custom Text to GIFs
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Create personalized animated GIFs by adding custom text overlays. Upload your GIF or use one from our search, customize fonts, colors, and positioning, then download your creation.
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" />
              Upload GIF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">GIF files only</p>
                </div>
                <input
                  type="file"
                  accept=".gif"
                  onChange={handleGifUpload}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Only show if GIF is uploaded */}
        {gifSrc !== '/your.gif' && (
          <div className="space-y-6">
            {/* Preview and Result - Side by side on larger screens */}
            <div className={`grid gap-6 ${!isMobileLayout ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Preview Panel */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Original with Text
                    {!isOnline && (
                      <Badge variant="destructive" className="text-xs">
                        Offline
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Double-click text to edit inline • Drag to move • Click to select</span>
                    <span className="sm:hidden">Tap to select • Double-tap or long-press to edit • Drag to move</span>
                    {!isOnline && (
                      <span className="block text-destructive mt-1">
                        Internet connection required for processing
                      </span>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="w-full bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-6 min-h-[350px] flex items-center justify-center border relative">
                    <div className="relative w-full max-w-full flex justify-center">
                      <GifTextOverlay
                        gifSrc={gifSrc}
                        overlays={overlays}
                        activeOverlayId={activeOverlayId}
                        onOverlayUpdate={updateOverlay}
                        onOverlaySelect={setActiveOverlayId}
                        onScaleFactorChange={setScaleFactor}
                        onOverlayRemove={removeTextOverlay}
                        onTextControlsOpen={(id) => {
                          setActiveOverlayId(id);
                          setIsTextControlsOpen(true);
                        }}
                      />
                    </div>
                    
                    {/* Processing Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 relative">
                            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                          </div>
                          <p className="text-lg font-medium text-foreground mb-2">Processing GIF</p>
                          <p className="text-sm text-muted-foreground">{processingStatus}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons - Always part of preview card */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={addTextOverlay}
                      disabled={overlays.length >= 2 || isProcessing}
                      variant="default"
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Text {overlays.length >= 2 && '(Max 2)'}
                    </Button>

                    <Button
                      onClick={() => processGif()}
                      disabled={isProcessing || overlays.length === 0 || !isOnline}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Process GIF
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Processed GIF Result */}
              <Card className="overflow-hidden" id="processed-result">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Processed Result
                    {processedGifUrl && (
                      <Button
                        onClick={downloadGif}
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        title="Download Processed GIF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {processedGifUrl ? 'Your processed GIF is ready!' : 'Click "Process GIF" to generate the final result'}
                  </p>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="w-full bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-6 min-h-[350px] flex items-center justify-center border">
                    {processedGifUrl ? (
                      <img
                        src={processedGifUrl}
                        alt="Processed GIF"
                        className="max-w-full h-auto rounded-lg shadow-sm border border-border/50"
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <Zap className="h-8 w-8" />
                        </div>
                        <p className="font-medium">No processed GIF yet</p>
                        <p className="text-sm mt-1">Add text and click "Process GIF" to generate</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State - Show when no GIF is uploaded */}
        {gifSrc === '/your.gif' && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Upload a GIF to get started
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Use the upload area above to choose a GIF file and start adding text overlays.
            </p>
          </div>
        )}

        {/* Text Controls Dialog */}
        <TextControlsDialog
          isOpen={isTextControlsOpen}
          onClose={() => setIsTextControlsOpen(false)}
          overlays={overlays}
          activeOverlayId={activeOverlayId}
          onOverlaySelect={setActiveOverlayId}
          onOverlayStyleUpdate={updateOverlayStyle}
          onOverlayRemove={removeTextOverlay}
          scaleFactor={scaleFactor}
        />
      </div>
    </div>
  );
}

export default function GifEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-foreground">Loading GIF Editor...</p>
        </div>
      </div>
    }>
      <GifEditorContent />
    </Suspense>
  );
}