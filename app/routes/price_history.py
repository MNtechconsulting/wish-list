"""
Price history routes for the Wishlist API.

This module provides REST endpoints for managing price history data
for wishlist items, including retrieval and manual entry creation.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.models.price_history import PriceHistory
from app.schemas.wishlist import PriceHistoryCreate, PriceHistoryResponse
from app.auth.dependencies import get_current_user
from app.exceptions import ResourceNotFoundError

# Create router for price history endpoints
router = APIRouter(
    prefix="/wishlist",
    tags=["Price History"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{item_id}/price-history", response_model=List[PriceHistoryResponse])
async def get_price_history(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve price history for a specific wishlist item.
    
    Returns price history ordered by timestamp (newest first) and ensures
    users can only access price history for their own items.
    
    Args:
        item_id: ID of the wishlist item
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        List[PriceHistoryResponse]: List of price history entries
        
    Raises:
        HTTPException: 401 if user is not authenticated
        HTTPException: 404 if item not found or doesn't belong to user
    """
    try:
        # First verify the wishlist item exists and belongs to the user
        result = await db.execute(
            select(WishlistItem)
            .where(
                WishlistItem.id == item_id,
                WishlistItem.user_id == current_user.id
            )
        )
        
        item = result.scalar_one_or_none()
        
        if item is None:
            raise ResourceNotFoundError("Wishlist item not found")
        
        # Query price history for the item ordered by timestamp (newest first)
        price_history_result = await db.execute(
            select(PriceHistory)
            .where(PriceHistory.wishlist_item_id == item_id)
            .order_by(desc(PriceHistory.checked_at))
        )
        
        price_history = price_history_result.scalars().all()
        
        return price_history
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve price history"
        )


@router.post("/{item_id}/price-history", response_model=PriceHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_price_history_entry(
    item_id: int,
    price_data: PriceHistoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new price history entry for a wishlist item.
    
    Allows manual price history entry addition with proper validation
    and ensures the item belongs to the authenticated user.
    
    Args:
        item_id: ID of the wishlist item
        price_data: Price history creation data
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        PriceHistoryResponse: Created price history entry
        
    Raises:
        HTTPException: 401 if user is not authenticated
        HTTPException: 404 if item not found or doesn't belong to user
        HTTPException: 422 if validation fails
    """
    try:
        # First verify the wishlist item exists and belongs to the user
        result = await db.execute(
            select(WishlistItem)
            .where(
                WishlistItem.id == item_id,
                WishlistItem.user_id == current_user.id
            )
        )
        
        item = result.scalar_one_or_none()
        
        if item is None:
            raise ResourceNotFoundError("Wishlist item not found")
        
        # Create new price history entry
        new_price_history = PriceHistory(
            wishlist_item_id=item_id,
            price=price_data.price
        )
        
        # Add to database
        db.add(new_price_history)
        await db.commit()
        await db.refresh(new_price_history)
        
        return new_price_history
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create price history entry"
        )