# Media Scraper - Frontend Client

A modern React frontend for the Media Scraper application. This client provides an intuitive interface for ingesting media URLs, browsing scraped media content, and managing media collections.

## 🚀 Features

- **URL Ingestion**: Submit single or multiple URLs for media scraping (comma-separated)
- **Media Gallery**: Browse and view all scraped media with pagination
- **Search & Filter**: Search media by title/source and filter by type (image, video)
- **Real-time Updates**: Live status updates for ingestion jobs
- **Responsive Design**: Modern, mobile-friendly interface
- **Pagination**: Efficient browsing with customizable page sizes

## 🛠️ Tech Stack

- **React 19** - Modern UI library with hooks
- **Vite 7** - Lightning-fast build tool and dev server
- **ESLint** - Code quality and style enforcement
- **CSS3** - Custom styling

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Running backend server (see `/server` directory)

## 🏗️ Installation

```bash
# Install dependencies
npm install
```

## ⚙️ Configuration

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
```

Adjust the API URL to match your backend server address.

## 🚦 Development

```bash
# Start development server with HMR
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## 🏭 Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The production build will be output to the `dist/` directory.

## 🧹 Code Quality

```bash
# Run ESLint
npm run lint
```

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t media-scraper-client .

# Run container
docker run -p 5173:5173 media-scraper-client
```

Or use the provided `docker-compose.yml` from the project root.

## 📁 Project Structure

```
client/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── App.jsx      # Main application component
│   ├── App.css      # Application styles
│   ├── main.jsx     # Application entry point
│   └── index.css    # Global styles
├── index.html       # HTML template
├── vite.config.js   # Vite configuration
├── eslint.config.js # ESLint configuration
└── package.json     # Dependencies and scripts
```

## 🔌 API Integration

The client communicates with the backend API for:

- `GET /media/getAll` - Fetch paginated media with search and filters
- `POST /media/ingest` - Submit URLs for scraping
