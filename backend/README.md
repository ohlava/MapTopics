# MapTopics Backend

FastAPI backend server for the MapTopics application.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- uv (Python package manager)

### Installation

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Run development server
uv run uvicorn main:app --reload
```

The server will start at `http://localhost:8000`

## 📋 API Documentation

Once the server is running, visit:
- **Interactive API docs**: `http://localhost:8000/docs`
- **Alternative docs**: `http://localhost:8000/redoc`

## 🛠️ Development

### Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── pyproject.toml       # Python dependencies and project config
├── .python-version      # Python version specification
└── README.md            # This file
```

### Available Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check endpoint

### Adding New Dependencies

```bash
# Add a new dependency
uv add package-name

# Add a development dependency
uv add --dev package-name
```

### Environment Variables

Create a `.env` file in this directory for environment-specific configuration:

```bash
# Example .env file
DATABASE_URL=postgresql://user:password@localhost/maptopics
SECRET_KEY=your-secret-key-here
DEBUG=True
```

## 🧪 Testing

```bash
# Install test dependencies (if not already installed)
uv add --dev pytest pytest-asyncio httpx

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=.
```

## 🏗️ Architecture

- **Framework**: FastAPI
- **Package Manager**: uv
- **CORS**: Configured for frontend at localhost:5173
- **Python Version**: 3.10+

## 📦 Deployment

[To be documented - Docker setup, production configuration, etc.]

## 🔧 Configuration

The application uses:
- **CORS**: Allows requests from React frontend (localhost:5173)
- **Auto-reload**: Enabled in development mode
- **Interactive docs**: Available at `/docs` endpoint