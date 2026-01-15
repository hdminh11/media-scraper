'use strict';

const prisma = require('../prisma/prisma.client');

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Connected to PostgreSQL database successfully');
        return prisma;
    } catch (error) {
        console.error('❌ Failed to connect to PostgreSQL database:', error.message);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        console.log('✅ Disconnected from PostgreSQL database');
    } catch (error) {
        console.error('❌ Failed to disconnect from database:', error.message);
    }
};

module.exports = {
    connectDB,
    disconnectDB,
    prisma
};
