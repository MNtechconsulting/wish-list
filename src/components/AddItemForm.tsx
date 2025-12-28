import React, { useState, useEffect } from 'react';
import { WishlistItem, AddItemFormData, FormValidationErrors, WishlistCollection } from '../types';
import { Input } from './ui/Input';
import { Select, SelectOption } from './ui/Select';
import { Button } from './ui/Button';
import { createWishlistItem, sanitizeItemName } from '../utils';

interface AddItemFormProps {
  onSubmit: (item: WishlistItem) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  prefilledData?: Partial<WishlistItem> | null;
  collections: WishlistCollection[];
  selectedCollection?: WishlistCollection | null;
}

/**
 * AddItemForm component with validation
 * Builds form with product name and price input fields
 * Implements real-time validation for empty/invalid inputs
 * Styles inputs with pastel accent colors
 * Requirements: 3.1, 3.2, 3.3, 3.5, 3.6
 */
export const AddItemForm: React.FC<AddItemFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  prefilledData = null,
  collections,
  selectedCollection
}) => {
  const [formData, setFormData] = useState<AddItemFormData>({
    name: prefilledData?.name || '',
    price: prefilledData?.currentPrice?.toString() || '',
    productUrl: prefilledData?.productUrl || '',
    collectionId: selectedCollection?.id || ''
  });

  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [touched, setTouched] = useState<{ name: boolean; price: boolean; productUrl: boolean; collectionId: boolean }>({
    name: false,
    price: false,
    productUrl: false,
    collectionId: false
  });

  const [isExtractingFromUrl, setIsExtractingFromUrl] = useState(false);

  // Update form data when prefilled data or selected collection changes
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        name: prefilledData.name || '',
        price: prefilledData.currentPrice?.toString() || '',
        productUrl: prefilledData.productUrl || ''
      }));
    }
  }, [prefilledData]);

  useEffect(() => {
    if (selectedCollection && !formData.collectionId) {
      setFormData(prev => ({
        ...prev,
        collectionId: selectedCollection.id
      }));
    }
  }, [selectedCollection, formData.collectionId]);

  /**
   * Try to extract product information from URL
   */
  const extractProductFromUrl = async (url: string) => {
    if (!url.trim()) return;
    
    setIsExtractingFromUrl(true);
    
    try {
      // Simple extraction based on URL patterns
      const urlObj = new URL(url);
      let extractedName = '';
      
      // Amazon URL pattern
      if (urlObj.hostname.includes('amazon')) {
        const pathParts = urlObj.pathname.split('/');
        const productIndex = pathParts.findIndex(part => part === 'dp' || part === 'gp');
        if (productIndex > 0 && pathParts[productIndex - 1]) {
          extractedName = pathParts[productIndex - 1].replace(/-/g, ' ');
        }
      }
      
      // eBay URL pattern
      else if (urlObj.hostname.includes('ebay')) {
        const pathParts = urlObj.pathname.split('/');
        const itemIndex = pathParts.findIndex(part => part === 'itm');
        if (itemIndex > 0 && pathParts[itemIndex - 1]) {
          extractedName = pathParts[itemIndex - 1].replace(/-/g, ' ');
        }
      }
      
      // Generic extraction from URL path
      else {
        const pathParts = urlObj.pathname.split('/').filter(part => part.length > 3);
        if (pathParts.length > 0) {
          extractedName = pathParts[pathParts.length - 1]
            .replace(/[-_]/g, ' ')
            .replace(/\.(html|php|aspx?)$/i, '');
        }
      }
      
      // Clean up the extracted name
      if (extractedName) {
        extractedName = extractedName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
          .substring(0, 100); // Limit length
        
        // Update form data if name is empty
        if (!formData.name.trim()) {
          setFormData(prev => ({ ...prev, name: extractedName }));
        }
      }
      
    } catch (error) {
      console.log('Could not extract product info from URL:', error);
    } finally {
      setIsExtractingFromUrl(false);
    }
  };
  const validateForm = (data: AddItemFormData): FormValidationErrors => {
    const newErrors: FormValidationErrors = {};

    // Validate product name
    if (!data.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'El nombre del producto debe tener al menos 2 caracteres';
    } else if (data.name.trim().length > 100) {
      newErrors.name = 'El nombre del producto debe tener menos de 100 caracteres';
    }

    // Validate price
    if (!data.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const priceNumber = parseFloat(data.price);
      if (isNaN(priceNumber)) {
        newErrors.price = 'El precio debe ser un número válido';
      } else if (priceNumber <= 0) {
        newErrors.price = 'El precio debe ser mayor que 0';
      } else if (priceNumber > 999999) {
        newErrors.price = 'El precio debe ser menor que $999,999';
      }
    }

    // Validate collection selection
    if (!data.collectionId.trim()) {
      newErrors.collectionId = 'Debes seleccionar una lista';
    }

    // Validate product URL (optional)
    if (data.productUrl && data.productUrl.trim()) {
      try {
        new URL(data.productUrl.trim());
      } catch {
        newErrors.productUrl = 'Por favor ingresa una URL válida';
      }
    }

    return newErrors;
  };

  /**
   * Handle input changes with real-time validation
   */
  const handleInputChange = (field: keyof AddItemFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Real-time validation for touched fields
    if (touched[field]) {
      const newErrors = validateForm(newFormData);
      setErrors(prev => ({
        ...prev,
        [field]: newErrors[field]
      }));
    }
  };

  /**
   * Handle input blur to mark field as touched
   */
  const handleInputBlur = (field: keyof AddItemFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    const newErrors = validateForm(formData);
    setErrors(prev => ({
      ...prev,
      [field]: newErrors[field]
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, price: true, productUrl: true, collectionId: true });

    // Validate entire form
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    // Check if form is valid
    if (Object.keys(validationErrors).length === 0) {
      // Create new wishlist item data
      const itemData = {
        name: sanitizeItemName(formData.name),
        currentPrice: parseFloat(formData.price),
        originalPrice: parseFloat(formData.price),
        productUrl: formData.productUrl?.trim() || undefined,
        imageUrl: undefined,
        collectionId: formData.collectionId
      };

      // Create complete wishlist item with generated fields
      const newItem = createWishlistItem(itemData);
      onSubmit(newItem);
    }
  };

  /**
   * Check if form is valid
   */
  const isFormValid = formData.name.trim().length >= 2 && 
                     formData.price.trim() !== '' && 
                     !isNaN(parseFloat(formData.price)) &&
                     parseFloat(formData.price) > 0 &&
                     formData.collectionId.trim() !== '';

  // Prepare collection options for select
  const collectionOptions: SelectOption[] = collections.map(collection => ({
    value: collection.id,
    label: collection.name
  }));

  // Debug logging
  console.log('🔍 Form Debug:', {
    name: formData.name,
    price: formData.price,
    nameLength: formData.name.trim().length,
    priceNumber: parseFloat(formData.price),
    isValidName: formData.name.trim().length >= 2,
    isValidPrice: formData.price.trim() !== '' && !isNaN(parseFloat(formData.price)) && parseFloat(formData.price) > 0,
    isFormValid: isFormValid,
    errors: errors
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Collection Selection */}
      <Select
        label="Lista de Deseos"
        value={formData.collectionId}
        onChange={(value) => handleInputChange('collectionId', value)}
        options={collectionOptions}
        placeholder="Selecciona una lista..."
        error={touched.collectionId ? errors.collectionId : undefined}
        required
      />

      {/* Product Name Input */}
      <Input
        label="Nombre del Producto"
        type="text"
        placeholder="Ingresa el nombre del producto (ej. iPhone 15 Pro)"
        value={formData.name}
        onChange={(value) => handleInputChange('name', value)}
        onBlur={() => handleInputBlur('name')}
        error={touched.name ? errors.name : undefined}
        required
      />

      {/* Product URL Input */}
      <Input
        label="URL del Producto (Opcional)"
        type="url"
        placeholder="Pega la URL del producto de Amazon, eBay, etc."
        value={formData.productUrl || ''}
        onChange={(value) => {
          handleInputChange('productUrl', value);
          // Auto-extract product info when URL is pasted
          if (value.trim() && value.includes('http')) {
            extractProductFromUrl(value);
          }
        }}
        onBlur={() => handleInputBlur('productUrl')}
        error={touched.productUrl ? errors.productUrl : undefined}
      />

      {isExtractingFromUrl && (
        <div className="text-sm text-theme-info flex items-center gap-2 theme-transition">
          <div className="w-4 h-4 border-2 border-theme-info border-t-transparent rounded-full animate-spin"></div>
          Extrayendo información del producto...
        </div>
      )}

      {/* Price Input */}
      <Input
        label="Precio Actual"
        type="number"
        placeholder="0.00"
        value={formData.price}
        onChange={(value) => handleInputChange('price', value)}
        onBlur={() => handleInputBlur('price')}
        error={touched.price ? errors.price : undefined}
        required
        step="0.01"
        min="0"
      />

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        
        <Button
          type="submit"
          variant="primary"
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
          className="flex-1"
        >
          Agregar a Lista de Deseos
        </Button>
      </div>
    </form>
  );
};