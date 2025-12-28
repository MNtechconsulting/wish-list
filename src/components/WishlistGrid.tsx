import React from 'react';
import { WishlistItem } from '../types';
import { WishlistCard } from './WishlistCard';
import { PlusIcon } from './ui/Icons';
import { Button } from './ui/Button';
import { FadeTransition } from './PageTransition';

interface WishlistGridProps {
  items: WishlistItem[];
  onItemClick?: (id: string) => void;
  onAddItemClick?: () => void;
  emptyStateMessage?: string;
}

/**
 * WishlistGrid component displays wishlist items in a responsive grid layout
 * Handles empty state when no items exist
 * Implements responsive grid that adapts to different screen sizes
 * Enhanced with staggered animations for better UX
 * Requirements: 2.2, 7.4, 6.4
 */
export const WishlistGrid: React.FC<WishlistGridProps> = ({
  items,
  onItemClick,
  onAddItemClick,
  emptyStateMessage
}) => {
  // Empty state when no items exist
  if (items.length === 0) {
    return (
      <FadeTransition show={true}>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="text-center max-w-md">
            {/* Empty state illustration */}
            <div className="w-24 h-24 mx-auto mb-6 bg-theme-primary/10 rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 theme-transition">
              <PlusIcon className="w-12 h-12 text-theme-primary" />
            </div>
            
            {/* Empty state text */}
            <h3 className="text-xl font-semibold text-theme-text-primary mb-3">
              Tu lista está vacía
            </h3>
            <p className="text-theme-text-muted mb-8 leading-relaxed">
              {emptyStateMessage || "Comienza a rastrear productos que quieres comprar. Agrega artículos para monitorear sus precios y recibir notificaciones de las mejores ofertas."}
            </p>
            
            {/* Add first item button */}
            {onAddItemClick && (
              <Button
                variant="primary"
                size="lg"
                onClick={onAddItemClick}
                className="inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Agregar Primer Artículo
              </Button>
            )}
          </div>
        </div>
      </FadeTransition>
    );
  }

  // Grid layout with items
  return (
    <div className="space-y-6">
      {/* Grid header with add button */}
      <FadeTransition show={true}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-theme-text-primary">
              Tu Lista de Deseos
            </h2>
            <p className="text-theme-text-muted mt-1">
              {items.length} {items.length === 1 ? 'artículo' : 'artículos'} rastreados
            </p>
          </div>
          
          {onAddItemClick && (
            <Button
              variant="primary"
              onClick={onAddItemClick}
              className="inline-flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Agregar Artículo
            </Button>
          )}
        </div>
      </FadeTransition>

      {/* Responsive grid layout with staggered animations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item, index) => (
          <FadeTransition 
            key={item.id} 
            show={true} 
            delay={index * 100}
          >
            <WishlistCard
              item={item}
              onClick={onItemClick}
            />
          </FadeTransition>
        ))}
      </div>
    </div>
  );
};