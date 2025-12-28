/**
 * Error handling middleware
 * Catches all errors and sends appropriate response
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let status = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Database errors
    if (err.code === '23505') {
        status = 409;
        message = 'Resource already exists';
    } else if (err.code === '23503') {
        status = 400;
        message = 'Referenced resource does not exist';
    }

    // Validation errors (Zod)
    if (err.name === 'ZodError') {
        status = 400;
        message = 'Validation error';
        return res.status(status).json({
            success: false,
            message,
            errors: err.errors,
        });
    }

    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    });
};
