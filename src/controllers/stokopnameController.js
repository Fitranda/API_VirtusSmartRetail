const { executeQuery, pool } = require('../config/database');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');

// Get all stokopname records with pagination and filters
const getAllStokopname = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      start_date = '', 
      end_date = '',
      id_produk = ''
    } = req.query;
    
    const offset = (page - 1) * limit;
    let whereConditions = [];
    let queryParams = [];

    // Build search conditions
    if (search) {
      whereConditions.push('(p.nama_produk LIKE ? OR p.kategori LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (start_date) {
      whereConditions.push('s.tanggal_opname >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push('s.tanggal_opname <= ?');
      queryParams.push(end_date);
    }

    if (id_produk) {
      whereConditions.push('s.id_produk = ?');
      queryParams.push(id_produk);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM stokopname s 
      INNER JOIN produk p ON s.id_produk = p.id_produk 
      ${whereClause}
    `;
      const countResult = await executeQuery(countQuery, queryParams);
    if (!countResult.success) {
      throw new Error(countResult.error);
    }
    const totalRecords = countResult.data[0].total;
    const totalPages = Math.ceil(totalRecords / limit);    // Get paginated records
    const query = `
      SELECT 
        s.id_stokopname,
        s.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_sistem,
        s.tanggal_opname,
        s.jumlah_sebenarnya,
        s.selisih,
        s.created_at,
        s.updated_at
      FROM stokopname s
      INNER JOIN produk p ON s.id_produk = p.id_produk
      ${whereClause}
      ORDER BY s.tanggal_opname DESC, s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Add limit and offset to a separate array to avoid duplication
    const dataQueryParams = [...queryParams, parseInt(limit), parseInt(offset)];
    const dataResult = await executeQuery(query, dataQueryParams);
    if (!dataResult.success) {
      throw new Error(dataResult.error);
    }
    const rows = dataResult.data;

    const pagination = {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total: totalRecords,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1
    };

    return paginationResponse(res, 'Data stokopname berhasil diambil', rows, pagination);
  } catch (error) {
    console.error('Get all stokopname error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mengambil data stokopname', error.message);
  }
};

// Get stokopname by ID
const getStokopnameById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        s.id_stokopname,
        s.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_sistem,
        s.tanggal_opname,
        s.jumlah_sebenarnya,
        s.selisih,
        s.created_at,
        s.updated_at
      FROM stokopname s
      INNER JOIN produk p ON s.id_produk = p.id_produk
      WHERE s.id_stokopname = ?
    `;    const result = await executeQuery(query, [id]);
    if (!result.success) {
      throw new Error(result.error);
    }

    if (result.data.length === 0) {
      return errorResponse(res, 'Data stokopname tidak ditemukan', null, 404);
    }

    return successResponse(res, 'Data stokopname berhasil diambil', result.data[0]);
  } catch (error) {
    console.error('Get stokopname by ID error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mengambil data stokopname', error.message);
  }
};

// Create new stokopname record
const createStokopname = async (req, res) => {
  try {
    const { id_produk, tanggal_opname, jumlah_sebenarnya } = req.body;    // Check if product exists and get current stock
    const checkProductQuery = 'SELECT id_produk, nama_produk, stok FROM produk WHERE id_produk = ?';
    const productResult = await executeQuery(checkProductQuery, [id_produk]);
    if (!productResult.success) {
      throw new Error(productResult.error);
    }

    if (productResult.data.length === 0) {
      return errorResponse(res, 'Produk tidak ditemukan', null, 404);
    }

    const product = productResult.data[0];
    const stokSistem = product.stok;
    const selisih = jumlah_sebenarnya - stokSistem;

    // Insert stokopname record
    const insertQuery = `
      INSERT INTO stokopname (id_produk, tanggal_opname, jumlah_sebenarnya, selisih, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;    const insertResult = await executeQuery(insertQuery, [
      id_produk,
      tanggal_opname,
      jumlah_sebenarnya,
      selisih
    ]);
    if (!insertResult.success) {
      throw new Error(insertResult.error);
    }

    // Get the created record
    const getQuery = `
      SELECT 
        s.id_stokopname,
        s.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_sistem,
        s.tanggal_opname,
        s.jumlah_sebenarnya,
        s.selisih,
        s.created_at,
        s.updated_at
      FROM stokopname s
      INNER JOIN produk p ON s.id_produk = p.id_produk
      WHERE s.id_stokopname = ?
    `;    const newRecordResult = await executeQuery(getQuery, [insertResult.data.insertId]);
    if (!newRecordResult.success) {
      throw new Error(newRecordResult.error);
    }

    return successResponse(res, 'Stokopname berhasil dibuat', newRecordResult.data[0], 201);
  } catch (error) {
    console.error('Create stokopname error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat membuat stokopname', error.message);
  }
};

// Update stokopname record
const updateStokopname = async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal_opname, jumlah_sebenarnya } = req.body;    // Check if stokopname exists
    const checkQuery = 'SELECT * FROM stokopname WHERE id_stokopname = ?';
    const checkResult = await executeQuery(checkQuery, [id]);
    if (!checkResult.success) {
      throw new Error(checkResult.error);
    }

    if (checkResult.data.length === 0) {
      return errorResponse(res, 'Data stokopname tidak ditemukan', null, 404);
    }

    const existingRecord = checkResult.data[0];
      // If jumlah_sebenarnya is being updated, recalculate selisih
    let newSelisih = existingRecord.selisih;
    if (jumlah_sebenarnya !== undefined) {
      const productQuery = 'SELECT stok FROM produk WHERE id_produk = ?';
      const productResult = await executeQuery(productQuery, [existingRecord.id_produk]);
      if (!productResult.success) {
        throw new Error(productResult.error);
      }
      const productRows = productResult.data;
      const stokSistem = productRows[0].stok;
      newSelisih = jumlah_sebenarnya - stokSistem;
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (tanggal_opname !== undefined) {
      updateFields.push('tanggal_opname = ?');
      updateValues.push(tanggal_opname);
    }

    if (jumlah_sebenarnya !== undefined) {
      updateFields.push('jumlah_sebenarnya = ?');
      updateFields.push('selisih = ?');
      updateValues.push(jumlah_sebenarnya);
      updateValues.push(newSelisih);
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);    const updateQuery = `
      UPDATE stokopname 
      SET ${updateFields.join(', ')}
      WHERE id_stokopname = ?
    `;

    const updateResult = await executeQuery(updateQuery, updateValues);
    if (!updateResult.success) {
      throw new Error(updateResult.error);
    }

    // Get the updated record
    const getQuery = `
      SELECT 
        s.id_stokopname,
        s.id_produk,
        p.nama_produk,
        p.kategori,
        p.stok as stok_sistem,
        s.tanggal_opname,
        s.jumlah_sebenarnya,
        s.selisih,
        s.created_at,
        s.updated_at
      FROM stokopname s
      INNER JOIN produk p ON s.id_produk = p.id_produk
      WHERE s.id_stokopname = ?
    `;

    const getResult = await executeQuery(getQuery, [id]);
    if (!getResult.success) {
      throw new Error(getResult.error);
    }
    const updatedRecord = getResult.data;

    return successResponse(res, 'Stokopname berhasil diperbarui', updatedRecord[0]);
  } catch (error) {
    console.error('Update stokopname error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat memperbarui stokopname', error.message);
  }
};

// Delete stokopname record
const deleteStokopname = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if stokopname exists
    const checkQuery = 'SELECT id_stokopname FROM stokopname WHERE id_stokopname = ?';
    const checkResult = await executeQuery(checkQuery, [id]);
    if (!checkResult.success) {
      throw new Error(checkResult.error);
    }
    const existingRows = checkResult.data;

    if (existingRows.length === 0) {
      return errorResponse(res, 'Data stokopname tidak ditemukan', null, 404);
    }

    // Delete the record
    const deleteQuery = 'DELETE FROM stokopname WHERE id_stokopname = ?';
    const deleteResult = await executeQuery(deleteQuery, [id]);
    if (!deleteResult.success) {
      throw new Error(deleteResult.error);
    }

    return successResponse(res, 'Stokopname berhasil dihapus');
  } catch (error) {
    console.error('Delete stokopname error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat menghapus stokopname', error.message);
  }
};

// Apply stock adjustment based on stokopname
const applyStockAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    // Get stokopname record
    const stokopnameQuery = `
      SELECT s.*, p.nama_produk 
      FROM stokopname s 
      INNER JOIN produk p ON s.id_produk = p.id_produk 
      WHERE s.id_stokopname = ?
    `;
    const stokopnameResult = await executeQuery(stokopnameQuery, [id]);
    if (!stokopnameResult.success) {
      throw new Error(stokopnameResult.error);
    }
    const stokopnameRows = stokopnameResult.data;

    if (stokopnameRows.length === 0) {
      return errorResponse(res, 'Data stokopname tidak ditemukan', null, 404);
    }

    const stokopname = stokopnameRows[0];

    // Update product stock to match actual count
    const updateStockQuery = `
      UPDATE produk 
      SET stok = ?, updated_at = NOW() 
      WHERE id_produk = ?
    `;
    
    const updateStockResult = await executeQuery(updateStockQuery, [stokopname.jumlah_sebenarnya, stokopname.id_produk]);
    if (!updateStockResult.success) {
      throw new Error(updateStockResult.error);
    }    // Recalculate selisih (should be 0 after adjustment)
    const updateStokopnameQuery = `
      UPDATE stokopname 
      SET selisih = 0, updated_at = NOW() 
      WHERE id_stokopname = ?
    `;
    
    const updateStokopnameResult = await executeQuery(updateStokopnameQuery, [id]);
    if (!updateStokopnameResult.success) {
      throw new Error(updateStokopnameResult.error);
    }

    return successResponse(res, `Stok produk ${stokopname.nama_produk} berhasil disesuaikan ke ${stokopname.jumlah_sebenarnya} unit`);
  } catch (error) {
    console.error('Apply stock adjustment error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat menerapkan penyesuaian stok', error.message);
  }
};

// Get stokopname statistics
const getStokopnameStats = async (req, res) => {
  try {
    const { start_date = '', end_date = '' } = req.query;
    
    let whereConditions = [];
    let queryParams = [];

    if (start_date) {
      whereConditions.push('tanggal_opname >= ?');
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push('tanggal_opname <= ?');
      queryParams.push(end_date);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';    const statsQuery = `
      SELECT 
        COUNT(*) as total_opname,
        COUNT(CASE WHEN selisih > 0 THEN 1 END) as kelebihan_stok,
        COUNT(CASE WHEN selisih < 0 THEN 1 END) as kekurangan_stok,
        COUNT(CASE WHEN selisih = 0 THEN 1 END) as stok_sesuai,
        SUM(ABS(selisih)) as total_selisih,
        AVG(ABS(selisih)) as rata_rata_selisih
      FROM stokopname 
      ${whereClause}
    `;

    const statsResult = await executeQuery(statsQuery, queryParams);
    if (!statsResult.success) {
      throw new Error(statsResult.error);
    }
    const statsRows = statsResult.data;
    const stats = statsRows[0];    // Get top products with biggest discrepancies
    const topDiscrepanciesQuery = `
      SELECT 
        s.id_produk,
        p.nama_produk,
        p.kategori,
        ABS(s.selisih) as absolut_selisih,
        s.selisih,
        s.tanggal_opname
      FROM stokopname s
      INNER JOIN produk p ON s.id_produk = p.id_produk
      ${whereClause}
      ORDER BY ABS(s.selisih) DESC
      LIMIT 10
    `;

    const discrepancyResult = await executeQuery(topDiscrepanciesQuery, queryParams);
    if (!discrepancyResult.success) {
      throw new Error(discrepancyResult.error);
    }
    const discrepancyRows = discrepancyResult.data;

    const finalResult = {
      summary: {
        total_opname: parseInt(stats.total_opname),
        kelebihan_stok: parseInt(stats.kelebihan_stok),
        kekurangan_stok: parseInt(stats.kekurangan_stok),
        stok_sesuai: parseInt(stats.stok_sesuai),
        total_selisih: parseInt(stats.total_selisih || 0),
        rata_rata_selisih: parseFloat(stats.rata_rata_selisih || 0).toFixed(2)
      },
      top_discrepancies: discrepancyRows
    };

    return successResponse(res, 'Statistik stokopname berhasil diambil', finalResult);
  } catch (error) {
    console.error('Get stokopname stats error:', error);
    return errorResponse(res, 'Terjadi kesalahan saat mengambil statistik stokopname', error.message);
  }
};

module.exports = {
  getAllStokopname,
  getStokopnameById,
  createStokopname,
  updateStokopname,
  deleteStokopname,
  applyStockAdjustment,
  getStokopnameStats
};
