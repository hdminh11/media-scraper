'use strict';

const redisConnection = require('./redis.connection');
const { mediaScrapeQueue, addScrapingJob } = require('./mediaScrape.queue');
const { mediaSaveQueue, addSaveJob } = require('./mediaSave.queue');
const mediaScrapeWorker = require('./mediaScrape.worker');
const mediaSaveWorker = require('./mediaSave.worker');

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
            scrapeQueue: mediaScrapeQueue,
            saveQueue: mediaSaveQueue,
            scrapeWorker: mediaScrapeWorker,
            saveWorker: mediaSaveWorker,
            addJob: addScrapingJob,
            addSaveJob: addSaveJob,
        };
    } catch (error) {
        console.error('Failed to initialize queue system:', error && error.message ? error.message : error);
        process.exit(1);
    }
};

const closeQueue = async () => {
    try {
        await mediaScrapeWorker.close();
        await mediaSaveWorker.close();
        await mediaScrapeQueue.close();
        await mediaSaveQueue.close();
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
    mediaSaveQueue,
    addScrapingJob,
    addSaveJob,
    mediaScrapeWorker,
    mediaSaveWorker,
};
