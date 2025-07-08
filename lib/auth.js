/**
 * Configuration NextAuth.js pour l'authentification
 * Gère les sessions et l'authentification par email/mot de passe
 */
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import * as bcryptjs from 'bcryptjs';
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

        try {
          // Use a promise wrapper to enable async/await with the database
          const user = await new Promise((resolve, reject) => {
            db.get(
              'SELECT * FROM users WHERE username = ? OR email = ?',
              [credentials.username, credentials.username],
              (err, user) => {
                if (err) {
                  reject(err);
                  return;
                }

                if (!user) {
                  resolve(null);
                } else {
                  resolve(user);
                }
              }
            );
          });

          // If no user found, return null
          if (!user) {
            return null;
          }

          try {
            const isPasswordValid = await bcryptjs.compare(credentials.password, user.password);

            if (!isPasswordValid) {
              return null;
            }

            // Create user object with the required structure for NextAuth
            const userObject = {
              id: user.id.toString(),
              username: user.username,
              email: user.email,
              name: user.full_name, 
              role: user.role,
              image: user.profile_picture
            };
            
            return userObject;
          } catch (bcryptError) {
            // Keep only critical error logging
            console.error("Authentication error:", bcryptError);
            return null;
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 heures
    updateAge: 60 * 60, // 1 heure
  },
  // Simplified JWT configuration - let NextAuth handle encoding/decoding with NEXTAUTH_SECRET
  jwt: {
    maxAge: 24 * 60 * 60, // 24 heures
  },
  // Use top-level secret configuration
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      try {
        if (!user) {
          return false;
        }
        
        return true;
      } catch (error) {
        console.error("Sign-in process error:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      try {
        // Token validation and structure check
        if (!token) {
          return { error: "Invalid token" };
        }
        
        // When user object is provided (during sign in)
        if (user) {
          // Validate user object fields
          const validId = typeof user.id === 'string' || typeof user.id === 'number';
          const validUsername = typeof user.username === 'string';
          const validRole = typeof user.role === 'string';
          
          // Merge all user properties into token with explicit type checking
          token = {
            ...token,
            id: validId ? user.id.toString() : "unknown_id",
            role: validRole ? user.role : "user",
            username: validUsername ? user.username : "unknown_user",
            email: typeof user.email === 'string' ? user.email : token.email || null,
            name: typeof user.name === 'string' ? user.name : token.name || user.username || "Unknown User"
          };
        }
        return token;
      } catch (error) {
        console.error("JWT processing error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        // Token validation
        if (!token) {
          return session || { user: {}, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };
        }
        
        // Check for token error flag
        if (token.error) {
          return { 
            user: { error: token.error }, 
            expires: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Short expiry for error sessions
          };
        }
        
        // Validate token field types
        const tokenFields = {
          id: typeof token.id === 'string',
          role: typeof token.role === 'string',
          username: typeof token.username === 'string',
          email: token.email ? typeof token.email === 'string' : true,
          name: token.name ? typeof token.name === 'string' : true
        };
        
        // Ensure session.user exists
        if (!session || !session.user) {
          session = { user: {}, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() };
        }
        
        // Transfer all relevant properties from token to session with fallbacks
        session.user = {
          ...session.user,
          id: tokenFields.id ? token.id : "unknown_id",
          role: tokenFields.role ? token.role : "user",
          username: tokenFields.username ? token.username : "unknown_user",
          email: token.email && tokenFields.email ? token.email : session.user.email || "unknown@example.com",
          name: token.name && tokenFields.name ? token.name : session.user.name || token.username || "Unknown User"
        };
        
        return session;
      } catch (error) {
        console.error("Session handling error:", error);
        // Return a minimal valid session to prevent crashes
        return { 
          user: { 
            name: "Error User", 
            email: "error@example.com" 
          }, 
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
        };
      }
    }
  },
};

export default NextAuth(authOptions);