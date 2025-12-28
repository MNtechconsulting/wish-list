# Wishlist Backend API

A production-ready REST API built with FastAPI for wishlist management with user authentication, item tracking, and price history functionality.

## Features

- User registration and authentication with JWT tokens
- Secure password hashing with bcrypt
- Wishlist item CRUD operations
- Price history tracking
- Automatic API documentation (Swagger/OpenAPI)
- CORS support for React frontend integration

## Technology Stack

- **FastAPI**: High-performance async web framework
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **JWT**: Token-based authentication
- **SQLite**: Local development database (PostgreSQL-ready for production)

## Setup Instructions

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository** (if not already done)

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values as needed:
   - `SECRET_KEY`: Generate a secure random key for JWT tokens
   - `DATABASE_URL`: Database connection string
   - `ALLOWED_ORIGINS`: Frontend URLs for CORS

6. **Run the application**:
   ```bash
   cd app
   python main.py
   ```
   
   Or using uvicorn directly:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

Once the server is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration (to be created)
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   └── auth/                # Authentication utilities
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── README_BACKEND.md       # This file
```

## Development

### Running Tests

Tests will be added in subsequent tasks. The testing framework uses:
- pytest for unit tests
- hypothesis for property-based tests

### Environment Variables

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: Secret key for JWT token generation
- `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token expiration time (default: 30)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins
- `DEBUG`: Enable debug mode (true/false)

## API Endpoints

Endpoints will be implemented in subsequent tasks:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info (protected)

### Wishlist
- `GET /wishlist` - Get all user's wishlist items (protected)
- `POST /wishlist` - Create new wishlist item (protected)
- `GET /wishlist/{item_id}` - Get specific wishlist item (protected)
- `PUT /wishlist/{item_id}` - Update wishlist item (protected)
- `DELETE /wishlist/{item_id}` - Delete wishlist item (protected)

### Price History
- `GET /wishlist/{item_id}/price-history` - Get price history (protected)
- `POST /wishlist/{item_id}/price-history` - Add price history entry (protected)

## License

This project is part of a wishlist application system.
