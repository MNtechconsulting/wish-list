"""
Wishlist Collections API routes.

Provides CRUD operations for wishlist collections including:
- Creating new collections
- Listing user's collections
- Getting collection details with items
- Updating collection properties
- Deleting collections
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, func, select, update, delete

from app.database import get_db
from app.models.user import User
from app.models.wishlist_collection import WishlistCollection
from app.models.wishlist import WishlistItem
from app.schemas.wishlist_collection import (
    WishlistCollectionCreate,
    WishlistCollectionUpdate,
    WishlistCollectionResponse,
    WishlistCollectionWithItems
)
from app.auth.dependencies import get_current_user
from app.exceptions import ResourceNotFoundError, ConflictError

router = APIRouter(
    prefix="/collections",
    tags=["Wishlist Collections"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Access forbidden"},
    }
)


@router.post("/", response_model=WishlistCollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(
    collection_data: WishlistCollectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new wishlist collection.
    
    - **name**: Collection name (required)
    - **description**: Optional description
    - **color**: Optional hex color code
    - **is_default**: Whether this should be the default collection
    """
    # Check if user already has a collection with this name
    result = await db.execute(
        select(WishlistCollection).where(
            and_(
                WishlistCollection.user_id == current_user.id,
                WishlistCollection.name == collection_data.name
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise ConflictError(f"Collection with name '{collection_data.name}' already exists")
    
    # If this is set as default, unset other defaults
    if collection_data.is_default:
        await db.execute(
            update(WishlistCollection).where(
                and_(
                    WishlistCollection.user_id == current_user.id,
                    WishlistCollection.is_default == True
                )
            ).values(is_default=False)
        )
    
    # Create new collection
    collection = WishlistCollection(
        user_id=current_user.id,
        name=collection_data.name,
        description=collection_data.description,
        color=collection_data.color,
        is_default=collection_data.is_default
    )
    
    db.add(collection)
    await db.commit()
    await db.refresh(collection)
    
    # Add item count
    collection.item_count = 0
    
    return collection


@router.get("/", response_model=List[WishlistCollectionResponse])
async def get_collections(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all wishlist collections for the current user.
    
    Returns collections ordered by creation date (newest first).
    """
    # Get collections with item counts
    result = await db.execute(
        select(
            WishlistCollection,
            func.count(WishlistItem.id).label('item_count')
        ).outerjoin(
            WishlistItem, WishlistCollection.id == WishlistItem.collection_id
        ).where(
            WishlistCollection.user_id == current_user.id
        ).group_by(
            WishlistCollection.id
        ).order_by(
            WishlistCollection.is_default.desc(),
            WishlistCollection.created_at.desc()
        )
    )
    
    collections_data = result.all()
    
    # Format response
    result_list = []
    for collection, item_count in collections_data:
        collection.item_count = item_count
        result_list.append(collection)
    
    return result_list


@router.get("/{collection_id}", response_model=WishlistCollectionWithItems)
async def get_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific wishlist collection with all its items.
    
    - **collection_id**: ID of the collection to retrieve
    """
    result = await db.execute(
        select(WishlistCollection).where(
            and_(
                WishlistCollection.id == collection_id,
                WishlistCollection.user_id == current_user.id
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise ResourceNotFoundError("Collection not found")
    
    # Add item count
    collection.item_count = len(collection.items)
    
    return collection


@router.put("/{collection_id}", response_model=WishlistCollectionResponse)
async def update_collection(
    collection_id: int,
    collection_data: WishlistCollectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a wishlist collection.
    
    - **collection_id**: ID of the collection to update
    - **name**: Updated collection name
    - **description**: Updated description
    - **color**: Updated hex color code
    - **is_default**: Whether this should be the default collection
    """
    result = await db.execute(
        select(WishlistCollection).where(
            and_(
                WishlistCollection.id == collection_id,
                WishlistCollection.user_id == current_user.id
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise ResourceNotFoundError("Collection not found")
    
    # Check for name conflicts if name is being updated
    if collection_data.name and collection_data.name != collection.name:
        result = await db.execute(
            select(WishlistCollection).where(
                and_(
                    WishlistCollection.user_id == current_user.id,
                    WishlistCollection.name == collection_data.name,
                    WishlistCollection.id != collection_id
                )
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            raise ConflictError(f"Collection with name '{collection_data.name}' already exists")
    
    # If setting as default, unset other defaults
    if collection_data.is_default:
        await db.execute(
            update(WishlistCollection).where(
                and_(
                    WishlistCollection.user_id == current_user.id,
                    WishlistCollection.is_default == True,
                    WishlistCollection.id != collection_id
                )
            ).values(is_default=False)
        )
    
    # Update collection
    update_data = collection_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(collection, field, value)
    
    await db.commit()
    await db.refresh(collection)
    
    # Add item count
    collection.item_count = len(collection.items)
    
    return collection


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete a wishlist collection and all its items.
    
    - **collection_id**: ID of the collection to delete
    
    Note: This will permanently delete all items in the collection.
    """
    result = await db.execute(
        select(WishlistCollection).where(
            and_(
                WishlistCollection.id == collection_id,
                WishlistCollection.user_id == current_user.id
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise ResourceNotFoundError("Collection not found")
    
    # Prevent deletion if it's the only collection
    result = await db.execute(
        select(func.count(WishlistCollection.id)).where(
            WishlistCollection.user_id == current_user.id
        )
    )
    collection_count = result.scalar()
    
    if collection_count <= 1:
        raise ConflictError("Cannot delete the last remaining collection")
    
    await db.delete(collection)
    await db.commit()


@router.post("/{collection_id}/set-default", response_model=WishlistCollectionResponse)
async def set_default_collection(
    collection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Set a collection as the default collection.
    
    - **collection_id**: ID of the collection to set as default
    """
    result = await db.execute(
        select(WishlistCollection).where(
            and_(
                WishlistCollection.id == collection_id,
                WishlistCollection.user_id == current_user.id
            )
        )
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise ResourceNotFoundError("Collection not found")
    
    # Unset other defaults
    await db.execute(
        update(WishlistCollection).where(
            and_(
                WishlistCollection.user_id == current_user.id,
                WishlistCollection.is_default == True
            )
        ).values(is_default=False)
    )
    
    # Set this as default
    collection.is_default = True
    await db.commit()
    await db.refresh(collection)
    
    # Add item count
    collection.item_count = len(collection.items)
    
    return collection