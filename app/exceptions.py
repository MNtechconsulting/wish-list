"""
Exception handling and error response utilities for the Wishlist API.

This module defines custom exceptions and error handlers to ensure consistent
HTTP status codes and error responses across all API endpoints.
"""

from typing import Any, Dict, List, Optional, Union
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging

# Configure logging
logger = logging.getLogger(__name__)


class WishlistAPIException(Exception):
    """Base exception class for Wishlist API custom exceptions."""
    
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(WishlistAPIException):
    """Exception for authentication failures."""
    
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(WishlistAPIException):
    """Exception for authorization failures."""
    
    def __init__(self, message: str = "Access forbidden"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class ResourceNotFoundError(WishlistAPIException):
    """Exception for resource not found errors."""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class ConflictError(WishlistAPIException):
    """Exception for resource conflicts (e.g., duplicate email)."""
    
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, status.HTTP_409_CONFLICT)


class ValidationError(WishlistAPIException):
    """Exception for validation errors."""
    
    def __init__(self, message: str = "Validation failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY, details)


def create_error_response(
    status_code: int,
    message: str,
    details: Optional[Union[Dict[str, Any], List[Dict[str, Any]]]] = None,
    error_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a standardized error response format.
    
    Args:
        status_code: HTTP status code
        message: Error message
        details: Additional error details or validation errors
        error_type: Type of error for categorization
        
    Returns:
        Dict containing standardized error response
    """
    error_response = {
        "error": True,
        "status_code": status_code,
        "message": message
    }
    
    if error_type:
        error_response["error_type"] = error_type
    
    if details:
        error_response["details"] = details
    
    return error_response


async def wishlist_api_exception_handler(request: Request, exc: WishlistAPIException) -> JSONResponse:
    """
    Handle custom Wishlist API exceptions.
    
    Args:
        request: FastAPI request object
        exc: Custom exception instance
        
    Returns:
        JSONResponse with standardized error format
    """
    logger.warning(f"WishlistAPIException: {exc.message} - Status: {exc.status_code}")
    
    error_response = create_error_response(
        status_code=exc.status_code,
        message=exc.message,
        details=exc.details if exc.details else None,
        error_type=exc.__class__.__name__
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle FastAPI HTTPException instances.
    
    Args:
        request: FastAPI request object
        exc: HTTPException instance
        
    Returns:
        JSONResponse with standardized error format
    """
    logger.warning(f"HTTPException: {exc.detail} - Status: {exc.status_code}")
    
    # Handle different types of HTTPException details
    if isinstance(exc.detail, dict):
        message = exc.detail.get("message", "An error occurred")
        details = exc.detail.get("errors") or exc.detail.get("details")
    else:
        message = str(exc.detail)
        details = None
    
    error_response = create_error_response(
        status_code=exc.status_code,
        message=message,
        details=details,
        error_type="HTTPException"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Handle Pydantic validation errors from request data.
    
    Args:
        request: FastAPI request object
        exc: RequestValidationError instance
        
    Returns:
        JSONResponse with detailed validation error information
    """
    logger.warning(f"Validation error: {exc.errors()}")
    
    # Format validation errors for better readability
    validation_errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        validation_errors.append({
            "field": field_path,
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    error_response = create_error_response(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message="Validation failed",
        details=validation_errors,
        error_type="ValidationError"
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """
    Handle SQLAlchemy database errors.
    
    Args:
        request: FastAPI request object
        exc: SQLAlchemyError instance
        
    Returns:
        JSONResponse with appropriate error response
    """
    logger.error(f"Database error: {str(exc)}")
    
    # Handle specific SQLAlchemy exceptions
    if isinstance(exc, IntegrityError):
        # Check for common constraint violations
        error_msg = str(exc.orig) if hasattr(exc, 'orig') else str(exc)
        
        if "UNIQUE constraint failed" in error_msg or "duplicate key" in error_msg.lower():
            if "email" in error_msg.lower():
                message = "Email address is already registered"
            else:
                message = "Resource already exists"
            
            error_response = create_error_response(
                status_code=status.HTTP_409_CONFLICT,
                message=message,
                error_type="ConflictError"
            )
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content=error_response
            )
        
        elif "FOREIGN KEY constraint failed" in error_msg:
            error_response = create_error_response(
                status_code=status.HTTP_400_BAD_REQUEST,
                message="Invalid reference to related resource",
                error_type="ForeignKeyError"
            )
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content=error_response
            )
    
    # Generic database error
    error_response = create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Database operation failed",
        error_type="DatabaseError"
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions that aren't caught by other handlers.
    
    Args:
        request: FastAPI request object
        exc: Exception instance
        
    Returns:
        JSONResponse with generic server error
    """
    logger.error(f"Unhandled exception: {type(exc).__name__}: {str(exc)}")
    
    error_response = create_error_response(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message="Internal server error",
        error_type="InternalServerError"
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response
    )


# Status code mapping for common scenarios
STATUS_CODE_MESSAGES = {
    status.HTTP_200_OK: "Success",
    status.HTTP_201_CREATED: "Resource created successfully",
    status.HTTP_204_NO_CONTENT: "Operation completed successfully",
    status.HTTP_400_BAD_REQUEST: "Bad request",
    status.HTTP_401_UNAUTHORIZED: "Authentication required",
    status.HTTP_403_FORBIDDEN: "Access forbidden",
    status.HTTP_404_NOT_FOUND: "Resource not found",
    status.HTTP_409_CONFLICT: "Resource conflict",
    status.HTTP_422_UNPROCESSABLE_ENTITY: "Validation failed",
    status.HTTP_500_INTERNAL_SERVER_ERROR: "Internal server error"
}


def get_status_message(status_code: int) -> str:
    """
    Get a standard message for a given HTTP status code.
    
    Args:
        status_code: HTTP status code
        
    Returns:
        Standard message for the status code
    """
    return STATUS_CODE_MESSAGES.get(status_code, "Unknown status")