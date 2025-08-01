/**
 * Sharing controls component for generated GIFs
 */

'use client';

import { useState } from 'react';
import { Share2, Copy, X, Facebook, MessageCircle, Mail, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSharing } from '@/hooks/useSharing';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { ProcessedGif } from '@/lib/types';

interface SharingControlsProps {
  gif: ProcessedGif;
  className?: string;
}

export function SharingControls({ gif, className }: SharingControlsProps) {
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

  const handleCreateLink = async () => {
    await createShareableLink(gif);
  };

  const handleCopyLink = async () => {
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
  };

  const handleSocialShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    toast({
      title: 'Opening share dialog',
      description: `Opening ${platform} share dialog...`,
    });
  };

  return (
    <Card className={cn('glass shadow-xl', className)}>
      <CardHeader className="animate-fade-in">
        <CardTitle className="flex items-center gap-2 text-responsive-base group">
          <Share2 className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
          <span className="gradient-text">Share Your GIF</span>
        </CardTitle>
        <CardDescription className="text-responsive-sm leading-relaxed">
          Create a shareable link or share directly to social media
        </CardDescription>
      </CardHeader>
      <CardContent className="space-responsive animate-fade-in-delay">
        {error && (
          <Alert variant="destructive" className="glass animate-slide-up">
            <AlertDescription className="text-responsive-sm">{error}</AlertDescription>
          </Alert>
        )}

        {!shareableLink ? (
          <Button
            onClick={handleCreateLink}
            disabled={isCreatingLink}
            size="lg"
            className="w-full group bg-gradient-to-r from-primary via-primary/90 to-primary hover:from-primary/90 hover:via-primary/80 hover:to-primary/90 transition-all duration-300 shadow-lg hover:shadow-2xl hover-lift focus-ring"
          >
            {isCreatingLink ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                <span className="text-responsive-sm font-semibold">Creating Link...</span>
              </>
            ) : (
              <>
                <Share2 className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-responsive-sm font-semibold">Create Shareable Link</span>
              </>
            )}
          </Button>
        ) : (
          <div className="space-responsive animate-slide-up">
            {/* Enhanced Shareable Link */}
            <div className="space-y-4">
              <Label htmlFor="share-link" className="text-responsive-base font-semibold text-foreground">Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  value={shareableLink.url}
                  readOnly
                  className="flex-1 glass focus:ring-2 focus:ring-primary/20 transition-all duration-200 font-mono text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="shrink-0 group hover:bg-green-50 hover:border-green-500 hover-lift focus-ring touch-target transition-all duration-300"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-green-600 animate-bounce-gentle" />
                  ) : (
                    <Copy className="h-4 w-4 group-hover:text-green-600 group-hover:scale-110 transition-all duration-200" />
                  )}
                </Button>
              </div>
              <div className="glass border border-border/50 rounded-lg p-4 bg-gradient-to-r from-muted/50 to-muted/30 animate-fade-in">
                <p className="text-responsive-sm text-foreground">
                  <span className="font-semibold">Expires:</span> {new Date(shareableLink.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Enhanced Social Media Sharing */}
            {socialUrls && (
              <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Label className="text-responsive-base font-semibold text-foreground">Share on Social Media</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('X (Twitter)', socialUrls.twitter)}
                    className="group flex items-center gap-2 hover:bg-foreground hover:text-background hover:border-foreground hover-lift focus-ring touch-target transition-all duration-300"
                  >
                    <X className="h-4 w-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200" />
                    <span className="text-responsive-sm font-medium">X</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('WhatsApp', socialUrls.whatsapp)}
                    className="group flex items-center gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary hover-lift focus-ring touch-target transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200" />
                    <span className="text-responsive-sm font-medium">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('Email', socialUrls.email)}
                    className="group flex items-center gap-2 hover:bg-muted hover:text-foreground hover:border-muted hover-lift focus-ring touch-target transition-all duration-300"
                  >
                    <Mail className="h-4 w-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200" />
                    <span className="text-responsive-sm font-medium">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('Reddit', socialUrls.reddit)}
                    className="group flex items-center gap-2 hover:bg-accent hover:text-accent-foreground hover:border-accent hover-lift focus-ring touch-target transition-all duration-300"
                  >
                    <ExternalLink className="h-4 w-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-200" />
                    <span className="text-responsive-sm font-medium">Reddit</span>
                  </Button>
                </div>
              </div>
            )}

            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

            {/* Enhanced Reset */}
            <Button
              variant="ghost"
              onClick={reset}
              className="w-full group hover:bg-accent/80 hover-lift focus-ring transition-all duration-300"
            >
              <Share2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-responsive-sm font-medium">Create New Link</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}