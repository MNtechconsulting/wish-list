/**
 * Collection Selector Component
 * Dropdown to select and manage wishlist collections
 */

import React, { useState, useRef, useEffect } from 'react';
import { WishlistCollection } from '../types';

interface CollectionSelectorProps {
  collections: WishlistCollection[];
  selectedCollection: WishlistCollection | null;
  onSelectCollection: (collection: WishlistCollection) => void;
  onCreateNew: () => void;
  onManageCollections: () => void;
  className?: string;
}

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  collections,
  selectedCollection,
  onSelectCollection,
  onCreateNew,
  onManageCollections,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCollection = (collection: WishlistCollection) => {
    onSelectCollection(collection);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-theme-surface border theme-border rounded-lg hover:bg-theme-background transition-colors theme-transition"
      >
        <div className="flex items-center space-x-3">
          {/* Collection Color Indicator */}
          {selectedCollection?.color && (
            <div
              className="w-4 h-4 rounded-full border border-theme-border"
              style={{ backgroundColor: selectedCollection.color }}
            />
          )}
          
          {/* Collection Info */}
          <div className="text-left">
            <div className="font-medium text-theme-text-primary">
              {selectedCollection?.name || 'Seleccionar Lista'}
            </div>
            {selectedCollection && (
              <div className="text-sm text-theme-text-muted">
                {selectedCollection.itemCount} {selectedCollection.itemCount === 1 ? 'artículo' : 'artículos'}
                {selectedCollection.isDefault && ' • Predeterminada'}
              </div>
            )}
          </div>
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-5 h-5 text-theme-text-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-theme-surface border theme-border rounded-lg shadow-theme-large z-50 theme-transition">
          <div className="py-2">
            {/* Collections List */}
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleSelectCollection(collection)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-theme-background transition-colors theme-transition
                  ${selectedCollection?.id === collection.id ? 'bg-theme-primary/5 text-theme-primary' : 'text-theme-text-primary'}
                `}
              >
                {/* Color Indicator */}
                {collection.color && (
                  <div
                    className="w-4 h-4 rounded-full border border-theme-border flex-shrink-0"
                    style={{ backgroundColor: collection.color }}
                  />
                )}
                
                {/* Collection Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {collection.name}
                    {collection.isDefault && (
                      <span className="ml-2 text-xs bg-theme-primary/10 text-theme-primary px-2 py-0.5 rounded-full">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-theme-text-muted">
                    {collection.itemCount} {collection.itemCount === 1 ? 'artículo' : 'artículos'}
                  </div>
                </div>

                {/* Selected Indicator */}
                {selectedCollection?.id === collection.id && (
                  <svg className="w-5 h-5 text-theme-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            {/* Divider */}
            {collections.length > 0 && (
              <div className="border-t theme-border my-2" />
            )}

            {/* Action Buttons */}
            <button
              onClick={() => {
                onCreateNew();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-theme-background transition-colors theme-transition text-theme-primary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">Crear Nueva Lista</span>
            </button>

            <button
              onClick={() => {
                onManageCollections();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-theme-background transition-colors theme-transition text-theme-text-secondary"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-medium">Administrar Listas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};