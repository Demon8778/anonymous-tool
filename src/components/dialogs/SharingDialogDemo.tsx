"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { SharingDialog } from './SharingDialog';
import type { ProcessedGif } from '@/lib/types/gif';
import type { ShareResult } from '@/lib/types/dialog';

// Demo component to show how SharingDialog integrates
export function SharingDialogDemo() {
  const [isOpen, setIsOpen] = useState(false);

  // Mock processed GIF for demo
  const mockProcessedGif: ProcessedGif = {
    id: 'demo-gif-1',
    title: 'Demo GIF with Text',
    originalUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    processedUrl: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    preview: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200.gif',
    width: 480,
    height: 270,
    duration: 2000,
    frameCount: 20,
    source: 'giphy',
    textOverlays: [
      {
        id: 'overlay-1',
        text: 'Hello World!',
        position: { x: 50, y: 50 },
        style: {
          fontSize: 24,
          fontFamily: 'Arial',
          color: '#ffffff',
          background: 'transparent',
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          stroke: { color: '#000000', width: 2 },
          shadow: { color: '#000000', blur: 4, offsetX: 2, offsetY: 2 }
        },
        timing: { start: 0, end: 2000 },
        animation: { type: 'none', duration: 0, delay: 0 }
      }
    ],
    createdAt: new Date(),
    metadata: {
      title: 'Demo GIF with Text',
      description: 'A demo GIF showing text overlay functionality'
    }
  };

  const handleShareComplete = (shareResult: ShareResult) => {
    console.log('Share completed:', shareResult);
    setIsOpen(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center">SharingDialog Demo</h2>
        <p className="text-muted-foreground text-center">
          Click the button below to test the SharingDialog component
        </p>
        
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Open Sharing Dialog
        </Button>

        <SharingDialog
          gif={mockProcessedGif}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onShareComplete={handleShareComplete}
        />
      </div>
    </div>
  );
}