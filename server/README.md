# Media Scraper Backend

## Architecture & Directory Structure

- **Express Entry Point**: [server.js](server.js) - initializes queue system and starts API server
- **App Config**: [src/app.js](src/app.js) - middleware setup, CORS, Express configuration
- **Routes**: [src/routes](src/routes) - mounted media endpoints at `/media`
  - [src/routes/media/index.js](src/routes/media/index.js) - `POST /media/ingest`, `GET /media/getAll`
- **Controller**: [src/controllers/media.controller.js](src/controllers/media.controller.js) - request handlers, enqueue jobs, return immediate response
- **Services & Helpers**:
  - [src/services/media.service.js](src/services/media.service.js) - fetch media data from database
  - [src/helpers/media.scrape.js](src/helpers/media.scrape.js) - HTML parsing, image/video extraction
- **Queue System**: [src/queue/index.js](src/queue/index.js) - Redis initialization and queue/worker management
  - Two BullMQ queues: `media-scrape` ([mediaScrape.queue.js](src/queue/mediaScrape.queue.js), [mediaScrape.worker.js](src/queue/mediaScrape.worker.js)) and `media-save` ([mediaSave.queue.js](src/queue/mediaSave.queue.js), [mediaSave.worker.js](src/queue/mediaSave.worker.js))
- **Database**: Prisma-based
  - Schema: [src/prisma/schema.prisma](src/prisma/schema.prisma)
  - Client: [src/prisma/prisma.client.js](src/prisma/prisma.client.js)
  - Model: [src/model/media.model.js](src/model/media.model.js)

## Request Processing Strategy

1. **Ingest Phase** (`POST /media/ingest`)
   - Accepts array of URLs
   - Returns immediately (non-blocking)
   - Each URL is enqueued as a job in `media-scrape` queue with deterministic job ID (SHA-256 hash + timestamp)
   - Client receives queue job IDs immediately without waiting for scraping

2. **Scraping Phase** (Worker: [mediaScrape.worker.js](src/queue/mediaScrape.worker.js))
   - Concurrency: 4 (optimized for single CPU)
   - Retry: 2 attempts with exponential backoff (2s delay)
   - Timeout: 8 seconds per job
   - Extracts all media (images, videos, embeds) from page HTML
   - If media found, adds batch to `media-save` queue
   - Failed jobs retained for debugging

3. **Saving Phase** (Worker: [mediaSave.worker.js](src/queue/mediaSave.worker.js))
   - Concurrency: 2 (higher than scraping, less CPU-intensive)
   - Retry: 2 attempts with exponential backoff
   - Timeout: 10 seconds per job
   - Bulk inserts media items into PostgreSQL via Prisma

4. **Resilience Features**
   - Redis-backed persistent queue
   - Stalled job detection and recovery
   - Exponential backoff prevents thundering herd
   - Job IDs use SHA-256 hash to avoid filesystem/Redis special character issues
   - Configurable job retention (1000 scrape, 5000 save completed jobs)

## Setup & Running the Server

### Prerequisites
- Node.js 18+
- Redis running on localhost:6379 (or configured host/port)
- PostgreSQL database

### Environment Variables
Create `.env` file from [.env.example](.env.example):
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/media_scraper?schema=public"
NODE_ENV=development
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### Installation & Startup
```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Start API server and queue workers
node server.js
```

The server will:
- Initialize Redis connection
- Start Express API on port 3000
- Activate media-scrape and media-save workers
- Listen for graceful shutdown (SIGTERM)

## Load Testing

Run load test to verify queue performance:

```bash
# Default: 100 jobs, batch size 50, 100ms delay between batches
node src/queue/loadTest.js

# Custom parameters: totalJobs, batchSize, delayMs
node src/queue/loadTest.js 5000 100 100
```

Output shows:
- Job enqueue rate (jobs/sec)
- Success/failure counts
- Total elapsed time

Example: `node src/queue/loadTest.js 5000` creates 5000 scraping jobs and measures throughput.

## Queue Monitoring

### Single-Run Report
```bash
# Show current queue stats and 5 failed jobs (default)
node src/queue/monitor.js

# Show 10 failed jobs
node src/queue/monitor.js --failed-limit=10

# Hide failed jobs section
node src/queue/monitor.js --no-failed
```

### Continuous Monitoring (Watch Mode)
```bash
# Refresh every 5 seconds
node src/queue/monitor.js --watch

# Custom interval (in milliseconds)
node src/queue/monitor.js -w --interval=3000

# Custom failed jobs limit + watch
node src/queue/monitor.js -w --failed-limit=15
```

Monitor displays:
- **Waiting**: Jobs queued, not yet processing
- **Active**: Jobs currently being processed
- **Completed**: Successfully finished jobs (recent)
- **Failed**: Jobs that failed all retry attempts
- **Delayed**: Jobs pending retry after backoff
- **Failed Jobs List**: Job ID, data preview, attempt count, failure reason, timestamp

## API Endpoints

### POST /media/ingest
Enqueue URLs for scraping.

**Request:**
```json
{
  "urls": ["https://example.com", "https://another.com"]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "metadata": {
    "queued": 2,
    "failed": 0,
    "jobIds": ["abc123-1705...", "def456-1705..."],
    "failedUrls": []
  }
}
```

### GET /media/getAll
Retrieve all scraped media with pagination.

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 20)
- `searchText` (optional, search in media names)
- `type` (optional, 'image' or 'video')

**Response:**
```json
{
  "statusCode": 200,
  "metadata": {
    "data": [...],
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

## Typical Workflow

1. **Start Services**
   ```bash
   # Terminal 1: Start API + queue workers
   node server.js
   ```

2. **Submit URLs**
   ```bash
   curl -X POST http://localhost:3000/media/ingest \
     -H "Content-Type: application/json" \
     -d '{"urls":["https://example.com"]}'
   ```

3. **Monitor Progress**
   ```bash
   # Terminal 2: Watch queue in real-time
   node src/queue/monitor.js -w
   ```

4. **Run Load Test** (optional)
   ```bash
   # Terminal 3: Stress test with 5000 jobs
   node src/queue/loadTest.js 5000 100 100
   ```

5. **Check Results**
   ```bash
   curl http://localhost:3000/media/getAll?page=1&pageSize=50
   ```

## Running Scripts in Docker Container

When running the application in Docker containers, use `docker exec` to run scripts inside the container:

### Queue Monitoring
```bash
# One-time queue status check
docker exec -it media-backend node src/queue/monitor.js

# Continuous monitoring (watch mode)
docker exec -it media-backend node src/queue/monitor.js --watch

# Custom refresh interval (3 seconds)
docker exec -it media-backend node src/queue/monitor.js --watch --interval=3000

# Show more failed jobs
docker exec -it media-backend node src/queue/monitor.js --watch --failed-limit=10
```

### Load Testing
```bash
# Queue-based load test (enqueue jobs directly)
# Default: 100 jobs
docker exec -it media-backend node src/queue/loadTest.js

# Custom: 5000 jobs, batch size 100, 100ms delay
docker exec -it media-backend node src/queue/loadTest.js 5000 100 100

# HTTP API load test (send HTTP requests to container)
# Default: 5000 requests, 10 concurrent
docker exec -it media-backend node src/queue/httpLoadTest.js

# Custom: 5000 requests, 20 concurrent, custom URL pattern
docker exec -it media-backend node src/queue/httpLoadTest.js 5000 20 https://example.com/page-

# Test from host machine to container
API_URL=http://localhost:3000 node src/queue/httpLoadTest.js 5000 10
```

### Clear Queue
```bash
# Remove all jobs (waiting, completed, failed) from media-scrape queue
docker exec -it media-backend node src/queue/clearQueue.js
```

### Redis Monitoring
```bash
# Interactive Redis CLI
docker exec -it media-redis redis-cli

# Get Redis stats
docker exec -it media-redis redis-cli INFO stats

# Check memory usage
docker exec -it media-redis redis-cli INFO memory

# Monitor commands in real-time
docker exec -it media-redis redis-cli MONITOR
```

### Container Logs
```bash
# View backend logs
docker logs media-backend -f

# View all services logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f redis
```
