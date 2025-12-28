"""
Unit tests for wishlist endpoints.
"""
import pytest
from httpx import AsyncClient
from decimal import Decimal


class TestWishlistCRUD:
    """Test wishlist CRUD operations."""
    
    async def test_create_wishlist_item(self, client: AsyncClient, auth_headers: dict):
        """Test creating a new wishlist item."""
        item_data = {
            "title": "Test Product",
            "product_url": "https://example.com/product",
            "initial_price": "29.99",
            "currency": "USD"
        }
        
        response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == item_data["title"]
        assert data["product_url"] == item_data["product_url"]
        assert float(data["initial_price"]) == float(item_data["initial_price"])
        assert float(data["current_price"]) == float(data["initial_price"])
        assert data["currency"] == item_data["currency"]
        assert "id" in data
        assert "created_at" in data
    
    async def test_create_item_unauthorized(self, client: AsyncClient):
        """Test creating item without authentication."""
        item_data = {
            "title": "Test Product",
            "initial_price": "29.99"
        }
        
        response = await client.post("/wishlist", json=item_data)
        assert response.status_code == 401
    
    async def test_get_user_wishlist(self, client: AsyncClient, auth_headers: dict):
        """Test retrieving user's wishlist."""
        # Create a few items first
        items = [
            {"title": "Item 1", "initial_price": "10.00"},
            {"title": "Item 2", "initial_price": "20.00"},
            {"title": "Item 3", "initial_price": "30.00"}
        ]
        
        for item in items:
            await client.post("/wishlist", json=item, headers=auth_headers)
        
        # Get wishlist
        response = await client.get("/wishlist", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        
        # Check ordering (newest first)
        titles = [item["title"] for item in data]
        assert titles == ["Item 3", "Item 2", "Item 1"]
    
    async def test_get_specific_item(self, client: AsyncClient, auth_headers: dict):
        """Test retrieving a specific wishlist item."""
        # Create item
        item_data = {"title": "Specific Item", "initial_price": "15.50"}
        create_response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Get specific item
        response = await client.get(f"/wishlist/{item_id}", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == item_data["title"]
        assert data["id"] == item_id
    
    async def test_get_nonexistent_item(self, client: AsyncClient, auth_headers: dict):
        """Test retrieving non-existent item."""
        response = await client.get("/wishlist/99999", headers=auth_headers)
        assert response.status_code == 404
    
    async def test_update_wishlist_item(self, client: AsyncClient, auth_headers: dict):
        """Test updating a wishlist item."""
        # Create item
        item_data = {"title": "Original Title", "initial_price": "25.00"}
        create_response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Update item
        update_data = {
            "title": "Updated Title",
            "current_price": "22.50"
        }
        response = await client.put(f"/wishlist/{item_id}", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == update_data["title"]
        assert float(data["current_price"]) == float(update_data["current_price"])
        assert float(data["initial_price"]) == 25.00  # Should remain unchanged
    
    async def test_delete_wishlist_item(self, client: AsyncClient, auth_headers: dict):
        """Test deleting a wishlist item."""
        # Create item
        item_data = {"title": "To Delete", "initial_price": "10.00"}
        create_response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Delete item
        response = await client.delete(f"/wishlist/{item_id}", headers=auth_headers)
        assert response.status_code == 200
        
        # Verify item is gone
        get_response = await client.get(f"/wishlist/{item_id}", headers=auth_headers)
        assert get_response.status_code == 404


class TestDataIsolation:
    """Test that users can only access their own data."""
    
    async def test_user_isolation(self, client: AsyncClient):
        """Test that users can only see their own wishlist items."""
        # Create two users
        user1_data = {"email": "user1@example.com", "password": "pass123"}
        user2_data = {"email": "user2@example.com", "password": "pass123"}
        
        await client.post("/auth/register", json=user1_data)
        await client.post("/auth/register", json=user2_data)
        
        # Get tokens for both users
        token1_response = await client.post("/auth/login", json=user1_data)
        token2_response = await client.post("/auth/login", json=user2_data)
        
        headers1 = {"Authorization": f"Bearer {token1_response.json()['access_token']}"}
        headers2 = {"Authorization": f"Bearer {token2_response.json()['access_token']}"}
        
        # User 1 creates an item
        item_data = {"title": "User 1 Item", "initial_price": "10.00"}
        create_response = await client.post("/wishlist", json=item_data, headers=headers1)
        item_id = create_response.json()["id"]
        
        # User 1 can see their item
        response1 = await client.get("/wishlist", headers=headers1)
        assert response1.status_code == 200
        assert len(response1.json()) == 1
        
        # User 2 cannot see User 1's item
        response2 = await client.get("/wishlist", headers=headers2)
        assert response2.status_code == 200
        assert len(response2.json()) == 0
        
        # User 2 cannot access User 1's specific item
        response3 = await client.get(f"/wishlist/{item_id}", headers=headers2)
        assert response3.status_code == 404


class TestInputValidation:
    """Test input validation for wishlist endpoints."""
    
    async def test_create_item_missing_title(self, client: AsyncClient, auth_headers: dict):
        """Test creating item without required title."""
        item_data = {"initial_price": "10.00"}
        response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        assert response.status_code == 422
    
    async def test_create_item_invalid_price(self, client: AsyncClient, auth_headers: dict):
        """Test creating item with invalid price."""
        item_data = {
            "title": "Test Item",
            "initial_price": "-5.00"  # Negative price
        }
        response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        assert response.status_code == 422
    
    async def test_create_item_invalid_currency(self, client: AsyncClient, auth_headers: dict):
        """Test creating item with invalid currency code."""
        item_data = {
            "title": "Test Item",
            "initial_price": "10.00",
            "currency": "INVALID"  # Invalid currency code
        }
        response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        assert response.status_code == 422