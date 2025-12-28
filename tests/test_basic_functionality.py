import subprocess
import time
import requests
import json
from pathlib import Path
import uuid


def test_api_server_starts():
    """Test that the API server can start successfully."""
    # Start the server in the background
    process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app.main:app", "--port", "8001"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Give the server time to start
    time.sleep(3)
    
    try:
        # Check if server is responding
        response = requests.get("http://localhost:8001/docs", timeout=5)
        assert response.status_code == 200
        print("✅ API server starts successfully")
        
        # Test basic health check
        response = requests.get("http://localhost:8001/", timeout=5)
        assert response.status_code == 200
        print("✅ Root endpoint responds")
        
    finally:
        # Clean up
        process.terminate()
        process.wait()


def test_user_registration_and_login():
    """Test basic user registration and login flow."""
    # Start the server
    process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app.main:app", "--port", "8002"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    time.sleep(3)
    
    try:
        base_url = "http://localhost:8002"
        
        # Test user registration with unique email
        unique_id = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"test{unique_id}@example.com",
            "password": "testpass123"
        }
        
        response = requests.post(f"{base_url}/auth/register", json=user_data, timeout=5)
        assert response.status_code == 201
        user_info = response.json()
        assert user_info["email"] == user_data["email"]
        assert "id" in user_info
        print("✅ User registration works")
        
        # Test user login
        response = requests.post(f"{base_url}/auth/login", json=user_data, timeout=5)
        assert response.status_code == 200
        token_data = response.json()
        assert "access_token" in token_data
        assert token_data["token_type"] == "bearer"
        print("✅ User login works")
        
        # Test protected endpoint
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        response = requests.get(f"{base_url}/auth/me", headers=headers, timeout=5)
        assert response.status_code == 200
        me_data = response.json()
        assert me_data["email"] == user_data["email"]
        print("✅ Protected endpoint access works")
        
    finally:
        process.terminate()
        process.wait()


def test_wishlist_operations():
    """Test basic wishlist CRUD operations."""
    # Start the server
    process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app.main:app", "--port", "8003"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    time.sleep(3)
    
    try:
        base_url = "http://localhost:8003"
        
        # Register and login with unique email
        unique_id = str(uuid.uuid4())[:8]
        user_data = {"email": f"wishlist{unique_id}@example.com", "password": "testpass123"}
        requests.post(f"{base_url}/auth/register", json=user_data, timeout=5)
        
        login_response = requests.post(f"{base_url}/auth/login", json=user_data, timeout=5)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create wishlist item
        item_data = {
            "title": "Test Product",
            "initial_price": "29.99",
            "currency": "USD"
        }
        
        response = requests.post(f"{base_url}/wishlist", json=item_data, headers=headers, timeout=5)
        assert response.status_code == 201
        item = response.json()
        assert item["title"] == item_data["title"]
        assert float(item["initial_price"]) == 29.99
        item_id = item["id"]
        print("✅ Wishlist item creation works")
        
        # Get wishlist
        response = requests.get(f"{base_url}/wishlist", headers=headers, timeout=5)
        assert response.status_code == 200
        wishlist = response.json()
        assert len(wishlist) == 1
        assert wishlist[0]["title"] == item_data["title"]
        print("✅ Wishlist retrieval works")
        
        # Update item
        update_data = {"title": "Updated Product", "current_price": "25.99"}
        response = requests.put(f"{base_url}/wishlist/{item_id}", json=update_data, headers=headers, timeout=5)
        assert response.status_code == 200
        updated_item = response.json()
        assert updated_item["title"] == "Updated Product"
        assert float(updated_item["current_price"]) == 25.99
        print("✅ Wishlist item update works")
        
        # Delete item
        response = requests.delete(f"{base_url}/wishlist/{item_id}", headers=headers, timeout=5)
        assert response.status_code == 204  # No Content for successful deletion
        print("✅ Wishlist item deletion works")
        
        # Verify item is deleted
        response = requests.get(f"{base_url}/wishlist", headers=headers, timeout=5)
        assert response.status_code == 200
        wishlist = response.json()
        assert len(wishlist) == 0
        print("✅ Item deletion verified")
        
    finally:
        process.terminate()
        process.wait()


def test_error_handling():
    """Test error handling scenarios."""
    # Start the server
    process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app.main:app", "--port", "8004"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    time.sleep(3)
    
    try:
        base_url = "http://localhost:8004"
        
        # Test invalid registration
        invalid_user = {"email": "invalid-email", "password": "short"}
        response = requests.post(f"{base_url}/auth/register", json=invalid_user, timeout=5)
        assert response.status_code == 422
        print("✅ Input validation works")
        
        # Test unauthorized access
        response = requests.get(f"{base_url}/wishlist", timeout=5)
        assert response.status_code == 403  # Forbidden for missing auth
        print("✅ Authorization protection works")
        
        # Test invalid login
        invalid_login = {"email": "nonexistent@example.com", "password": "wrongpass"}
        response = requests.post(f"{base_url}/auth/login", json=invalid_login, timeout=5)
        assert response.status_code == 401
        print("✅ Authentication validation works")
        
    finally:
        process.terminate()
        process.wait()


if __name__ == "__main__":
    print("🧪 Running basic functionality tests...")
    
    try:
        test_api_server_starts()
        test_user_registration_and_login()
        test_wishlist_operations()
        test_error_handling()
        
        print("\n🎉 All basic functionality tests passed!")
        print("✅ API server functionality validated")
        print("✅ Authentication system working")
        print("✅ Wishlist CRUD operations working")
        print("✅ Error handling working")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise