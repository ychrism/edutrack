/**
 * API Route pour NextAuth.js
 * Point d'entrée pour toutes les requêtes d'authentification
 */
import NextAuth from 'next-auth';
import { authOptions } from '../../../lib/auth.js';

export default NextAuth(authOptions);