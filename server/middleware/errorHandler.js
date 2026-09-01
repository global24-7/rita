const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }

  // Supabase errors (PostgREST)
  if (err.code === '23505') {
    // Unique violation
    return res.status(400).json({ message: 'Duplicate value. This record already exists.' });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({ message: 'Referenced record not found.' });
  }

  if (err.code === '23514') {
    // Check constraint violation
    return res.status(400).json({ message: 'Invalid value for a field constraint.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired.' });
  }

  // Default
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
