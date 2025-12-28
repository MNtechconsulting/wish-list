"""
User model for the Wishlist API.

Defines the User SQLAlchemy model with proper relationships,
constraints, and indexing for optimal performance.
"""

from datetime import datetime
from typing import List
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    """
    User model representing registered users in the system.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        email: Unique email address for user identification
        hashed_password: Securely hashed password using bcrypt
        created_at: Timestamp when user account was created
        updated_at: Timestamp when user account was last modified
        wishlist_items: Relationship to user's wishlist items
    """
    __tablename__ = "users"

    # Primary key
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # User credentials and identification
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    
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
    wishlist_items: Mapped[List["WishlistItem"]] = relationship(
        "WishlistItem", 
        back_populates="user", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    wishlist_collections: Mapped[List["WishlistCollection"]] = relationship(
        "WishlistCollection", 
        back_populates="user", 
        cascade="all, delete-orphan",
        order_by="desc(WishlistCollection.created_at)",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        """String representation of User model."""
        return f"<User(id={self.id}, email='{self.email}')>"


# Additional indexes for performance optimization
Index('idx_users_email_created', User.email, User.created_at)