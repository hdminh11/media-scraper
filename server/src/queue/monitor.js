'use strict';

const { mediaScrapeQueue } = require('./mediaScrape.queue');
const { mediaSaveQueue } = require('./mediaSave.queue');

const getQueueStats = async (queue, queueName) => {
    try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
            queue.getDelayedCount(),
        ]);

        return {
            name: queueName,
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed,
        };
    } catch (error) {
        console.error(`Error getting stats for ${queueName}:`, error.message);
        return null;
    }
};

const displayStats = (stats) => {
    console.log(`\n📊 ${stats.name} Queue Stats:`);
    console.log(`   ⏳ Waiting:   ${stats.waiting}`);
    console.log(`   ⚙️  Active:    ${stats.active}`);
    console.log(`   ✅ Completed: ${stats.completed}`);
    console.log(`   ❌ Failed:    ${stats.failed}`);
    console.log(`   ⏰ Delayed:   ${stats.delayed}`);
    console.log(`   📦 Total:     ${stats.total}`);
};

const getFailedJobs = async (queue, limit = 10) => {
    try {
        const failed = await queue.getFailed(0, limit - 1);
        return failed;
    } catch (error) {
        console.error('Error getting failed jobs:', error.message);
        return [];
    }
};

const displayFailedJobs = async (queue, queueName, limit = 5) => {
    const failedJobs = await getFailedJobs(queue, limit);
    
    if (failedJobs.length === 0) {
        console.log(`\n✅ No failed jobs in ${queueName}`);
        return;
    }

    console.log(`\n❌ Failed Jobs in ${queueName} (showing ${failedJobs.length}):`);
    failedJobs.forEach((job, idx) => {
        console.log(`\n   [${idx + 1}] Job ID: ${job.id}`);
        console.log(`       Data: ${JSON.stringify(job.data).substring(0, 100)}...`);
        console.log(`       Attempts: ${job.attemptsMade}/${job.opts.attempts}`);
        if (job.failedReason) {
            console.log(`       Reason: ${job.failedReason.substring(0, 150)}`);
        }
        console.log(`       Timestamp: ${new Date(job.timestamp).toLocaleString()}`);
    });
};

const monitorQueues = async (options = {}) => {
    const { interval = 5000, showFailed = true, failedLimit = 5, continuous = false } = options;

    const monitor = async () => {
        console.clear();
        console.log('🔍 Queue Monitor');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`📅 ${new Date().toLocaleString()}`);

        const [scrapeStats, saveStats] = await Promise.all([
            getQueueStats(mediaScrapeQueue, 'Media Scrape'),
            getQueueStats(mediaSaveQueue, 'Media Save'),
        ]);

        if (scrapeStats) displayStats(scrapeStats);
        if (saveStats) displayStats(saveStats);

        if (showFailed) {
            await displayFailedJobs(mediaScrapeQueue, 'Media Scrape', failedLimit);
            await displayFailedJobs(mediaSaveQueue, 'Media Save', failedLimit);
        }

        console.log('\n═══════════════════════════════════════════════════════');
        if (continuous) {
            console.log(`⏱️  Refreshing in ${interval / 1000} seconds... (Ctrl+C to stop)`);
        }
    };

    // Initial run
    await monitor();

    // Continuous monitoring
    if (continuous) {
        const intervalId = setInterval(monitor, interval);

        // Handle graceful shutdown
        process.on('SIGINT', () => {
            clearInterval(intervalId);
            console.log('\n\n👋 Monitoring stopped');
            process.exit(0);
        });
    }
};

// Run if executed directly
if (require.main === module) {
    require('dotenv').config();

    const args = process.argv.slice(2);
    const continuous = args.includes('--watch') || args.includes('-w');
    const interval = parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 5000;
    const showFailed = !args.includes('--no-failed');
    const failedLimit = parseInt(args.find(arg => arg.startsWith('--failed-limit='))?.split('=')[1]) || 5;

    console.log('🚀 Starting queue monitor...\n');
    
    monitorQueues({
        interval,
        showFailed,
        failedLimit,
        continuous,
    })
        .then(() => {
            if (!continuous) {
                console.log('\n✅ Monitor completed');
                process.exit(0);
            }
        })
        .catch(err => {
            console.error('\n❌ Monitor failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        });
}

module.exports = {
    monitorQueues,
    getQueueStats,
    getFailedJobs,
};
