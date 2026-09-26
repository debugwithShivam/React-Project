export function notFoundHandler(_req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || error.status || 500;
  const message = status >= 500 && process.env.NODE_ENV === 'production'
    ? 'An unexpected server error occurred.'
    : error.message;

  if (status >= 500) console.error(error);
  res.status(status).json({ success: false, message });
}
