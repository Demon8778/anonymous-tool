/**
 * TextOverlayEditor component using shadcn Tabs, Input, and Slider components
 */

'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown,
  Type,
  Layers,
  Settings
} from 'lucide-react';
import type { TextOverlay } from '@/lib/types/textOverlay';
import { TextControls } from './TextControls';
import { cn } from '@/lib/utils';

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  activeOverlayId: string | null;
  onOverlayAdd: () => void;
  onOverlayRemove: (id: string) => void;
  onOverlayDuplicate: (id: string) => void;
  onOverlayUpdate: (id: string, updates: Partial<TextOverlay>) => void;
  onActiveOverlayChange: (id: string | null) => void;
  onOverlayMoveUp: (id: string) => void;
  onOverlayMoveDown: (id: string) => void;
  className?: string;
}

export function TextOverlayEditor({
  overlays,
  activeOverlayId,
  onOverlayAdd,
  onOverlayRemove,
  onOverlayDuplicate,
  onOverlayUpdate,
  onActiveOverlayChange,
  onOverlayMoveUp,
  onOverlayMoveDown,
  className,
}: TextOverlayEditorProps) {
  const [activeTab, setActiveTab] = useState('layers');
  const activeOverlay = overlays.find(overlay => overlay.id === activeOverlayId);

  const handleTextChange = (id: string, text: string) => {
    onOverlayUpdate(id, { text });
  };

  const handleStyleChange = (id: string, styleUpdates: Partial<TextOverlay['style']>) => {
    const overlay = overlays.find(o => o.id === id);
    if (overlay) {
      onOverlayUpdate(id, { 
        style: { ...overlay.style, ...styleUpdates } 
      });
    }
  };

  return (
    <Card className={cn('w-full h-full flex flex-col', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Type className="w-5 h-5" />
          Text Overlay Editor
          <Badge variant="secondary" className="ml-auto">
            {overlays.length} text{overlays.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-6">
            <TabsTrigger value="layers" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Layers
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-2" disabled={!activeOverlay}>
              <Settings className="w-4 h-4" />
              Style
            </TabsTrigger>
          </TabsList>

          {/* Layers Tab */}
          <TabsContent value="layers" className="flex-1 px-6 pb-6">
            <div className="space-y-4">
              {/* Add Text Button */}
              <Button 
                onClick={onOverlayAdd} 
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Text Layer
              </Button>

              <Separator />

              {/* Text Layers List */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Text Layers</Label>
                {overlays.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Type className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No text layers yet</p>
                    <p className="text-xs">Click "Add Text Layer" to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {overlays.map((overlay, index) => (
                        <div
                          key={overlay.id}
                          className={cn(
                            'p-3 rounded-lg border cursor-pointer transition-all',
                            'hover:bg-accent/50',
                            activeOverlayId === overlay.id 
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                              : 'border-border'
                          )}
                          onClick={() => onActiveOverlayChange(overlay.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              Layer {overlays.length - index}
                            </Badge>
                            <div className="flex gap-1 ml-auto">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayMoveUp(overlay.id);
                                }}
                                disabled={index === overlays.length - 1}
                              >
                                <MoveUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayMoveDown(overlay.id);
                                }}
                                disabled={index === 0}
                              >
                                <MoveDown className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayDuplicate(overlay.id);
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayRemove(overlay.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Input
                              value={overlay.text}
                              onChange={(e) => handleTextChange(overlay.id, e.target.value)}
                              placeholder="Enter text..."
                              className="text-sm"
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Position: {Math.round(overlay.position.x)}%, {Math.round(overlay.position.y)}%</span>
                              <span>•</span>
                              <span>Size: {overlay.style.fontSize}px</span>
                              <span>•</span>
                              <span style={{ color: overlay.style.color }}>
                                {overlay.style.color}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="flex-1 px-6 pb-6">
            {activeOverlay ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Label className="text-sm font-medium">Editing:</Label>
                  <Badge variant="outline">
                    {activeOverlay.text || 'Empty Text'}
                  </Badge>
                </div>
                
                <ScrollArea className="h-96">
                  <TextControls
                    style={activeOverlay.style}
                    onStyleChange={(updates) => handleStyleChange(activeOverlay.id, updates)}
                  />
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No text layer selected</p>
                <p className="text-xs">Select a text layer to edit its style</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Gradient background for visual polish */}
      <div 
        className="absolute inset-0 -z-10 rounded-lg opacity-5"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
        }}
      />
    </Card>
  );
}