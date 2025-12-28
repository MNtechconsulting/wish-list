/**
 * Custom hook for managing wishlist collections with API integration
 * Handles loading, creating, updating, and deleting collections
 */

import { useState, useEffect } from 'react';
import { apiService, WishlistCollectionAPI, CreateWishlistCollectionRequest, ApiError } from '../services/api';
import { WishlistCollection, CreateCollectionFormData } from '../types';

// Convert API collection to frontend collection format
const convertApiCollectionToFrontend = (apiCollection: WishlistCollectionAPI): WishlistCollection => ({
  id: apiCollection.id.toString(),
  name: apiCollection.name,
  description: apiCollection.description,
  color: apiCollection.color,
  isDefault: apiCollection.is_default,
  createdAt: new Date(apiCollection.created_at),
  updatedAt: new Date(apiCollection.updated_at),
  itemCount: apiCollection.item_count
});

// Convert frontend collection to API format
const convertFrontendCollectionToApi = (collection: CreateCollectionFormData): CreateWishlistCollectionRequest => ({
  name: collection.name,
  description: collection.description,
  color: collection.color,
  is_default: collection.isDefault
});

export const useCollections = () => {
  const [collections, setCollections] = useState<WishlistCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<WishlistCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load collections from API
  const loadCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const apiCollections = await apiService.getWishlistCollections();
      const frontendCollections = apiCollections.map(convertApiCollectionToFrontend);
      setCollections(frontendCollections);
      
      // Set default collection as selected if no collection is currently selected
      const defaultCollection = frontendCollections.find(c => c.isDefault);
      if (defaultCollection && !selectedCollection) {
        setSelectedCollection(defaultCollection);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load collections');
      }
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new collection
  const createCollection = async (collectionData: CreateCollectionFormData): Promise<boolean> => {
    try {
      setError(null);
      
      const apiRequest = convertFrontendCollectionToApi(collectionData);
      const createdCollection = await apiService.createWishlistCollection(apiRequest);
      const frontendCollection = convertApiCollectionToFrontend(createdCollection);
      
      setCollections(prevCollections => [frontendCollection, ...prevCollections]);
      
      // Select the new collection if it's the default
      if (createdCollection.is_default) {
        setSelectedCollection(frontendCollection);
      }
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to create collection');
      }
      console.error('Error creating collection:', error);
      return false;
    }
  };

  // Update existing collection
  const updateCollection = async (collectionId: string, updates: Partial<CreateCollectionFormData>): Promise<boolean> => {
    try {
      setError(null);
      
      const apiRequest = convertFrontendCollectionToApi(updates as CreateCollectionFormData);
      const updatedCollection = await apiService.updateWishlistCollection(parseInt(collectionId), apiRequest);
      const frontendCollection = convertApiCollectionToFrontend(updatedCollection);
      
      setCollections(prevCollections => 
        prevCollections.map(collection => 
          collection.id === collectionId ? frontendCollection : collection
        )
      );
      
      // Update selected collection if it was the one being updated
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(frontendCollection);
      }
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to update collection');
      }
      console.error('Error updating collection:', error);
      return false;
    }
  };

  // Delete collection
  const deleteCollection = async (collectionId: string): Promise<boolean> => {
    try {
      setError(null);
      
      await apiService.deleteWishlistCollection(parseInt(collectionId));
      setCollections(prevCollections => prevCollections.filter(collection => collection.id !== collectionId));
      
      // Clear selected collection if it was the one being deleted
      if (selectedCollection?.id === collectionId) {
        setSelectedCollection(null);
      }
      
      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to delete collection');
      }
      console.error('Error deleting collection:', error);
      return false;
    }
  };

  // Select a collection
  const selectCollection = (collection: WishlistCollection) => {
    setSelectedCollection(collection);
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  return {
    collections,
    selectedCollection,
    isLoading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    selectCollection,
    refreshCollections: loadCollections,
    clearError
  };
};