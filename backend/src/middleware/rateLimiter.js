const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,                 // Max 100 req per IP address within timeframe
    message: {
        success: false,
        error: 'Too many requests, slow down'
    }
});

// Stricter rate limiter for POST routes
const ratingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hr
    max: 20,
    message: {
        success: false,
        error: 'Rating limit reached. Try again later'
    }
});

module.exports = { rateLimit, ratingLimiter };