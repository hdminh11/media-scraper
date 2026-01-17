'use strict';

// Use ioredis because BullMQ expects a client with `defineCommand` (ioredis provides it)
const IORedis = require('ioredis');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

// lazyConnect prevents immediate connection on construction; we'll connect explicitly
const redisConnection = new IORedis({
  host: redisHost,
  port: redisPort,
  lazyConnect: true,
  // Let BullMQ handle retries; require maxRetriesPerRequest === null
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err && err.message ? err.message : err);
});

redisConnection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

module.exports = redisConnection;
