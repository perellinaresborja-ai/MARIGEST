import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_marigest_key_2026";
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('marigest_session')?.value;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  if (!token) {
    if (isLoginPage) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, key);
    if (isLoginPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  } catch (error) {
    if (isLoginPage) return NextResponse.next();
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('marigest_session');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - logo.png (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|logo.png).*)',
  ],
};
