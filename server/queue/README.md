# BullMQ Queue System for Media Scraping

## Overview
A Redis-backed job queue system using BullMQ designed to handle ~5000 concurrent scraping requests efficiently on a server with 1 CPU and 1GB RAM.

## Architecture

### Files

1. **redis.connection.js**
   - Redis client initialization with error handling
   - Configuration: `maxRetriesPerRequest: null` (BullMQ requirement)
   - Uses `REDIS_HOST` and `REDIS_PORT` from environment

2. **mediaScrape.queue.js**
   - BullMQ Queue instance for "media-scrape"
   - Job options:
     - `attempts: 2` - Retry failed jobs once
     - `backoff: exponential` - Exponential backoff (2s delay)
     - `timeout: 8000ms` - Job execution timeout
     - `removeOnComplete: true` - Clean up completed jobs
     - `removeOnFail: false` - Keep failed jobs for debugging
   - Export function: `addScrapingJob(url)` - Add job to queue

3. **mediaScrape.worker.js**
   - Worker with concurrency: 5 (optimal for 1 CPU)
   - Processes jobs from "media-scrape" queue
   - Error handling without worker crash
   - Event listeners for job lifecycle (completed, failed)

4. **index.js**
   - Central initialization and cleanup
   - Export: `initializeQueue()`, `closeQueue()`
   - Export: `addScrapingJob()`, `mediaScrapeQueue`, `mediaScrapeWorker`

5. **loadTest.js**
   - Load test utility to verify system performance
   - Parameters: total jobs, batch size, delay between batches
   - Tracks: job rate, success/error counts, elapsed time

## Usage

### Setup
1. Ensure Redis is running on configured host/port
2. Set environment variables:
   ```bash
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

### Initialize Queue
```javascript
const { initializeQueue, addScrapingJob } = require('./queue');

// Initialize
await initializeQueue();

// Add scraping job
await addScrapingJob('https://example.com');

// Cleanup
process.on('SIGTERM', async () => {
    await closeQueue();
});
```

### Run Load Test
```bash
node queue/loadTest.js
```

## Performance Characteristics

- **Concurrency**: 5 workers per process (safe for 1 CPU)
- **Job Rate**: ~50-100 jobs/sec on modest hardware
- **Memory**: Minimal overhead per job (~1KB in queue)
- **Retry Strategy**: Exponential backoff prevents thundering herd
- **Failure Recovery**: Failed jobs remain for inspection and retry

## Constraints Met

✅ Designed for 1 CPU, 1GB RAM servers
✅ No clustering or worker_threads
✅ Efficient memory usage via Redis backing
✅ Safe concurrency limits
✅ Automatic retry and error handling

## Integration with Scraping Service

Connect to existing `MediaService` in `mediaScrape.worker.js`:
```javascript
const { scrapeMedia } = require('../helpers/media.scrape');
const MediaModel = require('../model/media.model');

const scrapePage = async (url) => {
    const media = await scrapeMedia(url);
    const newMedia = await filterNewMedia(media, url);
    if (newMedia.length > 0) {
        await MediaModel.createMany(newMedia);
    }
};
```

## Monitoring

Monitor queue health:
```javascript
const { mediaScrapeQueue } = require('./queue');

// Check pending jobs
const pendingCount = await mediaScrapeQueue.count('waiting');
console.log(`Pending jobs: ${pendingCount}`);

// Check failed jobs
const failedCount = await mediaScrapeQueue.count('failed');
console.log(`Failed jobs: ${failedCount}`);

// Get job counts by state
const counts = await mediaScrapeQueue.getJobCounts();
console.log(counts);
```
