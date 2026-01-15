'use strict';

const { addScrapingJob } = require('./mediaScrape.queue');

const generateMockUrls = (count) => {
    const urls = [];
    for (let i = 0; i < count; i++) {
        urls.push(`https://example.com/page/${i}`);
    }
    return urls;
};

const runLoadTest = async (totalJobs = 5000, batchSize = 100, delayBetweenBatches = 100) => {
    console.log(`🚀 Starting load test: ${totalJobs} jobs, batch size: ${batchSize}`);
    
    const urls = generateMockUrls(totalJobs);
    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        
        try {
            const promises = batch.map(url => addScrapingJob(url).catch(err => {
                errorCount++;
                console.error(`Batch ${batchNum}: Failed to add job for ${url}`);
            }));

            await Promise.all(promises);
            successCount += batch.length;
            
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            const rate = (successCount / elapsed).toFixed(2);
            console.log(`[${batchNum}/${Math.ceil(urls.length / batchSize)}] Added ${successCount}/${totalJobs} jobs | Rate: ${rate} jobs/sec`);

            if (delayBetweenBatches > 0) {
                await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
            }
        } catch (error) {
            console.error(`Error adding batch ${batchNum}:`, error.message);
        }
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    const avgRate = (successCount / totalTime).toFixed(2);

    console.log('\n📊 Load Test Summary:');
    console.log(`   Total jobs added: ${successCount}`);
    console.log(`   Failed jobs: ${errorCount}`);
    console.log(`   Total time: ${totalTime}s`);
    console.log(`   Average rate: ${avgRate} jobs/sec`);
};

module.exports = {
    runLoadTest,
    generateMockUrls,
};

// Run if executed directly
if (require.main === module) {
    require('dotenv').config();
    runLoadTest(5000, 100, 50)
        .then(() => {
            console.log('✅ Load test completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Load test failed:', err.message);
            process.exit(1);
        });
}
