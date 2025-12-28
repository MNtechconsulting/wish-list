/**
 * Login page component
 * Provides user authentication interface with form validation
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { Logo } from '../components/Logo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-surface to-theme-primary/5 flex items-center justify-center px-4 theme-transition">
        <div className="max-w-md w-full">
          <div className="theme-surface rounded-2xl shadow-theme-large p-8 theme-transition">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="large" showText={true} />
              </div>
              <p className="text-theme-text-muted theme-transition">Inicia sesión en tu cuenta</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-theme-error/10 border border-theme-error/20 rounded-lg theme-transition">
                <p className="text-theme-error text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-theme-text-primary mb-2 theme-transition">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border theme-border rounded-lg focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-colors theme-transition"
                  placeholder="Ingresa tu correo"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-theme-text-primary mb-2 theme-transition">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border theme-border rounded-lg focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-colors theme-transition"
                  placeholder="Ingresa tu contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email || !password}
                className="w-full bg-theme-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-theme-primary/90 focus:ring-2 focus:ring-theme-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors theme-transition"
              >
                {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-theme-text-muted theme-transition">
                ¿No tienes una cuenta?{' '}
                <Link 
                  to="/register" 
                  className="text-theme-primary hover:text-theme-primary/80 font-medium theme-transition"
                >
                  Crea una aquí
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link 
                to="/" 
                className="text-theme-text-muted hover:text-theme-text-secondary text-sm theme-transition"
              >
                ← Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};