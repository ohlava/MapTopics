# MapTopics

A full-stack web application for mapping and visualizing topics with an interactive interface.

## 🏗️ Architecture

- **Frontend**: React + Vite + Modern UI
- **Backend**: FastAPI + Python
- **Database**: [To be determined]

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd MapTopics
```

### 2. Backend Setup

```bash
cd backend
# Install uv (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
# Install dependencies
uv sync
# Run the development server
uv run uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
MapTopics/
├── README.md             # This file - project overview
├── LICENSE               # MIT License
├── .gitignore            # Git ignore rules
├── backend/              # FastAPI backend
│   ├── README.md         # Backend-specific documentation
│   ├── main.py           # FastAPI application
│   ├── pyproject.toml    # Python dependencies
│   └── ...
├── frontend/             # React frontend
│   ├── README.md         # Frontend-specific documentation
│   ├── package.json      # Node.js dependencies
│   ├── src/              # Source code
│   └── ...
└── docs/                 # Project documentation (optional)
```

## 🛠️ Development

### Backend Development
See [backend/README.md](./backend/README.md) for detailed backend setup and API documentation.

### Frontend Development
See [frontend/README.md](./frontend/README.md) for detailed frontend setup and component documentation.

## 🔧 Environment Variables

Create `.env` files in the appropriate directories:

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration (if needed)

## 📦 Production Deployment

[To be documented - Docker, deployment scripts, etc.]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
