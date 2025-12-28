import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddItemModal } from '../AddItemModal';
import { WishlistItem, WishlistCollection } from '../../types';

// Mock the PageTransition component
jest.mock('../PageTransition', () => ({
  FadeTransition: ({ children, show }: { children: React.ReactNode; show: boolean }) => 
    show ? <div>{children}</div> : null
}));

// Mock the ProductSearch component
jest.mock('../ProductSearch', () => ({
  ProductSearch: ({ onSelectProduct, onClose }: { 
    onSelectProduct: (product: Partial<WishlistItem>) => void;
    onClose: () => void;
  }) => (
    <div data-testid="product-search">
      <button 
        onClick={() => onSelectProduct({
          name: 'Test Product',
          currentPrice: 99.99,
          originalPrice: 99.99,
          productUrl: 'https://example.com/product',
          imageUrl: 'https://example.com/image.jpg'
        })}
        data-testid="select-product-btn"
      >
        Select Product
      </button>
      <button onClick={onClose} data-testid="search-close-btn">
        Close Search
      </button>
    </div>
  )
}));

// Mock the AddItemForm component
jest.mock('../AddItemForm', () => ({
  AddItemForm: ({ 
    onSubmit, 
    onCancel, 
    prefilledData,
    collections,
    selectedCollection
  }: {
    onSubmit: (item: WishlistItem) => void;
    onCancel?: () => void;
    prefilledData?: Partial<WishlistItem> | null;
    collections: WishlistCollection[];
    selectedCollection?: WishlistCollection | null;
  }) => (
    <div data-testid="add-item-form">
      <div data-testid="prefilled-data">
        {prefilledData ? JSON.stringify(prefilledData) : 'No prefilled data'}
      </div>
      <div data-testid="selected-collection">
        {selectedCollection ? selectedCollection.name : 'No collection selected'}
      </div>
      <button 
        onClick={() => onSubmit({
          id: '1',
          name: prefilledData?.name || 'Test Item',
          currentPrice: prefilledData?.currentPrice || 50,
          originalPrice: prefilledData?.originalPrice || 50,
          priceHistory: [],
          trend: 'flat',
          dateAdded: new Date(),
          daysTracked: 0,
          productUrl: prefilledData?.productUrl,
          imageUrl: prefilledData?.imageUrl,
          collectionId: selectedCollection?.id || '1'
        })}
        data-testid="submit-form-btn"
      >
        Submit Form
      </button>
      {onCancel && (
        <button onClick={onCancel} data-testid="cancel-form-btn">
          Cancel Form
        </button>
      )}
    </div>
  )
}));

describe('AddItemModal State Transitions', () => {
  const mockOnClose = jest.fn();
  const mockOnAddItem = jest.fn();
  
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

  const mockSelectedCollection = mockCollections[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start with menu view when opened', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
    expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
  });

  it('should transition to search view when search button is clicked', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    expect(screen.getByTestId('product-search')).toBeInTheDocument();
  });

  it('should transition to manual entry view when manual button is clicked', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));
    expect(screen.getByTestId('add-item-form')).toBeInTheDocument();
    expect(screen.getByTestId('prefilled-data')).toHaveTextContent('No prefilled data');
  });

  it('should transition from search to manual entry with prefilled data when product is selected', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to search view
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    expect(screen.getByTestId('product-search')).toBeInTheDocument();

    // Select a product from search
    fireEvent.click(screen.getByTestId('select-product-btn'));

    // Should transition to manual entry with prefilled data
    await waitFor(() => {
      expect(screen.getByTestId('add-item-form')).toBeInTheDocument();
    });

    const prefilledDataElement = screen.getByTestId('prefilled-data');
    expect(prefilledDataElement).toHaveTextContent('Test Product');
    expect(prefilledDataElement).toHaveTextContent('99.99');
    expect(prefilledDataElement).toHaveTextContent('https://example.com/product');
  });

  it('should show success message when prefilled data is present in manual entry', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to search view and select product
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    fireEvent.click(screen.getByTestId('select-product-btn'));

    // Should show success message about prefilled data
    await waitFor(() => {
      expect(screen.getByText(/Detalles del producto cargados desde la búsqueda/)).toBeInTheDocument();
    });
  });

  it('should allow going back to menu from manual entry', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to manual entry
    fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));
    expect(screen.getByTestId('add-item-form')).toBeInTheDocument();

    // Click back button
    fireEvent.click(screen.getByText('← Atrás'));

    // Should return to menu
    await waitFor(() => {
      expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
      expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
    });
  });

  it('should allow going back to menu from search view', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to search view
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    expect(screen.getByTestId('product-search')).toBeInTheDocument();

    // Click close in search
    fireEvent.click(screen.getByTestId('search-close-btn'));

    // Should return to menu
    await waitFor(() => {
      expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
      expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
    });
  });

  it('should clear prefilled data when going back to menu from manual entry', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to search and select product
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    fireEvent.click(screen.getByTestId('select-product-btn'));

    // Verify prefilled data is present
    await waitFor(() => {
      expect(screen.getByTestId('prefilled-data')).toHaveTextContent('Test Product');
    });

    // Go back to menu
    fireEvent.click(screen.getByText('← Atrás'));

    // Go to manual entry again
    await waitFor(() => {
      fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));
    });

    // Should have no prefilled data
    await waitFor(() => {
      expect(screen.getByTestId('prefilled-data')).toHaveTextContent('No prefilled data');
    });
  });

  it('should pass selected collection to AddItemForm', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to manual entry
    fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));

    // Should pass selected collection
    expect(screen.getByTestId('selected-collection')).toHaveTextContent('Test Collection');
  });

  it('should handle form submission correctly', async () => {
    mockOnAddItem.mockResolvedValue(undefined);

    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to manual entry and submit form
    fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));
    fireEvent.click(screen.getByTestId('submit-form-btn'));

    // Should call onAddItem with correct data
    await waitFor(() => {
      expect(mockOnAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Item',
          currentPrice: 50,
          collectionId: '1'
        })
      );
    });
  });

  it('should reset state when modal is closed', () => {
    const { rerender } = render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to search view and select product
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    fireEvent.click(screen.getByTestId('select-product-btn'));

    // Close modal
    rerender(
      <AddItemModal
        isOpen={false}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Reopen modal
    rerender(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Should be back to menu view
    expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
    expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
  });
});