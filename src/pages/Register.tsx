/**
 * Register page component
 * Provides user registration interface with form validation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageTransition } from '../components/PageTransition';
import { Logo } from '../components/Logo';

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!email) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('Please enter a valid email address');
    }

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one letter and one number');
    }

    if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    clearError();

    try {
      console.log('🎯 Form submitted, attempting registration...');
      await register({ email, password });
      console.log('🎉 Registration successful, navigating to dashboard...');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('🚨 Registration failed in component:', error);
      // Error is handled by AuthContext and will be displayed
    } finally {
      setIsSubmitting(false);
    }
  };

  const allErrors = [...validationErrors, ...(error ? [error] : [])];

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
              <p className="text-theme-text-muted theme-transition">Únete para comenzar a rastrear tu lista de deseos</p>
            </div>

            {/* Error Messages */}
            {allErrors.length > 0 && (
              <div className="mb-6 p-4 bg-theme-error/10 border border-theme-error/20 rounded-lg theme-transition">
                <ul className="text-theme-error text-sm space-y-1">
                  {allErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Register Form */}
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
                  placeholder="Crea una contraseña"
                />
                <p className="mt-1 text-xs text-theme-text-muted theme-transition">
                  Debe tener al menos 8 caracteres con letras y números
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-theme-text-primary mb-2 theme-transition">
                  Confirmar Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border theme-border rounded-lg focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-colors theme-transition"
                  placeholder="Confirma tu contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-theme-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-theme-primary/90 focus:ring-2 focus:ring-theme-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors theme-transition"
              >
                {isSubmitting ? 'Creando Cuenta...' : 'Crear Cuenta'}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-theme-text-muted theme-transition">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-theme-primary hover:text-theme-primary/80 font-medium theme-transition"
                >
                  Inicia sesión aquí
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