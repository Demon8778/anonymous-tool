'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import SimpleTextControls from '@/components/SimpleTextControls';

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

interface TextControlsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    overlays: TextOverlay[];
    activeOverlayId: string | null;
    onOverlaySelect: (id: string | null) => void;
    onOverlayStyleUpdate: (id: string, styleUpdates: Partial<TextOverlay['style']>) => void;
    onOverlayRemove: (id: string) => void;
    scaleFactor: number;
}

export default function TextControlsDialog({
    isOpen,
    onClose,
    overlays,
    activeOverlayId,
    onOverlaySelect,
    onOverlayStyleUpdate,
    onOverlayRemove,
    scaleFactor
}: TextControlsDialogProps) {
    const activeOverlay = overlays.find(o => o.id === activeOverlayId);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Text Controls</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Text Layers List */}
                    {overlays.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium">Text Layers</h4>
                                <Badge variant="secondary">{overlays.length}/2</Badge>
                            </div>
                            <div className="space-y-2">
                                {overlays.map((overlay, index) => (
                                    <div
                                        key={overlay.id}
                                        onClick={() => onOverlaySelect(overlay.id)}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${activeOverlayId === overlay.id
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
                                                    onOverlayRemove(overlay.id);
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
                        </div>
                    )}

                    {/* Style Controls */}
                    {activeOverlay ? (
                        <div>
                            <h4 className="font-medium mb-4">Style Controls</h4>
                            <SimpleTextControls
                                style={activeOverlay.style}
                                onStyleChange={(updates) => onOverlayStyleUpdate(activeOverlay.id, updates)}
                                scaleFactor={scaleFactor}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="font-medium">No text selected</p>
                            <p className="text-sm mt-1">Select a text layer above to edit its style</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}