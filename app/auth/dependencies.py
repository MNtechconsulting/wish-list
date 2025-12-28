"""
Authentication dependencies and password utilities.

This module provides password hashing, verification, validation utilities,
and FastAPI dependencies for user authentication.
"""

import re
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User
from app.auth.jwt_handler import decode_token
from app.exceptions import AuthenticationError

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer token security
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.
    
    Args:
        password: Plain text password to hash
        
    Returns:
        str: Hashed password
        
    Example:
        >>> hashed = hash_password("mypassword123")
        >>> isinstance(hashed, str)
        True
        >>> len(hashed) > 20  # Bcrypt hashes are typically 60 characters
        True
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to verify against
        
    Returns:
        bool: True if password matches, False otherwise
        
    Example:
        >>> password = "mypassword123"
        >>> hashed = hash_password(password)
        >>> verify_password(password, hashed)
        True
        >>> verify_password("wrongpassword", hashed)
        False
    """
    return pwd_context.verify(plain_password, hashed_password)


def validate_password_strength(password: str) -> bool:
    """
    Validate password strength requirements.
    
    Requirements:
    - At least 8 characters long
    - At most 100 characters long
    - Contains at least one letter
    - Contains at least one number
    
    Args:
        password: Password to validate
        
    Returns:
        bool: True if password meets requirements, False otherwise
        
    Example:
        >>> validate_password_strength("password123")
        True
        >>> validate_password_strength("pass")
        False
        >>> validate_password_strength("password")
        False
        >>> validate_password_strength("12345678")
        False
    """
    if len(password) < 8 or len(password) > 100:
        return False
    
    # Check for at least one letter
    if not re.search(r'[a-zA-Z]', password):
        return False
    
    # Check for at least one number
    if not re.search(r'\d', password):
        return False
    
    return True


def get_password_validation_errors(password: str) -> list[str]:
    """
    Get detailed password validation error messages.
    
    Args:
        password: Password to validate
        
    Returns:
        list[str]: List of validation error messages
        
    Example:
        >>> errors = get_password_validation_errors("pass")
        >>> len(errors) > 0
        True
        >>> "at least 8 characters" in " ".join(errors)
        True
    """
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if len(password) > 100:
        errors.append("Password must be at most 100 characters long")
    
    if not re.search(r'[a-zA-Z]', password):
        errors.append("Password must contain at least one letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    
    return errors


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency to get the current authenticated user.
    
    Extracts JWT token from Authorization header, validates it,
    and returns the corresponding user from the database.
    
    Args:
        credentials: HTTP Bearer credentials from request header
        db: Database session
        
    Returns:
        User: The authenticated user object
        
    Raises:
        AuthenticationError: If token is invalid or user not found
    """
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Decode token to get user email
        email = decode_token(token)
        if email is None:
            raise AuthenticationError("Could not validate credentials")
            
    except AuthenticationError:
        raise
    except Exception:
        raise AuthenticationError("Could not validate credentials")
    
    # Get user from database
    try:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user is None:
            raise AuthenticationError("Could not validate credentials")
            
        return user
        
    except AuthenticationError:
        raise
    except Exception:
        raise AuthenticationError("Could not validate credentials")


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    FastAPI dependency to optionally get the current authenticated user.
    
    Similar to get_current_user but returns None instead of raising
    an exception if no valid token is provided.
    
    Args:
        credentials: Optional HTTP Bearer credentials from request header
        db: Database session
        
    Returns:
        Optional[User]: The authenticated user object or None
    """
    if credentials is None:
        return None
    
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Decode token to get user email
        email = decode_token(token)
        if email is None:
            return None
            
        # Get user from database
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        return user
        
    except Exception:
        return None