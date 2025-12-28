/**
 * MiraWish Logo Component
 * Logo using PNG image with responsive sizing
 */

import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
  logoSrc?: string; // Permite personalizar la imagen
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'large', 
  showText = true, 
  className = '',
  logoSrc = '/logo.png' // Ruta por defecto - cambia aquí el nombre de tu archivo
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo PNG Image */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <img
          src={logoSrc}
          alt="MiraWish Logo"
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback en caso de que la imagen no se encuentre
            console.warn(`Logo image not found: ${logoSrc}`);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      
      {/* App Name */}
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-theme-text-primary ${textSizeClasses[size]} leading-tight`}>
            MiraWish
          </h1>
          {size === 'large' && (
            <p className="text-sm text-theme-text-muted -mt-1">
              Refleja tus deseos
            </p>
          )}
        </div>
      )}
    </div>
  );
};