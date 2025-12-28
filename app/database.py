"""
Database configuration and session management for the Wishlist API.

This module provides SQLAlchemy configuration, async session management,
and database initialization functionality.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./wishlist.db")

# For async SQLite, we need to use aiosqlite
if DATABASE_URL.startswith("sqlite"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
else:
    # For PostgreSQL or other databases
    ASYNC_DATABASE_URL = DATABASE_URL

# Create async engine
engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    # SQLite specific settings
    connect_args={"check_same_thread": False} if "sqlite" in ASYNC_DATABASE_URL else {}
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Create declarative base for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """
    Dependency injection for database sessions.
    
    Yields:
        AsyncSession: Database session for use in FastAPI endpoints
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """
    Initialize database tables.
    
    Creates all tables defined in the models if they don't exist.
    This function should be called during application startup.
    """
    async with engine.begin() as conn:
        # Import all models to ensure they are registered with Base
        from app.models import user, wishlist, price_history
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)


async def close_db():
    """
    Close database connections.
    
    This function should be called during application shutdown.
    """
    await engine.dispose()