/**
 * Shared GIF display page - displays a shared GIF by its ID
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Eye, 
  Calendar, 
  Sparkles, 
  Clock,
  Palette,
  Zap,
  Heart,
  Star,
  AlertTriangle,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { PageHeader, PageHeaderActions } from '@/components/layout/PageHeader';
import { SharingControls } from '@/components/gif/SharingControls';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import type { SharedGif } from '@/lib/types';

export default function SharedGifPage() {
  const params = useParams();
  const { toast } = useToast();
  const shareId = params.id as string;

  const [sharedGif, setSharedGif] = useState<SharedGif | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedGif = async () => {
      if (!shareId) {
        setError('Invalid share ID');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/share?id=${shareId}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.error || 'Failed to load shared GIF');
          return;
        }

        setSharedGif(result.data);
      } catch (err) {
        console.error('Error fetching shared GIF:', err);
        setError('Failed to load shared GIF');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedGif();
  }, [shareId]);

  const handleDownload = () => {
    if (!sharedGif) return;

    // Create a temporary link to download the processed GIF
    const link = document.createElement('a');
    link.href = sharedGif.gif.processedUrl;
    link.download = `${sharedGif.gif.title || 'shared-gif'}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Download started',
      description: 'Your GIF is being downloaded...',
    });
  };

  const copyCurrentUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied!',
        description: 'The share link has been copied to your clipboard.',
      });
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">Loading shared GIF...</p>
            <p className="text-sm text-gray-600">Preparing your amazing creation</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sharedGif) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-lg mx-auto">
          {/* 404 Hero Section */}
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Oops! GIF Not Found</h1>
            <p className="text-lg text-gray-600 mb-6">
              This shared GIF seems to have wandered off into the digital void
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 space-y-6">
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {error || 'This shared GIF could not be found or may have expired.'}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  Don't worry! Here are some things you can try:
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Check if the link was copied correctly
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    The GIF might have expired
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Create your own amazing GIF instead!
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full group hover:bg-gray-50 transition-all duration-200">
                    <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Back to Home
                  </Button>
                </Link>
                <Link href="/search" className="block">
                  <Button className="w-full group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                    <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Create New GIF
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Enhanced Header with Gradient */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-all duration-200">
              <div className="p-1 rounded-full group-hover:bg-purple-100 transition-colors">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              </div>
              <span className="font-semibold">Back to Home</span>
            </Link>
            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200 px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1 animate-pulse" />
              Shared GIF
            </Badge>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-6xl mx-auto">
            {/* Enhanced Title Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Featured Creation</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight">
                {sharedGif.metadata.title || 'Shared GIF'}
              </h1>
              
              {sharedGif.metadata.description && (
                <p className="text-xl md:text-2xl text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed">
                  {sharedGif.metadata.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">Created {new Date(sharedGif.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Shared Creation</span>
                </div>
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Palette className="h-4 w-4 text-pink-600" />
                  <span className="text-gray-700">{sharedGif.gif.textOverlays.length} Text Overlay{sharedGif.gif.textOverlays.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced GIF Display */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-pink-600/90 to-blue-600/90"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="relative">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-full">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <span className="truncate">{sharedGif.gif.title}</span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* GIF Display with Enhanced Styling */}
                  <div className="relative group">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-inner relative">
                      <img
                        src={sharedGif.gif.processedUrl}
                        alt={sharedGif.gif.title}
                        className="w-full h-auto max-h-96 object-contain transition-transform group-hover:scale-105 duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
                  </div>

                  {/* Enhanced GIF Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-blue-200 rounded-full">
                          <Eye className="h-3 w-3 text-blue-700" />
                        </div>
                        <p className="font-semibold text-blue-900 text-sm">Dimensions</p>
                      </div>
                      <p className="text-blue-800 font-mono text-lg">{sharedGif.gif.width} × {sharedGif.gif.height}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-green-200 rounded-full">
                          <Palette className="h-3 w-3 text-green-700" />
                        </div>
                        <p className="font-semibold text-green-900 text-sm">Text Overlays</p>
                      </div>
                      <p className="text-green-800 font-mono text-lg">{sharedGif.gif.textOverlays.length} overlay{sharedGif.gif.textOverlays.length !== 1 ? 's' : ''}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-purple-200 rounded-full">
                          <Clock className="h-3 w-3 text-purple-700" />
                        </div>
                        <p className="font-semibold text-purple-900 text-sm">Processing</p>
                      </div>
                      <p className="text-purple-800 font-mono text-lg">{sharedGif.gif.processingTime}ms</p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-pink-200 rounded-full">
                          <Zap className="h-3 w-3 text-pink-700" />
                        </div>
                        <p className="font-semibold text-pink-900 text-sm">File Size</p>
                      </div>
                      <p className="text-pink-800 font-mono text-lg">{Math.round(sharedGif.gif.fileSize / 1024)}KB</p>
                    </div>
                  </div>

                  {/* Enhanced Text Overlays Display */}
                  {sharedGif.gif.textOverlays.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-purple-600" />
                        <h3 className="font-bold text-gray-900 text-lg">Text Overlays</h3>
                      </div>
                      <div className="grid gap-3">
                        {sharedGif.gif.textOverlays.map((overlay) => (
                          <div key={overlay.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 mb-2 text-lg">"{overlay.text}"</p>
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    Position: {Math.round(overlay.position.x)}%, {Math.round(overlay.position.y)}%
                                  </Badge>
                                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Size: {overlay.style.fontSize}px
                                  </Badge>
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    Color: {overlay.style.color}
                                  </Badge>
                                </div>
                              </div>
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: overlay.style.color }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Enhanced Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button 
                      onClick={handleDownload} 
                      className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Download className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                      Download GIF
                    </Button>
                    <Button 
                      onClick={copyCurrentUrl} 
                      variant="outline" 
                      className="group border-2 hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Share2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Enhanced Sharing Controls */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl opacity-20 blur-sm"></div>
                <div className="relative">
                  <SharingControls gif={sharedGif.gif} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm" />
                </div>
              </div>

              {/* Enhanced Create Your Own Card */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <CardTitle className="text-lg flex items-center gap-2 relative">
                    <div className="p-2 bg-white/20 rounded-full">
                      <Heart className="h-5 w-5" />
                    </div>
                    Create Your Own
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Inspired by this creation? Join thousands of creators making amazing GIFs with custom text overlays!
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Search from millions of GIFs</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Add custom text overlays</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Share with friends instantly</span>
                    </div>
                  </div>

                  <Link href="/search" className="block">
                    <Button className="w-full group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Sparkles className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                      Start Creating
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    GIF Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{sharedGif.gif.width}px</p>
                      <p className="text-xs text-blue-700">Width</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{sharedGif.gif.height}px</p>
                      <p className="text-xs text-green-700">Height</p>
                    </div>
                  </div>
                  
                  <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">
                      {new Date(sharedGif.gif.processedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-purple-700">Created On</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}