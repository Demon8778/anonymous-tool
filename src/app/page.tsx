"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Type, Sparkles, Zap, Palette, Share2, Star, ArrowRight, Play, CheckCircle, Link2, Twitter, Facebook, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";

interface Gif {
  id: string;
  title: string;
  url: string;
  preview: string;
  width: number;
  height: number;
}

interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  size: number;
  color: string;
  isDragging: boolean;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([
    { id: '1', text: '', position: { x: 50, y: 50 }, size: 24, color: '#ffffff', isDragging: false },
    { id: '2', text: '', position: { x: 50, y: 80 }, size: 24, color: '#ffffff', isDragging: false }
  ]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const [activeTextId, setActiveTextId] = useState('1');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const activeDragIdRef = useRef<string | null>(null);

  const searchGifs = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search-gifs?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to search GIFs");
      }
      
      // Handle the new API response structure
      const results = data.success && data.data ? data.data.results : [];
      setGifs(results || []);
      if (results.length === 0) {
        toast.info("No GIFs found for your search term");
      }
    } catch (error) {
      toast.error("Failed to search GIFs. Please try again.");
      console.error("Error searching GIFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchGifs();
    }
  };

  const handleTextDragStart = (e: React.MouseEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    
    const textOverlay = textOverlays.find(t => t.id === textId);
    if (!textOverlay) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    dragOffsetRef.current = {
      x: x - textOverlay.position.x,
      y: y - textOverlay.position.y
    };
    
    activeDragIdRef.current = textId;
    
    // Update the dragging state
    setTextOverlays(prev => prev.map(t => 
      t.id === textId ? { ...t, isDragging: true } : t
    ));
    
    // Add global event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!activeDragIdRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const newX = Math.max(0, Math.min(100, x - dragOffsetRef.current.x));
    const newY = Math.max(0, Math.min(100, y - dragOffsetRef.current.y));
    
    setTextOverlays(prev => prev.map(t => 
      t.id === activeDragIdRef.current 
        ? { ...t, position: { x: newX, y: newY } }
        : t
    ));
  };

  const handleGlobalMouseUp = () => {
    if (!activeDragIdRef.current) return;
    
    setTextOverlays(prev => prev.map(t => 
      t.id === activeDragIdRef.current 
        ? { ...t, isDragging: false }
        : t
    ));
    
    activeDragIdRef.current = null;
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  };

  const updateTextOverlay = (textId: string, updates: Partial<TextOverlay>) => {
    setTextOverlays(prev => prev.map(t => 
      t.id === textId ? { ...t, ...updates } : t
    ));
  };

  const drawGifWithText = () => {
    if (!selectedGif || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      // Draw all text overlays
      textOverlays.forEach(overlay => {
        if (overlay.text.trim()) {
          ctx.font = `bold ${overlay.size}px Arial`;
          ctx.fillStyle = overlay.color;
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          const x = (overlay.position.x / 100) * canvas.width;
          const y = (overlay.position.y / 100) * canvas.height;
          
          ctx.strokeText(overlay.text, x, y);
          ctx.fillText(overlay.text, x, y);
        }
      });
    };
    img.src = selectedGif.url;
  };



  const downloadGif = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement("a");
    link.download = `gif-with-text-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    toast.success("GIF downloaded successfully!");
  };

  const generateShareableLink = () => {
    if (!canvasRef.current) return;
    
    // Convert canvas to base64
    const dataUrl = canvasRef.current.toDataURL();
    
    // Create a simple shareable link (in a real app, you'd upload this to a server)
    const shareData = {
      image: dataUrl,
      textOverlays: textOverlays.filter(t => t.text.trim()),
      timestamp: Date.now()
    };
    
    // For demo purposes, we'll create a base64 encoded link
    const encodedData = btoa(JSON.stringify(shareData));
    const link = `${window.location.origin}/shared?data=${encodedData}`;
    setShareableLink(link);
    setShowShareOptions(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const shareToSocial = (platform: string) => {
    if (!canvasRef.current) return;
    
    const text = encodeURIComponent(`Check out this GIF I made with ${textOverlays.filter(t => t.text.trim()).map(t => `"${t.text}"`).join(' and ')}!`);
    const url = encodeURIComponent(window.location.href);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Check out this GIF I made!&body=${text}%0A%0A${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  useEffect(() => {
    drawGifWithText();
    
    // Cleanup global event listeners on component unmount
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [selectedGif, textOverlays]);

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Search and customize GIFs in seconds with our powerful API integration"
    },
    {
      icon: <Palette className="h-8 w-8 text-purple-500" />,
      title: "Customizable Text",
      description: "Choose from multiple colors, sizes, and position text anywhere on your GIF"
    },
    {
      icon: <Share2 className="h-8 w-8 text-blue-500" />,
      title: "Instant Sharing",
      description: "Share your creations directly to social media or copy shareable links with one click"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              <Sparkles className="h-4 w-4 mr-2" />
              New Tool Available
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Create Stunning GIFs with Custom Text
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Transform any GIF into a personalized masterpiece. Add custom text, choose colors, and download in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Try It Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300"
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Amazing GIFs
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features that make GIF creation simple and fun
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section id="tool-section" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Start Creating Now
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search for any GIF and add your custom text overlay
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-6">
            {/* Search Section */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Search className="h-6 w-6" />
                  Search GIFs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for GIFs (e.g., happy birthday, celebration, funny)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-lg py-3"
                  />
                  <Button onClick={searchGifs} disabled={isLoading} className="px-6 py-3">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* GIF Results */}
            {gifs.length > 0 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
                  <CardTitle className="text-2xl">Search Results</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {gifs.map((gif) => (
                      <div
                        key={gif.id}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${
                          selectedGif?.id === gif.id ? "border-blue-500 shadow-lg" : "border-gray-200"
                        }`}
                        onClick={() => setSelectedGif(gif)}
                      >
                        <img
                          src={gif.preview}
                          alt={gif.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-2 bg-white">
                          <p className="text-xs text-gray-600 truncate">{gif.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Text Overlay Editor */}
            {selectedGif && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Type className="h-6 w-6" />
                      Text Overlay
                    </CardTitle>
                    <p className="text-green-100 text-sm">Customize your text and download as high-quality image</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Text Field Tabs */}
                    <div className="flex gap-2">
                      {textOverlays.map((overlay, index) => (
                        <Button
                          key={overlay.id}
                          variant={activeTextId === overlay.id ? "default" : "outline"}
                          onClick={() => setActiveTextId(overlay.id)}
                          className="flex-1"
                        >
                          Text {index + 1}
                        </Button>
                      ))}
                    </div>

                    {/* Active Text Field Controls */}
                    {textOverlays.map((overlay) => (
                      activeTextId === overlay.id && (
                        <div key={overlay.id} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block text-gray-700">
                              Text {textOverlays.findIndex(t => t.id === overlay.id) + 1}
                            </label>
                            <Input
                              placeholder="Enter your text..."
                              value={overlay.text}
                              onChange={(e) => updateTextOverlay(overlay.id, { text: e.target.value })}
                              className="text-lg py-3"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block text-gray-700">
                              Text Size: {overlay.size}px
                            </label>
                            <input
                              type="range"
                              min="12"
                              max="72"
                              value={overlay.size}
                              onChange={(e) => updateTextOverlay(overlay.id, { size: Number(e.target.value) })}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block text-gray-700">Text Color</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={overlay.color}
                                onChange={(e) => updateTextOverlay(overlay.id, { color: e.target.value })}
                                className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                              />
                              <div className="flex gap-2 flex-wrap">
                                {["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff"].map((color) => (
                                  <button
                                    key={color}
                                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                                      overlay.color === color ? "border-gray-800 shadow-lg" : "border-gray-300"
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateTextOverlay(overlay.id, { color })}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                    
                    <Button 
                      onClick={downloadGif} 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-3 rounded-lg font-semibold"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download GIF with Text
                    </Button>

                    {/* Share Section */}
                    <div className="space-y-4">
                      <Button 
                        onClick={generateShareableLink}
                        variant="outline" 
                        className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 text-lg py-3 rounded-lg font-semibold"
                      >
                        <Share2 className="h-5 w-5 mr-2" />
                        Share Your Creation
                      </Button>

                      {showShareOptions && (
                        <Card className="border-purple-200 bg-purple-50">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Link2 className="h-5 w-5 text-purple-600" />
                              <span className="font-semibold text-purple-800">Share Options</span>
                            </div>
                            
                            {/* Social Media Sharing */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                onClick={() => shareToSocial('twitter')}
                                variant="outline"
                                className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                              >
                                <Twitter className="h-4 w-4" />
                                Twitter
                              </Button>
                              <Button 
                                onClick={() => shareToSocial('facebook')}
                                variant="outline"
                                className="flex items-center gap-2 border-blue-600 text-blue-700 hover:bg-blue-50"
                              >
                                <Facebook className="h-4 w-4" />
                                Facebook
                              </Button>
                              <Button 
                                onClick={() => shareToSocial('whatsapp')}
                                variant="outline"
                                className="flex items-center gap-2 border-green-300 text-green-600 hover:bg-green-50"
                              >
                                <MessageCircle className="h-4 w-4" />
                                WhatsApp
                              </Button>
                              <Button 
                                onClick={() => shareToSocial('email')}
                                variant="outline"
                                className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                              >
                                <Mail className="h-4 w-4" />
                                Email
                              </Button>
                            </div>

                            {/* Copy Link */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-purple-700">Shareable Link:</label>
                              <div className="flex gap-2">
                                <Input 
                                  value={shareableLink}
                                  readOnly
                                  className="text-xs bg-white border-purple-200"
                                />
                                <Button 
                                  onClick={() => copyToClipboard(shareableLink)}
                                  variant="outline"
                                  size="sm"
                                  className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                >
                                  <Link2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="text-xs text-purple-600 text-center">
                              💡 Share your creation with friends and on social media!
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-xl">
                    <CardTitle className="text-2xl">Live Preview</CardTitle>
                    <p className="text-orange-100 text-sm">See your animated GIF with text overlay in real-time</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div
                      ref={containerRef}
                      className="relative bg-gray-100 rounded-lg overflow-hidden shadow-inner"
                      style={{ cursor: 'default' }}
                    >
                      {/* Show actual animated GIF */}
                      {selectedGif && (
                        <img
                          src={selectedGif.url}
                          alt="Selected GIF"
                          className="w-full h-auto max-h-96 object-contain"
                          style={{ display: 'block', pointerEvents: 'none' }}
                          draggable="false"
                        />
                      )}
                      
                      {/* Overlay text elements on the animated GIF */}
                      {textOverlays.map((overlay) => (
                        overlay.text && (
                          <div
                            key={overlay.id}
                            className={`absolute cursor-grab active:cursor-grabbing select-none ${
                              activeTextId === overlay.id ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                            }`}
                            style={{
                              left: `${overlay.position.x}%`,
                              top: `${overlay.position.y}%`,
                              transform: "translate(-50%, -50%)",
                              fontSize: `${overlay.size}px`,
                              color: overlay.color,
                              fontWeight: "bold",
                              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                              whiteSpace: "nowrap",
                              userSelect: "none",
                              WebkitUserSelect: "none",
                              MozUserSelect: "none",
                              msUserSelect: "none",
                              zIndex: activeTextId === overlay.id ? 10 : 1,
                            }}
                            onMouseDown={(e) => handleTextDragStart(e, overlay.id)}
                            onClick={() => setActiveTextId(overlay.id)}
                          >
                            {overlay.text}
                          </div>
                        )
                      ))}
                    </div>
                    
                    {/* Hidden canvas for download functionality */}
                    <canvas
                      ref={canvasRef}
                      className="hidden"
                      style={{ display: 'none' }}
                    />
                    
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      💡 Click and drag text to reposition. Click on text to select it for editing.
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      📸 Download creates a high-quality PNG image with text overlay
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Create Amazing GIFs?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of users who are already creating stunning GIFs with our tool
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => document.getElementById('tool-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Creating
                <Sparkles className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Star className="h-6 w-6 text-yellow-400" />
              <span className="text-xl font-bold">GIF Text Overlay</span>
            </div>
            <p className="text-gray-400 mb-4">
              Create stunning GIFs with custom text overlays. Fast, easy, and free to use.
            </p>
            <div className="flex justify-center gap-6 text-sm text-gray-400">
              <span>© 2024 GIF Text Overlay</span>
              <span>•</span>
              <span>Made with ❤️</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}