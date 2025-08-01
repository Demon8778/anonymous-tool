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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your GIF
        </CardTitle>
        <CardDescription>
          Create a shareable link or share directly to social media
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!shareableLink ? (
          <Button
            onClick={handleCreateLink}
            disabled={isCreatingLink}
            className="w-full group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isCreatingLink ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating Link...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                Create Shareable Link
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Enhanced Shareable Link */}
            <div className="space-y-3">
              <Label htmlFor="share-link" className="text-base font-semibold">Shareable Link</Label>
              <div className="flex gap-2">
                <Input
                  id="share-link"
                  value={shareableLink.url}
                  readOnly
                  className="flex-1 bg-gray-50 border-gray-200 focus:border-purple-500 transition-colors"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="shrink-0 group hover:bg-green-50 hover:border-green-500 transition-all duration-200"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-green-600 animate-pulse" />
                  ) : (
                    <Copy className="h-4 w-4 group-hover:text-green-600 group-hover:scale-110 transition-all" />
                  )}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Expires:</span> {new Date(shareableLink.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <Separator />

            {/* Enhanced Social Media Sharing */}
            {socialUrls && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Share on Social Media</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('X (Twitter)', socialUrls.twitter)}
                    className="group flex items-center gap-2 hover:bg-black hover:text-white hover:border-black transition-all duration-200"
                  >
                    <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    X
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('Facebook', socialUrls.facebook)}
                    className="group flex items-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
                  >
                    <Facebook className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('WhatsApp', socialUrls.whatsapp)}
                    className="group flex items-center gap-2 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-200"
                  >
                    <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('Email', socialUrls.email)}
                    className="group flex items-center gap-2 hover:bg-gray-600 hover:text-white hover:border-gray-600 transition-all duration-200"
                  >
                    <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare('Reddit', socialUrls.reddit)}
                    className="group flex items-center gap-2 col-span-2 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all duration-200"
                  >
                    <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Reddit
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Enhanced Reset */}
            <Button
              variant="ghost"
              onClick={reset}
              className="w-full group hover:bg-gray-100 transition-all duration-200"
            >
              <Share2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
              Create New Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}