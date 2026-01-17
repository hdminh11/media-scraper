'use strict';

require('dotenv').config();
const { mediaScrapeQueue, mediaSaveQueue } = require('.');

const clearQueue = async () => {
    try {
        console.log('Clearing queue...');
        
        const mediaScrapeQueueBefore = await mediaScrapeQueue.getJobCounts();
        console.log('Media Scrape Queue Before:', mediaScrapeQueueBefore);
        
        // Remove all jobs from the queue
        await mediaScrapeQueue.drain();
        
        // Remove failed jobs (0 = delete immediately, 5000 = max 5000 at a time)
        await mediaScrapeQueue.clean(0, 5000, 'failed');
        
        // Remove completed jobs (optional)
        await mediaScrapeQueue.clean(0, 5000, 'completed');
        
        const mediaScrapeQueueAfter = await mediaScrapeQueue.getJobCounts();
        console.log('Media Scrape Queue After:', mediaScrapeQueueAfter);
        console.log('✅ Queue cleared successfully');

        const mediaSaveQueueBefore = await mediaSaveQueue.getJobCounts();
        console.log('Media Save Queue Before:', mediaSaveQueueBefore);
        
        // Remove all jobs from the queue
        await mediaSaveQueue.drain();
        
        // Remove failed jobs (0 = delete immediately, 5000 = max 5000 at a time)
        await mediaSaveQueue.clean(0, 5000, 'failed');
        
        // Remove completed jobs (optional)
        await mediaSaveQueue.clean(0, 5000, 'completed');
        
        const mediaSaveQueueAfter = await mediaSaveQueue.getJobCounts();
        console.log('Media Save Queue After:', mediaSaveQueueAfter);
        console.log('✅ Queue cleared successfully');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing queue:', error.message);
        process.exit(1);
    }
};

clearQueue();
