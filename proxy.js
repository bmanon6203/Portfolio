import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function proxy(request) {
  const url = request.nextUrl;
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin') {
    // Log toutes les cookies reçues
    const jwtToken = request.cookies.get('admin_jwt')?.value;
    try {
      jwt.verify(jwtToken, process.env.ADMIN_JWT_SECRET);
    } catch {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  } else if (url.pathname.startsWith('/api/entries')) {
    // Autorise l'accès public en GET, protège les autres méthodes
    if (request.method !== 'GET') {
      const jwtToken = request.cookies.get('admin_jwt')?.value;
      try {
        jwt.verify(jwtToken, process.env.ADMIN_JWT_SECRET);
      } catch {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/entries/:path*'],
};
