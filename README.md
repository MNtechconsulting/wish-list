# Wishlist Backend API

A production-ready REST API built with FastAPI for wishlist management with user authentication, item tracking, and price history functionality. This API serves as the backend for both web and mobile wishlist applications.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Wishlist Management**: Complete CRUD operations for wishlist items
- **Price Tracking**: Historical price tracking with automatic initial entries
- **Data Security**: Users can only access their own data with proper authorization
- **API Documentation**: Automatic Swagger/OpenAPI documentation generation
- **CORS Support**: Configured for React frontend integration
- **Async Performance**: Built with FastAPI's async capabilities for high performance
- **Database Flexibility**: SQLite for development, PostgreSQL-ready for production

## 🛠️ Technology Stack

- **[FastAPI](https://fastapi.tiangolo.com/)** 0.104+ - High-performance async web framework
- **[SQLAlchemy](https://www.sqlalchemy.org/)** 2.0+ - Modern Python ORM with async support
- **[Pydantic](https://docs.pydantic.dev/)** v2 - Data validation and serialization
- **[JWT](https://python-jose.readthedocs.io/)** - Token-based authentication
- **[bcrypt](https://pypi.org/project/bcrypt/)** - Secure password hashing
- **[SQLite](https://www.sqlite.org/)** - Local development database
- **[PostgreSQL](https://www.postgresql.org/)** - Production database (ready)

## 📋 Prerequisites

- **Python 3.9 or higher**
- **pip** (Python package manager)
- **Git** (for cloning the repository)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd wishlist-app
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On macOS/Linux:
source .venv/bin/activate

# On Windows:
.venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
```

**Environment Variables:**

```bash
# Database Configuration
DATABASE_URL=sqlite:///./wishlist.db

# JWT Configuration
SECRET_KEY=your-super-secret-jwt-key-here-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration (for frontend integration)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Development Settings
DEBUG=true
```

> **⚠️ Security Note**: Always generate a strong, unique `SECRET_KEY` for production environments.

### 5. Database Initialization

```bash
# Initialize database tables
python scripts/init_db.py

# Optional: Add sample data for development
python scripts/init_db.py --seed-data

# Or start fresh with sample data
python scripts/init_db.py --drop-all --seed-data
```

### 6. Start the Server

```bash
# Using uvicorn directly (recommended for development)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the main.py script
python app/main.py
```

The API will be available at: **http://localhost:8000**

## 📚 API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 🏗️ Project Structure

```
wishlist-backend/
├── app/                          # Main application package
│   ├── main.py                   # FastAPI application entry point
│   ├── database.py               # Database configuration and session management
│   ├── exceptions.py             # Custom exception classes and handlers
│   ├── models/                   # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   ├── wishlist.py          # Wishlist item model
│   │   └── price_history.py     # Price history model
│   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication schemas
│   │   ├── user.py              # User schemas
│   │   └── wishlist.py          # Wishlist schemas
│   ├── routes/                   # API endpoint definitions
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── wishlist.py          # Wishlist CRUD endpoints
│   │   └── price_history.py     # Price history endpoints
│   ├── services/                 # Business logic layer
│   │   └── __init__.py
│   └── auth/                     # Authentication utilities
│       ├── __init__.py
│       ├── jwt_handler.py       # JWT token creation and validation
│       └── dependencies.py      # FastAPI auth dependencies
├── scripts/                      # Database and utility scripts
│   ├── init_db.py               # Database initialization script
│   └── seed_data.py             # Sample data seeding script
├── tests/                        # Test suite (to be implemented)
├── requirements.txt              # Python dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. Here's how to authenticate:

### 1. Register a New User

```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Login to Get JWT Token

```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### 3. Use Token for Protected Endpoints

```bash
curl -X GET "http://localhost:8000/wishlist" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📖 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user account | ❌ |
| POST | `/auth/login` | Login and receive JWT token | ❌ |
| GET | `/auth/me` | Get current user information | ✅ |

### Wishlist Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/wishlist` | Get all user's wishlist items | ✅ |
| POST | `/wishlist` | Create a new wishlist item | ✅ |
| GET | `/wishlist/{item_id}` | Get specific wishlist item | ✅ |
| PUT | `/wishlist/{item_id}` | Update wishlist item | ✅ |
| DELETE | `/wishlist/{item_id}` | Delete wishlist item | ✅ |

### Price History Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/wishlist/{item_id}/price-history` | Get price history for item | ✅ |
| POST | `/wishlist/{item_id}/price-history` | Add price history entry | ✅ |

### Health Check Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Root endpoint with API info | ❌ |
| GET | `/health` | Health check endpoint | ❌ |

## 💡 Usage Examples

### Create a Wishlist Item

```bash
curl -X POST "http://localhost:8000/wishlist" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Wireless Headphones",
    "product_url": "https://example.com/headphones",
    "initial_price": 299.99,
    "currency": "USD"
  }'
```

### Get All Wishlist Items

```bash
curl -X GET "http://localhost:8000/wishlist" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Item Price

```bash
curl -X PUT "http://localhost:8000/wishlist/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_price": 249.99
  }'
```

### Get Price History

```bash
curl -X GET "http://localhost:8000/wishlist/1/price-history" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🧪 Development & Testing

### Sample Data

The project includes sample data for development and testing:

```bash
# Add sample users and wishlist items
python scripts/seed_data.py

# Sample users (all with password: password123):
# - alice@example.com
# - bob@example.com  
# - charlie@example.com
```

### Database Management

```bash
# Initialize fresh database
python scripts/init_db.py --drop-all

# Add sample data
python scripts/init_db.py --seed-data

# Show database info
python scripts/init_db.py --info

# Reset everything with sample data
python scripts/init_db.py --drop-all --seed-data
```

### Running Tests

```bash
# Run all tests (when implemented)
pytest

# Run with coverage
pytest --cov=app

# Run property-based tests
pytest tests/property/
```

## 🔧 Configuration

### Database Configuration

**Development (SQLite):**
```bash
DATABASE_URL=sqlite:///./wishlist.db
```

**Production (PostgreSQL):**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/wishlist_db
```

### JWT Configuration

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Set in .env file
SECRET_KEY=your-generated-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### CORS Configuration

```bash
# Development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Production
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

## 🚀 Deployment

### Production Checklist

- [ ] Set strong `SECRET_KEY` in environment variables
- [ ] Configure PostgreSQL database
- [ ] Set `DEBUG=false`
- [ ] Configure proper CORS origins
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure logging and monitoring
- [ ] Set up database backups
- [ ] Configure rate limiting (if needed)

### Docker Deployment (Future)

```dockerfile
# Dockerfile example for future use
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app/ ./app/
COPY scripts/ ./scripts/

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Errors**
```bash
# Check if database file exists and is accessible
ls -la wishlist.db

# Reinitialize database
python scripts/init_db.py --drop-all
```

**2. JWT Token Errors**
```bash
# Verify SECRET_KEY is set in .env
grep SECRET_KEY .env

# Generate new secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**3. CORS Errors**
```bash
# Check ALLOWED_ORIGINS in .env
grep ALLOWED_ORIGINS .env

# Add your frontend URL to ALLOWED_ORIGINS
```

**4. Import Errors**
```bash
# Ensure virtual environment is activated
which python

# Reinstall dependencies
pip install -r requirements.txt
```

### Logging

The application logs important events. Check logs for debugging:

```bash
# Run with debug logging
DEBUG=true uvicorn app.main:app --reload --log-level debug
```

## 📄 License

This project is part of a wishlist application system. See the main project repository for license information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:

- Check the [API documentation](http://localhost:8000/docs) when running locally
- Review the troubleshooting section above
- Check existing issues in the repository

---

**Happy coding! 🎉**