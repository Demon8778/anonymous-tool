/**
 * TextOverlayEditor component using accordion layout for each layer
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Plus, 
  Trash2, 
  Copy, 
  MoveUp, 
  MoveDown,
  Type,
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
            {overlays.length} layer{overlays.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6 overflow-hidden">
        <div className="h-full flex flex-col space-y-4">
          {/* Enhanced Add Text Button */}
          <Button 
            onClick={onOverlayAdd} 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 focus-ring shadow-lg shrink-0"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2 shrink-0" />
            <span className="text-sm font-semibold truncate">Add Text Layer</span>
          </Button>

          {overlays.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground flex-1 flex flex-col justify-center">
              <div className="inline-flex p-4 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full mb-4">
                <Type className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm font-medium">No text layers yet</p>
              <p className="text-xs">Click "Add Text Layer" to get started</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <Accordion type="multiple" className="space-y-3 pr-2">
                {overlays.map((overlay, index) => (
                  <AccordionItem 
                    key={overlay.id} 
                    value={overlay.id}
                    className={cn(
                      'rounded-lg border transition-all duration-200',
                      'hover:shadow-md',
                      activeOverlayId === overlay.id 
                        ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg ring-1 ring-primary/20' 
                        : 'border-border bg-card/50 backdrop-blur-sm'
                    )}
                  >
                    <AccordionTrigger 
                      className="px-4 py-3 hover:no-underline"
                      onClick={() => onActiveOverlayChange(overlay.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="outline" className="text-xs bg-muted/30 border-border/30">
                          Layer {overlays.length - index}
                        </Badge>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium truncate">
                            {overlay.text || 'Empty Text'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {Math.round(overlay.position.x)}%, {Math.round(overlay.position.y)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-accent" />
                              {overlay.style.fontSize}px
                            </span>
                            <span className="flex items-center gap-1">
                              <div 
                                className="w-2 h-2 rounded-full border border-border" 
                                style={{ backgroundColor: overlay.style.color }}
                              />
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
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
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {/* Text Input */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Text Content</Label>
                          <Input
                            value={overlay.text}
                            onChange={(e) => handleTextChange(overlay.id, e.target.value)}
                            placeholder="Enter text..."
                            className="text-sm bg-background/80 border-border focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

                        {/* Style Controls */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-3">
                            <Settings className="w-4 h-4 text-primary" />
                            <Label className="text-sm font-medium">Style Options</Label>
                          </div>
                          <TextControls
                            style={overlay.style}
                            onStyleChange={(updates) => handleStyleChange(overlay.id, updates)}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                </Accordion>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}