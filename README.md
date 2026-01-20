# Media Scraper

A full-stack system for scraping and managing media (images, videos) from web URLs. The project is designed to efficiently handle thousands of concurrent requests using a queue-based architecture with asynchronous workers.

## 📖 Overview

Media Scraper is a web application that allows users to:
- Submit one or multiple URLs to scrape media content
- Automatically extract images and videos from web pages
- Store and manage media in a database
- Search and filter scraped media through a web interface

## 🏗️ System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │ ───> │   Backend    │ ───> │  PostgreSQL │
│   (React)   │      │  (Express)   │      │  Database   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            │
                     ┌──────┴──────┐
                     │    Redis    │
                     │   (Queue)   │
                     └─────────────┘
```

### Core Components

- **Frontend**: React 19 + Vite - Modern user interface
- **Backend**: Node.js + Express - RESTful API server
- **Queue System**: Redis + BullMQ - Asynchronous job processing
- **Database**: PostgreSQL + Prisma ORM - Media data storage
- **Containerization**: Docker + Docker Compose - Easy deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Installation and Running

#### Option 1: Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/hdminh11/media-scraper
cd media-scraper

# Start all services (default: localhost)
docker-compose up -d

# Access the application
# Frontend: http://localhost:4173
# Backend API: http://localhost:3000
```

**For EC2 Deployment:**

1. Edit `docker-compose.yml` and change `VITE_API_URL`:
   ```yaml
   frontend:
     environment:
       VITE_API_URL: http://<YOUR_EC2_PUBLIC_IP>:3000  # Change this
   ```

2. Make sure Security Group allows ports: 3000 (backend), 4173 (frontend)

3. Deploy:
   ```bash
   docker-compose up -d
   ```

#### Option 2: Manual Setup

```bash
# 1. Start PostgreSQL and Redis
docker-compose up -d postgres redis

# 2. Setup Backend
cd server
npm install
npm run migrate
npm run dev

# 3. Setup Frontend (new terminal)
cd client
npm install
npm run dev
```

## 📚 Module Documentation

### Backend Server
For detailed information about architecture, queue system, API endpoints, and performance tuning:

👉 **[See Server README](./server/README.md)**

Includes:
- Request processing architecture
- Queue-based scraping system
- Database schema
- Performance optimization
- API documentation

### Frontend Client
For detailed information about React components, features, and development:

👉 **[See Client README](./client/README.md)**

Includes:
- Tech stack and dependencies
- Development setup
- Build and deployment
- Project structure
- API integration

## 🎯 Key Features

### URL Ingestion
- Submit single or multiple URLs (comma-separated)
- Async processing with queue system
- Immediate response with job IDs

### Media Scraping
- Automatically detect and extract images, videos
- Support multiple media formats (image, video)
- Retry mechanism for reliability
- Timeout protection

### Media Management
- Pagination and search
- Filter by type (image/video)
- Responsive gallery view
- Real-time status updates

## 🔧 Configuration

All configuration is done directly in `docker-compose.yml`:

**Frontend API URL:**
```yaml
frontend:
  environment:
    VITE_API_URL: http://localhost:3000  # Change for EC2: http://<EC2_IP>:3000
```

**Backend:**
```yaml
backend:
  environment:
    PORT: 3000
    DATABASE_URL: postgresql://admin:admin@postgres:5432/media
    REDIS_HOST: redis
    REDIS_PORT: 6379
    CORS_ORIGIN: "*"  # Allow all origins
```

**For manual setup** (without Docker), create `.env` files:
- Backend (`.env` in `server/`): `DATABASE_URL`, `REDIS_HOST`, etc.
- Frontend (`.env` in `client/`): `VITE_API_URL=http://localhost:3000`

## 📊 Performance

The system is designed to handle:
- ~5,000 concurrent scraping requests
- Resource constraints: 1 CPU, 1GB RAM
- Queue-based architecture for scalability
- Worker concurrency tuning: 4 scrapers, 2 savers
- Database connection pooling

## 🛠️ Development

```bash
# Backend development
cd server
npm run dev          # Start dev server
npm run migrate      # Run database migrations
npm run test         # Run load tests

# Frontend development
cd client
npm run dev          # Start Vite dev server
npm run build        # Production build
npm run lint         # Code linting
```

## 🐳 Docker Images

Production images published on Docker Hub:
- Backend: `hoangducminh/media-scraper-backend:latest`
- Frontend: `hoangducminh/media-scraper-frontend:latest`

## 📝 API Endpoints

- `POST /media/ingest` - Submit URLs for scraping
- `GET /media/getAll` - Fetch paginated media with filters

See detailed API documentation in [Server README](./server/README.md).

## 🧪 Testing

```bash
# Load testing (backend)
cd server
npm run loadtest        # BullMQ load test
npm run httploadtest    # HTTP endpoint load test
```

## 👨‍💻 Author

Hoang Duc Minh

---

**Note**: See detailed implementation and configuration in the [Backend](./server/README.md) and [Frontend](./client/README.md) README files.
