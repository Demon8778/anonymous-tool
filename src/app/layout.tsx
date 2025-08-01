import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Navigation } from "@/components/layout/Navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GIF Generator - Create Amazing GIFs with Text Overlays",
  description: "Create stunning animated GIFs with custom text overlays. Search, customize, and share your creations with our powerful GIF generator.",
  keywords: ["GIF generator", "text overlay", "animated GIFs", "meme generator", "custom GIFs", "social media"],
  authors: [{ name: "GIF Generator Team" }],
  openGraph: {
    title: "GIF Generator - Create Amazing GIFs with Text Overlays",
    description: "Create stunning animated GIFs with custom text overlays",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GIF Generator - Create Amazing GIFs with Text Overlays",
    description: "Create stunning animated GIFs with custom text overlays",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary level="critical">
            <div className="relative flex min-h-screen flex-col">
              <ErrorBoundary level="component">
                <Navigation />
              </ErrorBoundary>
              {/* <ErrorBoundary level="component">
                <Breadcrumbs />
              </ErrorBoundary> */}
              <main className="flex-1">
                <ErrorBoundary level="page">
                  {children}
                </ErrorBoundary>
              </main>
            </div>
            <Toaster />
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
