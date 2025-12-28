"""
MiraWish Backend API

A production-ready REST API for wishlist management with user authentication,
item tracking, and price history functionality.
"""

import os
import logging
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.security import HTTPBearer
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv

from app.routes import auth, wishlist, wishlist_collections, price_history
from app.database import init_db, close_db
from app.exceptions import (
    WishlistAPIException,
    wishlist_api_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    sqlalchemy_exception_handler,
    generic_exception_handler
)

# Load environment variables
load_dotenv()

# Configure structured logging
def setup_logging():
    """Configure structured logging for the application."""
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    debug_mode = os.getenv("DEBUG", "false").lower() == "true"
    
    # Set log level based on environment
    if debug_mode:
        log_level = "DEBUG"
    
    # Configure logging format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    if debug_mode:
        # More detailed format for development
        log_format = "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s - %(message)s"
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format=log_format,
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Configure specific loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING if not debug_mode else logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    
    return logging.getLogger(__name__)

# Set up logging
logger = setup_logging()

# Create FastAPI application with comprehensive documentation
app = FastAPI(
    title="MiraWish Backend API",
    description="""
    A production-ready REST API for wishlist management with user authentication, 
    item tracking, and price history functionality.
    
    ## Authentication
    
    This API uses JWT (JSON Web Token) authentication. To access protected endpoints:
    
    1. Register a new account using `/auth/register`
    2. Login using `/auth/login` to receive a JWT token
    3. Include the token in the Authorization header: `Bearer <your_token>`
    
    ## Features
    
    * **User Management**: Secure user registration and authentication
    * **Wishlist Management**: Create, read, update, and delete wishlist items
    * **Price Tracking**: Track price history for wishlist items over time
    * **Data Security**: Users can only access their own data
    
    ## API Endpoints
    
    * **Authentication**: `/auth/*` - User registration, login, and profile
    * **Wishlist**: `/wishlist/*` - Wishlist item CRUD operations
    * **Price History**: `/wishlist/{item_id}/price-history/*` - Price tracking
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Authentication",
            "description": "User registration, login, and profile management operations."
        },
        {
            "name": "Wishlist",
            "description": "Wishlist item management operations. All endpoints require authentication."
        },
        {
            "name": "Price History",
            "description": "Price tracking operations for wishlist items. All endpoints require authentication."
        },
        {
            "name": "Health",
            "description": "API health check and status endpoints."
        }
    ],
    contact={
        "name": "MiraWish API Support",
        "email": "support@mirawish.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Configure OpenAPI security scheme for JWT authentication
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
        tags=app.openapi_tags,
    )
    
    # Add JWT Bearer token security scheme
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token in the format: Bearer <token>"
        }
    }
    
    # Add security requirement to protected endpoints
    for path, path_item in openapi_schema["paths"].items():
        # Skip auth endpoints and health endpoints
        if path.startswith("/auth") or path in ["/", "/health"]:
            continue
            
        for method, operation in path_item.items():
            if method in ["get", "post", "put", "delete", "patch"]:
                operation["security"] = [{"BearerAuth": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Request/Response logging middleware
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    """
    Log HTTP requests and responses for debugging and monitoring.
    
    This middleware logs:
    - Request method, URL, headers, and body (in debug mode)
    - Response status code, processing time, and headers
    - Request ID for tracing
    """
    # Generate unique request ID for tracing
    request_id = str(uuid.uuid4())[:8]
    
    # Start timing
    start_time = time.time()
    
    # Log request details
    debug_mode = os.getenv("DEBUG", "false").lower() == "true"
    
    if debug_mode:
        logger.debug(
            f"Request [{request_id}] - {request.method} {request.url} - "
            f"Headers: {dict(request.headers)} - Client: {request.client.host if request.client else 'unknown'}"
        )
    else:
        logger.info(
            f"Request [{request_id}] - {request.method} {request.url.path} - "
            f"Client: {request.client.host if request.client else 'unknown'}"
        )
    
    # Add request ID to request state for use in endpoints
    request.state.request_id = request_id
    
    # Process request
    try:
        response = await call_next(request)
    except Exception as e:
        # Log unhandled exceptions
        processing_time = time.time() - start_time
        logger.error(
            f"Request [{request_id}] - Unhandled exception after {processing_time:.3f}s: {type(e).__name__}: {str(e)}"
        )
        raise
    
    # Calculate processing time
    processing_time = time.time() - start_time
    
    # Log response details
    if debug_mode:
        logger.debug(
            f"Response [{request_id}] - Status: {response.status_code} - "
            f"Time: {processing_time:.3f}s - Headers: {dict(response.headers)}"
        )
    else:
        # Log different levels based on status code
        if response.status_code >= 500:
            logger.error(f"Response [{request_id}] - Status: {response.status_code} - Time: {processing_time:.3f}s")
        elif response.status_code >= 400:
            logger.warning(f"Response [{request_id}] - Status: {response.status_code} - Time: {processing_time:.3f}s")
        else:
            logger.info(f"Response [{request_id}] - Status: {response.status_code} - Time: {processing_time:.3f}s")
    
    # Add request ID to response headers for client-side tracing
    response.headers["X-Request-ID"] = request_id
    
    return response

# Add exception handlers
app.add_exception_handler(WishlistAPIException, wishlist_api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Note: HTTPException handler is added after other handlers to ensure
# custom exceptions are caught first
from fastapi import HTTPException
app.add_exception_handler(HTTPException, http_exception_handler)

# Configure CORS for React frontend integration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
# Clean up origins list (remove empty strings and whitespace)
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "User-Agent",
        "DNT",
        "Cache-Control",
        "X-Mx-ReqToken",
        "Keep-Alive",
        "X-Requested-With",
        "If-Modified-Since",
    ],
    expose_headers=["X-Request-ID"],
    max_age=86400,  # 24 hours for preflight cache
)

# Include routers with proper prefixes
app.include_router(auth.router)
app.include_router(wishlist_collections.router)
app.include_router(wishlist.router)
app.include_router(price_history.router)

# Application lifecycle events
@app.on_event("startup")
async def startup_event():
    """Initialize database and perform startup tasks."""
    logger.info("=" * 50)
    logger.info("Starting up MiraWish Backend API...")
    logger.info(f"Environment: {'Development' if os.getenv('DEBUG', 'false').lower() == 'true' else 'Production'}")
    logger.info(f"Database URL: {os.getenv('DATABASE_URL', 'sqlite:///./wishlist.db')}")
    logger.info(f"CORS Origins: {os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173')}")
    logger.info(f"Log Level: {os.getenv('LOG_LEVEL', 'INFO')}")
    
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        raise
    
    logger.info("MiraWish Backend API startup complete")
    logger.info("=" * 50)

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources during application shutdown."""
    logger.info("=" * 50)
    logger.info("Shutting down MiraWish Backend API...")
    
    try:
        await close_db()
        logger.info("Database connections closed successfully")
    except Exception as e:
        logger.error(f"Error closing database connections: {str(e)}")
    
    logger.info("MiraWish Backend API shutdown complete")
    logger.info("=" * 50)

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint for health check"""
    return {"message": "MiraWish Backend API is running", "version": "1.0.0"}

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "mirawish-backend"}

if __name__ == "__main__":
    import uvicorn
    
    debug_mode = os.getenv("DEBUG", "false").lower() == "true"
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=debug_mode
    )