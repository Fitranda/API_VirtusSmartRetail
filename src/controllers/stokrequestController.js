const { executeQuery, pool } = require('../config/database');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');

// Get all stock requests - simplified version
const getAllStokrequest = async (req, res) => {
  try {
    // Simple query to get all stock requests with product names
    const query = `
      SELECT 
        sr.id_request,
        sr.id_produk,
        sr.tanggal_pengajuan,
        sr.jumlah,
        sr.status,
        sr.created_at,
        sr.updated_at,
        p.nama_produk
      FROM stok_request sr
      INNER JOIN produk p ON sr.id_produk = p.id_produk
      ORDER BY sr.tanggal_pengajuan DESC, sr.created_at DESC
    `;    const result = await executeQuery(query);
    if (!result.success) {
      throw new Error(result.error);
    }

    return successResponse(res, 'Data stock request berhasil diambil', result.data);
  } catch (error) {
    console.error('Get all stock request error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mengambil data stock request', error.message);
  }
};

// Get stock request by ID
const getStokrequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        sr.id_request,
        sr.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_saat_ini,
        p.harga_beli,
        sr.tanggal_pengajuan,
        sr.jumlah,
        sr.status,
        sr.created_at,
        sr.updated_at
      FROM stok_request sr
      INNER JOIN produk p ON sr.id_produk = p.id_produk
      WHERE sr.id_request = ?
    `;    const result = await executeQuery(query, [id]);
    if (!result.success) {
      throw new Error(result.error);
    }

    if (result.data.length === 0) {
      return errorResponse(res, 'Data stock request tidak ditemukan', null, 404);
    }

    return successResponse(res, 'Data stock request berhasil diambil', result.data[0]);
  } catch (error) {
    console.error('Get stock request by ID error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mengambil data stock request', error.message);
  }
};

// Create new stock request
const createStokrequest = async (req, res) => {
  try {
    const { id_produk, tanggal_pengajuan, jumlah } = req.body;    // Check if product exists
    const checkProductQuery = 'SELECT id_produk, nama_produk, stok FROM produk WHERE id_produk = ?';
    const productResult = await executeQuery(checkProductQuery, [id_produk]);
    if (!productResult.success) {
      throw new Error(productResult.error);
    }

    if (productResult.data.length === 0) {
      return errorResponse(res, 'Produk tidak ditemukan', null, 404);
    }    // Insert stock request record
    const insertQuery = `
      INSERT INTO stok_request (id_produk, tanggal_pengajuan, jumlah, status, created_at, updated_at)
      VALUES (?, ?, ?, 'pending', NOW(), NOW())
    `;

    const insertResult = await executeQuery(insertQuery, [
      id_produk,
      tanggal_pengajuan,
      jumlah
    ]);
    if (!insertResult.success) {
      throw new Error(insertResult.error);
    }

    // Get the created record
    const getQuery = `
      SELECT 
        sr.id_request,
        sr.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_saat_ini,
        sr.tanggal_pengajuan,
        sr.jumlah,
        sr.status,
        sr.created_at,
        sr.updated_at
      FROM stok_request sr
      INNER JOIN produk p ON sr.id_produk = p.id_produk
      WHERE sr.id_request = ?
    `;    const getResult = await executeQuery(getQuery, [insertResult.data.insertId]);
    if (!getResult.success) {
      throw new Error(getResult.error);
    }

    return successResponse(res, 'Stock request berhasil dibuat', getResult.data[0], 201);
  } catch (error) {
    console.error('Create stock request error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat membuat stock request', error.message);
  }
};

// Update stock request
const updateStokrequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal_pengajuan, jumlah, status } = req.body;

    // Check if stock request exists
    const checkQuery = 'SELECT * FROM stok_request WHERE id_request = ?';
    const checkResult = await executeQuery(checkQuery, [id]);
    if (!checkResult.success) {
      throw new Error(checkResult.error);
    }

    if (checkResult.data.length === 0) {
      return errorResponse(res, 'Data stock request tidak ditemukan', null, 404);
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (tanggal_pengajuan !== undefined) {
      updateFields.push('tanggal_pengajuan = ?');
      updateValues.push(tanggal_pengajuan);
    }

    if (jumlah !== undefined) {
      updateFields.push('jumlah = ?');
      updateValues.push(jumlah);
    }

    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const updateQuery = `
      UPDATE stok_request 
      SET ${updateFields.join(', ')}
      WHERE id_request = ?
    `;

    const updateResult = await executeQuery(updateQuery, updateValues);
    if (!updateResult.success) {
      throw new Error(updateResult.error);
    }

    // Get the updated record
    const getQuery = `
      SELECT 
        sr.id_request,
        sr.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_saat_ini,
        sr.tanggal_pengajuan,
        sr.jumlah,
        sr.status,
        sr.created_at,
        sr.updated_at
      FROM stok_request sr
      INNER JOIN produk p ON sr.id_produk = p.id_produk
      WHERE sr.id_request = ?
    `;    const getResult = await executeQuery(getQuery, [id]);
    if (!getResult.success) {
      throw new Error(getResult.error);
    }

    return successResponse(res, 'Stock request berhasil diperbarui', getResult.data[0]);
  } catch (error) {
    console.error('Update stock request error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat memperbarui stock request', error.message);
  }
};

// Delete stock request
const deleteStokrequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if stock request exists
    const checkQuery = 'SELECT * FROM stok_request WHERE id_request = ?';
    const checkResult = await executeQuery(checkQuery, [id]);
    if (!checkResult.success) {
      throw new Error(checkResult.error);
    }

    if (checkResult.data.length === 0) {
      return errorResponse(res, 'Data stock request tidak ditemukan', null, 404);
    }    // Delete the record
    const deleteQuery = 'DELETE FROM stok_request WHERE id_request = ?';
    const deleteResult = await executeQuery(deleteQuery, [id]);
    if (!deleteResult.success) {
      throw new Error(deleteResult.error);
    }

    return successResponse(res, 'Stock request berhasil dihapus');
  } catch (error) {
    console.error('Delete stock request error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat menghapus stock request', error.message);
  }
};

// Get stock request statistics
const getStokrequestStats = async (req, res) => {
  try {
    const { start_date = '', end_date = '' } = req.query;
    
    let whereConditions = [];
    let queryParams = [];

    if (start_date) {
      whereConditions.push('tanggal_pengajuan >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push('tanggal_pengajuan <= ?');
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const statsQuery = `
      SELECT 
        COUNT(*) as total_request,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_request,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_request,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_request,
        SUM(jumlah) as total_jumlah_diminta,
        SUM(CASE WHEN status = 'approved' THEN jumlah ELSE 0 END) as total_jumlah_disetujui
      FROM stok_request 
      ${whereClause}
    `;    const statsResult = await executeQuery(statsQuery, queryParams);
    if (!statsResult.success) {
      throw new Error(statsResult.error);
    }
    const stats = statsResult.data[0];

    // Get top requested products
    const topProductsQuery = `
      SELECT 
        sr.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_saat_ini,
        COUNT(sr.id_request) as total_request,
        SUM(sr.jumlah) as total_jumlah_diminta,
        SUM(CASE WHEN sr.status = 'approved' THEN sr.jumlah ELSE 0 END) as total_jumlah_disetujui
      FROM stok_request sr
      INNER JOIN produk p ON sr.id_produk = p.id_produk
      ${whereClause}
      GROUP BY sr.id_produk, p.nama_produk, p.kategori, p.stok
      ORDER BY total_request DESC
      LIMIT 10
    `;

    const topProductsResult = await executeQuery(topProductsQuery, queryParams);
    if (!topProductsResult.success) {
      throw new Error(topProductsResult.error);
    }
    const topProductsRows = topProductsResult.data;

    // Get recent requests
    const recentRequestsQuery = `
      SELECT 
        sr.id_request,
        sr.id_produk,
        p.nama_produk,
        sr.tanggal_pengajuan,
        sr.jumlah,
        sr.status,
        sr.created_at
      FROM stok_request sr
      INNER JOIN produk p ON sr.id_produk = p.id_produk
      ${whereClause}      ORDER BY sr.created_at DESC
      LIMIT 5
    `;

    const recentRequestsResult = await executeQuery(recentRequestsQuery, queryParams);
    if (!recentRequestsResult.success) {
      throw new Error(recentRequestsResult.error);
    }
    const recentRequestsRows = recentRequestsResult.data;

    const result = {
      summary: {
        total_request: parseInt(stats.total_request),
        pending_request: parseInt(stats.pending_request),
        approved_request: parseInt(stats.approved_request),
        rejected_request: parseInt(stats.rejected_request),
        total_jumlah_diminta: parseInt(stats.total_jumlah_diminta || 0),
        total_jumlah_disetujui: parseInt(stats.total_jumlah_disetujui || 0)
      },
      top_requested_products: topProductsRows.map(row => ({
        ...row,
        total_request: parseInt(row.total_request),
        total_jumlah_diminta: parseInt(row.total_jumlah_diminta),
        total_jumlah_disetujui: parseInt(row.total_jumlah_disetujui)
      })),
      recent_requests: recentRequestsRows
    };

    return successResponse(res, 'Statistik stock request berhasil diambil', result);
  } catch (error) {
    console.error('Get stock request stats error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mengambil statistik stock request', error.message);
  }
};

// Get low stock products that need restocking
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query; // Default threshold is 10

    const query = `
      SELECT 
        p.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok,
        p.harga_beli,
        p.harga_jual,
        COALESCE(sr_pending.pending_requests, 0) as pending_requests,
        COALESCE(sr_pending.total_pending_qty, 0) as total_pending_qty
      FROM produk p
      LEFT JOIN (
        SELECT 
          id_produk,
          COUNT(*) as pending_requests,
          SUM(jumlah) as total_pending_qty
        FROM stok_request 
        WHERE status = 'pending'
        GROUP BY id_produk
      ) sr_pending ON p.id_produk = sr_pending.id_produk      WHERE p.stok <= ?
      ORDER BY p.stok ASC, p.nama_produk ASC
    `;

    const queryResult = await executeQuery(query, [threshold]);
    if (!queryResult.success) {
      throw new Error(queryResult.error);
    }
    const rows = queryResult.data;

    const result = rows.map(row => ({
      ...row,
      recommended_order_qty: Math.max(50 - row.stok, 20), // Suggest ordering to reach 50 units or minimum 20
      priority: row.stok === 0 ? 'urgent' : row.stok <= 5 ? 'high' : 'medium'
    }));

    return successResponse(res, 'Daftar produk stok rendah berhasil diambil', result);
  } catch (error) {
    console.error('Get low stock products error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mengambil daftar produk stok rendah', error.message);
  }
};

module.exports = {
  getAllStokrequest,
  getStokrequestById,
  createStokrequest,
  updateStokrequest,
  deleteStokrequest,
  getStokrequestStats,
  getLowStockProducts
};
