"""
Wishlist collection model for the MiraWish API.

Defines the WishlistCollection SQLAlchemy model to allow users to create
multiple named wishlists to organize their items.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class WishlistCollection(Base):
    """
    WishlistCollection model representing a named collection of wishlist items.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        user_id: Foreign key reference to the owning user
        name: Display name of the wishlist collection
        description: Optional description of the wishlist
        color: Optional color theme for the wishlist (hex code)
        is_default: Whether this is the user's default wishlist
        created_at: Timestamp when wishlist was created
        updated_at: Timestamp when wishlist was last modified
        user: Relationship to the owning user
        items: Relationship to wishlist items in this collection
    """
    __tablename__ = "wishlist_collections"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign key to user
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    # Collection details
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)  # Hex color code
    is_default: Mapped[bool] = mapped_column(nullable=False, default=False)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow,
        nullable=False
    )
    
    # Relationships
    user: Mapped["User"] = relationship(
        "User", 
        back_populates="wishlist_collections"
    )
    items: Mapped[List["WishlistItem"]] = relationship(
        "WishlistItem", 
        back_populates="collection",
        cascade="all, delete-orphan",
        order_by="desc(WishlistItem.created_at)",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        """String representation of WishlistCollection model."""
        return f"<WishlistCollection(id={self.id}, name='{self.name}', user_id={self.user_id})>"


# Indexes for performance optimization
Index('idx_wishlist_collection_user_created', WishlistCollection.user_id, WishlistCollection.created_at)
Index('idx_wishlist_collection_user_name', WishlistCollection.user_id, WishlistCollection.name)
Index('idx_wishlist_collection_default', WishlistCollection.user_id, WishlistCollection.is_default)