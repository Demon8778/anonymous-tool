"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  Pause, 
  Download, 
  Share2, 
  RotateCcw, 
  Maximize2, 
  AlertCircle,
  Info
} from 'lucide-react';
import type { Gif, ProcessedGif } from '@/lib/types/gif';
import type { TextOverlay } from '@/lib/types/textOverlay';

interface GifPreviewProps {
  gif: Gif | ProcessedGif | null;
  textOverlays?: TextOverlay[];
  onTextUpdate?: (overlays: TextOverlay[]) => void;
  isProcessing?: boolean;
  processingProgress?: number;
  onDownload?: () => void;
  onShare?: () => void;
  onReset?: () => void;
  className?: string;
  showControls?: boolean;
  allowFullscreen?: boolean;
}

interface GifDisplayProps {
  gif: Gif | ProcessedGif;
  textOverlays?: TextOverlay[];
  isPlaying: boolean;
  onTogglePlay: () => void;
  showOverlays?: boolean;
}

function GifDisplay({ 
  gif, 
  textOverlays = [], 
  isPlaying, 
  onTogglePlay, 
  showOverlays = true 
}: GifDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  if (imageError) {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-3" />
          <p className="text-lg font-medium">Failed to load GIF</p>
          <p className="text-sm">Please try a different GIF</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 rounded-lg overflow-hidden group"
    >
      {/* Loading skeleton */}
      {!imageLoaded && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* GIF image */}
      <img
        src={isPlaying ? gif.url : gif.preview}
        alt={gif.title}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />

      {/* Text overlays preview */}
      {showOverlays && textOverlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${overlay.position.x}%`,
            top: `${overlay.position.y}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: `${overlay.style.fontSize}px`,
            fontFamily: overlay.style.fontFamily,
            color: overlay.style.color,
            fontWeight: overlay.style.fontWeight,
            textAlign: overlay.style.textAlign,
            opacity: overlay.style.opacity,
            textShadow: `${overlay.style.strokeWidth}px ${overlay.style.strokeWidth}px 0px ${overlay.style.strokeColor}`,
            WebkitTextStroke: `${overlay.style.strokeWidth}px ${overlay.style.strokeColor}`,
          }}
        >
          {overlay.text}
        </div>
      ))}

      {/* Play/Pause overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
        <Button
          variant="secondary"
          size="lg"
          className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* GIF info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-between text-white">
          <div>
            <h3 className="font-medium truncate">{gif.title}</h3>
            <p className="text-sm text-white/80">
              {gif.width} × {gif.height}
              {gif.duration && ` • ${(gif.duration / 1000).toFixed(1)}s`}
            </p>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
            {gif.source.toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ProcessingOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
      <div className="text-center text-white">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
          <div 
            className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"
            style={{
              transform: `rotate(${progress * 360}deg)`
            }}
          ></div>
        </div>
        <p className="text-lg font-medium mb-2">Processing GIF...</p>
        <p className="text-sm text-white/80">{Math.round(progress * 100)}% complete</p>
      </div>
    </div>
  );
}

export function GifPreview({
  gif,
  textOverlays = [],
  onTextUpdate,
  isProcessing = false,
  processingProgress = 0,
  onDownload,
  onShare,
  onReset,
  className = "",
  showControls = true,
  allowFullscreen = true
}: GifPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  if (!gif) {
    return (
      <Card className={`bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
        <CardContent className="p-6">
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Info className="h-12 w-12 mx-auto mb-3" />
              <p className="text-lg font-medium">No GIF selected</p>
              <p className="text-sm">Choose a GIF to preview</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-white/20 shadow-xl ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            GIF Preview
          </CardTitle>
          {showControls && (
            <div className="flex items-center gap-2">
              {allowFullscreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreen}
                  className="h-8 w-8 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative">
          <GifDisplay
            gif={gif}
            textOverlays={textOverlays}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            showOverlays={!isProcessing}
          />
          
          {/* Processing overlay */}
          {isProcessing && (
            <ProcessingOverlay progress={processingProgress} />
          )}
        </div>

        {/* Text overlays info */}
        {textOverlays.length > 0 && !isProcessing && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Text Overlays ({textOverlays.length})</h4>
            <div className="flex flex-wrap gap-2">
              {textOverlays.map((overlay) => (
                <Badge
                  key={overlay.id}
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-800"
                >
                  "{overlay.text.substring(0, 20)}{overlay.text.length > 20 ? '...' : ''}"
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {showControls && (
          <div className="flex flex-wrap gap-2 pt-2">
            {onDownload && (
              <Button
                onClick={onDownload}
                disabled={isProcessing}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                onClick={onShare}
                disabled={isProcessing}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}
          </div>
        )}

        {/* Processing status */}
        {isProcessing && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your GIF is being processed with text overlays. This may take a few moments.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default GifPreview;