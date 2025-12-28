/**
 * Tests for useWishlist hook collection count update functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useWishlist } from '../useWishlist';
import { apiService } from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('useWishlist Hook - Collection Count Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    mockApiService.getWishlistItems.mockResolvedValue([]);
    mockApiService.createWishlistItem.mockResolvedValue({
      id: 1,
      title: 'Test Item',
      current_price: '99.99',
      initial_price: '99.99',
      currency: 'USD',
      collection_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    mockApiService.updateWishlistItem.mockResolvedValue({
      id: 1,
      title: 'Updated Item',
      current_price: '89.99',
      initial_price: '99.99',
      currency: 'USD',
      collection_id: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    mockApiService.deleteWishlistItem.mockResolvedValue();
  });

  it('should signal collection counts changed after adding an item', async () => {
    const { result } = renderHook(() => useWishlist());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.collectionCountsChanged).toBe(false);

    // Add an item
    await act(async () => {
      await result.current.addItem({
        id: '1',
        name: 'Test Item',
        currentPrice: 99.99,
        originalPrice: 99.99,
        priceHistory: [],
        productUrl: '',
        dateAdded: new Date(),
        trend: 'flat',
        daysTracked: 0,
        collectionId: '1'
      }, 1);
    });

    expect(result.current.collectionCountsChanged).toBe(true);
  });

  it('should signal collection counts changed after deleting an item', async () => {
    const { result } = renderHook(() => useWishlist());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.collectionCountsChanged).toBe(false);

    // Delete an item
    await act(async () => {
      await result.current.deleteItem('1');
    });

    expect(result.current.collectionCountsChanged).toBe(true);
  });

  it('should signal collection counts changed when updating item to different collection', async () => {
    const { result } = renderHook(() => useWishlist());

    // Wait for initial load and add an item first
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
      await result.current.addItem({
        id: '1',
        name: 'Test Item',
        currentPrice: 99.99,
        originalPrice: 99.99,
        priceHistory: [],
        productUrl: '',
        dateAdded: new Date(),
        trend: 'flat',
        daysTracked: 0,
        collectionId: '1'
      }, 1);
    });

    // Clear the flag
    act(() => {
      result.current.clearCollectionCountsChanged();
    });

    expect(result.current.collectionCountsChanged).toBe(false);

    // Update item to different collection
    await act(async () => {
      await result.current.updateItem('1', {
        name: 'Updated Item'
      }, 2); // Different collection ID
    });

    expect(result.current.collectionCountsChanged).toBe(true);
  });

  it('should allow clearing the collection counts changed flag', async () => {
    const { result } = renderHook(() => useWishlist());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Add an item to set the flag
    await act(async () => {
      await result.current.addItem({
        id: '1',
        name: 'Test Item',
        currentPrice: 99.99,
        originalPrice: 99.99,
        priceHistory: [],
        productUrl: '',
        dateAdded: new Date(),
        trend: 'flat',
        daysTracked: 0,
        collectionId: '1'
      }, 1);
    });

    expect(result.current.collectionCountsChanged).toBe(true);

    // Clear the flag
    act(() => {
      result.current.clearCollectionCountsChanged();
    });

    expect(result.current.collectionCountsChanged).toBe(false);
  });
});