"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Search,
  Type,
  Download,
  Wand2,
  Rocket,
  Zap,
  Shield,
  Snowflake,
  LayoutGrid
} from "lucide-react";
import CategoryCarousel from "@/components/gif/CategoryCarousel";
import { StructuredData } from "@/components/seo/StructuredData";


export default function Home() {
  const router = useRouter();

  // Handle category selection from carousel
  const handleCategorySelect = (searchTerm: string) => {
    // Navigate to browse page with the search term as a query parameter
    router.push(`/generate?search=${encodeURIComponent(searchTerm)}`);
  };

  const features = [
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Smart GIF Search",
      description: "Find the perfect GIF from millions of options with our intelligent search powered by Tenor and Giphy APIs"
    },
    {
      icon: <Type className="h-8 w-8 text-primary" />,
      title: "Custom Text Overlays",
      description: "Add personalized text with full control over fonts, colors, positioning, and styling"
    },
    {
      icon: <Wand2 className="h-8 w-8 text-primary" />,
      title: "Real-time Processing",
      description: "Create animated GIFs with text overlays using advanced FFmpeg WASM technology"
    },
    {
      icon: <LayoutGrid className="h-8 w-8 text-primary" />,
      title: "Masonry Layout",
      description: "Beautiful Pinterest-style masonry layout that adapts to GIF dimensions for optimal visual flow"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Lightning Fast",
      description: "Optimized performance with infinite scrolling, lazy loading, and advanced caching for instant results"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy-first design"
    }
  ];



  return (
    <>
      <StructuredData type="WebApplication" />
      <StructuredData type="HowTo" />
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-muted/10 [background-size:50px_50px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10"></div>

        <div className="container mx-auto px-4 py-24 text-center relative z-10">
          <div className="max-w-6xl mx-auto">
            <Badge className="mb-6 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all duration-300 animate-fade-in">
              <Sparkles className="h-4 w-4 mr-2 animate-pulse-gentle" />
              Design Your Own Experience
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground animate-fade-in-delay">
              Create Stunning GIFs with Custom Text
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-4xl mx-auto leading-relaxed animate-fade-in-delay">
              Transform any GIF into a personalized masterpiece. Search millions of GIFs, add custom text overlays, and share your creations instantly with our powerful tools.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up">
              <Link href="/browse">
                <Button
                  size="lg"
                  className="hover:scale-105 text-lg px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group bg-primary text-primary-foreground"
                >
                  <Snowflake className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Creating
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-slide-up-delay">
        {stats.map((stat, index) => (
          <div key={index} className="text-center group hover:scale-105 transition-transform duration-300 p-4 rounded-lg hover:bg-muted/20">
            <div className="flex justify-center mb-3 text-primary group-hover:text-primary/80 transition-colors">
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div> */}
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-muted/10 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
      </section>


      {/* Features Section */}
      <section className="py-20 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary text-primary-foreground border-0 animate-fade-in">
              <Rocket className="h-4 w-4 mr-2" />
              Powerful Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-fade-in-delay">
              Everything You Need to Create Amazing GIFs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Professional-grade tools that make GIF creation simple, fast, and fun for everyone
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group text-center p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 border bg-card hover:bg-accent/5 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 group-hover:scale-110">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                    {feature.description}
                  </p>
                  <div className="pt-4">
                    <CheckCircle className="h-5 w-5 text-primary mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse-gentle"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-xl animate-pulse-gentle" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Example GIFs Showcase */}
      <CategoryCarousel onCategorySelect={handleCategorySelect} />

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent text-accent-foreground border-0 animate-fade-in">
              <CheckCircle className="h-4 w-4 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-fade-in-delay">
              Create Your GIF in 3 Easy Steps
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Our streamlined process makes GIF creation fast and intuitive
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Search & Select",
                description: "Browse millions of GIFs from Tenor and Giphy. Find the perfect one for your message.",
                icon: <Search className="h-8 w-8" />
              },
              {
                step: "2",
                title: "Customize Text",
                description: "Add your custom text with full control over fonts, colors, size, and positioning.",
                icon: <Type className="h-8 w-8" />
              },
              {
                step: "3",
                title: "Download & Share",
                description: "Create your animated GIF and share it instantly on social media or download it.",
                icon: <Download className="h-8 w-8" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center group animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-foreground group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  {step.icon}
                </div>
                <div className="text-6xl font-bold text-primary/20 mb-4 group-hover:text-primary/40 transition-colors">
                  {step.step}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-background/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30 transition-all duration-300 animate-fade-in">
              <Rocket className="h-4 w-4 mr-2" />
              Join Other Creators
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to Create Amazing GIFs?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Join a lot of creators who are already making stunning GIFs with our powerful tools
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-slide-up">
              <Link href="/generate">
                <Button
                  size="lg"
                  variant="secondary"
                  className="hover:scale-105 text-lg px-8 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Start Creating Now
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/generate">
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-foreground/80 animate-slide-up-delay">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span>No registration required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary-foreground/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary-foreground/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                  CompressVerse
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
                Create stunning animated GIFs with custom text overlays. The most powerful and easy-to-use GIF generator on the web.
              </p>
              {/* <div className="flex gap-4">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index} className="text-center p-3 rounded-lg bg-background/50">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { name: "Browse GIFs", href: "/generate" },
                ].map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">Features</h3>
              <div className="space-y-2">
                {[
                  "Text Overlays",
                  "Real-time Preview",
                  "Social Sharing",
                  "Mobile Friendly"
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-muted-foreground text-sm mb-4 md:mb-0">
              © 2025 CompressVerse. Made with ❤️ for creators everywhere.
            </div>
            {/* <div className="flex items-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="text-sm text-muted-foreground ml-2">Rated 4.9/5 by users</span>
            </div> */}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-accent/10 rounded-full blur-xl"></div>
      </footer>
    </div>
    </>
  );
}