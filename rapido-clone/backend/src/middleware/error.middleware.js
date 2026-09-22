export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
};

export const globalErrorHandler = (err, req, res, _next) => {
    console.error('[ERROR]', err);

    if (res.headersSent) return;

    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        success: false,
        message: err.isOperational ? err.message : 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && !err.isOperational
            ? { stack: err.stack }
            : {}),
        ...(err.details ? { details: err.details } : {}),
    });
};
