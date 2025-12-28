import React from 'react';
import { InputProps } from '../../types';

/**
 * Reusable Input component with pastel accent styling
 * Includes label, error handling, and consistent design system
 */
export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  label,
  required = false,
  step,
  min,
  ...props
}) => {
  // Generate a simple ID for the input
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 theme-transition';
  const normalClasses = 'theme-border focus:border-theme-primary focus:ring-theme-primary/20';
  const errorClasses = 'border-theme-error focus:border-theme-error focus:ring-theme-error/20';
  
  const inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses}`;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };
  
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-theme-text-primary"
        >
          {label}
          {required && <span className="text-theme-error ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={inputClasses}
        step={step}
        min={min}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-theme-error mt-1">
          {error}
        </p>
      )}
    </div>
  );
};