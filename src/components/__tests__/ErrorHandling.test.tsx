/**
 * Tests for comprehensive error handling functionality
 * Validates Requirements 4.1, 4.2, 4.3, 4.4
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { AddItemModal } from '../AddItemModal';
import { WishlistCollection } from '../../types';

// Mock the useWishlist hook
const mockUseWishlist = {
  items: [],
  isLoading: false,
  error: null as string | null,
  isNetworkError: false,
  collectionCountsChanged: false,
  addItem: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
  getItem: jest.fn(),
  refreshItems: jest.fn(),
  clearError: jest.fn(),
  clearCollectionCountsChanged: jest.fn(),
  retryLastOperation: jest.fn()
};

jest.mock('../../hooks/useWishlist', () => ({
  useWishlist: () => mockUseWishlist
}));

// Mock collections hook
jest.mock('../../hooks/useCollections', () => ({
  useCollections: () => ({
    collections: [
      { 
        id: '1', 
        name: 'Test Collection', 
        isDefault: true, 
        itemCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    selectedCollection: { 
      id: '1', 
      name: 'Test Collection', 
      isDefault: true, 
      itemCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    isLoading: false,
    error: null,
    createCollection: jest.fn(),
    updateCollection: jest.fn(),
    deleteCollection: jest.fn(),
    selectCollection: jest.fn(),
    refreshCollections: jest.fn(),
    clearError: jest.fn()
  })
}));

const mockCollections: WishlistCollection[] = [
  { 
    id: '1', 
    name: 'Test Collection', 
    isDefault: true, 
    itemCount: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock to default state
    Object.assign(mockUseWishlist, {
      items: [],
      isLoading: false,
      error: null,
      isNetworkError: false,
      collectionCountsChanged: false
    });
  });

  describe('Dashboard Error Display', () => {
    it('should display error from useWishlist hook in Dashboard UI', async () => {
      // Set error in mock
      mockUseWishlist.error = 'API Error';

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Error should be displayed
      expect(screen.getByText('API Error')).toBeInTheDocument();
      expect(screen.getByText('Cerrar')).toBeInTheDocument();
    });

    it('should show retry button for network errors', async () => {
      // Set network error in mock
      mockUseWishlist.error = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      mockUseWishlist.isNetworkError = true;

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Error should be displayed
      expect(screen.getByText(/Error de conexión/)).toBeInTheDocument();
      // Should show retry button for network errors
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });

    it('should clear error when close button is clicked', async () => {
      // Set error in mock
      mockUseWishlist.error = 'API Error';

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Error should be displayed
      expect(screen.getByText('API Error')).toBeInTheDocument();

      // Click close button
      fireEvent.click(screen.getByText('Cerrar'));

      // Should call clearError
      expect(mockUseWishlist.clearError).toHaveBeenCalled();
    });

    it('should call retry function when retry button is clicked', async () => {
      // Set network error in mock
      mockUseWishlist.error = 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      mockUseWishlist.isNetworkError = true;

      render(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Click retry button
      fireEvent.click(screen.getByText('Reintentar'));

      // Should call retryLastOperation
      expect(mockUseWishlist.retryLastOperation).toHaveBeenCalled();
    });
  });

  describe('AddItemModal Error Handling', () => {
    const mockOnClose = jest.fn();
    const mockOnAddItem = jest.fn();
    const mockOnClearError = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should display error in AddItemModal', () => {
      const errorMessage = 'Failed to add item';

      render(
        <AddItemModal
          isOpen={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
          collections={mockCollections}
          selectedCollection={mockCollections[0]}
          error={errorMessage}
          onClearError={mockOnClearError}
        />
      );

      // Error should be displayed
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Cerrar')).toBeInTheDocument();
    });

    it('should call onClearError when error close button is clicked', () => {
      const errorMessage = 'Failed to add item';

      render(
        <AddItemModal
          isOpen={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
          collections={mockCollections}
          selectedCollection={mockCollections[0]}
          error={errorMessage}
          onClearError={mockOnClearError}
        />
      );

      // Click error close button
      fireEvent.click(screen.getByText('Cerrar'));

      // Should call onClearError
      expect(mockOnClearError).toHaveBeenCalled();
    });

    it('should clear error when modal is closed', () => {
      const errorMessage = 'Failed to add item';

      const { rerender } = render(
        <AddItemModal
          isOpen={true}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
          collections={mockCollections}
          selectedCollection={mockCollections[0]}
          error={errorMessage}
          onClearError={mockOnClearError}
        />
      );

      // Close modal
      rerender(
        <AddItemModal
          isOpen={false}
          onClose={mockOnClose}
          onAddItem={mockOnAddItem}
          collections={mockCollections}
          selectedCollection={mockCollections[0]}
          error={errorMessage}
          onClearError={mockOnClearError}
        />
      );

      // Should call onClearError when modal is closed
      expect(mockOnClearError).toHaveBeenCalled();
    });
  });
});