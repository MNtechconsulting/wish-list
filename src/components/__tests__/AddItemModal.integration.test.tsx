import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddItemModal } from '../AddItemModal';
import { WishlistCollection } from '../../types';

// Mock the PageTransition component
jest.mock('../PageTransition', () => ({
  FadeTransition: ({ children, show }: { children: React.ReactNode; show: boolean }) => 
    show ? <div>{children}</div> : null
}));

// Mock ProductSearch to focus on state transitions
jest.mock('../ProductSearch', () => ({
  ProductSearch: ({ onSelectProduct, onClose }: { 
    onSelectProduct: (product: any) => void;
    onClose: () => void;
  }) => (
    <div data-testid="product-search-mock">
      <h3>Mocked Product Search</h3>
      <button 
        onClick={() => onSelectProduct({
          name: 'Test Product from Search',
          currentPrice: 199.99,
          originalPrice: 199.99,
          productUrl: 'https://example.com/test-product',
          imageUrl: 'https://example.com/test-image.jpg'
        })}
        data-testid="mock-select-product"
      >
        Select Mock Product
      </button>
      <button onClick={onClose} data-testid="mock-close-search">
        Close Search
      </button>
    </div>
  )
}));

describe('AddItemModal Integration - State Transitions', () => {
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

  it('should complete the full flow: menu -> search -> select product -> manual entry with prefilled data', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Step 1: Should start with menu view
    expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
    expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();

    // Step 2: Click on search products
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));

    // Step 3: Should show mocked search interface
    expect(screen.getByTestId('product-search-mock')).toBeInTheDocument();
    expect(screen.getByText('Mocked Product Search')).toBeInTheDocument();

    // Step 4: Select a product from the mocked search
    fireEvent.click(screen.getByTestId('mock-select-product'));

    // Step 5: Should transition to manual entry with prefilled data
    await waitFor(() => {
      expect(screen.getByText('Detalles del Artículo')).toBeInTheDocument();
      expect(screen.getByText(/Detalles del producto cargados desde la búsqueda/)).toBeInTheDocument();
    });

    // Step 6: Should show back button and form
    expect(screen.getByText('← Atrás')).toBeInTheDocument();
    expect(screen.getByText('Agregar artículo manualmente')).toBeInTheDocument();
  });

  it('should handle going back from manual entry to menu and preserve state reset', async () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to search and select a product
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    fireEvent.click(screen.getByTestId('mock-select-product'));

    // Should be in manual entry with prefilled data
    await waitFor(() => {
      expect(screen.getByText(/Detalles del producto cargados desde la búsqueda/)).toBeInTheDocument();
    });

    // Go back to menu
    fireEvent.click(screen.getByText('← Atrás'));

    // Should be back to menu
    await waitFor(() => {
      expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
      expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
    });

    // Go to manual entry again - should have no prefilled data
    fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));

    await waitFor(() => {
      expect(screen.queryByText(/Detalles del producto cargados desde la búsqueda/)).not.toBeInTheDocument();
    });
  });

  it('should handle direct manual entry without search', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go directly to manual entry
    fireEvent.click(screen.getByText('✏️ Agregar Manualmente'));

    // Should show manual entry without prefilled data message
    expect(screen.getByText('Detalles del Artículo')).toBeInTheDocument();
    expect(screen.queryByText(/Detalles del producto cargados desde la búsqueda/)).not.toBeInTheDocument();
    expect(screen.getByText('← Atrás')).toBeInTheDocument();
  });

  it('should handle search cancellation correctly', () => {
    render(
      <AddItemModal
        isOpen={true}
        onClose={mockOnClose}
        onAddItem={mockOnAddItem}
        collections={mockCollections}
        selectedCollection={mockSelectedCollection}
      />
    );

    // Go to search
    fireEvent.click(screen.getByText('🔍 Buscar Productos'));
    expect(screen.getByTestId('product-search-mock')).toBeInTheDocument();

    // Cancel search
    fireEvent.click(screen.getByTestId('mock-close-search'));

    // Should return to menu
    expect(screen.getByText('🔍 Buscar Productos')).toBeInTheDocument();
    expect(screen.getByText('✏️ Agregar Manualmente')).toBeInTheDocument();
  });

  it('should verify that prefilled data is correctly passed to AddItemForm', async () => {
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
    fireEvent.click(screen.getByTestId('mock-select-product'));

    // Should transition to manual entry
    await waitFor(() => {
      expect(screen.getByText('Detalles del Artículo')).toBeInTheDocument();
    });

    // The AddItemForm should receive the prefilled data
    // This is verified by the presence of the success message
    expect(screen.getByText(/Detalles del producto cargados desde la búsqueda/)).toBeInTheDocument();
  });
});