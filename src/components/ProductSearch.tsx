import React, { useState } from 'react';
import { WishlistItem } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ProductSearchResult {
  name: string;
  price?: number;
  url?: string;
  image?: string;
  source: string;
}

interface ProductSearchProps {
  onSelectProduct: (product: Partial<WishlistItem>) => void;
  onClose: () => void;
}

/**
 * ProductSearch component for searching products online
 * Provides search functionality and product selection
 */
export const ProductSearch: React.FC<ProductSearchProps> = ({
  onSelectProduct,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search for products using various methods
   */
  const searchProducts = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    
    try {
      // For now, we'll create mock results since we can't directly access Google Shopping API
      // In a real implementation, you would use:
      // 1. Google Shopping API
      // 2. Amazon Product API
      // 3. Web scraping service
      // 4. Product aggregator APIs
      
      const mockResults: ProductSearchResult[] = [
        {
          name: `${searchQuery} - Premium Model`,
          price: 299.99,
          url: `https://example.com/product/${searchQuery.toLowerCase().replace(/\s+/g, '-')}`,
          image: 'https://via.placeholder.com/150x150?text=Product',
          source: 'Amazon'
        },
        {
          name: `${searchQuery} - Standard Edition`,
          price: 199.99,
          url: `https://example.com/product/${searchQuery.toLowerCase().replace(/\s+/g, '-')}-standard`,
          image: 'https://via.placeholder.com/150x150?text=Product',
          source: 'eBay'
        },
        {
          name: `${searchQuery} - Budget Option`,
          price: 99.99,
          url: `https://example.com/product/${searchQuery.toLowerCase().replace(/\s+/g, '-')}-budget`,
          image: 'https://via.placeholder.com/150x150?text=Product',
          source: 'Best Buy'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSearchResults(mockResults);
      
    } catch (error) {
      setError('Failed to search for products. Please try again.');
      console.error('Product search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handle selecting a product from search results
   */
  const handleSelectProduct = (result: ProductSearchResult) => {
    const productData: Partial<WishlistItem> = {
      name: result.name,
      currentPrice: result.price || 0,
      originalPrice: result.price || 0,
      productUrl: result.url,
      imageUrl: result.image
    };
    
    onSelectProduct(productData);
  };

  /**
   * Handle search form submission
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchProducts();
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Search for Products
        </h3>
        <p className="text-gray-600 text-sm">
          Find products from popular online stores and add them to your wishlist
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <Input
          label="Search Products"
          type="text"
          placeholder="e.g., iPhone 15, MacBook Pro, Nike shoes..."
          value={searchQuery}
          onChange={setSearchQuery}
          required
        />
        
        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!searchQuery.trim() || isSearching}
            loading={isSearching}
            className="flex-1"
          >
            {isSearching ? 'Searching...' : 'Search Products'}
          </Button>
          
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSearching}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">
            Search Results ({searchResults.length})
          </h4>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-pastel-lavender-300 transition-colors cursor-pointer"
                onClick={() => handleSelectProduct(result)}
              >
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {result.image ? (
                    <img 
                      src={result.image} 
                      alt={result.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center">
                      No Image
                    </div>
                  )}
                </div>
                
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-800 truncate">
                    {result.name}
                  </h5>
                  <p className="text-sm text-gray-600">
                    From {result.source}
                  </p>
                  {result.price && (
                    <p className="text-lg font-semibold text-pastel-lavender-600">
                      ${result.price.toFixed(2)}
                    </p>
                  )}
                </div>
                
                {/* Select Button */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    if (e) {
                      e.stopPropagation();
                    }
                    handleSelectProduct(result);
                  }}
                >
                  Select
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No products found for "{searchQuery}". Try a different search term.
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-medium text-blue-800 mb-2">How to use:</h5>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Search for any product by name or description</li>
          <li>• Select a product from the results to auto-fill the form</li>
          <li>• You can still edit the details before adding to your wishlist</li>
          <li>• Or paste a direct product URL in the manual form</li>
        </ul>
      </div>
    </div>
  );
};