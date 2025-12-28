"""
Authentication routes for user registration, login, and profile management.

This module implements the authentication endpoints for the Wishlist API,
including user registration, login, and protected user profile access.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, UserResponse, LoginRequest, Token
from app.auth.dependencies import hash_password, verify_password, get_current_user, get_password_validation_errors
from app.auth.jwt_handler import create_access_token, get_token_expiration_time
from app.exceptions import AuthenticationError, ConflictError, ValidationError

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> UserResponse:
    """
    Register a new user account.
    
    Creates a new user with email and password validation.
    Ensures email uniqueness and password strength requirements.
    
    Args:
        user_data: User registration data (email and password)
        db: Database session
        
    Returns:
        UserResponse: Created user information (excluding password)
        
    Raises:
        HTTPException: 422 for validation errors, 409 for duplicate email
    """
    # Validate password strength
    password_errors = get_password_validation_errors(user_data.password)
    if password_errors:
        raise ValidationError(
            message="Password validation failed",
            details={"errors": password_errors}
        )
    
    # Check if email already exists
    try:
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise ConflictError("Email already registered")
    except ConflictError:
        raise
    except ValidationError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred"
        )
    
    # Hash password and create user
    try:
        hashed_password = hash_password(user_data.password)
        
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return UserResponse.model_validate(new_user)
        
    except IntegrityError:
        await db.rollback()
        raise ConflictError("Email already registered")
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )


@router.post("/login", response_model=Token)
async def login_user(
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
) -> Token:
    """
    Authenticate user and return JWT token.
    
    Verifies user credentials and generates a JWT access token
    for authenticated API access.
    
    Args:
        login_data: User login credentials (email and password)
        db: Database session
        
    Returns:
        Token: JWT access token with expiration information
        
    Raises:
        HTTPException: 401 for invalid credentials
    """
    # Find user by email
    try:
        result = await db.execute(select(User).where(User.email == login_data.email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise AuthenticationError("Invalid email or password")
        
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")
        
        # Create JWT token
        access_token = create_access_token(data={"sub": user.email})
        expires_in = get_token_expiration_time() * 60  # Convert minutes to seconds
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=expires_in
        )
        
    except AuthenticationError:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Get current authenticated user information.
    
    Returns the profile information for the currently authenticated user.
    This is a protected endpoint that requires a valid JWT token.
    
    Args:
        current_user: Current authenticated user from JWT token
        
    Returns:
        UserResponse: Current user information (excluding password)
    """
    return UserResponse.model_validate(current_user)