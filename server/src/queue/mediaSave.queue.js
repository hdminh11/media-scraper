'use strict';

const { Queue } = require('bullmq');
const redisConnection = require('./redis.connection');
const crypto = require('crypto');

const mediaSaveQueue = new Queue('media-save', {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 2,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
        timeout: 10000,
        removeOnComplete: { count: 5000 }, // Keep last 5000 completed jobs
        removeOnFail: false,
    },
});

mediaSaveQueue.on('error', (err) => {
    console.error('Save Queue error:', err.message);
});

const addSaveJob = async (mediaArray) => {
    try {
        // Create batch job with multiple media items
        const hash = crypto.createHash('sha256').update(JSON.stringify(mediaArray)).digest('hex').slice(0, 12);
        const jobId = `save-${hash}-${Date.now()}`;
        
        const job = await mediaSaveQueue.add('batch-save', 
            { mediaArray }, 
            { jobId }
        );
        console.log(`[Save Queue] Batch job added: ${job.id} (${mediaArray.length} items)`);
        return job;
    } catch (error) {
        console.error('Failed to add save job:', error.message);
        throw error;
    }
};

module.exports = {
    mediaSaveQueue,
    addSaveJob,
};
