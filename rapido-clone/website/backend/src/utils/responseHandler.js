/**
 * Standardized API Response Helper
 */

exports.successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.errorResponse = (res, statusCode = 400, message = 'An error occurred', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
