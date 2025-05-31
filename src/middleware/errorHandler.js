const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Log error untuk debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }
  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    const message = 'Data sudah ada dalam database';
    error = { message, statusCode: 400 };
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    const message = 'Data yang direferensikan tidak ditemukan';
    error = { message, statusCode: 400 };
  }

  // MySQL connection errors
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    const message = 'Koneksi database terputus';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'ER_CON_COUNT_ERROR') {
    const message = 'Terlalu banyak koneksi database';
    error = { message, statusCode: 503 };
  }

  // MySQL query errors
  if (err.code === 'ER_BAD_FIELD_ERROR') {
    const message = 'Field tidak valid dalam query';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    const message = 'Tabel tidak ditemukan';
    error = { message, statusCode: 500 };
  }

  if (err.code === 'ER_PARSE_ERROR') {
    const message = 'Syntax error dalam query SQL';
    error = { message, statusCode: 500 };
  }

  // MySQL prepared statement errors
  if (err.message && err.message.includes('mysqld_stmt_execute')) {
    const message = 'Error eksekusi prepared statement database';
    error = { message, statusCode: 500 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token tidak valid';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token telah expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
