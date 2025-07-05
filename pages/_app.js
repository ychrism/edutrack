/**
 * Configuration principale de l'application Next.js
 * Gère les sessions et les styles globaux
 */
import '../app/globals.css';
import { SessionProvider } from 'next-auth/react';

export default function App({ Component, pageProps: { session, ...pageProps } }) {

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}