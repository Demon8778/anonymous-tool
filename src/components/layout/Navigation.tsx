"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Search, Wand2, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
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
import Image from "next/image";

const navigationItems = [
  {
    title: "Home",
    href: "/",
    description: "Welcome to CompressVerse",
    icon: Sparkles,
  },
  {
    title: "Generate",
    href: "/generate",
    description: "Search, customize, and create GIFs",
    icon: Wand2,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center px-responsive">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group transition-all duration-300 hover:scale-105">
            <Image src="/logo.svg" alt="Logo" width={40} height={40}/>
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
              CompressKit
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                {/* <Link href={item.href}> */}
                  <NavigationMenuLink
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "group relative overflow-hidden transition-all duration-300 hover:bg-accent/50 hover:scale-105 focus-ring",
                      pathname === item.href && "bg-accent text-accent-foreground shadow-sm"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
                    {item.title}
                    {pathname === item.href && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary to-primary/60 animate-scale-in" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </NavigationMenuLink>
                {/* </Link> */}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-accent/50 focus-ring touch-target md:hidden transition-all duration-200 hover:scale-105"
            >
              <Menu className="h-6 w-6 transition-transform duration-200 hover:rotate-3" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 glass border-r">
            <SheetHeader className="animate-fade-in">
              <SheetTitle className="flex items-center space-x-2 group">
                <Sparkles className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
                <span className="bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent">
                  CompressKit
                </span>
              </SheetTitle>
              <SheetDescription className="text-responsive-sm">
                Create amazing GIFs with custom text overlays
              </SheetDescription>
            </SheetHeader>
            <MobileNav items={navigationItems} pathname={pathname} setIsOpen={setIsOpen} />
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden group transition-all duration-300 hover:scale-105 focus-ring rounded-md p-1">
              <Sparkles className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent group-hover:from-primary/80 group-hover:to-primary transition-all duration-300">
                CompressKit
              </span>
            </Link>
          </div>
          <ThemeToggle />
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
  return (
    <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 animate-slide-in-left">
      <div className="flex flex-col space-y-2">
        {items.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-accent/80 hover:text-accent-foreground hover:scale-105 hover:shadow-sm focus-ring touch-target",
              pathname === item.href
                ? "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <item.icon className="mr-3 h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
            <div className="flex flex-col flex-1">
              <span className="text-responsive-sm font-semibold">{item.title}</span>
              <span className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                {item.description}
              </span>
            </div>
            {pathname === item.href && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse-gentle" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </Link>
        ))}
      </div>
      
      {/* Decorative gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}