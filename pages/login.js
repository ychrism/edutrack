/**
 * Page de connexion
 * Interface d'authentification avec style attrayant
 */
'use client';

import { useState, useEffect } from 'react';
import { signIn, getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirect to homepage if already authenticated
  useEffect(() => {
    if (status === 'loading') {
      return; // Don't do anything while loading
    }
    
    if (session) {
      // Use window.location for a clean redirect that ensures the session is fully established
      window.location.href = '/';
    } else if (loginSuccess) {
      // If login was successful but we don't have a session yet, force a hard refresh
      window.location.href = '/';
    }
  }, [session, status, router, loginSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        
        // Provide more specific error messages based on the error
        if (result.error === "CredentialsSignin") {
          setError('Nom d\'utilisateur ou mot de passe incorrect');
        } else {
          setError(`Erreur d'authentification: ${result.error}`);
        }
      } else {
        try {
          // Set login success state to trigger the useEffect
          setLoginSuccess(true);
          
          // Force a session update - this is more reliable than router.replace
          const freshSession = await getSession();
          
          if (freshSession) {
            // Use window.location for a hard redirect
            window.location.href = '/';
          }
          // else: The useEffect will handle redirect since loginSuccess is true
        } catch (sessionError) {
          // Still set loginSuccess to true so the useEffect can try to redirect
          setLoginSuccess(true);
        }
      }
    } catch (error) {
      setError('Une erreur inattendue est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-black shadow-lg">
            ET
          </div>
          <h2 className="mt-6 text-4xl font-bold text-purple-800" style={{ fontFamily: 'Bangers, cursive' }}>
            EduTrack
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Système de gestion scolaire
          </p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-black">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 p-3 rounded-lg">
                {error ? error : 
                  router.query.error === 'CredentialsSignin' ? 'Nom d\'utilisateur ou mot de passe incorrect' : 
                  router.query.error === 'SessionRequired' ? 'Veuillez vous connecter pour accéder à cette page' :
                  router.query.error === 'AccessDenied' ? 'Accès refusé. Vous n\'avez pas les permissions requises' :
                  router.query.error ? `Erreur d'authentification: ${router.query.error}` : ''}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez votre nom d'utilisateur"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 border-2 border-black rounded-lg bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-lg hover:from-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Utilisateur par défaut: <span className="font-semibold">admin</span>
            </p>
            <p className="text-sm text-gray-600">
              Mot de passe: <span className="font-semibold">password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}