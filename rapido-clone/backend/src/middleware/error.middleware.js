import { ApiError } from '../utils/apiError.js';

export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

export const globalErrorHandler = (err, req, res, _next) => {
    console.error('[ERROR]', err);

    if (res.headersSent) return;

    // Convert known DB/driver errors (e.g. duplicate key) into safe ApiErrors.
    const apiErr = err instanceof ApiError ? err : ApiError.fromDbError(err);

    // Multer / upload errors
    if (err && err.code === 'LIMIT_FILE_SIZE') {
        apiErr.statusCode = 413;
        apiErr.message = 'File too large';
    }
    if (err && err.code === 'LIMIT_FILE_COUNT') {
        apiErr.statusCode = 400;
        apiErr.message = 'Too many files';
    }
    if (err && err.code === 'LIMIT_UNEXPECTED_FILE') {
        apiErr.statusCode = 400;
        apiErr.message = 'Unexpected file field';
    }

    const status = apiErr.statusCode || 500;
    res.status(status).json({
        success: false,
        message: apiErr.isOperational ? apiErr.message : 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && !apiErr.isOperational
            ? { stack: apiErr.stack }
            : {}),
        ...(apiErr.details ? { details: apiErr.details } : {}),
    });
};
