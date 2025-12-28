import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistItem, WishlistCollection } from '../types';
import { WishlistGrid } from './WishlistGrid';
import { AddItemModal } from './AddItemModal';
import { CreateCollectionModal } from './CreateCollectionModal';
import { CollectionSelector } from './CollectionSelector';
import { PageTransition } from './PageTransition';
import { InlineLoading } from './ui/Loading';
import { useWishlist } from '../hooks/useWishlist';
import { useCollections } from '../hooks/useCollections';

/**
 * Dashboard component that manages wishlist items and collections
 * Handles API integration, modal state management, and collection selection
 * Requirements: 2.4, 3.1, 5.1, 5.2, 5.3
 */
export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Use wishlist hook for API integration
  const { 
    items: wishlistItems, 
    isLoading, 
    error, 
    isNetworkError,
    collectionCountsChanged,
    addItem,
    updateItem,
    deleteItem,
    clearError,
    clearCollectionCountsChanged,
    retryLastOperation
  } = useWishlist();

  // Use collections hook for collections management
  const {
    collections,
    selectedCollection,
    isLoading: collectionsLoading,
    error: collectionsError,
    createCollection,
    selectCollection,
    refreshCollections,
    clearError: clearCollectionsError
  } = useCollections();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false);

  // Effect to refresh collections when item counts change
  useEffect(() => {
    if (collectionCountsChanged) {
      refreshCollections();
      clearCollectionCountsChanged();
    }
  }, [collectionCountsChanged, refreshCollections, clearCollectionCountsChanged]);

  /**
   * Handle creating a new collection
   */
  const handleCreateCollection = async (collectionData: any) => {
    // Use useCollections hook instead of direct API call
    const success = await createCollection(collectionData);
    
    if (success) {
      setIsCreateCollectionModalOpen(false);
    }
    // Error handling is managed by useCollections hook
  };
  /**
   * Handle adding a new item to the wishlist
   */
  const handleAddItem = async (newItem: WishlistItem) => {
    if (!selectedCollection) {
      throw new Error('Debes seleccionar una lista antes de agregar un artículo');
    }
    
    // Use useWishlist hook instead of direct API call
    const success = await addItem(newItem, parseInt(selectedCollection.id));
    
    if (success) {
      // Collection counts will be refreshed automatically via useEffect
      setIsAddModalOpen(false);
    }
    // If there's an error, the modal will remain open and show the error
    // Error handling is managed by useWishlist hook
  };

  /**
   * Handle updating an existing item
   */
  const handleUpdateItem = async (itemId: string, updates: Partial<WishlistItem>, collectionId?: number) => {
    const success = await updateItem(itemId, updates, collectionId);
    // Collection counts will be refreshed automatically via useEffect if collection changed
    return success;
  };

  /**
   * Handle deleting an item
   */
  const handleDeleteItem = async (itemId: string) => {
    const success = await deleteItem(itemId);
    // Collection counts will be refreshed automatically via useEffect
    return success;
  };

  /**
   * Handle clicking on a wishlist item (navigate to detail page)
   */
  const handleItemClick = (itemId: string) => {
    navigate(`/item/${itemId}`);
  };

  /**
   * Open the add item modal
   */
  const handleOpenAddModal = () => {
    if (!selectedCollection) {
      clearCollectionsError();
      // Set error using collections hook error state
      return;
    }
    clearError(); // Clear any previous errors
    setIsAddModalOpen(true);
  };

  /**
   * Close the add item modal
   */
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    clearError();
  };

  /**
   * Handle collection selection
   */
  const handleSelectCollection = (collection: WishlistCollection) => {
    selectCollection(collection);
    clearCollectionsError();
  };

  /**
   * Handle opening create collection modal
   */
  const handleOpenCreateCollection = () => {
    setIsCreateCollectionModalOpen(true);
  };

  /**
   * Handle manage collections (placeholder for now)
   */
  const handleManageCollections = () => {
    // TODO: Navigate to collections management page
    console.log('Navigate to collections management');
  };

  // Filter items by selected collection
  const filteredItems = selectedCollection 
    ? wishlistItems.filter(item => item.collectionId === selectedCollection.id)
    : [];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="mb-6">
          <p className="text-theme-text-muted">
            Organiza tus productos en listas y monitorea sus cambios de precio
          </p>
        </div>

        {/* Collections Error Display */}
        {collectionsError && (
          <div className="mb-6 p-4 bg-theme-error/10 border border-theme-error/20 rounded-lg theme-transition">
            <p className="text-theme-error text-sm">{collectionsError}</p>
            <button
              onClick={clearCollectionsError}
              className="mt-2 text-theme-error hover:text-theme-error/80 text-sm underline theme-transition"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* General Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-theme-error/10 border border-theme-error/20 rounded-lg theme-transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-theme-error text-sm">{error}</p>
                {isNetworkError && (
                  <p className="text-theme-error/80 text-xs mt-1">
                    Problema de conexión detectado. Verifica tu conexión a internet.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {isNetworkError && (
                  <button
                    onClick={retryLastOperation}
                    className="px-3 py-1 text-xs bg-theme-error/20 hover:bg-theme-error/30 text-theme-error rounded theme-transition"
                  >
                    Reintentar
                  </button>
                )}
                <button
                  onClick={clearError}
                  className="text-theme-error hover:text-theme-error/80 text-sm underline theme-transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collection Selector */}
        {collectionsLoading ? (
          <InlineLoading text="Cargando listas..." />
        ) : (
          <CollectionSelector
            collections={collections}
            selectedCollection={selectedCollection}
            onSelectCollection={handleSelectCollection}
            onCreateNew={handleOpenCreateCollection}
            onManageCollections={handleManageCollections}
            className="mb-6"
          />
        )}

        {/* Loading State */}
        {isLoading ? (
          <InlineLoading text="Cargando artículos..." />
        ) : (
          /* Wishlist Grid */
          <WishlistGrid
            items={filteredItems}
            onItemClick={handleItemClick}
            onAddItemClick={handleOpenAddModal}
            emptyStateMessage={
              selectedCollection 
                ? `No hay artículos en "${selectedCollection.name}". ¡Agrega tu primer artículo!`
                : "Selecciona una lista para ver tus artículos"
            }
          />
        )}

        {/* Add Item Modal */}
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onAddItem={handleAddItem}
          collections={collections}
          selectedCollection={selectedCollection}
          error={error}
          onClearError={clearError}
        />

        {/* Create Collection Modal */}
        <CreateCollectionModal
          isOpen={isCreateCollectionModalOpen}
          onClose={() => setIsCreateCollectionModalOpen(false)}
          onSubmit={handleCreateCollection}
        />
      </div>
    </PageTransition>
  );
};