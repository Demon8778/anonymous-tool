"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Copy, 
  X, 
  Facebook, 
  MessageCircle, 
  Mail, 
  ExternalLink, 
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useSharing } from '@/hooks/useSharing';
import type { ProcessedGif } from '@/lib/types/gif';
import type { SharingDialogProps, ShareResult } from '@/lib/types/dialog';
import { cn } from '@/lib/utils';
import { DESIGN_TOKENS } from '@/lib/constants/designTokens';

export function SharingDialog({ 
  gif, 
  isOpen, 
  onClose, 
  onShareComplete 
}: SharingDialogProps) {
  const { toast } = useToast();
  const {
    isCreatingLink,
    shareableLink,
    socialUrls,
    error,
    createShareableLink,
    copyToClipboard,
    reset
  } = useSharing();

  const [copiedLink, setCopiedLink] = useState(false);

  // Reset sharing state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Handle creating shareable link
  const handleCreateLink = useCallback(async () => {
    await createShareableLink(gif);
  }, [createShareableLink, gif]);

  // Handle copying link to clipboard
  const handleCopyLink = useCallback(async () => {
    if (!shareableLink) return;

    const success = await copyToClipboard(shareableLink.url);
    if (success) {
      setCopiedLink(true);
      toast({
        title: 'Link copied!',
        description: 'The shareable link has been copied to your clipboard.',
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy link to clipboard. Please try again.',
        variant: 'destructive',
      });
    }
  }, [shareableLink, copyToClipboard, toast]);

  // Handle social media sharing
  const handleSocialShare = useCallback((platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    toast({
      title: 'Opening share dialog',
      description: `Opening ${platform} share dialog...`,
    });
  }, [toast]);

  // Handle share completion
  const handleShareComplete = useCallback(() => {
    if (shareableLink && socialUrls) {
      const shareResult: ShareResult = {
        shareId: shareableLink.id,
        shareUrl: shareableLink.url,
        socialUrls
      };
      onShareComplete(shareResult);
    }
  }, [shareableLink, socialUrls, onShareComplete]);

  // Handle dialog close
  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className={cn(
          "max-w-md w-[95vw] p-0 gap-0",
          "bg-background border shadow-lg",
          // Mobile: full screen
          "sm:w-[95vw] sm:max-w-md",
          // Desktop: modal
          "lg:w-[500px] lg:max-w-[500px]"
        )}
      >
        {/* Header */}
        <DialogHeader className="bg-primary text-primary-foreground p-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your GIF
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80">
                Create a shareable link or share directly to social media
              </DialogDescription>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* GIF Preview */}
          <div className="bg-card border rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                <img
                  src={gif.preview || gif.processedUrl}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-card-foreground truncate">{gif.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {gif.textOverlays.length} text overlay{gif.textOverlays.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {gif.width} × {gif.height}
                </p>
              </div>
            </div>
          </div>

          {/* Create Link or Show Link */}
          {!shareableLink ? (
            <Button
              onClick={handleCreateLink}
              disabled={isCreatingLink}
              size="lg"
              className="w-full"
            >
              {isCreatingLink ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Link...
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-5 w-5" />
                  Create Shareable Link
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Shareable Link */}
              <div className="space-y-3">
                <Label htmlFor="share-link" className="text-base font-semibold">
                  Shareable Link
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="share-link"
                    value={shareableLink.url}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                  >
                    {copiedLink ? (
                      <Check className="h-4 w-4 text-primary animate-bounce" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="bg-muted border rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Expires:</span> {new Date(shareableLink.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Social Media Sharing */}
              {socialUrls && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Share on Social Media
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleSocialShare('X (Twitter)', socialUrls.twitter)}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      <span className="font-medium">X</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialShare('WhatsApp', socialUrls.whatsapp)}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span className="font-medium">WhatsApp</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialShare('Email', socialUrls.email)}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Email</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSocialShare('Reddit', socialUrls.reddit)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="font-medium">Reddit</span>
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={reset}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Create New Link
                </Button>
                <Button
                  onClick={handleShareComplete}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}