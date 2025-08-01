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
        "relative overflow-hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        gradient && "bg-gradient-to-br from-background via-background to-muted/20",
        className
      )}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
      )}
      
      {/* Content */}
      <div className="container relative flex flex-col items-start justify-between gap-4 pb-8 pt-6 md:flex-row md:items-center md:pb-10 md:pt-8">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {description && (
            <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center space-x-2">
            {children}
          </div>
        )}
      </div>
      
      {/* Decorative elements */}
      {gradient && (
        <>
          <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
          <div className="absolute -bottom-24 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-primary/10 to-transparent blur-3xl" />
        </>
      )}
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