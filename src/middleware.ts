import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle legacy /search route redirect to /generate
  if (pathname === '/search') {
    const url = request.nextUrl.clone();
    url.pathname = '/generate';
    return NextResponse.redirect(url);
  }

  // Handle legacy /shared route redirect to /generate with shared parameter
  if (pathname === '/shared') {
    const url = request.nextUrl.clone();
    url.pathname = '/generate';
    
    // If there's a 'data' query parameter, convert it to 'shared'
    const dataParam = searchParams.get('data');
    if (dataParam) {
      url.searchParams.delete('data');
      url.searchParams.set('shared', dataParam);
    }
    
    return NextResponse.redirect(url);
  }

  // Handle legacy /shared/[id] route redirect to /generate?shared=[id]
  if (pathname.startsWith('/shared/')) {
    const shareId = pathname.replace('/shared/', '');
    const url = request.nextUrl.clone();
    url.pathname = '/generate';
    url.searchParams.set('shared', shareId);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/search',
    '/shared',
    '/shared/:path*',
  ],
};