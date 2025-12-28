#!/usr/bin/env python3
"""
Database initialization script for the Wishlist Backend API.

This script provides database initialization and migration capabilities
for development and production environments.

Usage:
    python scripts/init_db.py [--drop-all] [--seed-data]
    
Options:
    --drop-all    Drop all existing tables before creating new ones
    --seed-data   Populate database with sample data after initialization
"""

import asyncio
import argparse
import sys
import os
from pathlib import Path

# Add the parent directory to the Python path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine, Base, init_db, close_db
from app.models import user, wishlist, price_history


async def drop_all_tables():
    """
    Drop all existing database tables.
    
    WARNING: This will permanently delete all data in the database.
    Use with caution, especially in production environments.
    """
    print("⚠️  Dropping all existing tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("✅ All tables dropped successfully")


async def create_all_tables():
    """
    Create all database tables based on SQLAlchemy models.
    
    This function will create tables for:
    - Users (authentication and user management)
    - Wishlist Items (user's wishlist entries)
    - Price History (price tracking over time)
    """
    print("🔧 Creating database tables...")
    
    # Import all models to ensure they are registered with Base
    # This is important for proper table creation
    from app.models import user, wishlist, price_history
    
    async with engine.begin() as conn:
        # Create all tables defined in the models
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created successfully")
    
    # Print information about created tables
    print("\n📋 Created tables:")
    print("   • users - User accounts and authentication")
    print("   • wishlist_items - User wishlist entries")
    print("   • price_history - Price tracking data")


async def verify_database_schema():
    """
    Verify that the database schema matches the expected structure.
    
    This function checks that all required tables exist and have
    the correct structure as defined in the SQLAlchemy models.
    """
    print("\n🔍 Verifying database schema...")
    
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            # Check if tables exist by querying metadata
            result = await conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table'")
            )
            result = result.fetchall()
            
            table_names = [row[0] for row in result]
            expected_tables = ['users', 'wishlist_items', 'price_history']
            
            print(f"   Found tables: {', '.join(table_names)}")
            
            # Check if all expected tables exist
            missing_tables = [table for table in expected_tables if table not in table_names]
            
            if missing_tables:
                print(f"❌ Missing tables: {', '.join(missing_tables)}")
                return False
            else:
                print("✅ All required tables are present")
                return True
                
    except Exception as e:
        print(f"❌ Error verifying database schema: {e}")
        return False


async def show_database_info():
    """
    Display information about the current database configuration.
    """
    print("\n📊 Database Information:")
    print(f"   Database URL: {os.getenv('DATABASE_URL', 'sqlite:///./wishlist.db')}")
    print(f"   Engine: {engine.url}")
    
    # Show table information if database exists
    try:
        async with engine.begin() as conn:
            from sqlalchemy import text
            result = await conn.execute(
                text("""
                    SELECT name, sql FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                    ORDER BY name
                """)
            )
            result = result.fetchall()
            
            if result:
                print(f"   Tables: {len(result)} found")
                for table_name, _ in result:
                    print(f"     • {table_name}")
            else:
                print("   Tables: No tables found")
                
    except Exception as e:
        print(f"   Status: Database not accessible ({e})")


async def main():
    """
    Main function to handle database initialization based on command line arguments.
    """
    parser = argparse.ArgumentParser(
        description="Initialize the Wishlist Backend API database",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/init_db.py                    # Initialize database with existing data
  python scripts/init_db.py --drop-all        # Drop and recreate all tables
  python scripts/init_db.py --seed-data       # Initialize and add sample data
  python scripts/init_db.py --drop-all --seed-data  # Fresh start with sample data
        """
    )
    
    parser.add_argument(
        "--drop-all",
        action="store_true",
        help="Drop all existing tables before creating new ones (WARNING: destroys all data)"
    )
    
    parser.add_argument(
        "--seed-data",
        action="store_true",
        help="Populate database with sample data after initialization"
    )
    
    parser.add_argument(
        "--info",
        action="store_true",
        help="Show database information and exit"
    )
    
    args = parser.parse_args()
    
    print("🚀 Wishlist Backend API - Database Initialization")
    print("=" * 50)
    
    try:
        # Show database info if requested
        if args.info:
            await show_database_info()
            return
        
        # Drop tables if requested
        if args.drop_all:
            confirmation = input(
                "\n⚠️  This will permanently delete all data. "
                "Type 'yes' to continue: "
            )
            if confirmation.lower() != 'yes':
                print("❌ Operation cancelled")
                return
            await drop_all_tables()
        
        # Create tables
        await create_all_tables()
        
        # Verify schema
        schema_valid = await verify_database_schema()
        
        if not schema_valid:
            print("❌ Database initialization failed - schema verification failed")
            return
        
        # Seed data if requested
        if args.seed_data:
            print("\n🌱 Seeding database with sample data...")
            # Import and run seed data script
            try:
                from scripts.seed_data import seed_database
                await seed_database()
                print("✅ Sample data added successfully")
            except ImportError:
                print("⚠️  Seed data script not found. Run: python scripts/seed_data.py")
            except Exception as e:
                print(f"❌ Error seeding data: {e}")
        
        print("\n🎉 Database initialization completed successfully!")
        print("\nNext steps:")
        print("  1. Start the API server: uvicorn app.main:app --reload")
        print("  2. Visit http://localhost:8000/docs for API documentation")
        print("  3. Register a new user account to get started")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)
    
    finally:
        # Clean up database connections
        await close_db()


if __name__ == "__main__":
    # Run the async main function
    asyncio.run(main())