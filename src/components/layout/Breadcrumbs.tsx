"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/generate": "Generate GIF",
};

interface BreadcrumbItem {
  href: string;
  label: string;
  isLast?: boolean;
  isHome: boolean;
}

export function Breadcrumbs({ className, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on home page
  if (pathname === "/") {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbItems: BreadcrumbItem[] = [];

  // Add home if requested
  if (showHome) {
    breadcrumbItems.push({
      href: "/",
      label: "Home",
      isHome: true,
    });
  }

  // Build breadcrumb items from path segments
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    
    // Get label from routeLabels or format segment
    let label = routeLabels[currentPath];
    if (!label) {
      // Format segment: remove hyphens, capitalize words
      label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    breadcrumbItems.push({
      href: currentPath,
      label,
      isLast,
      isHome: false,
    });
  });

  return (
    <div className={cn("container py-2", className)}>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage className="flex items-center">
                    {item.isHome && <Home className="mr-1 h-3 w-3" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link 
                      href={item.href}
                      className="flex items-center transition-colors hover:text-foreground"
                    >
                      {item.isHome && <Home className="mr-1 h-3 w-3" />}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && (
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}