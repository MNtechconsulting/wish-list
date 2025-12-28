"""
Wishlist management routes for the MiraWish API.

This module provides REST endpoints for CRUD operations on wishlist items,
including creation, retrieval, updates, and deletion with proper user authorization.
Updated to work with wishlist collections.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, desc, select, update, delete

from app.database import get_db
from app.models.user import User
from app.models.wishlist import WishlistItem
from app.models.wishlist_collection import WishlistCollection
from app.models.price_history import PriceHistory
from app.schemas.wishlist import (
    WishlistItemCreate,
    WishlistItemUpdate,
    WishlistItemResponse
)
from app.auth.dependencies import get_current_user
from app.exceptions import ResourceNotFoundError, AuthorizationError

# Create router for wishlist endpoints
router = APIRouter(
    prefix="/wishlist",
    tags=["Wishlist"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[WishlistItemResponse])
async def get_user_wishlist(
    collection_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve wishlist items for the authenticated user.
    
    Args:
        collection_id: Optional collection ID to filter items
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        List[WishlistItemResponse]: List of user's wishlist items
    """
    query = select(WishlistItem).where(WishlistItem.user_id == current_user.id)
    
    if collection_id:
        # Verify user owns the collection
        collection_result = await db.execute(
            select(WishlistCollection).where(
                and_(
                    WishlistCollection.id == collection_id,
                    WishlistCollection.user_id == current_user.id
                )
            )
        )
        collection = collection_result.scalar_one_or_none()
        
        if not collection:
            raise ResourceNotFoundError("Collection not found")
        
        query = query.where(WishlistItem.collection_id == collection_id)
    
    # Order by creation date (newest first)
    query = query.order_by(desc(WishlistItem.created_at))
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    return items


@router.post("/", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def create_wishlist_item(
    item_data: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new wishlist item for the authenticated user.
    
    Args:
        item_data: Wishlist item creation data
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        WishlistItemResponse: Created wishlist item
        
    Raises:
        ResourceNotFoundError: If collection doesn't exist or doesn't belong to user
    """
    # Verify user owns the collection
    collection_result = await db.execute(
        select(WishlistCollection).where(
            and_(
                WishlistCollection.id == item_data.collection_id,
                WishlistCollection.user_id == current_user.id
            )
        )
    )
    collection = collection_result.scalar_one_or_none()
    
    if not collection:
        raise ResourceNotFoundError("Collection not found")
    
    # Create new wishlist item
    new_item = WishlistItem(
        user_id=current_user.id,
        collection_id=item_data.collection_id,
        title=item_data.title,
        product_url=str(item_data.product_url) if item_data.product_url else None,
        initial_price=item_data.initial_price,
        current_price=item_data.initial_price,  # Start with initial price
        currency=item_data.currency or "USD"
    )
    
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    
    # Create initial price history entry
    price_entry = PriceHistory(
        wishlist_item_id=new_item.id,
        price=new_item.initial_price
    )
    db.add(price_entry)
    await db.commit()
    
    return new_item


@router.get("/{item_id}", response_model=WishlistItemResponse)
async def get_wishlist_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve a specific wishlist item by ID.
    
    Args:
        item_id: ID of the wishlist item
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        WishlistItemResponse: Wishlist item details
        
    Raises:
        ResourceNotFoundError: If item doesn't exist
        AuthorizationError: If item doesn't belong to user
    """
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise ResourceNotFoundError("Wishlist item not found")
    
    if item.user_id != current_user.id:
        raise AuthorizationError("You don't have permission to access this item")
    
    return item


@router.put("/{item_id}", response_model=WishlistItemResponse)
async def update_wishlist_item(
    item_id: int,
    item_data: WishlistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a wishlist item.
    
    Args:
        item_id: ID of the wishlist item to update
        item_data: Updated item data
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        WishlistItemResponse: Updated wishlist item
        
    Raises:
        ResourceNotFoundError: If item doesn't exist
        AuthorizationError: If item doesn't belong to user
    """
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise ResourceNotFoundError("Wishlist item not found")
    
    if item.user_id != current_user.id:
        raise AuthorizationError("You don't have permission to update this item")
    
    # If collection_id is being updated, verify user owns the new collection
    if item_data.collection_id and item_data.collection_id != item.collection_id:
        collection_result = await db.execute(
            select(WishlistCollection).where(
                and_(
                    WishlistCollection.id == item_data.collection_id,
                    WishlistCollection.user_id == current_user.id
                )
            )
        )
        collection = collection_result.scalar_one_or_none()
        
        if not collection:
            raise ResourceNotFoundError("Collection not found")
    
    # Update item fields
    update_data = item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        # Convert HttpUrl to string for product_url field
        if field == 'product_url' and value is not None:
            value = str(value)
        setattr(item, field, value)
    
    await db.commit()
    await db.refresh(item)
    
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wishlist_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a wishlist item.
    
    Args:
        item_id: ID of the wishlist item to delete
        current_user: Authenticated user from JWT token
        db: Database session
        
    Raises:
        ResourceNotFoundError: If item doesn't exist
        AuthorizationError: If item doesn't belong to user
    """
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise ResourceNotFoundError("Wishlist item not found")
    
    if item.user_id != current_user.id:
        raise AuthorizationError("You don't have permission to delete this item")
    
    await db.delete(item)
    await db.commit()


@router.get("/{item_id}/price-history", response_model=List[dict])
async def get_item_price_history(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get price history for a wishlist item.
    
    Args:
        item_id: ID of the wishlist item
        current_user: Authenticated user from JWT token
        db: Database session
        
    Returns:
        List[dict]: Price history entries
        
    Raises:
        ResourceNotFoundError: If item doesn't exist
        AuthorizationError: If item doesn't belong to user
    """
    # Verify item exists and belongs to user
    result = await db.execute(
        select(WishlistItem).where(WishlistItem.id == item_id)
    )
    item = result.scalar_one_or_none()
    
    if not item:
        raise ResourceNotFoundError("Wishlist item not found")
    
    if item.user_id != current_user.id:
        raise AuthorizationError("You don't have permission to access this item")
    
    # Get price history
    result = await db.execute(
        select(PriceHistory).where(
            PriceHistory.wishlist_item_id == item_id
        ).order_by(desc(PriceHistory.checked_at))
    )
    price_history = result.scalars().all()
    
    return [
        {
            "price": float(entry.price),
            "checked_at": entry.checked_at.isoformat()
        }
        for entry in price_history
    ]