"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Search, Wand2, Share2 } from "lucide-react";

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

const navigationItems = [
  {
    title: "Home",
    href: "/",
    description: "Welcome to GIF Generator",
    icon: Sparkles,
  },
  {
    title: "Search",
    href: "/search",
    description: "Find the perfect GIF",
    icon: Search,
  },
  {
    title: "Generate",
    href: "/generate",
    description: "Create custom GIFs with text",
    icon: Wand2,
  },
  {
    title: "Shared",
    href: "/shared",
    description: "View shared GIFs",
    icon: Share2,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              GIF Generator
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "group relative overflow-hidden transition-all duration-300 hover:bg-accent/50",
                      pathname === item.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    {item.title}
                    {pathname === item.href && (
                      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                    )}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  GIF Generator
                </span>
              </SheetTitle>
              <SheetDescription>
                Create amazing GIFs with custom text overlays
              </SheetDescription>
            </SheetHeader>
            <MobileNav items={navigationItems} pathname={pathname} setIsOpen={setIsOpen} />
          </SheetContent>
        </Sheet>

        {/* Mobile Logo */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="flex items-center space-x-2 md:hidden">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                GIF Generator
              </span>
            </Link>
          </div>
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
    <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
      <div className="flex flex-col space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
            <div className="flex flex-col">
              <span>{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </div>
            {pathname === item.href && (
              <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}