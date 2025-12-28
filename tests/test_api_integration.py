"""
Integration tests for complete API flows.
"""
import pytest
from httpx import AsyncClient


class TestCompleteAPIFlows:
    """Test end-to-end API workflows."""
    
    async def test_complete_user_journey(self, client: AsyncClient):
        """Test complete user journey from registration to wishlist management."""
        # 1. Register a new user
        user_data = {
            "email": "journey@example.com",
            "password": "journeypass123"
        }
        register_response = await client.post("/auth/register", json=user_data)
        assert register_response.status_code == 201
        user_info = register_response.json()
        assert user_info["email"] == user_data["email"]
        
        # 2. Login to get token
        login_response = await client.post("/auth/login", json=user_data)
        assert login_response.status_code == 200
        token_data = login_response.json()
        assert "access_token" in token_data
        
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        
        # 3. Verify authentication works
        me_response = await client.get("/auth/me", headers=headers)
        assert me_response.status_code == 200
        me_data = me_response.json()
        assert me_data["email"] == user_data["email"]
        
        # 4. Create wishlist items
        items = [
            {"title": "Laptop", "initial_price": "999.99", "product_url": "https://example.com/laptop"},
            {"title": "Mouse", "initial_price": "29.99"},
            {"title": "Keyboard", "initial_price": "79.99", "currency": "USD"}
        ]
        
        created_items = []
        for item in items:
            response = await client.post("/wishlist", json=item, headers=headers)
            assert response.status_code == 201
            created_items.append(response.json())
        
        # 5. Retrieve wishlist and verify all items
        wishlist_response = await client.get("/wishlist", headers=headers)
        assert wishlist_response.status_code == 200
        wishlist = wishlist_response.json()
        assert len(wishlist) == 3
        
        # Verify ordering (newest first)
        titles = [item["title"] for item in wishlist]
        assert titles == ["Keyboard", "Mouse", "Laptop"]
        
        # 6. Update an item
        laptop_id = created_items[0]["id"]
        update_data = {"title": "Gaming Laptop", "current_price": "899.99"}
        update_response = await client.put(f"/wishlist/{laptop_id}", json=update_data, headers=headers)
        assert update_response.status_code == 200
        updated_item = update_response.json()
        assert updated_item["title"] == "Gaming Laptop"
        assert float(updated_item["current_price"]) == 899.99
        
        # 7. Add price history
        price_data = {"price": "849.99"}
        price_response = await client.post(
            f"/wishlist/{laptop_id}/price-history",
            json=price_data,
            headers=headers
        )
        assert price_response.status_code == 201
        
        # 8. Verify price history
        history_response = await client.get(f"/wishlist/{laptop_id}/price-history", headers=headers)
        assert history_response.status_code == 200
        history = history_response.json()
        assert len(history) == 2  # Initial price + added price
        
        # 9. Delete an item
        mouse_id = created_items[1]["id"]
        delete_response = await client.delete(f"/wishlist/{mouse_id}", headers=headers)
        assert delete_response.status_code == 200
        
        # 10. Verify item is deleted
        final_wishlist_response = await client.get("/wishlist", headers=headers)
        final_wishlist = final_wishlist_response.json()
        assert len(final_wishlist) == 2
        
        # Verify deleted item is not accessible
        get_deleted_response = await client.get(f"/wishlist/{mouse_id}", headers=headers)
        assert get_deleted_response.status_code == 404
    
    async def test_concurrent_user_operations(self, client: AsyncClient):
        """Test that multiple users can operate independently."""
        # Create multiple users
        users = [
            {"email": "user1@concurrent.com", "password": "pass123"},
            {"email": "user2@concurrent.com", "password": "pass123"},
            {"email": "user3@concurrent.com", "password": "pass123"}
        ]
        
        # Register all users
        for user in users:
            response = await client.post("/auth/register", json=user)
            assert response.status_code == 201
        
        # Get tokens for all users
        tokens = []
        for user in users:
            response = await client.post("/auth/login", json=user)
            assert response.status_code == 200
            token = response.json()["access_token"]
            tokens.append({"Authorization": f"Bearer {token}"})
        
        # Each user creates items
        for i, headers in enumerate(tokens):
            item_data = {
                "title": f"User {i+1} Item",
                "initial_price": f"{(i+1) * 10}.00"
            }
            response = await client.post("/wishlist", json=item_data, headers=headers)
            assert response.status_code == 201
        
        # Verify each user only sees their own items
        for i, headers in enumerate(tokens):
            response = await client.get("/wishlist", headers=headers)
            assert response.status_code == 200
            wishlist = response.json()
            assert len(wishlist) == 1
            assert wishlist[0]["title"] == f"User {i+1} Item"
    
    async def test_error_handling_flow(self, client: AsyncClient):
        """Test various error scenarios in a realistic flow."""
        # 1. Try to access protected endpoint without token
        response = await client.get("/wishlist")
        assert response.status_code == 401
        
        # 2. Try to login with non-existent user
        login_data = {"email": "nonexistent@example.com", "password": "password"}
        response = await client.post("/auth/login", json=login_data)
        assert response.status_code == 401
        
        # 3. Register user with invalid data
        invalid_user = {"email": "invalid-email", "password": "short"}
        response = await client.post("/auth/register", json=invalid_user)
        assert response.status_code == 422
        
        # 4. Register valid user
        valid_user = {"email": "errortest@example.com", "password": "validpass123"}
        response = await client.post("/auth/register", json=valid_user)
        assert response.status_code == 201
        
        # 5. Try to register same user again
        response = await client.post("/auth/register", json=valid_user)
        assert response.status_code == 400
        
        # 6. Login and get token
        response = await client.post("/auth/login", json=valid_user)
        assert response.status_code == 200
        token = response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # 7. Try to create item with invalid data
        invalid_item = {"title": "", "initial_price": "-10.00"}
        response = await client.post("/wishlist", json=invalid_item, headers=headers)
        assert response.status_code == 422
        
        # 8. Create valid item
        valid_item = {"title": "Valid Item", "initial_price": "25.00"}
        response = await client.post("/wishlist", json=valid_item, headers=headers)
        assert response.status_code == 201
        item_id = response.json()["id"]
        
        # 9. Try to access non-existent item
        response = await client.get("/wishlist/99999", headers=headers)
        assert response.status_code == 404
        
        # 10. Try to update with invalid data
        invalid_update = {"current_price": "-5.00"}
        response = await client.put(f"/wishlist/{item_id}", json=invalid_update, headers=headers)
        assert response.status_code == 422
        
        # 11. Valid update
        valid_update = {"current_price": "20.00"}
        response = await client.put(f"/wishlist/{item_id}", json=valid_update, headers=headers)
        assert response.status_code == 200