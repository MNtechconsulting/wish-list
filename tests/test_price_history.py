"""
Unit tests for price history endpoints.
"""
import pytest
from httpx import AsyncClient


class TestPriceHistory:
    """Test price history functionality."""
    
    async def test_automatic_price_history_creation(self, client: AsyncClient, auth_headers: dict):
        """Test that price history is automatically created when item is created."""
        # Create item
        item_data = {"title": "Price Test Item", "initial_price": "25.99"}
        create_response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Get price history
        response = await client.get(f"/wishlist/{item_id}/price-history", headers=auth_headers)
        
        assert response.status_code == 200
        history = response.json()
        assert len(history) == 1
        assert float(history[0]["price"]) == 25.99
        assert "checked_at" in history[0]
    
    async def test_add_price_history_entry(self, client: AsyncClient, auth_headers: dict):
        """Test manually adding a price history entry."""
        # Create item
        item_data = {"title": "Price Update Item", "initial_price": "30.00"}
        create_response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Add price history entry
        price_data = {"price": "27.50"}
        response = await client.post(
            f"/wishlist/{item_id}/price-history", 
            json=price_data, 
            headers=auth_headers
        )
        
        assert response.status_code == 201
        data = response.json()
        assert float(data["price"]) == 27.50
        assert "checked_at" in data
        
        # Verify history now has 2 entries
        history_response = await client.get(f"/wishlist/{item_id}/price-history", headers=auth_headers)
        history = history_response.json()
        assert len(history) == 2
    
    async def test_price_history_ordering(self, client: AsyncClient, auth_headers: dict):
        """Test that price history is ordered by newest first."""
        # Create item
        item_data = {"title": "Order Test Item", "initial_price": "20.00"}
        create_response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Add multiple price entries
        prices = ["18.00", "22.00", "19.50"]
        for price in prices:
            await client.post(
                f"/wishlist/{item_id}/price-history",
                json={"price": price},
                headers=auth_headers
            )
        
        # Get history and verify ordering
        response = await client.get(f"/wishlist/{item_id}/price-history", headers=auth_headers)
        history = response.json()
        
        assert len(history) == 4  # Initial + 3 added
        # Should be ordered newest first, so last added price should be first
        assert float(history[0]["price"]) == 19.50
    
    async def test_price_history_access_control(self, client: AsyncClient):
        """Test that users can only access price history for their own items."""
        # Create two users
        user1_data = {"email": "priceuser1@example.com", "password": "pass123"}
        user2_data = {"email": "priceuser2@example.com", "password": "pass123"}
        
        await client.post("/auth/register", json=user1_data)
        await client.post("/auth/register", json=user2_data)
        
        # Get tokens
        token1_response = await client.post("/auth/login", json=user1_data)
        token2_response = await client.post("/auth/login", json=user2_data)
        
        headers1 = {"Authorization": f"Bearer {token1_response.json()['access_token']}"}
        headers2 = {"Authorization": f"Bearer {token2_response.json()['access_token']}"}
        
        # User 1 creates an item
        item_data = {"title": "User 1 Price Item", "initial_price": "15.00"}
        create_response = await client.post("/wishlist", json=item_data, headers=headers1)
        item_id = create_response.json()["id"]
        
        # User 2 cannot access User 1's price history
        response = await client.get(f"/wishlist/{item_id}/price-history", headers=headers2)
        assert response.status_code == 404
        
        # User 2 cannot add price history to User 1's item
        price_data = {"price": "12.00"}
        response = await client.post(
            f"/wishlist/{item_id}/price-history",
            json=price_data,
            headers=headers2
        )
        assert response.status_code == 404
    
    async def test_price_history_invalid_price(self, client: AsyncClient, auth_headers: dict):
        """Test adding invalid price to history."""
        # Create item
        item_data = {"title": "Invalid Price Item", "initial_price": "10.00"}
        create_response = await client.post("/wishlist", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Try to add negative price
        price_data = {"price": "-5.00"}
        response = await client.post(
            f"/wishlist/{item_id}/price-history",
            json=price_data,
            headers=auth_headers
        )
        assert response.status_code == 422