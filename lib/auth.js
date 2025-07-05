/**
 * Configuration NextAuth.js pour l'authentification
 * Gère les sessions et l'authentification par email/mot de passe
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import db from './database.js';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        return new Promise((resolve, reject) => {
          db.get(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [credentials.username, credentials.username],
            async (err, user) => {
              if (err) {
                reject(err);
                return;
              }

              if (!user) {
                resolve(null);
                return;
              }

              const isPasswordValid = await bcrypt.compare(
                credentials.password,
                user.password
              );

              if (!isPasswordValid) {
                resolve(null);
                return;
              }

              resolve({
                id: user.id.toString(),
                username: user.username,
                email: user.email,
                name: user.full_name,
                role: user.role,
                image: user.profile_picture
              });
            }
          );
        });
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 heures
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.username = token.username;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key'
};

export default NextAuth(authOptions);