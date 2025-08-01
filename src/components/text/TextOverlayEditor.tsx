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
    <Card className={cn('w-full h-full flex flex-col bg-card/90 backdrop-blur-sm border-border/20 shadow-xl', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base group">
          <Type className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
          <span className="gradient-text truncate">Text Overlay Editor</span>
          <Badge variant="secondary" className="ml-auto bg-muted/30 border-border/30 text-xs shrink-0">
            {overlays.length} text{overlays.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 sm:px-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 border-border/20">
              <TabsTrigger value="layers" className="flex items-center gap-1 focus-ring text-xs sm:text-sm px-1 sm:px-2">
                <Layers className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Layers</span>
              </TabsTrigger>
              <TabsTrigger value="style" className="flex items-center gap-1 focus-ring text-xs sm:text-sm px-1 sm:px-2" disabled={!activeOverlay}>
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Style</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Layers Tab */}
          <TabsContent value="layers" className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-responsive">
              {/* Enhanced Add Text Button */}
              <Button 
                onClick={onOverlayAdd} 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 focus-ring shadow-lg"
                size="lg"
              >
                <Plus className="w-4 h-4 mr-2 shrink-0" />
                <span className="text-sm font-semibold truncate">Add Text Layer</span>
              </Button>

              <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Text Layers List */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Text Layers</Label>
                {overlays.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="inline-flex p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full mb-4">
                      <Type className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">No text layers yet</p>
                    <p className="text-xs">Click "Add Text Layer" to get started</p>
                  </div>
                ) : (
                  <ScrollArea className="h-64 scrollbar-thin">
                    <div className="space-y-3 pr-4">
                      {overlays.map((overlay, index) => (
                        <div
                          key={overlay.id}
                          className={cn(
                            'p-4 rounded-lg border cursor-pointer transition-all duration-200',
                            'hover:bg-accent/50 hover:shadow-md',
                            activeOverlayId === overlay.id 
                              ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg ring-1 ring-primary/20' 
                              : 'border-border bg-card/50 backdrop-blur-sm'
                          )}
                          onClick={() => onActiveOverlayChange(overlay.id)}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs bg-muted/30 border-border/30">
                              Layer {overlays.length - index}
                            </Badge>
                            <div className="flex gap-1 ml-auto">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-accent/80 focus-ring touch-target"
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
                                className="h-7 w-7 hover:bg-accent/80 focus-ring touch-target"
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
                                className="h-7 w-7 hover:bg-accent hover:text-accent-foreground focus-ring touch-target"
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
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 focus-ring touch-target"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOverlayRemove(overlay.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <Input
                              value={overlay.text}
                              onChange={(e) => handleTextChange(overlay.id, e.target.value)}
                              placeholder="Enter text..."
                              className="text-sm bg-background/80 border-border focus:ring-2 focus:ring-primary/20"
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground font-mono">
                              <span className="flex items-center gap-1 shrink-0">
                                <div className="w-2 h-2 rounded-full bg-primary" />
                                {Math.round(overlay.position.x)}%, {Math.round(overlay.position.y)}%
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <div className="w-2 h-2 rounded-full bg-accent" />
                                {overlay.style.fontSize}px
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <div 
                                  className="w-3 h-3 rounded-full border border-border" 
                                  style={{ backgroundColor: overlay.style.color }}
                                />
                                <span className="truncate max-w-[60px]">{overlay.style.color}</span>
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
          <TabsContent value="style" className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
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


    </Card>
  );
}