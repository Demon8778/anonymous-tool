"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  CheckCircle, 
  Search,
  Type,
  Download,
  Star,
  Heart,
  Users,
  Wand2,
  Globe,
  Smartphone,
  Rocket
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Search className="h-8 w-8 text-blue-500" />,
      title: "Smart GIF Search",
      description: "Find the perfect GIF from millions of options with our intelligent search powered by Tenor and Giphy APIs"
    },
    {
      icon: <Type className="h-8 w-8 text-purple-500" />,
      title: "Custom Text Overlays",
      description: "Add personalized text with full control over fonts, colors, positioning, and styling"
    },
    {
      icon: <Wand2 className="h-8 w-8 text-green-500" />,
      title: "Real-time Processing",
      description: "Generate animated GIFs with text overlays using advanced FFmpeg WASM technology"
    }
  ];

  const stats = [
    { icon: <Users className="h-6 w-6" />, value: "10K+", label: "Active Users" },
    { icon: <Star className="h-6 w-6" />, value: "50K+", label: "GIFs Created" },
    { icon: <Heart className="h-6 w-6" />, value: "99%", label: "Satisfaction" },
    { icon: <Globe className="h-6 w-6" />, value: "24/7", label: "Available" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300 animate-pulse">
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              ✨ AI-Powered GIF Generator
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100">
              Create Stunning GIFs with Custom Text
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transform any GIF into a personalized masterpiece. Search millions of GIFs, add custom text overlays, and share your creations instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/search">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Search className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Creating
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/generate">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 group"
                >
                  <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Try Generator
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-2 text-white/80 group-hover:text-white transition-colors">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section> 
     {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <Rocket className="h-4 w-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Everything You Need to Create Amazing GIFs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional-grade tools that make GIF creation simple, fast, and fun for everyone
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group text-center p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50 hover:from-white hover:to-blue-50/30">
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-purple-100 transition-all duration-300 group-hover:scale-110">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-800 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                  <div className="pt-4">
                    <CheckCircle className="h-5 w-5 text-green-500 mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl"></div>
      </section>    
  {/* Example GIFs Showcase */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              <Star className="h-4 w-4 mr-2" />
              Popular Examples
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
              See What Others Are Creating
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get inspired by these amazing GIF creations from our community
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
            {[
              { id: "1", title: "Celebration GIF", category: "Celebration" },
              { id: "2", title: "Funny Reaction", category: "Reaction" },
              { id: "3", title: "Success Animation", category: "Success" },
              { id: "4", title: "Happy Dance", category: "Dance" }
            ].map((gif, index) => (
              <Card key={gif.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white">
                <div className="relative overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">{gif.title}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {gif.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Example GIF</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">4.9</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/search">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
                <Search className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Browse All GIFs
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>      
{/* How It Works Section */}
      <section className="py-20 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
              <CheckCircle className="h-4 w-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 bg-clip-text text-transparent">
              Create Your GIF in 3 Easy Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our streamlined process makes GIF creation fast and intuitive
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Search & Select",
                description: "Browse millions of GIFs from Tenor and Giphy. Find the perfect one for your message.",
                icon: <Search className="h-8 w-8" />,
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "2", 
                title: "Customize Text",
                description: "Add your custom text with full control over fonts, colors, size, and positioning.",
                icon: <Type className="h-8 w-8" />,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "3",
                title: "Download & Share",
                description: "Generate your animated GIF and share it instantly on social media or download it.",
                icon: <Download className="h-8 w-8" />,
                color: "from-green-500 to-emerald-500"
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {step.icon}
                </div>
                <div className={`text-6xl font-bold bg-gradient-to-br ${step.color} bg-clip-text text-transparent mb-4 opacity-20 group-hover:opacity-40 transition-opacity`}>
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>     
 {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300">
              <Rocket className="h-4 w-4 mr-2" />
              Join 10K+ Creators
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-100">
              Ready to Create Amazing GIFs?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join thousands of creators who are already making stunning GIFs with our powerful tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/search">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 hover:scale-105 text-lg px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Creating Now
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/generate">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 group"
                >
                  <Wand2 className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Try Generator
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>  
    {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  GIF Generator
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
                Create stunning animated GIFs with custom text overlays. The most powerful and easy-to-use GIF generator on the web.
              </p>
              <div className="flex gap-4">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { name: "Search GIFs", href: "/search" },
                  { name: "Generate", href: "/generate" },
                  { name: "Shared GIFs", href: "/shared" },
                ].map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href}
                    className="block text-gray-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Features</h3>
              <div className="space-y-2">
                {[
                  "Text Overlays",
                  "Real-time Preview", 
                  "Social Sharing",
                  "Mobile Friendly"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 GIF Generator. Made with ❤️ for creators everywhere.
            </div>
            <div className="flex items-center gap-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="text-sm text-gray-400 ml-2">Rated 4.9/5 by users</span>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
      </footer>
    </div>
  );
}