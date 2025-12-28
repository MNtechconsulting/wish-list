"""
Wishlist schemas for request/response validation.

This module defines Pydantic models for wishlist item operations
including creation, updates, and responses.
"""

from pydantic import BaseModel, Field, HttpUrl, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional
import re


class WishlistItemCreate(BaseModel):
    """Schema for creating new wishlist items."""
    title: str = Field(..., min_length=1, max_length=200, description="Item title")
    product_url: Optional[HttpUrl] = Field(None, description="Optional product URL")
    initial_price: Decimal = Field(..., gt=0, description="Initial price must be positive")
    currency: str = Field(default="USD", description="3-letter currency code")
    collection_id: int = Field(..., description="ID of the wishlist collection this item belongs to")
    
    @field_validator('currency')
    @classmethod
    def validate_currency(cls, v):
        """Validate currency is a 3-letter uppercase code."""
        if not re.match(r'^[A-Z]{3}$', v):
            raise ValueError('Currency must be a 3-letter uppercase code (e.g., USD, EUR)')
        return v
    
    @field_validator('initial_price')
    @classmethod
    def validate_initial_price(cls, v):
        """Validate initial price has at most 2 decimal places."""
        if v.as_tuple().exponent < -2:
            raise ValueError('Price can have at most 2 decimal places')
        return v


class WishlistItemUpdate(BaseModel):
    """Schema for updating existing wishlist items."""
    title: Optional[str] = Field(None, min_length=1, max_length=200, description="Updated item title")
    product_url: Optional[HttpUrl] = Field(None, description="Updated product URL")
    current_price: Optional[Decimal] = Field(None, gt=0, description="Updated current price")
    collection_id: Optional[int] = Field(None, description="Move item to different collection")
    
    @field_validator('current_price')
    @classmethod
    def validate_current_price(cls, v):
        """Ensure current price is positive and has at most 2 decimal places."""
        if v is not None:
            if v <= 0:
                raise ValueError('Current price must be positive')
            if v.as_tuple().exponent < -2:
                raise ValueError('Price can have at most 2 decimal places')
        return v


class WishlistItemResponse(BaseModel):
    """Schema for wishlist item responses."""
    id: int
    title: str
    product_url: Optional[str]
    initial_price: Decimal
    current_price: Decimal
    currency: str
    collection_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class PriceHistoryCreate(BaseModel):
    """Schema for creating new price history entries."""
    price: Decimal = Field(..., gt=0, description="Price must be positive")
    
    @field_validator('price')
    @classmethod
    def validate_price(cls, v):
        """Validate price has at most 2 decimal places."""
        if v.as_tuple().exponent < -2:
            raise ValueError('Price can have at most 2 decimal places')
        return v


class PriceHistoryResponse(BaseModel):
    """Schema for price history responses."""
    id: int
    price: Decimal
    checked_at: datetime
    
    model_config = {"from_attributes": True}