"""
JWT token handling for authentication.

This module provides JWT token creation, verification, and decoding functionality
for secure user authentication in the Wishlist API.
"""

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-jwt-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing the payload data (typically user email)
        expires_delta: Optional custom expiration time
        
    Returns:
        str: Encoded JWT token
        
    Example:
        >>> token = create_access_token({"sub": "user@example.com"})
        >>> isinstance(token, str)
        True
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token string to verify
        
    Returns:
        Optional[Dict[str, Any]]: Decoded payload if valid, None if invalid
        
    Example:
        >>> payload = {"sub": "user@example.com"}
        >>> token = create_access_token(payload)
        >>> decoded = verify_token(token)
        >>> decoded["sub"] == "user@example.com"
        True
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def decode_token(token: str) -> Optional[str]:
    """
    Decode JWT token and extract user email from subject.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Optional[str]: User email if token is valid, None if invalid
        
    Example:
        >>> token = create_access_token({"sub": "user@example.com"})
        >>> email = decode_token(token)
        >>> email == "user@example.com"
        True
    """
    payload = verify_token(token)
    if payload is None:
        return None
    
    return payload.get("sub")


def get_token_expiration_time() -> int:
    """
    Get the token expiration time in minutes.
    
    Returns:
        int: Token expiration time in minutes
    """
    return ACCESS_TOKEN_EXPIRE_MINUTES


def is_token_expired(token: str) -> bool:
    """
    Check if a JWT token is expired.
    
    Args:
        token: JWT token string to check
        
    Returns:
        bool: True if token is expired or invalid, False if still valid
    """
    payload = verify_token(token)
    if payload is None:
        return True
    
    exp_timestamp = payload.get("exp")
    if exp_timestamp is None:
        return True
    
    current_timestamp = datetime.utcnow().timestamp()
    return current_timestamp > exp_timestamp