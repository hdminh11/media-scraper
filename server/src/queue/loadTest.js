'use strict';

const { addScrapingJob } = require('./mediaScrape.queue');

const generateMockUrls = (count) => {
    const urls = [];
    for (let i = 0; i < count; i++) {
        urls.push(`https://tuoitre.vn/thoi-su/trang-${i + 1}.htm`);
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
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const totalJobs = parseInt(args[0]) || 100;
    const batchSize = parseInt(args[1]) || 50;
    const delayBetweenBatches = parseInt(args[2]) || 100;
    
    console.log('📋 Load Test Configuration:');
    console.log(`   Total Jobs: ${totalJobs}`);
    console.log(`   Batch Size: ${batchSize}`);
    console.log(`   Delay Between Batches: ${delayBetweenBatches}ms`);
    console.log('');
    
    runLoadTest(totalJobs, batchSize, delayBetweenBatches)
        .then(() => {
            console.log('\n✅ Load test completed successfully');
            process.exit(0);
        })
        .catch(err => {
            console.error('\n❌ Load test failed:', err.message);
            console.error(err.stack);
            process.exit(1);
        });
}
