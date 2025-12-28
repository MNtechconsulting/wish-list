#!/usr/bin/env python3
"""
Test script for Wishlist API authentication using Python requests
"""

import requests
import json
from datetime import datetime

# Configuration
API_URL = "http://localhost:8001"
EMAIL = "pythontest@example.com"
PASSWORD = "pythontest123"

def test_authentication():
    """Test the complete authentication flow"""
    
    print("🚀 Testing Wishlist API Authentication with Python")
    print("=" * 50)
    
    # 1. Register user
    print("📝 Step 1: Registering user...")
    register_data = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    try:
        register_response = requests.post(
            f"{API_URL}/auth/register",
            json=register_data,
            headers={"Content-Type": "application/json"}
        )
        
        if register_response.status_code == 201:
            print("✅ Registration successful!")
            print(f"   User: {register_response.json()}")
        elif register_response.status_code == 409:
            print("ℹ️  User already exists, proceeding to login...")
        else:
            print(f"❌ Registration failed: {register_response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running on port 8001")
        return False
    
    # 2. Login
    print("\n🔐 Step 2: Logging in...")
    login_data = {
        "email": EMAIL,
        "password": PASSWORD
    }
    
    login_response = requests.post(
        f"{API_URL}/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.text}")
        return False
    
    login_result = login_response.json()
    token = login_result["access_token"]
    
    print("✅ Login successful!")
    print(f"   Token: {token[:20]}...")
    print(f"   Expires in: {login_result['expires_in']} seconds")
    
    # 3. Test protected endpoint
    print("\n👤 Step 3: Testing protected endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    
    me_response = requests.get(f"{API_URL}/auth/me", headers=headers)
    
    if me_response.status_code == 200:
        user_info = me_response.json()
        print("✅ Protected endpoint works!")
        print(f"   User ID: {user_info['id']}")
        print(f"   Email: {user_info['email']}")
    else:
        print(f"❌ Protected endpoint failed: {me_response.text}")
        return False
    
    # 4. Test wishlist
    print("\n📋 Step 4: Testing wishlist...")
    wishlist_response = requests.get(f"{API_URL}/wishlist/", headers=headers)
    
    if wishlist_response.status_code == 200:
        wishlist = wishlist_response.json()
        print(f"✅ Wishlist retrieved! Items: {len(wishlist)}")
    else:
        print(f"❌ Wishlist failed: {wishlist_response.text}")
        return False
    
    # 5. Create wishlist item
    print("\n➕ Step 5: Creating wishlist item...")
    item_data = {
        "title": f"Python Test Item {datetime.now().strftime('%H:%M:%S')}",
        "product_url": "https://example.com/python-test",
        "initial_price": 123.45,
        "currency": "USD"
    }
    
    create_response = requests.post(
        f"{API_URL}/wishlist/",
        json=item_data,
        headers={**headers, "Content-Type": "application/json"}
    )
    
    if create_response.status_code == 201:
        item = create_response.json()
        print("✅ Item created successfully!")
        print(f"   ID: {item['id']}")
        print(f"   Title: {item['title']}")
        print(f"   Price: ${item['initial_price']} {item['currency']}")
    else:
        print(f"❌ Item creation failed: {create_response.text}")
        return False
    
    print("\n🎉 All tests passed! Authentication is working correctly.")
    return True

if __name__ == "__main__":
    test_authentication()