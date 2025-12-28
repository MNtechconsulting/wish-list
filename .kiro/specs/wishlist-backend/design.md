# Design Document: Wishlist Backend API

## Overview

The Wishlist Backend API is a production-ready REST API built with Python, FastAPI, and SQLAlchemy. It provides secure user authentication using JWT tokens, comprehensive wishlist management capabilities, and price history tracking. The API is designed to support both web and future mobile applications with CORS-enabled endpoints, automatic documentation generation, and robust error handling.

## Architecture

### Technology Stack
- **Web Framework**: FastAPI 0.104+ for high-performance async API development
- **ORM**: SQLAlchemy 2.0+ with declarative models and async support
- **Database**: SQLite for local development, PostgreSQL-ready for production
- **Authentication**: JWT tokens with python-jose for encoding/decoding
- **Password Hashing**: bcrypt via passlib for secure password storage
- **Validation**: Pydantic v2 for request/response validation and serialization
- **CORS**: FastAPI CORS middleware for React frontend integration
- **Documentation**: Automatic OpenAPI/Swagger documentation generation

### Application Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration and session management
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py          # User SQLAlchemy model
│   │   ├── wishlist.py      # Wishlist item SQLAlchemy model
│   │   └── price_history.py # Price history SQLAlchemy model
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py          # User Pydantic schemas
│   │   ├── wishlist.py      # Wishlist Pydantic schemas
│   │   └── auth.py          # Authentication schemas
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── wishlist.py      # Wishlist CRUD endpoints
│   │   └── price_history.py # Price history endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py  # Authentication business logic
│   │   └── wishlist_service.py # Wishlist business logic
│   └── auth/
│       ├── __init__.py
│       ├── jwt_handler.py   # JWT token creation and validation
│       └── dependencies.py  # FastAPI dependency injection
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README.md               # Setup and usage instructions
```

## Components and Interfaces

### Database Models

#### User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    wishlist_items: Mapped[List["WishlistItem"]] = relationship("WishlistItem", back_populates="user", cascade="all, delete-orphan")
```

#### Wishlist Item Model
```python
class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    product_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    initial_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    current_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="wishlist_items")
    price_history: Mapped[List["PriceHistory"]] = relationship("PriceHistory", back_populates="wishlist_item", cascade="all, delete-orphan")
```

#### Price History Model
```python
class PriceHistory(Base):
    __tablename__ = "price_history"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    wishlist_item_id: Mapped[int] = mapped_column(Integer, ForeignKey("wishlist_items.id"), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    checked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    wishlist_item: Mapped["WishlistItem"] = relationship("WishlistItem", back_populates="price_history")
```

### Pydantic Schemas

#### Authentication Schemas
```python
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
```

#### Wishlist Schemas
```python
class WishlistItemCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    product_url: Optional[HttpUrl] = None
    initial_price: Decimal = Field(..., gt=0, decimal_places=2)
    currency: str = Field(default="USD", regex="^[A-Z]{3}$")

class WishlistItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    product_url: Optional[HttpUrl] = None
    current_price: Optional[Decimal] = Field(None, gt=0, decimal_places=2)

class WishlistItemResponse(BaseModel):
    id: int
    title: str
    product_url: Optional[str]
    initial_price: Decimal
    current_price: Decimal
    currency: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PriceHistoryResponse(BaseModel):
    id: int
    price: Decimal
    checked_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
```

### API Endpoints

#### Authentication Routes
```python
# POST /auth/register - User registration
# POST /auth/login - User login
# GET /auth/me - Get current user info (protected)
```

#### Wishlist Routes
```python
# GET /wishlist - Get all user's wishlist items (protected)
# POST /wishlist - Create new wishlist item (protected)
# GET /wishlist/{item_id} - Get specific wishlist item (protected)
# PUT /wishlist/{item_id} - Update wishlist item (protected)
# DELETE /wishlist/{item_id} - Delete wishlist item (protected)
```

#### Price History Routes
```python
# GET /wishlist/{item_id}/price-history - Get price history for item (protected)
# POST /wishlist/{item_id}/price-history - Add price history entry (protected)
```

## Data Models

### Database Configuration
```python
# SQLite for development
DATABASE_URL = "sqlite:///./wishlist.db"

# PostgreSQL for production
DATABASE_URL = "postgresql://user:password@localhost/wishlist_db"

# SQLAlchemy engine configuration
engine = create_async_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True
)

SessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
```

### JWT Configuration
```python
SECRET_KEY = "your-secret-key-here"  # From environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Token payload structure
{
    "sub": "user_email@example.com",
    "exp": 1234567890,
    "iat": 1234567890
}
```

### Environment Variables
```bash
# Database
DATABASE_URL=sqlite:///./wishlist.db

# JWT
SECRET_KEY=your-super-secret-jwt-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Development
DEBUG=true
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Converting EARS to Properties

Based on the prework analysis, here are the consolidated correctness properties:

Property 1: User registration validation and security
*For any* user registration request, valid email and password data should create a new user account with securely hashed password, while invalid data should be rejected with appropriate validation errors
**Validates: Requirements 1.1, 1.2, 1.4, 1.5, 9.2**

Property 2: Duplicate email prevention
*For any* email address, attempting to register multiple users with the same email should succeed only for the first registration and return appropriate errors for subsequent attempts
**Validates: Requirements 1.3**

Property 3: Authentication and JWT token generation
*For any* user login attempt, valid credentials should return a properly formatted JWT token with correct expiration, while invalid credentials should return authentication errors
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 4: JWT authorization and access control
*For any* protected endpoint request, valid JWT tokens should grant access with correct user identity extraction, while missing, invalid, or expired tokens should return appropriate authorization errors
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

Property 5: Data isolation and user access control
*For any* user and any data resource, users should only be able to access, modify, or delete their own data, never other users' data
**Validates: Requirements 3.5, 5.5, 6.4, 7.5**

Property 6: Wishlist item creation and ownership
*For any* authenticated user and valid item data, creating a wishlist item should properly associate it with the user, set correct default values, and return the complete item with generated ID
**Validates: Requirements 4.1, 4.2, 4.4, 4.5**

Property 7: Input validation and data integrity
*For any* API endpoint, invalid input data should be rejected with detailed validation errors, while valid data should be processed successfully
**Validates: Requirements 4.3, 6.2, 9.3, 9.4, 9.5**

Property 8: Wishlist item retrieval and ordering
*For any* authenticated user, retrieving their wishlist should return all and only their items, properly ordered by creation date, with complete field data
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

Property 9: Wishlist item modification and deletion
*For any* authenticated user and their wishlist items, updates should modify item data correctly, and deletions should permanently remove items with appropriate success responses
**Validates: Requirements 6.1, 6.3, 6.5**

Property 10: Price history management and access
*For any* wishlist item creation, an initial price history entry should be automatically created, and users should be able to retrieve complete price history for their items in proper chronological order
**Validates: Requirements 7.1, 7.2, 7.3, 7.4**

Property 11: HTTP status code consistency
*For any* API operation, the response should return the appropriate HTTP status code (201 for creation, 200 for success, 401 for authentication errors, 403 for authorization errors, 404 for not found, 422 for validation errors, 500 for server errors)
**Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

Property 12: CORS configuration and cross-origin support
*For any* cross-origin request from allowed origins, the API should properly handle CORS headers, methods, and preflight requests to enable React frontend integration
**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

Property 13: API documentation completeness
*For any* API endpoint, the automatically generated documentation should include complete endpoint information, schemas, authentication requirements, and status codes
**Validates: Requirements 12.2, 12.4**

## Error Handling

### Authentication and Authorization Errors
- **Invalid Credentials**: Return 401 with clear error message for wrong email/password
- **Missing Token**: Return 401 when JWT token is not provided for protected routes
- **Invalid Token**: Return 401 for malformed, expired, or tampered JWT tokens
- **Insufficient Permissions**: Return 403 when user tries to access others' data

### Validation Errors
- **Pydantic Validation**: Return 422 with detailed field-level error messages
- **Email Format**: Validate email format using EmailStr type
- **Password Strength**: Enforce minimum length and complexity requirements
- **Required Fields**: Ensure all mandatory fields are provided
- **Data Types**: Validate numeric fields, URL formats, and currency codes

### Database Errors
- **Connection Failures**: Handle database connection issues gracefully
- **Constraint Violations**: Handle unique constraint violations (duplicate emails)
- **Foreign Key Errors**: Handle invalid references between related entities
- **Transaction Rollback**: Ensure data consistency with proper transaction management

### Business Logic Errors
- **Resource Not Found**: Return 404 for non-existent wishlist items or users
- **Ownership Validation**: Prevent users from accessing others' resources
- **Data Integrity**: Maintain referential integrity between users, items, and price history

### Server Errors
- **Internal Errors**: Return 500 for unexpected server errors with proper logging
- **Graceful Degradation**: Handle service unavailability scenarios
- **Error Logging**: Log errors for debugging while protecting sensitive information

## Testing Strategy

### Dual Testing Approach

The API will use both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Authentication with known credentials
- CRUD operations with specific data
- Error scenarios with invalid inputs
- Database constraint violations
- JWT token validation edge cases

**Property Tests**: Verify universal properties across all inputs
- User registration across all valid/invalid input combinations
- Authentication behavior across all credential types
- Authorization across all token states
- Data isolation across all user combinations
- Input validation across all possible invalid inputs

### Testing Framework Configuration

**Testing Libraries**:
- **pytest**: Python testing framework with async support
- **pytest-asyncio**: Async test support for FastAPI
- **httpx**: Async HTTP client for API testing
- **hypothesis**: Property-based testing library for Python
- **factory-boy**: Test data generation and factories

**Property Test Configuration**:
- Minimum 100 iterations per property test
- Custom strategies for users, wishlist items, and JWT tokens
- Each property test tagged with: **Feature: wishlist-backend, Property {number}: {property_text}**

**Test Organization**:
```
tests/
├── unit/                    # Unit tests
│   ├── test_auth.py        # Authentication unit tests
│   ├── test_wishlist.py    # Wishlist CRUD unit tests
│   └── test_models.py      # Database model tests
├── property/               # Property-based tests
│   ├── test_auth_properties.py      # Authentication properties
│   ├── test_wishlist_properties.py  # Wishlist properties
│   └── test_validation_properties.py # Input validation properties
├── integration/            # Integration tests
│   ├── test_api_flows.py   # End-to-end API flows
│   └── test_database.py    # Database integration tests
└── conftest.py            # Pytest configuration and fixtures
```

### Mock Data and Test Strategies

**Hypothesis Strategies for Property Testing**:
- **User Strategy**: Generates valid/invalid user registration data
- **Credentials Strategy**: Creates various email/password combinations
- **JWT Strategy**: Generates valid/invalid/expired tokens
- **Wishlist Item Strategy**: Creates realistic item data with edge cases
- **Price Strategy**: Generates valid price values and currency codes

**Test Database**:
- In-memory SQLite for fast test execution
- Database fixtures with automatic cleanup
- Transaction rollback for test isolation
- Seed data for consistent test scenarios

### API Testing Patterns

**Authentication Flow Testing**:
- Registration → Login → Protected endpoint access
- Token expiration and refresh scenarios
- Invalid credential handling

**CRUD Operation Testing**:
- Create → Read → Update → Delete cycles
- Ownership validation across operations
- Concurrent access scenarios

**Error Scenario Testing**:
- Network failures and timeouts
- Database constraint violations
- Malformed request payloads
- Edge cases in business logic
