"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  gradient = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm",
        gradient && "bg-gradient-to-br from-background via-background to-muted/20",
        className
      )}
    >
      {/* Enhanced gradient overlay */}
      {gradient && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-primary/8" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/2 to-transparent" />
        </>
      )}

      {/* Content */}
      <div className="container relative flex flex-col items-start justify-between gap-6 py-responsive md:flex-row md:items-center md:gap-8">
        <div className="flex max-w-[980px] flex-col items-start gap-4 animate-fade-in">
          <h1 className="text-responsive-2xl font-bold leading-tight tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent hover:from-primary hover:via-primary hover:to-primary/80 transition-all duration-500">
              {title}
            </span>
          </h1>
          {description && (
            <p className="max-w-[750px] text-responsive-base text-muted-foreground leading-relaxed animate-fade-in-delay">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-2 animate-slide-in-right">
            {children}
          </div>
        )}
      </div>

      {/* Enhanced decorative elements */}
      {gradient && (
        <>
          <div className="absolute -top-32 right-0 h-64 w-64 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-3xl animate-float" />
          <div className="absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl animate-pulse-gentle" />
        </>
      )}
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background/50 to-transparent" />
    </div>
  );
}

interface PageHeaderActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeaderActions({ children, className }: PageHeaderActionsProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {children}
    </div>
  );
}

interface PageHeaderDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeaderDescription({ children, className }: PageHeaderDescriptionProps) {
  return (
    <p className={cn("max-w-[750px] text-lg text-muted-foreground sm:text-xl", className)}>
      {children}
    </p>
  );
}

interface PageHeaderHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export function PageHeaderHeading({ children, className }: PageHeaderHeadingProps) {
  return (
    <h1 className={cn(
      "text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl",
      className
    )}>
      <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
        {children}
      </span>
    </h1>
  );
}