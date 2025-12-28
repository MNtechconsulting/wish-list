#!/usr/bin/env python3
"""
Test script to verify frontend-backend integration
"""

import requests
import time

def test_integration():
    """Test that both frontend and backend are working together"""
    
    print("🔗 Testing Frontend-Backend Integration")
    print("=" * 40)
    
    # Test backend API
    print("1. Testing Backend API...")
    try:
        response = requests.get("http://localhost:8001/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend API is running")
        else:
            print(f"   ❌ Backend API error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ Backend API not accessible")
        return False
    
    # Test frontend
    print("2. Testing Frontend...")
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend is running")
        else:
            print(f"   ❌ Frontend error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ Frontend not accessible")
        return False
    
    # Test CORS (simulate frontend calling backend)
    print("3. Testing CORS configuration...")
    try:
        response = requests.options(
            "http://localhost:8001/auth/login",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            },
            timeout=5
        )
        if response.status_code in [200, 204]:
            print("   ✅ CORS is configured correctly")
        else:
            print(f"   ❌ CORS error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("   ❌ CORS test failed")
        return False
    
    print("\n🎉 Integration test passed!")
    print("\n📝 Next steps:")
    print("   1. Open http://localhost:5173 in your browser")
    print("   2. Click 'Get Started' to go to login")
    print("   3. Register a new account")
    print("   4. Login and test the wishlist functionality")
    
    return True

if __name__ == "__main__":
    test_integration()