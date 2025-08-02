'use client';

import { useState } from 'react';
import GifTextOverlay from '@/components/GifTextOverlay';
import SimpleTextControls from '@/components/SimpleTextControls';
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

export default function GifEditorPage() {
  const [gifSrc, setGifSrc] = useState('/your.gif'); // Default placeholder
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedGifUrl, setProcessedGifUrl] = useState<string | null>(null);
  const [overlays, setOverlays] = useState<TextOverlay[]>([]);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);

  const addTextOverlay = () => {
    const newOverlay: TextOverlay = {
      id: `overlay-${Date.now()}`,
      text: 'New Text',
      position: { x: 50, y: 50 + overlays.length * 40 },
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
  };

  const removeTextOverlay = (id: string) => {
    setOverlays(prev => prev.filter(overlay => overlay.id !== id));
    if (activeOverlayId === id) {
      setActiveOverlayId(null);
    }
  };

  const updateOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    ));
  };

  const updateOverlayStyle = (id: string, styleUpdates: Partial<TextOverlay['style']>) => {
    setOverlays(prev => prev.map(overlay => 
      overlay.id === id 
        ? { ...overlay, style: { ...overlay.style, ...styleUpdates } }
        : overlay
    ));
  };

  const handleGifUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setGifSrc(url);
      setProcessedGifUrl(null); // Clear previous processed result
      
      // Add initial text overlay when GIF is uploaded
      if (overlays.length === 0) {
        addTextOverlay();
      }
    }
  };

  const processGif = async () => {
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
      const processor = getFFmpegProcessor();
      await processor.initialize();

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
          fontWeight: overlay.style.fontWeight
        },
        id: overlay.id,
        isDragging: false
      }));

      const result = await processor.processGifWithText(gifSrc, processedOverlays);
      
      // Create blob URL for processed GIF
      const blob = new Blob([result.data], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      setProcessedGifUrl(url);
      
    } catch (error) {
      console.error('Processing failed:', error);
      alert('Processing failed. Please try again.');
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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">GIF Text Editor</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Upload GIF:
        </label>
        <input
          type="file"
          accept=".gif"
          onChange={handleGifUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Preview */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <GifTextOverlay 
            gifSrc={gifSrc}
            overlays={overlays}
            activeOverlayId={activeOverlayId}
            onOverlayUpdate={updateOverlay}
            onOverlaySelect={setActiveOverlayId}
          />
          
          <div className="mt-6 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={addTextOverlay}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
              >
                Add Text
              </button>
              {activeOverlayId && (
                <button
                  onClick={() => removeTextOverlay(activeOverlayId)}
                  className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            
            <button
              onClick={processGif}
              disabled={isProcessing || gifSrc === '/your.gif' || overlays.length === 0}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Process GIF'}
            </button>
            
            {processedGifUrl && (
              <button
                onClick={downloadGif}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700"
              >
                Download Processed GIF
              </button>
            )}
          </div>

          {/* Processed GIF Preview */}
          {processedGifUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Processed GIF:</h3>
              <img 
                src={processedGifUrl} 
                alt="Processed GIF" 
                className="max-w-full border rounded-lg"
              />
            </div>
          )}
        </div>
        
        {/* Right Panel - Text Controls */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Text Controls</h2>
          
          {activeOverlayId ? (
            <div className="space-y-4">
              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Text Content</label>
                <input
                  type="text"
                  value={overlays.find(o => o.id === activeOverlayId)?.text || ''}
                  onChange={(e) => updateOverlay(activeOverlayId, { text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter text..."
                />
              </div>
              
              {/* Style Controls */}
              <SimpleTextControls
                style={overlays.find(o => o.id === activeOverlayId)?.style || {
                  fontSize: 24,
                  color: '#ffffff',
                  strokeColor: '#000000',
                  strokeWidth: 2,
                  opacity: 1,
                  fontWeight: 'normal'
                }}
                onStyleChange={(updates) => updateOverlayStyle(activeOverlayId, updates)}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Select a text overlay to edit its properties</p>
              <p className="text-sm mt-2">Click on text in the preview or add new text</p>
            </div>
          )}
          
          {/* Text Layers List */}
          {overlays.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Text Layers ({overlays.length})</h3>
              <div className="space-y-2">
                {overlays.map((overlay, index) => (
                  <div
                    key={overlay.id}
                    onClick={() => setActiveOverlayId(overlay.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      activeOverlayId === overlay.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Layer {overlays.length - index}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTextOverlay(overlay.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {overlay.text || 'Empty text'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}