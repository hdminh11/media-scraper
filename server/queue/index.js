'use strict';

const redisConnection = require('./redis.connection');
const { mediaScrapeQueue, addScrapingJob } = require('./mediaScrape.queue');
const mediaScrapeWorker = require('./mediaScrape.worker');

const initializeQueue = async () => {
    try {
        // Only connect if the client is not already connecting/connected
        const status = redisConnection.status;
        if (!['connecting', 'connect', 'ready'].includes(status)) {
            await redisConnection.connect();
            console.log('✅ Redis connection established');
        } else {
            console.log('ℹ️ Redis already connecting/connected');
        }
        console.log('✅ Queue system initialized');
        return {
            queue: mediaScrapeQueue,
            worker: mediaScrapeWorker,
            addJob: addScrapingJob,
        };
    } catch (error) {
        console.error('Failed to initialize queue system:', error && error.message ? error.message : error);
        process.exit(1);
    }
};

const closeQueue = async () => {
    try {
        await mediaScrapeWorker.close();
        await mediaScrapeQueue.close();
        await redisConnection.quit();
        console.log('✅ Queue system closed');
    } catch (error) {
        console.error('Error closing queue system:', error.message);
    }
};

module.exports = {
    initializeQueue,
    closeQueue,
    mediaScrapeQueue,
    addScrapingJob,
    mediaScrapeWorker,
};
