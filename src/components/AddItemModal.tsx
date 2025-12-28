import React, { useState, useEffect } from 'react';
import { WishlistItem, WishlistCollection } from '../types';
import { Modal } from './ui/Modal';
import { AddItemForm } from './AddItemForm';
import { ProductSearch } from './ProductSearch';
import { FadeTransition } from './PageTransition';
import { Button } from './ui/Button';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: WishlistItem) => void;
  isSubmitting?: boolean;
  collections: WishlistCollection[];
  selectedCollection?: WishlistCollection | null;
  error?: string | null;
  onClearError?: () => void;
}

/**
 * AddItemModal component that integrates the AddItemForm with Modal
 * Handles modal display and form submission flow
 * Wires form to Add Item button on dashboard
 * Enhanced with loading states and success feedback
 * Requirements: 2.4, 3.1, 6.4
 */
export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  isSubmitting: externalSubmitting = false,
  collections,
  selectedCollection,
  error,
  onClearError
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'manual' | 'search'>('menu');
  const [prefilledData, setPrefilledData] = useState<Partial<WishlistItem> | null>(null);
  
  // Use external submitting state if provided, otherwise use internal state
  const isSubmitting = externalSubmitting;

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setCurrentView('menu');
      setPrefilledData(null);
      // Clear error when modal is closed
      if (onClearError) {
        onClearError();
      }
    }
  }, [isOpen, onClearError]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (item: WishlistItem) => {
    try {
      // Clear any previous errors
      if (onClearError) {
        onClearError();
      }
      
      // Call the parent's add item handler
      await onAddItem(item);
      
      // Show success state briefly if not using external submitting and no error occurred
      if (!externalSubmitting && !error) {
        setShowSuccess(true);
        
        // Close modal after success animation
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 1200);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
      // Error handling is managed by the parent component
      // Modal will remain open to show the error
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!isSubmitting && !showSuccess) {
      setShowSuccess(false);
      setCurrentView('menu');
      setPrefilledData(null);
      // Clear error when closing
      if (onClearError) {
        onClearError();
      }
      onClose();
    }
  };

  /**
   * Handle product selection from search
   */
  const handleProductSelect = (product: Partial<WishlistItem>) => {
    setPrefilledData(product);
    setCurrentView('manual');
  };

  /**
   * Get modal title based on current view
   */
  const getModalTitle = () => {
    if (showSuccess) return "¡Éxito!";
    switch (currentView) {
      case 'menu': return "Agregar Nuevo Artículo";
      case 'manual': return "Detalles del Artículo";
      case 'search': return "Buscar Productos";
      default: return "Agregar Nuevo Artículo";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
    >
      <div className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-theme-error/10 border border-theme-error/20 rounded-lg theme-transition">
            <div className="flex items-start justify-between">
              <p className="text-theme-error text-sm flex-1">{error}</p>
              {onClearError && (
                <button
                  onClick={onClearError}
                  className="ml-2 text-theme-error hover:text-theme-error/80 text-sm underline theme-transition"
                >
                  Cerrar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Menu View - Choose how to add item */}
        <FadeTransition show={currentView === 'menu' && !showSuccess}>
          <div className="space-y-4">
            <p className="text-theme-text-muted text-sm text-center">
              ¿Cómo te gustaría agregar tu artículo?
            </p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="primary"
                onClick={() => setCurrentView('search')}
                className="flex items-center justify-center gap-3 p-4 h-auto"
              >
                <div className="text-left">
                  <div className="font-semibold">🔍 Buscar Productos</div>
                  <div className="text-sm opacity-90">Encuentra productos de tiendas online</div>
                </div>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setCurrentView('manual')}
                className="flex items-center justify-center gap-3 p-4 h-auto"
              >
                <div className="text-left">
                  <div className="font-semibold">✏️ Agregar Manualmente</div>
                  <div className="text-sm opacity-90">Ingresa los detalles del producto tú mismo</div>
                </div>
              </Button>
            </div>
          </div>
        </FadeTransition>

        {/* Manual Entry View */}
        <FadeTransition show={currentView === 'manual' && !showSuccess}>
          <div className="space-y-4">
            {prefilledData && (
              <div className="p-3 bg-theme-success/10 border border-theme-success/20 rounded-lg theme-transition">
                <p className="text-theme-success text-sm">
                  ✅ Detalles del producto cargados desde la búsqueda. Puedes editarlos abajo.
                </p>
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCurrentView('menu');
                  setPrefilledData(null);
                }}
              >
                ← Atrás
              </Button>
              <span className="text-theme-text-muted text-sm">Agregar artículo manualmente</span>
            </div>
            
            <AddItemForm
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isSubmitting={isSubmitting}
              prefilledData={prefilledData}
              collections={collections}
              selectedCollection={selectedCollection}
            />
          </div>
        </FadeTransition>

        {/* Product Search View */}
        <FadeTransition show={currentView === 'search' && !showSuccess}>
          <ProductSearch
            onSelectProduct={handleProductSelect}
            onClose={() => setCurrentView('menu')}
          />
        </FadeTransition>

        {/* Success View */}
        <FadeTransition show={showSuccess}>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-theme-success/10 rounded-full flex items-center justify-center mx-auto mb-4 theme-transition">
              <svg className="w-8 h-8 text-theme-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-theme-text-primary mb-2">¡Artículo Agregado Exitosamente!</h3>
            <p className="text-theme-text-muted text-sm">
              Tu artículo ha sido agregado a tu lista de deseos y el seguimiento de precios ha comenzado.
            </p>
          </div>
        </FadeTransition>
      </div>
    </Modal>
  );
};