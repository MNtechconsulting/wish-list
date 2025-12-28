import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import * as useWishlistHook from '../../hooks/useWishlist';
import * as apiService from '../../services/api';

// Mock the useWishlist hook
jest.mock('../../hooks/useWishlist');
const mockUseWishlist = useWishlistHook.useWishlist as jest.MockedFunction<typeof useWishlistHook.useWishlist>;

// Mock the API service
jest.mock('../../services/api');
const mockApiService = apiService.apiService as jest.Mocked<typeof apiService.apiService>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard useWishlist Hook Integration', () => {
  const mockAddItem = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useWishlist hook return value
    mockUseWishlist.mockReturnValue({
      items: [],
      isLoading: false,
      error: null,
      addItem: mockAddItem,
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      getItem: jest.fn(),
      refreshItems: jest.fn(),
      clearError: mockClearError,
    });

    // Mock API service methods
    mockApiService.getWishlistCollections.mockResolvedValue([
      {
        id: 1,
        name: 'Default List',
        description: 'My default wishlist',
        color: '#3B82F6',
        is_default: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        item_count: 0
      }
    ]);
  });

  it('uses useWishlist hook for state management', () => {
    renderDashboard();
    
    // Verify that useWishlist hook is called
    expect(mockUseWishlist).toHaveBeenCalled();
  });

  it('extracts addItem method from useWishlist hook', () => {
    renderDashboard();
    
    // Verify that the hook returns the expected methods
    const hookResult = mockUseWishlist.mock.results[0].value;
    expect(hookResult.addItem).toBe(mockAddItem);
    expect(hookResult.clearError).toBe(mockClearError);
  });

  it('displays error from useWishlist hook', async () => {
    const errorMessage = 'Failed to load items';
    mockUseWishlist.mockReturnValue({
      items: [],
      isLoading: false,
      error: errorMessage,
      addItem: mockAddItem,
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      getItem: jest.fn(),
      refreshItems: jest.fn(),
      clearError: mockClearError,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('calls clearError when error close button is clicked', async () => {
    const errorMessage = 'Failed to load items';
    mockUseWishlist.mockReturnValue({
      items: [],
      isLoading: false,
      error: errorMessage,
      addItem: mockAddItem,
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      getItem: jest.fn(),
      refreshItems: jest.fn(),
      clearError: mockClearError,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Cerrar');
    fireEvent.click(closeButton);

    expect(mockClearError).toHaveBeenCalled();
  });
});