'use strict';

const { Worker } = require('bullmq');
const redisConnection = require('./redis.connection');
const { scrapeMedia, filterNewMedia } = require('../helpers/media-scrape.handler');
const { addSaveJob } = require('./mediaSave.queue');

const scrapePage = async (url) => {
    const media = await scrapeMedia(url);
    const newMedia = await filterNewMedia(media, url);
    console.log(newMedia);
    return media;
};

const mediaScrapeWorker = new Worker('media-scrape', async (job) => {
    const { url } = job.data;
    
    try {
        console.log(`[Scrape Worker] Processing job ${job.id}: ${url}`);
        const media = await scrapePage(url);
        
        // Only add save job if we found media
        if (media.length > 0) {
            await addSaveJob(media);
            console.log(`[Scrape Worker] Found ${media.length} items, added to save queue`);
        }
        
        console.log(`[Scrape Worker] Completed job ${job.id}`);
        return { success: true, url, mediaCount: media.length };
    } catch (error) {
        console.error(`[Scrape Worker] Error in job ${job.id}:`, error.message);
        // Rethrow to trigger retry logic
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 4, // 4 concurrent scraping jobs
    maxStalledCount: 2,
    stalledInterval: 5000,
});

mediaScrapeWorker.on('error', (err) => {
    console.error('[Scrape Worker] Worker error:', err.message);
});

mediaScrapeWorker.on('failed', (job, err) => {
    console.error(`[Scrape Worker] Job ${job.id} failed: ${err.message}`);
});

mediaScrapeWorker.on('completed', (job, result) => {
    console.log(`[Scrape Worker] Job ${job.id} completed - scraped ${result.mediaCount} items`);
});

module.exports = mediaScrapeWorker;
