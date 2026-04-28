const express = require("express");
const { connectDB, disconnectDB } = require('./config/dbHandler');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { errorHandler } = require('./src/midlleware/errorHandler');
const { rateLimiter } = require('./src/middleware/rateLimiter');

dotenv.config();

const app = express();
connectDB();

// Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(rateLimiter);

// API Routes
app.use('/api/movies', require('./src/routes/movieRoutes'));
app.use('./api/ratings', require('./src/routes/ratingRoutes'));
app.use('./api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/genres', require('./src/routes/genreRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/search', require('./src/routes/searchRoutes'));

app.get('/api/check', (req, res) => res.json({
    status: 'ok',
    uptime: process.uptime() 
}));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on PORT ${PORT}`));

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