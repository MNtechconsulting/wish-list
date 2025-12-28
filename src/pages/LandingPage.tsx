import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { FadeTransition } from '../components/PageTransition';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';

/**
 * Landing Page Component
 * 
 * Displays the app's welcome screen with:
 * - Prominent app name with clean typography
 * - Value proposition describing app benefits
 * - Call-to-action button navigating to dashboard
 * - Responsive design for mobile and desktop
 * - Pastel gradient background
 * - Enhanced with smooth animations
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.4
 */
export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-background via-theme-surface to-theme-primary/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 theme-transition">
      <div className="max-w-4xl mx-auto text-center">
        {/* App Name - Prominent display with clean typography */}
        <FadeTransition show={true} delay={100}>
          <div className="flex justify-center mb-8">
            <Logo size="large" showText={true} />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-theme-text-primary mb-6 leading-tight theme-transition">
            Refleja tus deseos
          </h2>
        </FadeTransition>
        
        {/* Value Proposition - Clear description of app benefits */}
        <FadeTransition show={true} delay={300}>
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-xl sm:text-2xl text-theme-text-secondary mb-6 leading-relaxed theme-transition">
              Rastrea los productos que deseas, monitorea las tendencias de precios y nunca te pierdas una gran oferta.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-theme-text-muted theme-transition">
              <FadeTransition show={true} delay={500}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-theme-accent/10 rounded-xl flex items-center justify-center mb-3 transform transition-all duration-200 hover:scale-110 theme-transition">
                    <span className="text-2xl">📋</span>
                  </div>
                  <p className="text-sm font-medium">Organiza tu Lista de Deseos</p>
                </div>
              </FadeTransition>
              
              <FadeTransition show={true} delay={600}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-theme-secondary/10 rounded-xl flex items-center justify-center mb-3 transform transition-all duration-200 hover:scale-110 theme-transition">
                    <span className="text-2xl">📈</span>
                  </div>
                  <p className="text-sm font-medium">Monitorea Tendencias de Precios</p>
                </div>
              </FadeTransition>
              
              <FadeTransition show={true} delay={700}>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-theme-primary/10 rounded-xl flex items-center justify-center mb-3 transform transition-all duration-200 hover:scale-110 theme-transition">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-sm font-medium">Ahorra Dinero</p>
                </div>
              </FadeTransition>
            </div>
          </div>
        </FadeTransition>
        
        {/* Call-to-Action Button */}
        <FadeTransition show={true} delay={800}>
          <div className="space-y-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              className="px-8 py-4 text-xl shadow-theme-large hover:shadow-theme-large transform hover:scale-105 transition-all duration-200"
            >
              {isAuthenticated ? 'Ir al Panel' : 'Comenzar'}
            </Button>
            
            {!isAuthenticated && (
              <div className="space-y-2">
                <p className="text-sm text-theme-text-muted theme-transition">
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-theme-primary hover:text-theme-primary/80 font-medium underline theme-transition"
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            )}
          </div>
        </FadeTransition>
      </div>
    </div>
  );
};