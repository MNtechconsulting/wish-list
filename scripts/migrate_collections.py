#!/usr/bin/env python3
"""
Migration script to add wishlist collections functionality.

This script:
1. Creates the new wishlist_collections table
2. Creates a default collection for each existing user
3. Updates existing wishlist items to belong to the default collection
4. Adds the new foreign key constraint
"""

import os
import sys
from pathlib import Path

# Add the app directory to the Python path
app_dir = Path(__file__).parent.parent
sys.path.insert(0, str(app_dir))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import User, WishlistCollection, WishlistItem
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration():
    """Run the migration to add collections support."""
    
    # Get database URL from environment or use default
    database_url = os.getenv("DATABASE_URL", "sqlite:///./wishlist.db")
    
    # Create engine and session
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    logger.info("Starting migration to add wishlist collections...")
    
    try:
        # Create all tables (this will create the new collections table)
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Created wishlist_collections table")
        
        with SessionLocal() as db:
            # Get all existing users
            users = db.query(User).all()
            logger.info(f"Found {len(users)} existing users")
            
            for user in users:
                # Check if user already has a default collection
                existing_collection = db.query(WishlistCollection).filter(
                    WishlistCollection.user_id == user.id,
                    WishlistCollection.is_default == True
                ).first()
                
                if not existing_collection:
                    # Create default collection for user
                    default_collection = WishlistCollection(
                        user_id=user.id,
                        name="Mi Lista Principal",
                        description="Lista de deseos principal",
                        color="#8B6F47",  # Earth theme color
                        is_default=True
                    )
                    
                    db.add(default_collection)
                    db.flush()  # Get the ID
                    
                    logger.info(f"✅ Created default collection for user {user.email}")
                    
                    # Update existing wishlist items to belong to this collection
                    items_updated = db.query(WishlistItem).filter(
                        WishlistItem.user_id == user.id,
                        WishlistItem.collection_id == None
                    ).update({"collection_id": default_collection.id})
                    
                    if items_updated > 0:
                        logger.info(f"✅ Updated {items_updated} items for user {user.email}")
                else:
                    logger.info(f"✅ User {user.email} already has a default collection")
            
            db.commit()
            logger.info("✅ Migration completed successfully!")
            
    except Exception as e:
        logger.error(f"❌ Migration failed: {str(e)}")
        raise

if __name__ == "__main__":
    run_migration()