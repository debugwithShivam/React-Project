export class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.isOperational = true;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

ApiError.badRequest = (message = 'Bad Request', details = null) =>
    new ApiError(400, message, details);
ApiError.unauthorized = (message = 'Unauthorized', details = null) =>
    new ApiError(401, message, details);
ApiError.forbidden = (message = 'Forbidden', details = null) =>
    new ApiError(403, message, details);
ApiError.notFound = (message = 'Not Found', details = null) =>
    new ApiError(404, message, details);
ApiError.conflict = (message = 'Conflict', details = null) =>
    new ApiError(409, message, details);

/**
 * Convert a raw database / driver error into a safe ApiError.
 * Detects duplicate-key violations (ER_DUP_ENTRY) and maps them to 409,
 * and falls back to 400 for other known MySQL client errors.
 */
ApiError.fromDbError = (err) => {
    if (err && err.code === 'ER_DUP_ENTRY') {
        const match = err.message?.match(/for key '([^']+)'/);
        return new ApiError(409, 'Resource already exists', {
            field: match ? match[1] : undefined,
        });
    }
    if (err && (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR')) {
        return new ApiError(503, 'Database unavailable');
    }
    if (err instanceof ApiError) return err;
    return err instanceof Error
        ? new ApiError(400, err.message || 'Database error')
        : new ApiError(400, 'Database error');
};

export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
