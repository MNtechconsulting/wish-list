"""
Authentication schemas for request/response validation.

This module defines Pydantic models for user authentication operations
including registration, login, and token responses.
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration requests."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100, description="Password must be at least 8 characters long")


class UserResponse(BaseModel):
    """Schema for user data in API responses (excludes sensitive fields)."""
    id: int
    email: str
    created_at: datetime
    
    model_config = {"from_attributes": True}


class Token(BaseModel):
    """Schema for JWT token responses."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration time in seconds")


class LoginRequest(BaseModel):
    """Schema for user login requests."""
    email: EmailStr
    password: str