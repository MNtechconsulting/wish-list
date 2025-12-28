import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { WishlistItem, WishlistCollection } from '../../types';
import * as useWishlistHook from '../../hooks/useWishlist';
import * as useCollectionsHook from '../../hooks/useCollections';

// Mock the hooks
jest.mock('../../hooks/useWishlist');
jest.mock('../../hooks/useCollections');

const mockUseWishlist = useWishlistHook.useWishlist as jest.MockedFunction<typeof useWishlistHook.useWishlist>;
const mockUseCollections = useCollectionsHook.useCollections as jest.MockedFunction<typeof useCollectionsHook.useCollections>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock ProductSearch component for controlled testing
jest.mock('../ProductSearch', () => ({
  ProductSearch: ({ onSelectProduct, onClose }: { 
    onSelectProduct: (product: any) => void;
    onClose: () => void;
  }) => (
    <div data-testid="product-search">
      <h3>Product Search</h3>
      <button 
        onClick={() => onSelectProduct({
          name: 'Test Product from Search',
          currentPrice: 199.99,
          originalPrice: 249.99,
          productUrl: 'https://example.com/test-product',
          imageUrl: 'https://example.com/test-image.jpg'
        })}
        data-testid="select-product-btn"
      >
        Select Product
      </button>
      <button onClick={onClose} data-testid="close-search-btn">
        Close Search
      </button>
    </div>
  )
}));

// Mock PageTransition to avoid animation delays
jest.mock('../PageTransition', () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FadeTransition: ({ children, show }: { children: React.ReactNode; show: boolean }) => 
    show ? <div>{children}</div> : null
}));

// Mock UI Icons to avoid import issues
jest.mock('../ui/Icons', () => ({
  TrendingUpIcon: ({ className }: { className?: string }) => <div className={className} data-testid="trending-up-icon">↗</div>,
  TrendingDownIcon: ({ className }: { className?: string }) => <div className={className} data-testid="trending-down-icon">↘</div>,
  MinusIcon: ({ className }: { className?: string }) => <div className={className} data-testid="minus-icon">-</div>,
}));

// Mock WishlistGrid to avoid complex rendering issues
jest.mock('../WishlistGrid', () => ({
  WishlistGrid: ({ items, onAddItemClick, emptyStateMessage }: { 
    items: any[];
    onAddItemClick: () => void;
    emptyStateMessage?: string;
  }) => (
    <div data-testid="wishlist-grid">
      {items.length === 0 ? (
        <div data-testid="empty-state">{emptyStateMessage || 'No hay artículos en esta lista'}</div>
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} data-testid={`item-${item.id}`}>
              {item.name}
            </div>
          ))}
        </div>
      )}
      <button onClick={onAddItemClick} data-testid="add-item-btn">
        Agregar Artículo
      </button>
    </div>
  )
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Wishlist State Management Integration Tests', () => {
  const mockCollections: WishlistCollection[] = [
    {
      id: '1',
      name: 'Test Collection',
      description: 'Test Description',
      color: '#blue',
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      itemCount: 0
    }
  ];

  const mockItems: WishlistItem[] = [
    {
      id: '1',
      name: 'Test Item 1',
      currentPrice: 99.99,
      originalPrice: 129.99,
      productUrl: 'https://example.com/item1',
      imageUrl: 'https://example.com/image1.jpg',
      collectionId: '1',
      createdAt: new Date(),
      updatedAt: new Date(),
      trend: 'down' as const,
      daysTracked: 5
    }
  ];

  // Mock functions
  const mockAddItem = jest.fn();
  const mockUpdateItem = jest.fn();
  const mockDeleteItem = jest.fn();
  const mockClearError = jest.fn();
  const mockClearCollectionCountsChanged = jest.fn();
  const mockRetryLastOperation = jest.fn();
  const mockCreateCollection = jest.fn();
  const mockSelectCollection = jest.fn();
  const mockRefreshCollections = jest.fn();
  const mockClearCollectionsError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useWishlist hook
    mockUseWishlist.mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
      isNetworkError: false,
      collectionCountsChanged: false,
      addItem: mockAddItem,
      updateItem: mockUpdateItem,
      deleteItem: mockDeleteItem,
      clearError: mockClearError,
      clearCollectionCountsChanged: mockClearCollectionCountsChanged,
      retryLastOperation: mockRetryLastOperation
    });

    // Mock useCollections hook
    mockUseCollections.mockReturnValue({
      collections: mockCollections,
      selectedCollection: mockCollections[0],
      isLoading: false,
      error: null,
      createCollection: mockCreateCollection,
      selectCollection: mockSelectCollection,
      refreshCollections: mockRefreshCollections,
      clearError: mockClearCollectionsError
    });
  });

  describe('Complete User Flow: Product Search to Wishlist Addition', () => {
    it('should complete the full flow from opening modal to adding item via search', async () => {
      mockAddItem.mockResolvedValue(true);
      
      renderDashboard();

      // Step 1: Open add item modal
      const addButton = screen.getByTestId('add-item-btn');
      fireEvent.click(addButton);

      // Step 2: Should show modal menu
      await waitFor(() => {
        expect(screen.getByText('Agregar Nuevo Artículo')).toBeInTheDocument();
        expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
      });

      // Step 3: Click on search products
      fireEvent.click(screen.getByText('🔍 Buscar Productos'));

      // Step 4: Should show product search
      await waitFor(() => {
        expect(screen.getByTestId('product-search')).toBeInTheDocument();
      });

      // Step 5: Select a product from search
      fireEvent.click(screen.getByTestId('select-product-btn'));

      // Step 6: Should transition to manual entry with prefilled data
      await waitFor(() => {
        expect(screen.getByText('Detalles del Artículo')).toBeInTheDocument();
        expect(screen.getByText(/Detalles del producto cargados desde la búsqueda/)).toBeInTheDocument();
      });

      // Step 7: Fill in required fields and submit
      const nameInput = screen.getByLabelText(/Nombre del producto/i);
      expect(nameInput).toHaveValue('Test Product from Search');

      // Select collection
      const collectionSelect = screen.getByRole('combobox');
      fireEvent.change(collectionSelect, { target: { value: '1' } });

      const submitButton = screen.getByText('Agregar a Lista de Deseos');
      fireEvent.click(submitButton);

      // Step 8: Verify useWishlist hook's addItem was called
      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Product from Search',
            currentPrice: 199.99,
            productUrl: 'https://example.com/test-product'
          }),
          1 // collection ID
        );
      });
    });

    it('should handle manual entry flow without search', async () => {
      mockAddItem.mockResolvedValue(true);
      
      renderDashboard();

      // Open modal and go directly to manual entry
      fireEvent.click(screen.getByTestId('add-item-btn'));
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));

      // Should show manual entry without prefilled data message
      await waitFor(() => {
        expect(screen.getByText('Detalles del Artículo')).toBeInTheDocument();
        expect(screen.queryByText(/Detalles del producto cargados desde la búsqueda/)).not.toBeInTheDocument();
      });

      // Fill form manually
      const nameInput = screen.getByLabelText(/Nombre del producto/i);
      const priceInput = screen.getByLabelText(/Precio actual/i);
      const urlInput = screen.getByLabelText(/URL del producto/i);

      fireEvent.change(nameInput, { target: { value: 'Manual Test Product' } });
      fireEvent.change(priceInput, { target: { value: '150.00' } });
      fireEvent.change(urlInput, { target: { value: 'https://example.com/manual' } });

      // Select collection
      const collectionSelect = screen.getByRole('combobox');
      fireEvent.change(collectionSelect, { target: { value: '1' } });

      // Submit form
      fireEvent.click(screen.getByText('Agregar a Lista de Deseos'));

      // Verify addItem was called with manual data
      await waitFor(() => {
        expect(mockAddItem).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Manual Test Product',
            currentPrice: 150,
            productUrl: 'https://example.com/manual'
          }),
          1
        );
      });
    });
  });

  describe('Real-time UI Updates Without Page Refresh', () => {
    it('should display new items immediately after successful addition', async () => {
      // Start with empty items
      mockUseWishlist.mockReturnValue({
        items: [],
        isLoading: false,
        error: null,
        isNetworkError: false,
        collectionCountsChanged: false,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      const { rerender } = renderDashboard();

      // Should show empty state
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();

      // Simulate successful item addition by updating hook return value
      mockAddItem.mockResolvedValue(true);
      
      // Update hook to return new item
      mockUseWishlist.mockReturnValue({
        items: [mockItems[0]],
        isLoading: false,
        error: null,
        isNetworkError: false,
        collectionCountsChanged: false,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      // Re-render to simulate state update
      rerender(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Should now show the new item
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should refresh collection counts after item operations', async () => {
      // Mock collection counts changed
      mockUseWishlist.mockReturnValue({
        items: mockItems,
        isLoading: false,
        error: null,
        isNetworkError: false,
        collectionCountsChanged: true, // Simulate counts changed
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      renderDashboard();

      // Should call refreshCollections and clearCollectionCountsChanged
      await waitFor(() => {
        expect(mockRefreshCollections).toHaveBeenCalled();
        expect(mockClearCollectionCountsChanged).toHaveBeenCalled();
      });
    });

    it('should update UI immediately when items are deleted', async () => {
      mockDeleteItem.mockResolvedValue(true);
      
      const { rerender } = renderDashboard();

      // Should show the item initially
      expect(screen.getByTestId('item-1')).toBeInTheDocument();

      // Simulate item deletion by updating hook return value
      mockUseWishlist.mockReturnValue({
        items: [], // Item removed
        isLoading: false,
        error: null,
        isNetworkError: false,
        collectionCountsChanged: true, // Counts changed after deletion
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      // Re-render to simulate state update
      rerender(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Should show empty state
      await waitFor(() => {
        expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      });
    });
  });

  describe('Error Scenarios and Recovery Mechanisms', () => {
    it('should display errors from useWishlist hook in Dashboard UI', async () => {
      const errorMessage = 'Failed to add item to wishlist';
      
      mockUseWishlist.mockReturnValue({
        items: mockItems,
        isLoading: false,
        error: errorMessage,
        isNetworkError: false,
        collectionCountsChanged: false,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      renderDashboard();

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Should have close button
      const closeButton = screen.getByText('Cerrar');
      expect(closeButton).toBeInTheDocument();

      // Clicking close should call clearError
      fireEvent.click(closeButton);
      expect(mockClearError).toHaveBeenCalled();
    });

    it('should show retry option for network errors', async () => {
      const errorMessage = 'Network connection failed';
      
      mockUseWishlist.mockReturnValue({
        items: mockItems,
        isLoading: false,
        error: errorMessage,
        isNetworkError: true, // Network error
        collectionCountsChanged: false,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      renderDashboard();

      // Should display error and retry button
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByText('Reintentar')).toBeInTheDocument();
        expect(screen.getByText(/Problema de conexión detectado/)).toBeInTheDocument();
      });

      // Clicking retry should call retryLastOperation
      fireEvent.click(screen.getByText('Reintentar'));
      expect(mockRetryLastOperation).toHaveBeenCalled();
    });

    it('should keep AddItemModal open when item addition fails', async () => {
      const errorMessage = 'Failed to add item';
      mockAddItem.mockResolvedValue(false); // Simulate failure
      
      // Start with error state
      mockUseWishlist.mockReturnValue({
        items: mockItems,
        isLoading: false,
        error: errorMessage,
        isNetworkError: false,
        collectionCountsChanged: false,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      renderDashboard();

      // Open modal
      fireEvent.click(screen.getByTestId('add-item-btn'));

      // Go to manual entry
      await waitFor(() => {
        expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));

      // Should show error in modal
      await waitFor(() => {
        const errorElements = screen.getAllByText(errorMessage);
        expect(errorElements.length).toBeGreaterThan(0); // Should show error somewhere
        expect(screen.getByText('Detalles del Artículo')).toBeInTheDocument(); // Modal still open
      });
    });

    it('should clear errors when modal is closed', async () => {
      const errorMessage = 'Some error occurred';
      
      mockUseWishlist.mockReturnValue({
        items: mockItems,
        isLoading: false,
        error: errorMessage,
        isNetworkError: false,
        collectionCountsChanged: false,
        addItem: mockAddItem,
        updateItem: mockUpdateItem,
        deleteItem: mockDeleteItem,
        clearError: mockClearError,
        clearCollectionCountsChanged: mockClearCollectionCountsChanged,
        retryLastOperation: mockRetryLastOperation
      });

      renderDashboard();

      // Open modal
      fireEvent.click(screen.getByTestId('add-item-btn'));

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i }) || 
                         screen.getByText('×') ||
                         screen.getByLabelText(/close/i);
      
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(mockClearError).toHaveBeenCalled();
      }
    });

    it('should handle collections loading and error states', async () => {
      // Test collections loading state
      mockUseCollections.mockReturnValue({
        collections: [],
        selectedCollection: null,
        isLoading: true, // Loading state
        error: null,
        createCollection: mockCreateCollection,
        selectCollection: mockSelectCollection,
        refreshCollections: mockRefreshCollections,
        clearError: mockClearCollectionsError
      });

      const { rerender } = renderDashboard();

      // Should show loading
      expect(screen.getByText('Cargando listas...')).toBeInTheDocument();

      // Test collections error state
      const collectionsError = 'Failed to load collections';
      mockUseCollections.mockReturnValue({
        collections: [],
        selectedCollection: null,
        isLoading: false,
        error: collectionsError,
        createCollection: mockCreateCollection,
        selectCollection: mockSelectCollection,
        refreshCollections: mockRefreshCollections,
        clearError: mockClearCollectionsError
      });

      rerender(
        <BrowserRouter>
          <Dashboard />
        </BrowserRouter>
      );

      // Should show collections error
      await waitFor(() => {
        expect(screen.getByText(collectionsError)).toBeInTheDocument();
      });

      // Should have close button for collections error
      const closeButtons = screen.getAllByText('Cerrar');
      fireEvent.click(closeButtons[0]); // First close button should be for collections error
      expect(mockClearCollectionsError).toHaveBeenCalled();
    });
  });

  describe('State Consistency Across Components', () => {
    it('should use useWishlist hook as single source of truth', () => {
      renderDashboard();

      // Verify useWishlist hook is called
      expect(mockUseWishlist).toHaveBeenCalled();
      
      // Verify hook methods are available
      const hookResult = mockUseWishlist.mock.results[0].value;
      expect(hookResult.addItem).toBe(mockAddItem);
      expect(hookResult.updateItem).toBe(mockUpdateItem);
      expect(hookResult.deleteItem).toBe(mockDeleteItem);
    });

    it('should maintain consistent data across hook consumers', () => {
      renderDashboard();

      // The Dashboard should display items from the hook
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      
      // Items should be filtered by selected collection
      const displayedItems = mockItems.filter(item => 
        item.collectionId === mockCollections[0].id
      );
      expect(displayedItems).toHaveLength(1);
    });

    it('should handle collection selection properly', async () => {
      renderDashboard();

      // Should show selected collection name in UI
      expect(screen.getByText('Test Collection')).toBeInTheDocument();
      
      // Items should be filtered by selected collection
      expect(screen.getByTestId('item-1')).toBeInTheDocument();
    });
  });
});