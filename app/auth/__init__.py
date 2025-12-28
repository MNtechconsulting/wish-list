"""
Authentication module for the Wishlist API.

This module provides JWT token handling, password utilities,
and authentication dependencies for secure user authentication.
"""

from .jwt_handler import (
    create_access_token,
    verify_token,
    decode_token,
    get_token_expiration_time,
    is_token_expired
)

from .dependencies import (
    hash_password,
    verify_password,
    validate_password_strength,
    get_password_validation_errors,
    get_current_user,
    get_current_user_optional
)

__all__ = [
    # JWT functions
    "create_access_token",
    "verify_token", 
    "decode_token",
    "get_token_expiration_time",
    "is_token_expired",
    # Password functions
    "hash_password",
    "verify_password",
    "validate_password_strength",
    "get_password_validation_errors",
    # Dependencies
    "get_current_user",
    "get_current_user_optional"
]