"""
Price history functionality tests.
"""
import subprocess
import time
import requests
import uuid


def test_price_history_operations():
    """Test price history functionality."""
    # Start the server
    process = subprocess.Popen(
        ["python", "-m", "uvicorn", "app.main:app", "--port", "8007"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    time.sleep(3)
    
    try:
        base_url = "http://localhost:8007"
        
        # Register and login with unique email
        unique_id = str(uuid.uuid4())[:8]
        user_data = {"email": f"pricetest{unique_id}@example.com", "password": "testpass123"}
        requests.post(f"{base_url}/auth/register", json=user_data, timeout=5)
        
        login_response = requests.post(f"{base_url}/auth/login", json=user_data, timeout=5)
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create wishlist item
        item_data = {
            "title": "Price Test Product",
            "initial_price": "50.00",
            "currency": "USD"
        }
        
        response = requests.post(f"{base_url}/wishlist", json=item_data, headers=headers, timeout=5)
        assert response.status_code == 201
        item = response.json()
        item_id = item["id"]
        print("✅ Wishlist item created for price testing")
        
        # Check initial price history (should be created automatically)
        response = requests.get(f"{base_url}/wishlist/{item_id}/price-history", headers=headers, timeout=5)
        assert response.status_code == 200
        history = response.json()
        assert len(history) == 1
        assert float(history[0]["price"]) == 50.00
        print("✅ Initial price history created automatically")
        
        # Add new price history entry
        price_data = {"price": "45.99"}
        response = requests.post(f"{base_url}/wishlist/{item_id}/price-history", json=price_data, headers=headers, timeout=5)
        assert response.status_code == 201
        new_entry = response.json()
        assert float(new_entry["price"]) == 45.99
        print("✅ New price history entry added")
        
        # Check updated price history
        response = requests.get(f"{base_url}/wishlist/{item_id}/price-history", headers=headers, timeout=5)
        assert response.status_code == 200
        history = response.json()
        assert len(history) == 2
        # Should be ordered newest first
        assert float(history[0]["price"]) == 45.99
        assert float(history[1]["price"]) == 50.00
        print("✅ Price history ordering works (newest first)")
        
        # Add another price entry
        price_data = {"price": "42.50"}
        response = requests.post(f"{base_url}/wishlist/{item_id}/price-history", json=price_data, headers=headers, timeout=5)
        assert response.status_code == 201
        print("✅ Multiple price entries work")
        
        # Verify final history
        response = requests.get(f"{base_url}/wishlist/{item_id}/price-history", headers=headers, timeout=5)
        assert response.status_code == 200
        history = response.json()
        assert len(history) == 3
        prices = [float(entry["price"]) for entry in history]
        assert prices == [42.50, 45.99, 50.00]  # Newest first
        print("✅ Complete price history tracking works")
        
    finally:
        process.terminate()
        process.wait()


if __name__ == "__main__":
    print("🧪 Running price history functionality tests...")
    
    try:
        test_price_history_operations()
        
        print("\n🎉 All price history tests passed!")
        print("✅ Automatic price history creation works")
        print("✅ Manual price history addition works")
        print("✅ Price history ordering works")
        print("✅ Multiple price entries work")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        raise