/**
 * Middleware pour protéger les routes
 * Redirige vers la page de connexion si non authentifié
 */
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
};