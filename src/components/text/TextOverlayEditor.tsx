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
    <Card className={cn('w-full h-full flex flex-col glass shadow-xl', className)}>
      <CardHeader className="pb-3 animate-fade-in">
        <CardTitle className="flex items-center gap-2 text-responsive-base group">
          <Type className="w-5 h-5 text-primary group-hover:rotate-3 transition-transform duration-300" />
          <span className="gradient-text">Text Overlay Editor</span>
          <Badge variant="secondary" className="ml-auto glass animate-pulse-gentle">
            {overlays.length} text{overlays.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-6 glass">
            <TabsTrigger value="layers" className="flex items-center gap-2 transition-all duration-200 hover:scale-105 focus-ring">
              <Layers className="w-4 h-4 transition-transform duration-200 group-hover:rotate-3" />
              <span className="text-responsive-sm">Layers</span>
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-2 transition-all duration-200 hover:scale-105 focus-ring" disabled={!activeOverlay}>
              <Settings className="w-4 h-4 transition-transform duration-200 group-hover:rotate-3" />
              <span className="text-responsive-sm">Style</span>
            </TabsTrigger>
          </TabsList>

          {/* Layers Tab */}
          <TabsContent value="layers" className="flex-1 px-6 pb-6 animate-fade-in">
            <div className="space-responsive">
              {/* Enhanced Add Text Button */}
              <Button 
                onClick={onOverlayAdd} 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover-lift focus-ring shadow-lg"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
                <span className="text-responsive-sm font-semibold">Add Text Layer</span>
              </Button>

              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Text Layers List */}
              <div className="space-y-3">
                <Label className="text-responsive-sm font-semibold text-foreground">Text Layers</Label>
                {overlays.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground animate-fade-in">
                    <div className="inline-flex p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full mb-4 animate-float">
                      <Type className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-responsive-sm font-medium">No text layers yet</p>
                    <p className="text-responsive-xs">Click "Add Text Layer" to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64 scrollbar-thin">
                    <div className="space-y-3 pr-4">
                      {overlays.map((overlay, index) => (
                        <div
                          key={overlay.id}
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-all duration-300 hover-lift focus-ring',
                            'hover:bg-accent/50 hover:shadow-md',
                            activeOverlayId === overlay.id 
                              ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg ring-1 ring-primary/20' 
                              : 'border-border glass'
                          )}
                          onClick={() => onActiveOverlayChange(overlay.id)}
                          style={{
                            animationDelay: `${index * 0.1}s`,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs glass">
                              Layer {overlays.length - index}
                            </Badge>
                            <div className="flex gap-1 ml-auto">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-accent/80 hover-lift focus-ring touch-target"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayMoveUp(overlay.id);
                                }}
                                disabled={index === overlays.length - 1}
                              >
                                <MoveUp className="w-3 h-3 transition-transform duration-200 hover:scale-110" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-accent/80 hover-lift focus-ring touch-target"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayMoveDown(overlay.id);
                                }}
                                disabled={index === 0}
                              >
                                <MoveDown className="w-3 h-3 transition-transform duration-200 hover:scale-110" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600 hover-lift focus-ring touch-target"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayDuplicate(overlay.id);
                                }}
                              >
                                <Copy className="w-3 h-3 transition-transform duration-200 hover:scale-110" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 hover-lift focus-ring touch-target"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayRemove(overlay.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3 transition-transform duration-200 hover:scale-110" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <Input
                              value={overlay.text}
                              onChange={(e) => handleTextChange(overlay.id, e.target.value)}
                              placeholder="Enter text..."
                              className="text-responsive-sm glass focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                {Math.round(overlay.position.x)}%, {Math.round(overlay.position.y)}%
                              </span>
                              <span className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                {overlay.style.fontSize}px
                              </span>
                              <span className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300" 
                                  style={{ backgroundColor: overlay.style.color }}
                                />
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