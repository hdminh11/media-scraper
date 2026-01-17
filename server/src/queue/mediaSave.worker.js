'use strict';

const { Worker } = require('bullmq');
const redisConnection = require('./redis.connection');
const MediaModel = require('../model/media.model');

const mediaSaveWorker = new Worker('media-save', async (job) => {
    const { mediaArray } = job.data;
    
    try {
        console.log(`[Save Worker] Processing batch job ${job.id}: ${mediaArray.length} items`);
        
        // Batch insert all media at once
        if (mediaArray.length > 0) {
            const result = await MediaModel.createMany(mediaArray);
            console.log(`[Save Worker] Saved ${result.count} media items from job ${job.id}`);
        }
        
        return { 
            success: true, 
            count: mediaArray.length,
            jobId: job.id 
        };
    } catch (error) {
        console.error(`[Save Worker] Error in job ${job.id}:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 2, // Higher concurrency for DB writes (less CPU-intensive than scraping)
    maxStalledCount: 2,
    stalledInterval: 5000,
});

mediaSaveWorker.on('error', (err) => {
    console.error('[Save Worker] Worker error:', err.message);
});

mediaSaveWorker.on('failed', (job, err) => {
    console.error(`[Save Worker] Job ${job.id} failed: ${err.message}`);
});

mediaSaveWorker.on('completed', (job, result) => {
    console.log(`[Save Worker] Job ${job.id} completed - saved ${result.count} items`);
});

module.exports = mediaSaveWorker;
