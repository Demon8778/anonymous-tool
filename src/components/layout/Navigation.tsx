"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, Wand2, Search } from "lucide-react";
// import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Home",
    href: "/",
    description: "Welcome to CompressVerse",
    icon: Sparkles,
  },
  {
    title: "Browse",
    href: "/browse",
    description: "Search and browse GIFs",
    icon: Search,
  },
  {
    title: "GIF Editor",
    href: "/gif-editor",
    description: "Create GIFs with custom text",
    icon: Wand2,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    // Detect if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-responsive">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group transition-all duration-300 hover:scale-105">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:from-primary/90 group-hover:to-primary/70 transition-all duration-300">
              <Sparkles className="h-6 w-6 text-primary-foreground group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
              CompressVerse
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Right aligned */}
        <div className="hidden md:flex ml-auto mr-4">
          <nav className="flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-300 group",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.title}
                {/* Active line */}
                {pathname === item.href && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-scale-in" />
                )}
                {/* Hover line */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between md:hidden">
          <Link
            href="/"
            className={cn(
              "flex items-center space-x-2 group transition-all duration-300 focus-ring rounded-md p-1",
              !isTouchDevice && "hover:scale-105"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center transition-all duration-300",
              !isTouchDevice && "group-hover:from-primary/90 group-hover:to-primary/70"
            )}>
              <Sparkles className={cn(
                "h-5 w-5 text-primary-foreground transition-transform duration-300",
                !isTouchDevice && "group-hover:rotate-12"
              )} />
            </div>
            <span className={cn(
              "font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent transition-all duration-300",
              !isTouchDevice && "group-hover:from-primary/80 group-hover:to-primary"
            )}>
              CompressVerse
            </span>
          </Link>

          {/* Mobile Navigation - Right side */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "px-0 text-base focus-ring touch-target transition-all duration-200",
                  !isTouchDevice && "hover:bg-accent/50 hover:scale-105"
                )}
              >
                <Menu className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  !isTouchDevice && "hover:rotate-3"
                )} />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="pb-0 glass border-b">
              <SheetHeader className="animate-fade-in">
                <SheetTitle className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:from-primary/90 group-hover:to-primary/70 transition-all duration-300">
                    <Sparkles className="h-5 w-5 text-primary-foreground group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                    CompressVerse
                  </span>
                </SheetTitle>
                <SheetDescription className="text-responsive-sm">
                  Create amazing GIFs with custom text overlays
                </SheetDescription>
              </SheetHeader>
              <MobileNav items={navigationItems} pathname={pathname} setIsOpen={setIsOpen} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

interface MobileNavProps {
  items: typeof navigationItems;
  pathname: string;
  setIsOpen: (open: boolean) => void;
}

function MobileNav({ items, pathname, setIsOpen }: MobileNavProps) {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return (
    <div className="my-4 pb-6 px-6 animate-slide-in-down">
      <div className="flex flex-col sm:flex-row sm:justify-center space-y-2 sm:space-y-0 sm:space-x-4">
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "group relative flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 focus-ring touch-target active:scale-95",
              pathname === item.href
                ? "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-sm"
                : "text-muted-foreground",
              // Only apply hover effects on non-touch devices
              !isTouchDevice && [
                "hover:bg-accent/80 hover:text-accent-foreground hover:scale-105 hover:shadow-sm",
                pathname !== item.href && "hover:text-foreground"
              ]
            )}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <item.icon className={cn(
              "mr-3 h-5 w-5 transition-all duration-300",
              !isTouchDevice && "group-hover:scale-110 group-hover:rotate-3"
            )} />
            <div className="flex flex-col flex-1">
              <span className="text-responsive-sm font-semibold">{item.title}</span>
              <span className={cn(
                "text-xs text-muted-foreground transition-colors",
                !isTouchDevice && "group-hover:text-muted-foreground/80"
              )}>
                {item.description}
              </span>
            </div>
            {pathname === item.href && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse-gentle" />
            )}
            {!isTouchDevice && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
            )}
          </Link>
        ))}
      </div>

      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}