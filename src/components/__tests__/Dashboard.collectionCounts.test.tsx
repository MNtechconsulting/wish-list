/**
 * Tests for Dashboard component collection count update functionality
 */

import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { useWishlist } from '../../hooks/useWishlist';
import { useCollections } from '../../hooks/useCollections';

// Mock the hooks
jest.mock('../../hooks/useWishlist');
jest.mock('../../hooks/useCollections');

const mockUseWishlist = useWishlist as jest.MockedFunction<typeof useWishlist>;
const mockUseCollections = useCollections as jest.MockedFunction<typeof useCollections>;

describe('Dashboard - Collection Count Updates', () => {
  const mockRefreshCollections = jest.fn();
  const mockClearCollectionCountsChanged = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useCollections hook
    mockUseCollections.mockReturnValue({
      collections: [
        {
          id: '1',
          name: 'Test Collection',
          description: 'Test Description',
          color: '#000000',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          itemCount: 5
        }
      ],
      selectedCollection: {
        id: '1',
        name: 'Test Collection',
        description: 'Test Description',
        color: '#000000',
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        itemCount: 5
      },
      isLoading: false,
      error: null,
      createCollection: jest.fn(),
      updateCollection: jest.fn(),
      deleteCollection: jest.fn(),
      selectCollection: jest.fn(),
      refreshCollections: mockRefreshCollections,
      clearError: jest.fn()
    });

    // Mock useWishlist hook
    mockUseWishlist.mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      isNetworkError: false,
      collectionCountsChanged: false,
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      getItem: jest.fn(),
      refreshItems: jest.fn(),
      clearError: jest.fn(),
      clearCollectionCountsChanged: mockClearCollectionCountsChanged,
      retryLastOperation: jest.fn()
    });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('should refresh collections when collectionCountsChanged is true', async () => {
    // First render with collectionCountsChanged false
    renderDashboard();

    expect(mockRefreshCollections).not.toHaveBeenCalled();
    expect(mockClearCollectionCountsChanged).not.toHaveBeenCalled();

    // Update mock to return collectionCountsChanged true
    mockUseWishlist.mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      isNetworkError: false,
      collectionCountsChanged: true, // Changed to true
      addItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      getItem: jest.fn(),
      refreshItems: jest.fn(),
      clearError: jest.fn(),
      clearCollectionCountsChanged: mockClearCollectionCountsChanged,
      retryLastOperation: jest.fn()
    });

    // Re-render to trigger the effect
    renderDashboard();

    await waitFor(() => {
      expect(mockRefreshCollections).toHaveBeenCalled();
      expect(mockClearCollectionCountsChanged).toHaveBeenCalled();
    });
  });

  it('should not refresh collections when collectionCountsChanged is false', () => {
    renderDashboard();

    expect(mockRefreshCollections).not.toHaveBeenCalled();
    expect(mockClearCollectionCountsChanged).not.toHaveBeenCalled();
  });
});