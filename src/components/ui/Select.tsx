/**
 * Select UI Component
 * Reusable select dropdown component with consistent styling
 */

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-theme-text-primary">
          {label}
          {required && <span className="text-theme-error ml-1">*</span>}
        </label>
      )}

      {/* Select Input */}
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3 pr-10 border rounded-lg transition-colors theme-transition
            bg-theme-surface text-theme-text-primary
            focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error 
              ? 'border-theme-error focus:border-theme-error focus:ring-theme-error/20' 
              : 'theme-border hover:border-theme-primary/50'
            }
          `}
        >
          {/* Placeholder option */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {/* Options */}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-theme-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-theme-error">{error}</p>
      )}
    </div>
  );
};