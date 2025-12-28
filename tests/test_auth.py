"""
Unit tests for authentication endpoints.
"""
import pytest
from httpx import AsyncClient


class TestUserRegistration:
    """Test user registration functionality."""
    
    async def test_register_valid_user(self, client: AsyncClient):
        """Test successful user registration."""
        user_data = {
            "email": "newuser@example.com",
            "password": "securepass123"
        }
        
        response = await client.post("/auth/register", json=user_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == user_data["email"]
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data
        assert "hashed_password" not in data
    
    async def test_register_duplicate_email(self, client: AsyncClient):
        """Test registration with duplicate email."""
        user_data = {
            "email": "duplicate@example.com",
            "password": "password123"
        }
        
        # First registration should succeed
        response1 = await client.post("/auth/register", json=user_data)
        assert response1.status_code == 201
        
        # Second registration should fail
        response2 = await client.post("/auth/register", json=user_data)
        assert response2.status_code == 400
        assert "already registered" in response2.json()["detail"].lower()
    
    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email format."""
        user_data = {
            "email": "invalid-email",
            "password": "password123"
        }
        
        response = await client.post("/auth/register", json=user_data)
        assert response.status_code == 422
    
    async def test_register_short_password(self, client: AsyncClient):
        """Test registration with password too short."""
        user_data = {
            "email": "test@example.com",
            "password": "short"
        }
        
        response = await client.post("/auth/register", json=user_data)
        assert response.status_code == 422


class TestUserLogin:
    """Test user login functionality."""
    
    async def test_login_valid_credentials(self, client: AsyncClient):
        """Test successful login with valid credentials."""
        # Register user first
        user_data = {
            "email": "logintest@example.com",
            "password": "loginpass123"
        }
        await client.post("/auth/register", json=user_data)
        
        # Login
        response = await client.post("/auth/login", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
    
    async def test_login_invalid_email(self, client: AsyncClient):
        """Test login with non-existent email."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = await client.post("/auth/login", json=login_data)
        assert response.status_code == 401
    
    async def test_login_wrong_password(self, client: AsyncClient):
        """Test login with wrong password."""
        # Register user first
        user_data = {
            "email": "wrongpass@example.com",
            "password": "correctpass123"
        }
        await client.post("/auth/register", json=user_data)
        
        # Login with wrong password
        login_data = {
            "email": "wrongpass@example.com",
            "password": "wrongpass123"
        }
        
        response = await client.post("/auth/login", json=login_data)
        assert response.status_code == 401


class TestProtectedEndpoints:
    """Test protected endpoint access."""
    
    async def test_get_current_user_valid_token(self, client: AsyncClient, auth_headers: dict):
        """Test accessing current user info with valid token."""
        response = await client.get("/auth/me", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "email" in data
        assert "id" in data
        assert "created_at" in data
        assert "password" not in data
    
    async def test_get_current_user_no_token(self, client: AsyncClient):
        """Test accessing current user info without token."""
        response = await client.get("/auth/me")
        assert response.status_code == 401
    
    async def test_get_current_user_invalid_token(self, client: AsyncClient):
        """Test accessing current user info with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await client.get("/auth/me", headers=headers)
        assert response.status_code == 401