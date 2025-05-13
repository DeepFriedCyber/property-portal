import { clerkMiddleware, createRouteMatcher, auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in',
  '/sign-up',
  '/search',
  '/api/search',
  '/api/status',
]);

export default clerkMiddleware(async (_, request) => {
  if (isPublicRoute(request) || (await auth()).userId) {
    return NextResponse.next();
  }
  
  const signInUrl = new URL('/sign-in', request.url);
  signInUrl.searchParams.set('redirect_url', request.url);
  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};