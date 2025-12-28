/**
 * Custom hook for managing wishlist data with API integration
 * Handles loading, creating, updating, and deleting wishlist items
 */

import { useState, useEffect } from 'react';
import { apiService, WishlistItemAPI, CreateWishlistItemRequest, ApiError } from '../services/api';
import { WishlistItem } from '../types';

// Convert API item to frontend item format
const convertApiItemToFrontend = (apiItem: WishlistItemAPI): WishlistItem => {
  return {
    id: apiItem.id.toString(),
    name: apiItem.title,
    currentPrice: parseFloat(apiItem.current_price),
    originalPrice: parseFloat(apiItem.initial_price),
    priceHistory: [], // Will be populated from price history API
    productUrl: apiItem.product_url || '',
    dateAdded: new Date(apiItem.created_at),
    trend: 'flat' as const, // Will be calculated based on price history
    daysTracked: Math.floor((Date.now() - new Date(apiItem.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    collectionId: apiItem.collection_id.toString()
  };
};

// Convert frontend item to API format
const convertFrontendItemToApi = (item: Partial<WishlistItem>, collectionId?: number): CreateWishlistItemRequest => {
  return {
    title: item.name || '',
    product_url: item.productUrl || undefined,
    initial_price: item.currentPrice || item.originalPrice || 0,
    currency: 'USD', // Default currency for now
    collection_id: collectionId || parseInt(item.collectionId || '0')
  };
};

export const useWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionCountsChanged, setCollectionCountsChanged] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);

  // Helper function to determine if error is network-related
  const isNetworkErrorType = (error: any): boolean => {
    return (
      error instanceof TypeError && error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('ERR_NETWORK') ||
      error.message.includes('ERR_INTERNET_DISCONNECTED') ||
      (error instanceof ApiError && (error.status === 0 || error.status >= 500))
    );
  };

  // Load wishlist items from API
  const loadItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsNetworkError(false);
      
      const apiItems = await apiService.getWishlistItems();
      const frontendItems = apiItems.map(convertApiItemToFrontend);
      setItems(frontendItems);
    } catch (error) {
      const isNetwork = isNetworkErrorType(error);
      setIsNetworkError(isNetwork);
      
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (isNetwork) {
        setError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      } else {
        setError('Failed to load wishlist items');
      }
      console.error('Error loading wishlist items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new item to wishlist
  const addItem = async (newItem: WishlistItem, collectionId?: number): Promise<boolean> => {
    try {
      setError(null);
      setIsNetworkError(false);
      
      const apiRequest = convertFrontendItemToApi(newItem, collectionId);
      await apiService.createWishlistItem(apiRequest);
      
      // Instead of just adding to the current list, refresh the entire list
      // This ensures we get the most up-to-date data from the server
      await loadItems();
      
      setCollectionCountsChanged(true); // Signal that collection counts need refresh
      return true;
    } catch (error) {
      const isNetwork = isNetworkErrorType(error);
      setIsNetworkError(isNetwork);
      
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (isNetwork) {
        setError('Error de conexión. No se pudo agregar el artículo. Verifica tu conexión a internet e intenta nuevamente.');
      } else {
        setError('Failed to add item to wishlist');
      }
      console.error('Error adding wishlist item:', error);
      return false;
    }
  };

  // Update existing item
  const updateItem = async (itemId: string, updates: Partial<WishlistItem>, collectionId?: number): Promise<boolean> => {
    try {
      setError(null);
      setIsNetworkError(false);
      
      const apiRequest = convertFrontendItemToApi(updates, collectionId);
      const updatedItem = await apiService.updateWishlistItem(parseInt(itemId), apiRequest);
      const frontendItem = convertApiItemToFrontend(updatedItem);
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? frontendItem : item
        )
      );
      
      // Check if collection changed to signal count refresh
      const originalItem = items.find(item => item.id === itemId);
      if (originalItem && (collectionId && originalItem.collectionId !== collectionId.toString())) {
        setCollectionCountsChanged(true);
      }
      
      return true;
    } catch (error) {
      const isNetwork = isNetworkErrorType(error);
      setIsNetworkError(isNetwork);
      
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (isNetwork) {
        setError('Error de conexión. No se pudo actualizar el artículo. Verifica tu conexión a internet e intenta nuevamente.');
      } else {
        setError('Failed to update item');
      }
      console.error('Error updating wishlist item:', error);
      return false;
    }
  };

  // Delete item from wishlist
  const deleteItem = async (itemId: string): Promise<boolean> => {
    try {
      setError(null);
      setIsNetworkError(false);
      
      await apiService.deleteWishlistItem(parseInt(itemId));
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      setCollectionCountsChanged(true); // Signal that collection counts need refresh
      return true;
    } catch (error) {
      const isNetwork = isNetworkErrorType(error);
      setIsNetworkError(isNetwork);
      
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (isNetwork) {
        setError('Error de conexión. No se pudo eliminar el artículo. Verifica tu conexión a internet e intenta nuevamente.');
      } else {
        setError('Failed to delete item');
      }
      console.error('Error deleting wishlist item:', error);
      return false;
    }
  };

  // Get single item by ID
  const getItem = async (itemId: string): Promise<WishlistItem | null> => {
    try {
      setError(null);
      setIsNetworkError(false);
      
      const apiItem = await apiService.getWishlistItem(parseInt(itemId));
      return convertApiItemToFrontend(apiItem);
    } catch (error) {
      const isNetwork = isNetworkErrorType(error);
      setIsNetworkError(isNetwork);
      
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (isNetwork) {
        setError('Error de conexión. No se pudo cargar el artículo. Verifica tu conexión a internet e intenta nuevamente.');
      } else {
        setError('Failed to load item');
      }
      console.error('Error loading wishlist item:', error);
      return null;
    }
  };

  // Clear collection counts changed flag
  const clearCollectionCountsChanged = () => {
    setCollectionCountsChanged(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
    setIsNetworkError(false);
  };

  // Retry last failed operation (for network errors)
  const retryLastOperation = async () => {
    if (isNetworkError) {
      // For now, retry by reloading items
      // In a more sophisticated implementation, we could track the last failed operation
      await loadItems();
    }
  };

  // Load items on mount
  useEffect(() => {
    loadItems();
  }, []);

  return {
    items,
    isLoading,
    error,
    isNetworkError,
    collectionCountsChanged,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    refreshItems: loadItems,
    clearError,
    clearCollectionCountsChanged,
    retryLastOperation
  };
};