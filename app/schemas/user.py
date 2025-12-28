"""
User schemas for API responses.

This module defines Pydantic models for user-related API responses,
ensuring sensitive fields like passwords are never exposed.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr


class UserProfile(UserBase):
    """Schema for user profile information (excludes sensitive data)."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class UserWithStats(UserProfile):
    """Extended user schema with additional statistics."""
    wishlist_item_count: Optional[int] = Field(None, description="Number of items in user's wishlist")
    
    model_config = {"from_attributes": True}


class UserSummary(BaseModel):
    """Minimal user schema for references in other responses."""
    id: int
    email: str
    
    model_config = {"from_attributes": True}