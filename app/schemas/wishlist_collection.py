"""
Pydantic schemas for wishlist collection operations.

Defines request/response models for wishlist collection CRUD operations
with proper validation, documentation, and type safety.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator
import re


class WishlistCollectionCreate(BaseModel):
    """Schema for creating new wishlist collections."""
    name: str = Field(..., min_length=1, max_length=100, description="Collection name")
    description: Optional[str] = Field(None, max_length=500, description="Optional collection description")
    color: Optional[str] = Field(None, description="Hex color code for the collection theme")
    is_default: Optional[bool] = Field(False, description="Whether this should be the default collection")

    @validator('name')
    def validate_name(cls, v):
        """Validate collection name."""
        if not v or not v.strip():
            raise ValueError('Collection name cannot be empty')
        return v.strip()

    @validator('color')
    def validate_color(cls, v):
        """Validate hex color code."""
        if v is not None:
            if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
                raise ValueError('Color must be a valid hex code (e.g., #FF5733)')
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "name": "Regalos de Navidad",
                "description": "Lista de regalos para la temporada navideña",
                "color": "#8B6F47",
                "is_default": False
            }
        }


class WishlistCollectionUpdate(BaseModel):
    """Schema for updating existing wishlist collections."""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated collection name")
    description: Optional[str] = Field(None, max_length=500, description="Updated collection description")
    color: Optional[str] = Field(None, description="Updated hex color code")
    is_default: Optional[bool] = Field(None, description="Whether this should be the default collection")

    @validator('name')
    def validate_name(cls, v):
        """Validate collection name."""
        if v is not None and (not v or not v.strip()):
            raise ValueError('Collection name cannot be empty')
        return v.strip() if v else v

    @validator('color')
    def validate_color(cls, v):
        """Validate hex color code."""
        if v is not None and v != "":
            if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
                raise ValueError('Color must be a valid hex code (e.g., #FF5733)')
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "name": "Regalos de Navidad Actualizados",
                "description": "Lista actualizada de regalos navideños",
                "color": "#A0522D"
            }
        }


class WishlistCollectionResponse(BaseModel):
    """Schema for wishlist collection responses."""
    id: int
    name: str
    description: Optional[str]
    color: Optional[str]
    is_default: bool
    created_at: datetime
    updated_at: datetime
    item_count: int = Field(description="Number of items in this collection")

    class Config:
        """Pydantic configuration."""
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "Regalos de Navidad",
                "description": "Lista de regalos para la temporada navideña",
                "color": "#8B6F47",
                "is_default": False,
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
                "item_count": 5
            }
        }


class WishlistCollectionWithItems(WishlistCollectionResponse):
    """Schema for wishlist collection responses with items included."""
    items: List["WishlistItemResponse"] = Field(description="Items in this collection")

    class Config:
        """Pydantic configuration."""
        from_attributes = True


# Import here to avoid circular imports
from app.schemas.wishlist import WishlistItemResponse
WishlistCollectionWithItems.model_rebuild()