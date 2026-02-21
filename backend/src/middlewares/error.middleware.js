/**
 * Global Error Handler Middleware.
 *
 * Handles:
 * - Mongoose ValidationError
 * - Mongoose CastError (invalid ObjectId)
 * - MongoDB duplicate key error (code 11000)
 * - Generic errors
 */

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const fields = Object.values(err.errors).map((e) => e.message);
        message = `Validation failed: ${fields.join(', ')}`;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyPattern).join(', ');
        message = `Duplicate value for: ${field}`;
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export default errorHandler;
