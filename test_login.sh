#!/bin/bash

# Test script for Wishlist API authentication
API_URL="http://localhost:8001"
EMAIL="testuser@example.com"
PASSWORD="testpassword123"

echo "🚀 Testing Wishlist API Authentication"
echo "======================================"

# 1. Register a new user
echo "📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Register Response: $REGISTER_RESPONSE"

# 2. Login with the user
echo ""
echo "🔐 Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed - no token received"
    exit 1
fi

echo "✅ Login successful! Token: ${TOKEN:0:20}..."

# 3. Test protected endpoint
echo ""
echo "👤 Step 3: Testing protected endpoint..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "User Info: $ME_RESPONSE"

# 4. Test wishlist endpoint
echo ""
echo "📋 Step 4: Testing wishlist..."
WISHLIST_RESPONSE=$(curl -s -X GET "$API_URL/wishlist/" \
  -H "Authorization: Bearer $TOKEN")

echo "Wishlist: $WISHLIST_RESPONSE"

# 5. Create a wishlist item
echo ""
echo "➕ Step 5: Creating wishlist item..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/wishlist/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "product_url": "https://example.com/product",
    "initial_price": 99.99,
    "currency": "USD"
  }')

echo "Created Item: $CREATE_RESPONSE"

echo ""
echo "🎉 All tests completed!"