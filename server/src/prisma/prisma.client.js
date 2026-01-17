'use strict';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

// Pool configuration optimized for concurrent workers
const pool = new Pool({
  connectionString,
  min: 1,
  max: 5, // 🔥 cực kỳ quan trọng
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],  // Reduce logs to avoid I/O bottleneck
});

// Monitor pool status
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
    console.log('✅ New connection established');
});

// Graceful shutdown - ensure all connections are closed
const shutdownHandler = async (signal) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    try {
        // Close Prisma (internal pool will drain)
        await prisma.$disconnect();
        console.log('✅ Prisma disconnected');
        
        // Close external pool
        await pool.end();
        console.log('✅ Connection pool closed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdownHandler('SIGINT'));
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

module.exports = prisma;
