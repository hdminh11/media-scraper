'use strict';

const app = require('./src/app');
const { initializeQueue, closeQueue } = require('./src/queue');

const PORT = process.env.PORT || '3000';

let server;

const startServer = async () => {
    try {
        // Initialize queue system
        await initializeQueue();
        console.log('✅ Queue system started');

        // Start Express server
        server = app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received, shutting down gracefully...');
            server.close(async () => {
                await closeQueue();
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();