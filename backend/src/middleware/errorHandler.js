const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;

    // Log the error with timestamp for easy debugging
    const message = err.message || "Internal Server Error";

    console.error(`[${new Date().toISOString()}] ${status} - ${message}`);

    res
    .status(status)
    .json({
        success: false,
        error: message,

        // Conditionally adds stack trace only if ran locally - no sensitive info leaked
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack
        })
    });
};

module.exports = { errorHandler };