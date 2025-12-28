/**
 * API service for communicating with the Wishlist Backend API
 * Handles authentication, wishlist operations, and error handling
 */

const API_BASE_URL = 'http://localhost:8000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface WishlistItemAPI {
  id: number;
  title: string;
  product_url?: string;
  initial_price: string;
  current_price: string;
  currency: string;
  collection_id: number;
  created_at: string;
  updated_at: string;
}

export interface WishlistCollectionAPI {
  id: number;
  name: string;
  description?: string;
  color?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  item_count: number;
  items?: WishlistItemAPI[];
}

export interface CreateWishlistItemRequest {
  title: string;
  product_url?: string;
  initial_price: number;
  currency?: string;
  collection_id: number;
}

export interface CreateWishlistCollectionRequest {
  name: string;
  description?: string;
  color?: string;
  is_default?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, errorData.message || 'Request failed', errorData);
    }
    return response.json();
  }

  // Authentication endpoints
  async register(data: RegisterRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      try {
        const errorData = JSON.parse(errorText);
        throw new ApiError(response.status, errorData.message || 'Registration failed', errorData);
      } catch (parseError) {
        throw new ApiError(response.status, 'Registration failed', { originalError: errorText });
      }
    }
    
    const result = await response.json();
    return result;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await this.handleResponse<AuthResponse>(response);
    
    // Store token in localStorage
    localStorage.setItem('auth_token', result.access_token);
    localStorage.setItem('token_expires_at', (Date.now() + result.expires_in * 1000).toString());
    
    return result;
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<User>(response);
  }

  // Wishlist Collections endpoints
  async getWishlistCollections(): Promise<WishlistCollectionAPI[]> {
    const response = await fetch(`${API_BASE_URL}/collections/`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WishlistCollectionAPI[]>(response);
  }

  async createWishlistCollection(data: CreateWishlistCollectionRequest): Promise<WishlistCollectionAPI> {
    const response = await fetch(`${API_BASE_URL}/collections/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<WishlistCollectionAPI>(response);
  }

  async getWishlistCollection(id: number): Promise<WishlistCollectionAPI> {
    const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WishlistCollectionAPI>(response);
  }

  async updateWishlistCollection(id: number, data: Partial<CreateWishlistCollectionRequest>): Promise<WishlistCollectionAPI> {
    const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<WishlistCollectionAPI>(response);
  }

  async deleteWishlistCollection(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/collections/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, errorData.message || 'Delete failed', errorData);
    }
  }

  async setDefaultCollection(id: number): Promise<WishlistCollectionAPI> {
    const response = await fetch(`${API_BASE_URL}/collections/${id}/set-default`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WishlistCollectionAPI>(response);
  }

  // Wishlist endpoints
  async getWishlistItems(collectionId?: number): Promise<WishlistItemAPI[]> {
    const url = collectionId 
      ? `${API_BASE_URL}/wishlist/?collection_id=${collectionId}`
      : `${API_BASE_URL}/wishlist/`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WishlistItemAPI[]>(response);
  }

  async createWishlistItem(data: CreateWishlistItemRequest): Promise<WishlistItemAPI> {
    const response = await fetch(`${API_BASE_URL}/wishlist/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return this.handleResponse<WishlistItemAPI>(response);
  }

  async getWishlistItem(id: number): Promise<WishlistItemAPI> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WishlistItemAPI>(response);
  }

  async updateWishlistItem(id: number, data: Partial<CreateWishlistItemRequest>): Promise<WishlistItemAPI> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse<WishlistItemAPI>(response);
  }

  async deleteWishlistItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/wishlist/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new ApiError(response.status, errorData.message || 'Delete failed', errorData);
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!token || !expiresAt) {
      return false;
    }
    
    return Date.now() < parseInt(expiresAt);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expires_at');
  }
}

export const apiService = new ApiService();
export { ApiError };