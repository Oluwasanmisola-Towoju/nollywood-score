require('dotenv/config');
const express = require('express');
const { connectDB, disconnectDB } = require('../config/dbHandler.js');

// Import routes
connectDB();

const app = express();

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`Server running on port`);
});

// Handle unhandled promise rejections (e.g, distance connection errors)
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close the database connection
    server.close(async () => {
        await disconnectDB();
        // Exit the process
        process.exit(1);
    });
});

// Handle uncaught exceptions (e.g, syntax errors)
process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err);
    // Close the database connection
    await disconnectDB();
    // Exit the process
    process.exit(1);
});

// Graceful shutdown on SIGTERM or SIGINT (e.g, when the process is killed or interrupted)  
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM. Shutting down gracefully...');
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});