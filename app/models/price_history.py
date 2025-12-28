"""
Price history model for the Wishlist API.

Defines the PriceHistory SQLAlchemy model for tracking price changes
over time with proper indexing for efficient queries.
"""

from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class PriceHistory(Base):
    """
    PriceHistory model representing historical price data for wishlist items.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        wishlist_item_id: Foreign key reference to the associated wishlist item
        price: Price value at the time of recording
        checked_at: Timestamp when this price was recorded
        wishlist_item: Relationship to the associated wishlist item
    """
    __tablename__ = "price_history"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Foreign key to wishlist item
    wishlist_item_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("wishlist_items.id", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    
    # Price information with proper decimal precision (10 digits, 2 decimal places)
    price: Mapped[Decimal] = mapped_column(
        Numeric(precision=10, scale=2), 
        nullable=False
    )
    
    # Timestamp when price was recorded
    checked_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        nullable=False
    )
    
    # Relationships
    wishlist_item: Mapped["WishlistItem"] = relationship(
        "WishlistItem", 
        back_populates="price_history"
    )

    def __repr__(self) -> str:
        """String representation of PriceHistory model."""
        return f"<PriceHistory(id={self.id}, price={self.price}, checked_at={self.checked_at})>"


# Indexes for efficient price history queries
Index('idx_price_history_item_time', PriceHistory.wishlist_item_id, PriceHistory.checked_at)
Index('idx_price_history_time', PriceHistory.checked_at)
Index('idx_price_history_item_price', PriceHistory.wishlist_item_id, PriceHistory.price)