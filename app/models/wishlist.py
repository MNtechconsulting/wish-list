"""
Wishlist item model for the Wishlist API.

Defines the WishlistItem SQLAlchemy model with proper relationships,
decimal precision for prices, and indexing for optimal performance.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class WishlistItem(Base):
    """
    WishlistItem model representing items in a user's wishlist.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        user_id: Foreign key reference to the owning user
        title: Display name/title of the wishlist item
        product_url: Optional URL to the product page
        initial_price: Original price when item was added to wishlist
        current_price: Most recent/current price of the item
        currency: Three-letter currency code (e.g., USD, EUR)
        created_at: Timestamp when item was added to wishlist
        updated_at: Timestamp when item was last modified
        user: Relationship to the owning user
        price_history: Relationship to price history entries
    """
    __tablename__ = "wishlist_items"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign key to user
    user_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    # Foreign key to wishlist collection
    collection_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("wishlist_collections.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    # Item details
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    product_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    
    # Price information with proper decimal precision (10 digits, 2 decimal places)
    initial_price: Mapped[Decimal] = mapped_column(
        Numeric(precision=10, scale=2), 
        nullable=False
    )
    current_price: Mapped[Decimal] = mapped_column(
        Numeric(precision=10, scale=2), 
        nullable=False
    )
    
    # Currency code (ISO 4217 standard - 3 characters)
    currency: Mapped[str] = mapped_column(
        String(3), 
        nullable=False, 
        default="USD"
    )
    
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
        back_populates="wishlist_items"
    )
    collection: Mapped["WishlistCollection"] = relationship(
        "WishlistCollection", 
        back_populates="items"
    )
    price_history: Mapped[List["PriceHistory"]] = relationship(
        "PriceHistory", 
        back_populates="wishlist_item", 
        cascade="all, delete-orphan",
        order_by="desc(PriceHistory.checked_at)",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        """String representation of WishlistItem model."""
        return f"<WishlistItem(id={self.id}, title='{self.title}', current_price={self.current_price} {self.currency})>"


# Indexes for performance optimization
Index('idx_wishlist_user_created', WishlistItem.user_id, WishlistItem.created_at)
Index('idx_wishlist_user_updated', WishlistItem.user_id, WishlistItem.updated_at)
Index('idx_wishlist_collection_created', WishlistItem.collection_id, WishlistItem.created_at)
Index('idx_wishlist_currency', WishlistItem.currency)