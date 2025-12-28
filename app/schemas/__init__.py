"""
Pydantic schemas for request/response validation.

This module provides centralized imports for all API schemas.
"""

from .auth import UserCreate, UserResponse, Token, LoginRequest
from .user import UserBase, UserProfile, UserWithStats, UserSummary
from .wishlist import (
    WishlistItemCreate,
    WishlistItemUpdate, 
    WishlistItemResponse,
    PriceHistoryResponse
)

__all__ = [
    # Authentication schemas
    "UserCreate",
    "UserResponse", 
    "Token",
    "LoginRequest",
    # User schemas
    "UserBase",
    "UserProfile",
    "UserWithStats", 
    "UserSummary",
    # Wishlist schemas
    "WishlistItemCreate",
    "WishlistItemUpdate",
    "WishlistItemResponse",
    "PriceHistoryResponse",
]