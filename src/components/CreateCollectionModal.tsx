/**
 * Create Collection Modal Component
 * Modal for creating new wishlist collections
 */

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CreateCollectionFormData, FormValidationErrors } from '../types';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCollectionFormData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateCollectionFormData>({
    name: '',
    description: '',
    color: '#8B6F47', // Default earth theme color
    isDefault: false
  });
  
  const [errors, setErrors] = useState<FormValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormValidationErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length > 100) {
      newErrors.name = 'El nombre no puede exceder 100 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = 'El color debe ser un código hex válido (ej: #FF5733)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        color: '#8B6F47',
        isDefault: false
      });
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      color: '#8B6F47',
      isDefault: false
    });
    setErrors({});
    onClose();
  };

  const colorOptions = [
    { value: '#8B6F47', name: 'Café (Tierra)' },
    { value: '#A0522D', name: 'Sienna' },
    { value: '#CD853F', name: 'Dorado Arena' },
    { value: '#6B8E23', name: 'Verde Oliva' },
    { value: '#708090', name: 'Gris Pizarra' },
    { value: '#B8860B', name: 'Dorado Oscuro' },
    { value: '#8FBC8F', name: 'Verde Mar' },
    { value: '#D2691E', name: 'Chocolate' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Crear Nueva Lista">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Collection Name */}
        <Input
          label="Nombre de la Lista"
          type="text"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="Ej: Regalos de Navidad, Electrónicos, etc."
          error={errors.name}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-theme-text-primary mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el propósito de esta lista..."
            rows={3}
            className="w-full px-4 py-3 border theme-border rounded-lg focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary transition-colors theme-transition resize-none"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-theme-error">{errors.description}</p>
          )}
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-theme-text-primary mb-2">
            Color del Tema
          </label>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`
                  relative w-full h-12 rounded-lg border-2 transition-all duration-200
                  ${formData.color === color.value 
                    ? 'border-theme-primary ring-2 ring-theme-primary/20' 
                    : 'border-theme-border hover:border-theme-primary/50'
                  }
                `}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {formData.color === color.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          {errors.color && (
            <p className="mt-1 text-sm text-theme-error">{errors.color}</p>
          )}
        </div>

        {/* Default Collection Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
            className="w-4 h-4 text-theme-primary bg-theme-surface border-theme-border rounded focus:ring-theme-primary/20 focus:ring-2"
          />
          <label htmlFor="isDefault" className="ml-2 text-sm text-theme-text-primary">
            Establecer como lista predeterminada
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            Crear Lista
          </Button>
        </div>
      </form>
    </Modal>
  );
};