'use strict';

const { Queue } = require('bullmq');
const redisConnection = require('./redis.connection');
const crypto = require('crypto');

const mediaScrapeQueue = new Queue('media-scrape', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 2, // Retry twice on failure
        backoff: {
            type: 'exponential', // Avoid immediate retries -> avoid overwhelming the system
            delay: 2000,
        },
        timeout: 8000,
        removeOnComplete: { count: 1000 }, // Keep last 1000 completed jobs
        removeOnFail: false, // Keep failed jobs for debugging
    },
});

mediaScrapeQueue.on('error', (err) => {
    console.error('Queue error:', err.message);
});


const makeSafeJobId = (url) => {
    // Create a deterministic, filesystem/redis-safe id from the url
    // Use SHA256 hex digest + timestamp to avoid collisions
    const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);
    return `${hash}-${Date.now()}`;
};

const addScrapingJob = async (url) => {
    try {
        const jobId = makeSafeJobId(url);
        const job = await mediaScrapeQueue.add('scrape', { url }, {
            jobId,
        });
        console.log(`Job added: ${job.id} (${url})`);
        return job;
    } catch (error) {
        console.error(`Failed to add scraping job for ${url}:`, error.message);
        throw error;
    }
};

module.exports = {
    mediaScrapeQueue,
    addScrapingJob,
};
