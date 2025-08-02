'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Upload, Plus, Trash2, Download, Zap, Loader2, Settings } from 'lucide-react';
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
      const url = URL.createObjectURL(file);
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
            GIF Text Editor
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Add up to 2 text overlays to your GIF
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
            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Preview
                  {!isOnline && (
                    <Badge variant="destructive" className="text-xs">
                      Offline
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  <span className="hidden sm:inline">Double-click text to edit inline • Drag to move • Click to select</span>
                  <span className="sm:hidden">Tap text to select • Double-tap to edit • Drag to move</span>
                  {!isOnline && (
                    <span className="block text-destructive mt-1">
                      Internet connection required for processing
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <div className="w-full flex justify-center">
                  <GifTextOverlay 
                    gifSrc={gifSrc}
                    overlays={overlays}
                    activeOverlayId={activeOverlayId}
                    onOverlayUpdate={updateOverlay}
                    onOverlaySelect={setActiveOverlayId}
                    onScaleFactorChange={setScaleFactor}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button
                      onClick={addTextOverlay}
                      disabled={overlays.length >= 2}
                      variant="default"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Text {overlays.length >= 2 && '(Max 2)'}
                    </Button>
                    
                    <Button
                      onClick={() => setIsTextControlsOpen(true)}
                      disabled={overlays.length === 0}
                      variant="outline"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Text Controls
                    </Button>
                    
                    {activeOverlayId && (
                      <Button
                        onClick={() => removeTextOverlay(activeOverlayId)}
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Selected
                      </Button>
                    )}
                    
                    <Button
                      onClick={processGif}
                      disabled={isProcessing || overlays.length === 0 || !isOnline}
                      className="sm:col-span-2 lg:col-span-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {processingStatus}
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Process GIF
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {processedGifUrl && (
                    <Button
                      onClick={downloadGif}
                      variant="secondary"
                      className="w-full"
                      size="lg"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Processed GIF
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Text Layers Quick View */}
            {overlays.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Text Layers
                    <Badge variant="secondary">{overlays.length}/2</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {overlays.map((overlay, index) => (
                      <div
                        key={overlay.id}
                        onClick={() => setActiveOverlayId(overlay.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          activeOverlayId === overlay.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {index === 0 ? 'First' : 'Second'}
                            </Badge>
                            <span className="text-sm font-medium truncate">
                              {overlay.text || 'Empty text'}
                            </span>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTextOverlay(overlay.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processed GIF Preview */}
            {processedGifUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Processed Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full flex justify-center">
                    <img 
                      src={processedGifUrl} 
                      alt="Processed GIF" 
                      className="max-w-full h-auto border rounded-lg"
                      style={{ display: 'block' }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
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