#!/usr/bin/env python3
"""
Seed data script for the Wishlist Backend API.

This script populates the database with sample users, wishlist items,
and price history data for development and testing purposes.

Usage:
    python scripts/seed_data.py [--clear-existing]
    
Options:
    --clear-existing    Clear all existing data before seeding
"""

import asyncio
import argparse
import sys
from pathlib import Path
from datetime import datetime, timedelta
from decimal import Decimal

# Add the parent directory to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select, delete
from app.database import AsyncSessionLocal, close_db
from app.models.user import User
from app.models.wishlist_collection import WishlistCollection
from app.models.wishlist import WishlistItem
from app.models.price_history import PriceHistory
from app.auth.dependencies import hash_password


# Sample user data
SAMPLE_USERS = [
    {
        "email": "alice@example.com",
        "password": "password123",
        "name": "Alice"
    },
    {
        "email": "bob@example.com",
        "password": "password123",
        "name": "Bob"
    },
    {
        "email": "charlie@example.com",
        "password": "password123",
        "name": "Charlie"
    }
]

# Sample collections for each user
SAMPLE_COLLECTIONS = {
    "alice@example.com": [
        {
            "name": "Electrónicos",
            "description": "Dispositivos y gadgets tecnológicos",
            "color": "#8B6F47",
            "is_default": True
        },
        {
            "name": "Oficina",
            "description": "Artículos para el espacio de trabajo",
            "color": "#6B8E23",
            "is_default": False
        }
    ],
    "bob@example.com": [
        {
            "name": "Gaming",
            "description": "Accesorios y equipos para gaming",
            "color": "#A0522D",
            "is_default": True
        },
        {
            "name": "Hogar",
            "description": "Muebles y decoración para el hogar",
            "color": "#708090",
            "is_default": False
        }
    ],
    "charlie@example.com": [
        {
            "name": "Tecnología",
            "description": "Gadgets y accesorios tech",
            "color": "#CD853F",
            "is_default": True
        }
    ]
}

# Sample wishlist items for each user (updated with collection assignments)
SAMPLE_WISHLIST_ITEMS = {
    "alice@example.com": [
        {
            "collection_name": "Electrónicos",
            "title": "Wireless Noise-Cancelling Headphones",
            "product_url": "https://example.com/products/headphones-123",
            "initial_price": Decimal("299.99"),
            "current_price": Decimal("249.99"),
            "currency": "USD",
            "price_changes": [
                (Decimal("299.99"), 30),  # (price, days_ago)
                (Decimal("279.99"), 20),
                (Decimal("269.99"), 10),
                (Decimal("249.99"), 0),
            ]
        },
        {
            "collection_name": "Electrónicos",
            "title": "Smart Watch Series 8",
            "product_url": "https://example.com/products/smartwatch-456",
            "initial_price": Decimal("399.00"),
            "current_price": Decimal("399.00"),
            "currency": "USD",
            "price_changes": [
                (Decimal("399.00"), 15),
            ]
        },
        {
            "collection_name": "Oficina",
            "title": "4K Ultra HD Monitor 27 inch",
            "product_url": "https://example.com/products/monitor-789",
            "initial_price": Decimal("549.99"),
            "current_price": Decimal("499.99"),
            "currency": "USD",
            "price_changes": [
                (Decimal("549.99"), 45),
                (Decimal("529.99"), 30),
                (Decimal("519.99"), 15),
                (Decimal("499.99"), 5),
            ]
        },
    ],
    "bob@example.com": [
        {
            "collection_name": "Gaming",
            "title": "Mechanical Gaming Keyboard RGB",
            "product_url": "https://example.com/products/keyboard-321",
            "initial_price": Decimal("149.99"),
            "current_price": Decimal("129.99"),
            "currency": "USD",
            "price_changes": [
                (Decimal("149.99"), 20),
                (Decimal("139.99"), 10),
                (Decimal("129.99"), 2),
            ]
        },
        {
            "collection_name": "Hogar",
            "title": "Ergonomic Office Chair",
            "product_url": "https://example.com/products/chair-654",
            "initial_price": Decimal("449.00"),
            "current_price": Decimal("399.00"),
            "currency": "USD",
            "price_changes": [
                (Decimal("449.00"), 60),
                (Decimal("429.00"), 40),
                (Decimal("419.00"), 20),
                (Decimal("399.00"), 5),
            ]
        },
    ],
    "charlie@example.com": [
        {
            "collection_name": "Tecnología",
            "title": "Portable SSD 2TB",
            "product_url": "https://example.com/products/ssd-987",
            "initial_price": Decimal("199.99"),
            "current_price": Decimal("179.99"),
            "currency": "USD",
            "price_changes": [
                (Decimal("199.99"), 25),
                (Decimal("189.99"), 15),
                (Decimal("179.99"), 3),
            ]
        },
        {
            "collection_name": "Tecnología",
            "title": "Wireless Mouse Bluetooth",
            "product_url": "https://example.com/products/mouse-147",
            "initial_price": Decimal("59.99"),
            "current_price": Decimal("49.99"),
            "currency": "USD",
            "price_changes": [
                (Decimal("59.99"), 10),
                (Decimal("54.99"), 5),
                (Decimal("49.99"), 1),
            ]
        },
        {
            "collection_name": "Tecnología",
            "title": "USB-C Hub 7-in-1",
            "product_url": "https://example.com/products/hub-258",
            "initial_price": Decimal("39.99"),
            "current_price": Decimal("39.99"),
            "currency": "USD",
            "price_changes": [
                (Decimal("39.99"), 7),
            ]
        },
    ]
}


async def clear_existing_data():
    """
    Clear all existing data from the database.
    
    WARNING: This will permanently delete all users, wishlist items,
    and price history data.
    """
    print("🗑️  Clearing existing data...")
    
    async with AsyncSessionLocal() as session:
        try:
            # Delete in correct order due to foreign key constraints
            await session.execute(delete(PriceHistory))
            await session.execute(delete(WishlistItem))
            await session.execute(delete(WishlistCollection))
            await session.execute(delete(User))
            
            await session.commit()
            print("✅ Existing data cleared")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error clearing data: {e}")
            raise


async def create_sample_users():
    """
    Create sample user accounts.
    
    Returns:
        dict: Mapping of email addresses to User objects
    """
    print("\n👥 Creating sample users...")
    
    users = {}
    
    async with AsyncSessionLocal() as session:
        try:
            for user_data in SAMPLE_USERS:
                # Check if user already exists
                result = await session.execute(
                    select(User).where(User.email == user_data["email"])
                )
                existing_user = result.scalar_one_or_none()
                
                if existing_user:
                    print(f"   ⚠️  User {user_data['email']} already exists, skipping")
                    users[user_data["email"]] = existing_user
                    continue
                
                # Create new user
                user = User(
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"])
                )
                
                session.add(user)
                await session.flush()  # Flush to get the user ID
                
                users[user_data["email"]] = user
                print(f"   ✅ Created user: {user_data['email']} (password: {user_data['password']})")
            
            await session.commit()
            print(f"✅ Created {len(users)} users")
            
            return users
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error creating users: {e}")
            raise


async def create_sample_collections(users: dict):
    """
    Create sample wishlist collections for users.
    
    Args:
        users: Dictionary mapping email addresses to User objects
        
    Returns:
        dict: Mapping of (email, collection_name) to WishlistCollection objects
    """
    print("\n📁 Creating sample collections...")
    
    collections = {}
    
    async with AsyncSessionLocal() as session:
        try:
            for email, collections_data in SAMPLE_COLLECTIONS.items():
                if email not in users:
                    print(f"   ⚠️  User {email} not found, skipping collections")
                    continue
                
                user = users[email]
                
                for collection_data in collections_data:
                    # Check if collection already exists
                    result = await session.execute(
                        select(WishlistCollection).where(
                            WishlistCollection.user_id == user.id,
                            WishlistCollection.name == collection_data["name"]
                        )
                    )
                    existing_collection = result.scalar_one_or_none()
                    
                    if existing_collection:
                        print(f"   ⚠️  Collection '{collection_data['name']}' already exists for {email}, skipping")
                        collections[(email, collection_data["name"])] = existing_collection
                        continue
                    
                    # Create new collection
                    collection = WishlistCollection(
                        user_id=user.id,
                        name=collection_data["name"],
                        description=collection_data["description"],
                        color=collection_data["color"],
                        is_default=collection_data["is_default"]
                    )
                    
                    session.add(collection)
                    await session.flush()  # Flush to get the collection ID
                    
                    collections[(email, collection_data["name"])] = collection
                    print(f"   ✅ Created collection: {collection_data['name']} for {email}")
            
            await session.commit()
            print(f"✅ Created {len(collections)} collections")
            
            return collections
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error creating collections: {e}")
            raise


async def create_sample_wishlist_items(users: dict, collections: dict):
    """
    Create sample wishlist items for users.
    
    Args:
        users: Dictionary mapping email addresses to User objects
        collections: Dictionary mapping (email, collection_name) to WishlistCollection objects
    """
    print("\n🛍️  Creating sample wishlist items...")
    
    total_items = 0
    
    async with AsyncSessionLocal() as session:
        try:
            for email, items_data in SAMPLE_WISHLIST_ITEMS.items():
                if email not in users:
                    print(f"   ⚠️  User {email} not found, skipping items")
                    continue
                
                user = users[email]
                
                for item_data in items_data:
                    # Find the collection for this item
                    collection_key = (email, item_data["collection_name"])
                    if collection_key not in collections:
                        print(f"   ⚠️  Collection '{item_data['collection_name']}' not found for {email}, skipping item")
                        continue
                    
                    collection = collections[collection_key]
                    
                    # Create wishlist item
                    wishlist_item = WishlistItem(
                        user_id=user.id,
                        collection_id=collection.id,
                        title=item_data["title"],
                        product_url=item_data.get("product_url"),
                        initial_price=item_data["initial_price"],
                        current_price=item_data["current_price"],
                        currency=item_data["currency"]
                    )
                    
                    session.add(wishlist_item)
                    await session.flush()  # Flush to get the item ID
                    
                    # Create price history entries
                    for price, days_ago in item_data["price_changes"]:
                        price_entry = PriceHistory(
                            wishlist_item_id=wishlist_item.id,
                            price=price,
                            checked_at=datetime.utcnow() - timedelta(days=days_ago)
                        )
                        session.add(price_entry)
                    
                    total_items += 1
                    print(f"   ✅ Created item: {item_data['title']} for {email} in collection '{item_data['collection_name']}'")
            
            await session.commit()
            print(f"✅ Created {total_items} wishlist items with price history")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error creating wishlist items: {e}")
            raise


async def show_seed_data_summary():
    """
    Display a summary of the seeded data.
    """
    print("\n📊 Seed Data Summary:")
    
    async with AsyncSessionLocal() as session:
        try:
            # Count users
            result = await session.execute(select(User))
            users = result.scalars().all()
            print(f"   Users: {len(users)}")
            
            # Count collections and items per user
            for user in users:
                result = await session.execute(
                    select(WishlistCollection).where(WishlistCollection.user_id == user.id)
                )
                collections = result.scalars().all()
                
                result = await session.execute(
                    select(WishlistItem).where(WishlistItem.user_id == user.id)
                )
                items = result.scalars().all()
                
                print(f"     • {user.email}: {len(collections)} collections, {len(items)} items")
            
            # Count total price history entries
            result = await session.execute(select(PriceHistory))
            price_entries = result.scalars().all()
            print(f"   Price History Entries: {len(price_entries)}")
            
        except Exception as e:
            print(f"   ❌ Error getting summary: {e}")


async def seed_database():
    """
    Main function to seed the database with sample data.
    """
    print("🌱 Seeding database with sample data...")
    
    try:
        # Create users
        users = await create_sample_users()
        
        # Create collections
        collections = await create_sample_collections(users)
        
        # Create wishlist items and price history
        await create_sample_wishlist_items(users, collections)
        
        # Show summary
        await show_seed_data_summary()
        
        print("\n🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Database seeding failed: {e}")
        raise


async def main():
    """
    Main function to handle seed data creation based on command line arguments.
    """
    parser = argparse.ArgumentParser(
        description="Seed the Wishlist Backend API database with sample data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/seed_data.py                  # Add sample data to existing database
  python scripts/seed_data.py --clear-existing # Clear all data and add fresh samples

Sample Users:
  • alice@example.com (password: password123)
  • bob@example.com (password: password123)
  • charlie@example.com (password: password123)
        """
    )
    
    parser.add_argument(
        "--clear-existing",
        action="store_true",
        help="Clear all existing data before seeding (WARNING: destroys all data)"
    )
    
    args = parser.parse_args()
    
    print("🚀 Wishlist Backend API - Database Seeding")
    print("=" * 50)
    
    try:
        # Clear existing data if requested
        if args.clear_existing:
            confirmation = input(
                "\n⚠️  This will permanently delete all existing data. "
                "Type 'yes' to continue: "
            )
            if confirmation.lower() != 'yes':
                print("❌ Operation cancelled")
                return
            await clear_existing_data()
        
        # Seed database
        await seed_database()
        
        print("\nNext steps:")
        print("  1. Start the API server: uvicorn app.main:app --reload")
        print("  2. Login with any sample user (password: password123)")
        print("  3. Explore the wishlist items and price history")
        
    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        sys.exit(1)
    
    finally:
        # Clean up database connections
        await close_db()


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())
