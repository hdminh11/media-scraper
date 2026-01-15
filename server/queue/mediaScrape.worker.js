'use strict';

const { Worker } = require('bullmq');
const redisConnection = require('./redis.connection');
const { scrapeMedia, filterNewMedia } = require('../helpers/media.scrape');
const MediaModel = require('../model/media.model');

const scrapePage = async (url) => {
    const media = await scrapeMedia(url);
    const newMedia = await filterNewMedia(media, url);
    if (newMedia.length > 0) {
        await MediaModel.createMany(newMedia);
    }
};

const mediaScrapeWorker = new Worker('media-scrape', async (job) => {
    const { url } = job.data;
    
    try {
        console.log(`[Worker] Processing job ${job.id}: ${url}`);
        await scrapePage(url);
        console.log(`[Worker] Completed job ${job.id}`);
        return { success: true, url };
    } catch (error) {
        console.error(`[Worker] Error in job ${job.id}:`, error.message);
        // Rethrow to trigger retry logic
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 5, // 5 concurrent jobs -> Avoid overwhelming the system
    maxStalledCount: 2,
    stalledInterval: 5000,
});

mediaScrapeWorker.on('error', (err) => {
    console.error('Worker error:', err.message);
});

mediaScrapeWorker.on('failed', (job, err) => {
    console.error(`Job ${job.id} failed: ${err.message}`);
});

mediaScrapeWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
});

module.exports = mediaScrapeWorker;
