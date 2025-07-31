"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface SharedGifData {
  gifUrl: string;
  text: string;
  textColor: string;
  textSize: number;
  textPosition: { x: number; y: number };
  timestamp: number;
}

function SharedPageContent() {
  const [gifData, setGifData] = useState<SharedGifData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const searchParams = useSearchParams();
  const dataParam = searchParams.get('data');

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = JSON.parse(atob(dataParam));
        setGifData(decodedData);
      } catch (err) {
        setError("Invalid share link");
        console.error("Error decoding shared data:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setError("No share data found");
      setLoading(false);
    }
  }, [dataParam]);

  const downloadImage = () => {
    if (!gifData) return;
    
    // Create a canvas to draw the GIF with text overlay
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      if (gifData.text.trim()) {
        ctx.font = `bold ${gifData.textSize}px Arial`;
        ctx.fillStyle = gifData.textColor;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const x = (gifData.textPosition.x / 100) * canvas.width;
        const y = (gifData.textPosition.y / 100) * canvas.height;
        
        ctx.strokeText(gifData.text, x, y);
        ctx.fillText(gifData.text, x, y);
      }
      
      const link = document.createElement("a");
      link.download = `shared-gif-${gifData.timestamp}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Image downloaded successfully!");
    };
    img.src = gifData.gifUrl;
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Share link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared GIF...</p>
        </div>
      </div>
    );
  }

  if (error || !gifData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">{error || "Failed to load shared GIF"}</p>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Creator
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Back to Creator</span>
            </Link>
            <Badge className="bg-blue-100 text-blue-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Shared GIF
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Shared GIF Creation
            </h1>
            <p className="text-xl text-gray-600">
              Someone shared this amazing GIF with custom text!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* GIF Display */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
                <CardTitle className="text-2xl">Shared Creation</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow-inner relative">
                  {/* Show actual animated GIF */}
                  <img
                    src={gifData.gifUrl}
                    alt="Shared GIF with text overlay"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  
                  {/* Show text overlay on the GIF */}
                  {gifData.text && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: `${gifData.textPosition.x}%`,
                        top: `${gifData.textPosition.y}%`,
                        transform: "translate(-50%, -50%)",
                        fontSize: `${gifData.textSize}px`,
                        color: gifData.textColor,
                        fontWeight: "bold",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {gifData.text}
                    </div>
                  )}
                </div>
                {gifData.text && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      Text Overlay: "{gifData.text}"
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Color: {gifData.textColor} | Size: {gifData.textSize}px
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
                <CardTitle className="text-2xl">Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">Download & Share</h3>
                  <p className="text-sm text-gray-600">
                    Save this creation with text overlay or share it with others
                  </p>
                </div>

                <Button 
                  onClick={downloadImage}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-3 rounded-lg font-semibold"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Image with Text
                </Button>

                <Button 
                  onClick={copyShareLink}
                  variant="outline"
                  className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 text-lg py-3 rounded-lg font-semibold"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Copy Share Link
                </Button>

                <div className="pt-4 border-t">
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Your Own GIF
                    </Button>
                  </Link>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Created on {new Date(gifData.timestamp).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared GIF...</p>
        </div>
      </div>
    }>
      <SharedPageContent />
    </Suspense>
  );
}