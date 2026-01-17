'use strict';

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TOTAL_REQUESTS = parseInt(process.argv[2]) || 5000;
const CONCURRENT_REQUESTS = parseInt(process.argv[3]) || 10;
const BASE_URL = process.argv[4] || 'https://tuoitre.vn/thoi-su/trang-';

console.log('🚀 HTTP Load Test Configuration:');
console.log(`   API URL: ${API_URL}`);
console.log(`   Total Requests: ${TOTAL_REQUESTS}`);
console.log(`   Concurrent Requests: ${CONCURRENT_REQUESTS}`);
console.log(`   Base URL Pattern: ${BASE_URL}[1-${TOTAL_REQUESTS}].htm`);
console.log('═══════════════════════════════════════════════════════\n');

const stats = {
    total: 0,
    success: 0,
    failed: 0,
    startTime: null,
    endTime: null,
    responseTimes: [],
};

const makeRequest = async (urlIndex) => {
    const url = `${BASE_URL}${urlIndex}.htm`;
    const requestStartTime = Date.now();

    try {
        const response = await axios.post(
            `${API_URL}/media/ingest`,
            { urls: [url] },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            }
        );

        const responseTime = Date.now() - requestStartTime;
        stats.responseTimes.push(responseTime);
        stats.success++;

        if (response.data?.metadata?.queued > 0) {
            return { success: true, url, responseTime };
        } else {
            stats.failed++;
            return { success: false, url, error: 'No jobs queued', responseTime };
        }
    } catch (error) {
        const responseTime = Date.now() - requestStartTime;
        stats.responseTimes.push(responseTime);
        stats.failed++;
        return {
            success: false,
            url,
            error: error.message,
            responseTime,
        };
    } finally {
        stats.total++;

        // Progress indicator
        if (stats.total % 100 === 0) {
            const progress = ((stats.total / TOTAL_REQUESTS) * 100).toFixed(1);
            const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(2);
            const rate = (stats.total / elapsed).toFixed(2);
            process.stdout.write(
                `\r[${progress}%] ${stats.total}/${TOTAL_REQUESTS} requests | ` +
                `Success: ${stats.success} | Failed: ${stats.failed} | ` +
                `Rate: ${rate} req/s`
            );
        }
    }
};

const runLoadTest = async () => {
    stats.startTime = Date.now();

    const requests = [];
    const urlIndices = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i + 1);

    // Process in batches with concurrency limit
    for (let i = 0; i < urlIndices.length; i += CONCURRENT_REQUESTS) {
        const batch = urlIndices.slice(i, i + CONCURRENT_REQUESTS);
        const batchPromises = batch.map((index) => makeRequest(index));
        await Promise.all(batchPromises);
    }

    stats.endTime = Date.now();

    // Calculate statistics
    const totalTime = (stats.endTime - stats.startTime) / 1000;
    const avgResponseTime = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
    const minResponseTime = Math.min(...stats.responseTimes);
    const maxResponseTime = Math.max(...stats.responseTimes);
    const requestsPerSecond = (stats.total / totalTime).toFixed(2);

    // Sort for percentile calculations
    const sortedTimes = [...stats.responseTimes].sort((a, b) => a - b);
    const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)];
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)];
    const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)];

    console.log('\n\n📊 HTTP Load Test Summary:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Total Requests: ${stats.total}`);
    console.log(`   Successful: ${stats.success} (${((stats.success / stats.total) * 100).toFixed(2)}%)`);
    console.log(`   Failed: ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(2)}%)`);
    console.log(`   Total Time: ${totalTime.toFixed(2)}s`);
    console.log(`   Requests/sec: ${requestsPerSecond}`);
    console.log('\n📈 Response Times (ms):');
    console.log(`   Average: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Min: ${minResponseTime}ms`);
    console.log(`   Max: ${maxResponseTime}ms`);
    console.log(`   P50 (median): ${p50}ms`);
    console.log(`   P95: ${p95}ms`);
    console.log(`   P99: ${p99}ms`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (stats.failed === 0) {
        console.log('✅ All requests completed successfully');
    } else {
        console.log(`⚠️  ${stats.failed} requests failed`);
    }

    process.exit(stats.failed > 0 ? 1 : 0);
};

// Run the test
console.log('Starting HTTP load test...\n');
runLoadTest().catch((err) => {
    console.error('\n❌ Load test failed:', err.message);
    console.error(err.stack);
    process.exit(1);
});
