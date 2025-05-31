const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'virtusmartretail',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  charset: 'utf8mb4',
  supportBigNumbers: true,
  bigNumberStrings: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Execute query with error handling
const executeQuery = async (query, params = []) => {
  let connection = null;  
  
  try {
    // Validate parameters
    if (!Array.isArray(params)) {
      params = [params];
    }
    
    // Clean up undefined/null parameters
    const cleanParams = params.map(param => param === undefined ? null : param);
    
    
    // Get connection from pool
    connection = await pool.getConnection();
    
    
    
    // Execute the query
    const [results] = await connection.execute(query, cleanParams);
    
    
    
    return { success: true, data: results };
  } catch (error) {
    console.error('Database query error:', {
      error: error.message,
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      params: params,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    
    // Handle specific MySQL errors
    let errorMessage = error.message;
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      errorMessage = 'Invalid field name in query';
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Table does not exist';
    } else if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Duplicate entry found';
    } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      errorMessage = 'Referenced record does not exist';
    } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      errorMessage = 'Database connection lost';
    }
    
    return { success: false, error: errorMessage, code: error.code };
  } finally {
    // Always release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
};

// Get connection for transactions
const getConnection = async () => {
  return await pool.getConnection();
};

// Execute transaction with automatic rollback on error
const executeTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return { success: true, data: result };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  getConnection,
  executeTransaction
};
