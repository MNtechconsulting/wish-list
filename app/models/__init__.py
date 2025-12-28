"""
Models package for the MiraWish API.

This module imports all SQLAlchemy models to ensure they are registered
with the Base metadata for proper table creation and relationships.
"""

from app.models.user import User
from app.models.wishlist_collection import WishlistCollection
from app.models.wishlist import WishlistItem
from app.models.price_history import PriceHistory

# Export all models for easy importing
__all__ = ["User", "WishlistCollection", "WishlistItem", "PriceHistory"]