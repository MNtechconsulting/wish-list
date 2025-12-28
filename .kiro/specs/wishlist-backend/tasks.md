# Implementation Plan: Wishlist Backend API

## Overview

This implementation plan breaks down the wishlist backend API into discrete coding tasks that build incrementally. Each task focuses on specific functionality while ensuring integration with previous components. The plan emphasizes early validation through testing and maintains security best practices throughout.

## Tasks

- [x] 1. Project setup and core infrastructure
  - Initialize FastAPI project with proper folder structure (app/, models/, schemas/, routes/, services/, auth/)
  - Configure requirements.txt with FastAPI, SQLAlchemy, Pydantic, python-jose, passlib, bcrypt
  - Set up environment variable configuration with python-dotenv
  - Create main.py with basic FastAPI application and CORS middleware
  - _Requirements: 13.1, 13.2, 14.1, 14.2_

- [ ]* 1.1 Write unit tests for project setup
  - Test that all required dependencies are importable
  - Test that environment variables are loaded correctly
  - _Requirements: 13.1, 13.2_

- [x] 2. Database configuration and models
  - [x] 2.1 Set up database configuration in database.py
    - Configure SQLAlchemy engine for SQLite development
    - Create async session factory and dependency injection
    - Implement database initialization and table creation
    - _Requirements: 8.4, 8.5, 13.4, 14.3_

  - [x] 2.2 Create User model in models/user.py
    - Define User SQLAlchemy model with id, email, hashed_password, timestamps
    - Add proper indexes and constraints for email uniqueness
    - _Requirements: 8.1_

  - [x] 2.3 Create WishlistItem model in models/wishlist.py
    - Define WishlistItem SQLAlchemy model with all required fields
    - Add foreign key relationship to User model
    - Include proper decimal precision for price fields
    - _Requirements: 8.2_

  - [x] 2.4 Create PriceHistory model in models/price_history.py
    - Define PriceHistory SQLAlchemy model with foreign key to WishlistItem
    - Add proper indexing for efficient price history queries
    - _Requirements: 8.3_

  - [ ]* 2.5 Write unit tests for database models
    - Test model creation and relationships
    - Test database constraints and validations
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 3. Authentication system implementation
  - [x] 3.1 Create JWT handler in auth/jwt_handler.py
    - Implement JWT token creation with proper expiration
    - Add JWT token verification and decoding
    - Configure secret key and algorithm from environment
    - _Requirements: 2.2, 2.3_

  - [ ]* 3.2 Write property test for JWT token generation
    - **Property 3: Authentication and JWT token generation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [x] 3.3 Create password hashing utilities in auth/dependencies.py
    - Implement bcrypt password hashing and verification
    - Add password strength validation
    - _Requirements: 1.2, 1.4, 2.5_

  - [x] 3.4 Create authentication dependencies
    - Implement get_current_user dependency for protected routes
    - Add JWT token extraction from Authorization header
    - Handle token validation and user identity extraction
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.5 Write property test for JWT authorization
    - **Property 4: JWT authorization and access control**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [x] 4. Pydantic schemas for request/response validation
  - [x] 4.1 Create authentication schemas in schemas/auth.py
    - Define UserCreate, UserResponse, Token, LoginRequest schemas
    - Add email validation and password requirements
    - _Requirements: 9.1, 9.2_

  - [x] 4.2 Create wishlist schemas in schemas/wishlist.py
    - Define WishlistItemCreate, WishlistItemUpdate, WishlistItemResponse schemas
    - Add price validation and currency format constraints
    - _Requirements: 9.1, 9.5_

  - [x] 4.3 Create user schemas in schemas/user.py
    - Define user-related Pydantic models for API responses
    - Ensure password fields are never included in responses
    - _Requirements: 1.5, 9.1_

  - [ ]* 4.4 Write property test for input validation
    - **Property 7: Input validation and data integrity**
    - **Validates: Requirements 4.3, 6.2, 9.3, 9.4, 9.5**

- [x] 5. Authentication routes implementation
  - [x] 5.1 Create authentication routes in routes/auth.py
    - Implement POST /auth/register endpoint with user creation
    - Add email uniqueness validation and error handling
    - _Requirements: 1.1, 1.3, 1.5_

  - [ ]* 5.2 Write property test for user registration
    - **Property 1: User registration validation and security**
    - **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 9.2**

  - [ ]* 5.3 Write property test for duplicate email prevention
    - **Property 2: Duplicate email prevention**
    - **Validates: Requirements 1.3**

  - [x] 5.4 Implement POST /auth/login endpoint
    - Add credential verification and JWT token generation
    - Handle authentication failures with proper error responses
    - _Requirements: 2.1, 2.4_

  - [x] 5.5 Implement GET /auth/me endpoint (protected)
    - Return current user information for authenticated requests
    - Test JWT token validation and user identity extraction
    - _Requirements: 3.4_

  - [ ]* 5.6 Write unit tests for authentication endpoints
    - Test registration with valid and invalid data
    - Test login with correct and incorrect credentials
    - Test protected endpoint access with various token states
    - _Requirements: 1.1, 1.3, 2.1, 2.4, 3.1, 3.2_

- [x] 6. Wishlist management routes
  - [x] 6.1 Create wishlist routes in routes/wishlist.py
    - Implement GET /wishlist endpoint to retrieve user's items
    - Add proper ordering by creation date (newest first)
    - Ensure users only see their own items
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 6.2 Write property test for wishlist retrieval
    - **Property 8: Wishlist item retrieval and ordering**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [x] 6.3 Implement POST /wishlist endpoint for item creation
    - Add wishlist item creation with user association
    - Set initial price history entry automatically
    - Return created item with generated ID
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 7.1_

  - [ ]* 6.4 Write property test for item creation
    - **Property 6: Wishlist item creation and ownership**
    - **Validates: Requirements 4.1, 4.2, 4.4, 4.5**

  - [x] 6.5 Implement GET /wishlist/{item_id} endpoint
    - Return specific wishlist item if owned by user
    - Handle not found and forbidden access scenarios
    - _Requirements: 5.4, 5.5_

  - [x] 6.6 Implement PUT /wishlist/{item_id} endpoint for updates
    - Allow item modification with proper validation
    - Ensure users can only update their own items
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 6.7 Implement DELETE /wishlist/{item_id} endpoint
    - Remove wishlist item permanently with cascade deletion
    - Return appropriate success confirmation
    - _Requirements: 6.3, 6.4, 6.5_

  - [ ]* 6.8 Write property test for item modification
    - **Property 9: Wishlist item modification and deletion**
    - **Validates: Requirements 6.1, 6.3, 6.5**

  - [ ]* 6.9 Write property test for data isolation
    - **Property 5: Data isolation and user access control**
    - **Validates: Requirements 3.5, 5.5, 6.4, 7.5**

- [x] 7. Price history functionality
  - [x] 7.1 Create price history routes in routes/price_history.py
    - Implement GET /wishlist/{item_id}/price-history endpoint
    - Return price history ordered by timestamp (newest first)
    - Ensure access control for user's items only
    - _Requirements: 7.3, 7.4, 7.5_

  - [x] 7.2 Implement POST /wishlist/{item_id}/price-history endpoint
    - Allow manual price history entry addition
    - Validate price data and associate with correct item
    - _Requirements: 7.2_

  - [ ]* 7.3 Write property test for price history management
    - **Property 10: Price history management and access**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4**

  - [ ]* 7.4 Write unit tests for price history endpoints
    - Test price history retrieval and creation
    - Test access control and data validation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [-] 8. HTTP status codes and error handling
  - [x] 8.1 Implement comprehensive error handling middleware
    - Add global exception handlers for common error types
    - Ensure proper HTTP status codes for all scenarios
    - Include detailed error messages for validation failures
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 8.2 Write property test for HTTP status codes
    - **Property 11: HTTP status code consistency**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

  - [ ]* 8.3 Write unit tests for error scenarios
    - Test various error conditions and status codes
    - Test validation error message formats
    - _Requirements: 9.3, 10.6_

- [x] 9. CORS configuration and API documentation
  - [x] 9.1 Configure CORS middleware in main.py
    - Set up CORS for React frontend origins
    - Allow necessary HTTP methods and headers
    - Handle preflight OPTIONS requests
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 9.2 Write property test for CORS configuration
    - **Property 12: CORS configuration and cross-origin support**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

  - [x] 9.3 Configure automatic API documentation
    - Ensure Swagger/OpenAPI docs are generated at /docs
    - Include comprehensive endpoint documentation
    - Document authentication requirements and schemas
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 9.4 Write property test for API documentation
    - **Property 13: API documentation completeness**
    - **Validates: Requirements 12.2, 12.4**

- [x] 10. Development tooling and seed data
  - [x] 10.1 Create database initialization script
    - Add script to create tables and initial setup
    - Include database migration capabilities
    - _Requirements: 13.3, 13.4_

  - [x] 10.2 Create seed data functionality
    - Add script to populate database with sample data
    - Include sample users and wishlist items for testing
    - _Requirements: 13.5_

  - [x] 10.3 Create development environment documentation
    - Write README.md with setup instructions
    - Document API endpoints and usage examples
    - Include environment variable configuration guide
    - _Requirements: 13.3_

  - [ ]* 10.4 Write integration tests for complete API flows
    - Test end-to-end user registration → login → wishlist management
    - Test cross-endpoint data consistency
    - _Requirements: All requirements_

- [x] 11. Final integration and testing
  - [x] 11.1 Wire all components together in main.py
    - Register all route modules with proper prefixes
    - Configure middleware stack and error handlers
    - Set up application lifecycle events
    - _Requirements: 14.1_

  - [x] 11.2 Add comprehensive logging and monitoring
    - Configure structured logging for debugging
    - Add request/response logging for development
    - _Requirements: 10.7_

  - [ ]* 11.3 Write comprehensive integration tests
    - Test complete API functionality end-to-end
    - Test error scenarios and edge cases
    - Test concurrent access and data consistency
    - _Requirements: All requirements_

- [x] 12. Checkpoint - Final testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using Hypothesis library
- Unit tests validate specific examples and edge cases using pytest
- The implementation uses async/await throughout for optimal performance
- SQLAlchemy 2.0+ syntax is used for modern ORM patterns
- JWT tokens provide stateless authentication for scalability