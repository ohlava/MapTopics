# MapTopics Frontend

React frontend application for the MapTopics project, built with Vite for fast development and modern tooling.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
npm run dev      # Start development server with HMR
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Project Structure

```sh
frontend/
├── public/             # Static assets
│   └── vite.svg        # Vite logo
├── src/                # Source code
│   ├── assets/         # React components assets
│   │   └── react.svg   # React logo
│   ├── App.css         # Main app styles
│   ├── App.jsx         # Main app component
│   ├── index.css       # Global styles
│   └── main.jsx        # Application entry point
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── eslint.config.js    # ESLint configuration
└── README.md           # This file
```

## UI Framework & Styling

- **React 19** - Latest React with modern features
- **CSS** - Custom CSS with CSS variables for theming
- **Responsive Design** - Mobile-first approach

## Configuration

### Environment Variables

Create a `.env` file in this directory for environment-specific settings:

```bash
# Example .env file
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=MapTopics
```

### Vite Configuration

The project uses Vite for:

- **Fast HMR** (Hot Module Replacement)
- **Modern build tooling**
- **React plugin** for JSX support

## Testing

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm test
```

## Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

The build artifacts will be stored in the `dist/` directory.

## Backend Integration

The frontend is configured to work with the FastAPI backend:

- **API Base URL**: `http://localhost:8000`
- **CORS**: Backend configured to accept requests from this frontend
- **Development**: Both servers run simultaneously during development

## Deployment

[To be documented - static hosting, CDN setup, etc.]

## Future Enhancements

- [ ] Add routing (React Router)
- [ ] State management (Redux/Zustand)
- [ ] UI component library
- [ ] Testing setup
- [ ] TypeScript migration
- [ ] PWA features
