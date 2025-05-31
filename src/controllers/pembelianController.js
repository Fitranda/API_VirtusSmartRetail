const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

// Get all pembelian dengan pagination, filter, dan search
const getAllPembelian = async (req, res) => {    
  try {    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const supplier = req.query.supplier || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    // Build where clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(p.no_faktur LIKE ? OR s.nama_supplier LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (supplier) {
      whereConditions.push('p.id_supplier = ?');
      queryParams.push(supplier);
    }

    if (startDate) {
      whereConditions.push('p.tanggal >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('p.tanggal <= ?');
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM pembelian p
      LEFT JOIN supplier s ON p.id_supplier = s.id_supplier
      ${whereClause}
    `;    
    
    const countResult = await executeQuery(countQuery, queryParams);
    

    const totalData = countResult.total;
    const totalPages = Math.ceil(totalData / limit);

    // Get pembelian data dengan detail supplier
    const dataQuery = `
      SELECT 
        p.id_pembelian,
        p.no_faktur,
        p.tanggal,
        p.total,
        p.created_at,
        p.updated_at,
        s.id_supplier,
        s.nama_supplier,
        s.kontak as supplier_kontak,
        s.alamat as supplier_alamat,
        COUNT(pd.id) as total_items,
        COALESCE(SUM(pd.jumlah), 0) as total_qty
      FROM pembelian p
      LEFT JOIN supplier s ON p.id_supplier = s.id_supplier
      LEFT JOIN pembelian_detail pd ON p.id_pembelian = pd.id_pembelian
      ${whereClause}
      GROUP BY p.id_pembelian, s.id_supplier, s.nama_supplier, s.kontak, s.alamat
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const pembelianData = await executeQuery(dataQuery, [...queryParams, limit, offset]);

    res.json(formatResponse(true, 'Data pembelian berhasil diambil', {
      data: pembelianData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalData: totalData,
        limit: limit
      }
    }));
  } catch (error) {
    console.error('Error fetching pembelian:', error);
    res.status(500).json(formatResponse(false, 'Error fetching pembelian', null, error.message));
  }
};

// Get pembelian by ID dengan detail items
const getPembelianById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get pembelian header
    const headerQuery = `
      SELECT 
        p.id_pembelian,
        p.no_faktur,
        p.tanggal,
        p.total,
        p.created_at,
        p.updated_at,
        s.id_supplier,
        s.nama_supplier,
        s.kontak as supplier_kontak,
        s.alamat as supplier_alamat
      FROM pembelian p
      LEFT JOIN supplier s ON p.id_supplier = s.id_supplier
      WHERE p.id_pembelian = ?
    `;

    const pembelianHeader = await executeQuery(headerQuery, [id]);

    if (!pembelianHeader) {
      return res.status(404).json(formatResponse(false, 'Pembelian tidak ditemukan'));
    }

    // Get pembelian details
    const detailQuery = `
      SELECT 
        pd.id,
        pd.id_produk,
        pd.jumlah,
        pd.harga,
        pd.jumlah * pd.harga as subtotal,
        p.nama_produk,
        p.kategori,
        p.stok as stok_produk
      FROM pembelian_detail pd
      LEFT JOIN produk p ON pd.id_produk = p.id_produk
      WHERE pd.id_pembelian = ?
      ORDER BY pd.id
    `;

    const pembelianDetails = await executeQuery(detailQuery, [id]);

    // Combine header and details
    const pembelianData = {
      ...pembelianHeader,
      items: pembelianDetails,
      total_items: pembelianDetails.length,
      total_qty: pembelianDetails.reduce((sum, item) => sum + item.jumlah, 0)
    };

    res.json(formatResponse(true, 'Detail pembelian berhasil diambil', pembelianData));
  } catch (error) {
    console.error('Error fetching pembelian detail:', error);
    res.status(500).json(formatResponse(false, 'Error fetching pembelian detail', null, error.message));
  }
};

// Get statistik pembelian
const getPembelianStats = async (req, res) => {
  try {
    // Total pembelian
    const totalQuery = 'SELECT COUNT(*) as total_pembelian FROM pembelian';
    const totalResult = await executeQuery(totalQuery);

    // Total nilai pembelian
    const totalNilaiQuery = 'SELECT COALESCE(SUM(total), 0) as total_nilai FROM pembelian';
    const totalNilaiResult = await executeQuery(totalNilaiQuery);

    // Pembelian bulan ini
    const monthlyQuery = `
      SELECT COUNT(*) as pembelian_bulan_ini 
      FROM pembelian 
      WHERE MONTH(tanggal) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal) = YEAR(CURRENT_DATE())
    `;
    const monthlyResult = await executeQuery(monthlyQuery);

    // Total nilai pembelian bulan ini
    const monthlyValueQuery = `
      SELECT COALESCE(SUM(total), 0) as nilai_bulan_ini 
      FROM pembelian 
      WHERE MONTH(tanggal) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal) = YEAR(CURRENT_DATE())
    `;
    const monthlyValueResult = await executeQuery(monthlyValueQuery);

    // Top 5 supplier berdasarkan nilai pembelian
    const topSuppliersQuery = `
      SELECT 
        s.id_supplier,
        s.nama_supplier,
        COUNT(p.id_pembelian) as total_transaksi,
        COALESCE(SUM(p.total), 0) as total_nilai_pembelian
      FROM supplier s
      LEFT JOIN pembelian p ON s.id_supplier = p.id_supplier
      GROUP BY s.id_supplier, s.nama_supplier
      ORDER BY total_nilai_pembelian DESC
      LIMIT 5
    `;
    const topSuppliers = await executeQuery(topSuppliersQuery);

    // Pembelian per bulan (6 bulan terakhir)
    const monthlyTrendQuery = `
      SELECT 
        DATE_FORMAT(tanggal, '%Y-%m') as bulan,
        COUNT(*) as jumlah_transaksi,
        COALESCE(SUM(total), 0) as total_nilai
      FROM pembelian 
      WHERE tanggal >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
      ORDER BY bulan DESC
    `;
    const monthlyTrend = await executeQuery(monthlyTrendQuery);

    const stats = {
      overview: {
        total_pembelian: totalResult.total_pembelian,
        total_nilai_pembelian: totalNilaiResult.total_nilai,
        pembelian_bulan_ini: monthlyResult.pembelian_bulan_ini,
        nilai_bulan_ini: monthlyValueResult.nilai_bulan_ini
      },
      top_suppliers: topSuppliers,
      monthly_trend: monthlyTrend
    };

    res.json(formatResponse(true, 'Statistik pembelian berhasil diambil', stats));
  } catch (error) {
    console.error('Error fetching pembelian stats:', error);
    res.status(500).json(formatResponse(false, 'Error fetching pembelian stats', null, error.message));
  }
};

// Create pembelian baru
const createPembelian = async (req, res) => {
  try {
    const { id_supplier, no_faktur, tanggal, items } = req.body;

    // Validasi items
    if (!items || items.length === 0) {
      return res.status(400).json(formatResponse(false, 'Items pembelian tidak boleh kosong'));
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.jumlah * item.harga), 0);

    // Insert pembelian header
    const insertHeaderQuery = `
      INSERT INTO pembelian (id_supplier, no_faktur, tanggal, total, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;    

    const headerResult = await executeQuery(insertHeaderQuery, [
      id_supplier, no_faktur, tanggal, total
    ]);

    const id_pembelian = headerResult.insertId;

    // Insert pembelian details dan update stok
    for (const item of items) {
      // Insert detail
      const insertDetailQuery = `
        INSERT INTO pembelian_detail (id_pembelian, id_produk, jumlah, harga, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;

      await executeQuery(insertDetailQuery, [
        id_pembelian, item.id_produk, item.jumlah, item.harga
      ]);

      // Update stok produk (tambah stok)
      const updateStokQuery = `
        UPDATE produk 
        SET stok = stok + ?, updated_at = NOW()
        WHERE id_produk = ?
      `;

      await executeQuery(updateStokQuery, [item.jumlah, item.id_produk]);
    }

    // Get the created pembelian with details
    const createdPembelian = await getPembelianByIdInternal(id_pembelian);

    res.status(201).json(formatResponse(true, 'Pembelian berhasil dibuat', createdPembelian));
  } catch (error) {
    console.error('Error creating pembelian:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json(formatResponse(false, 'No faktur sudah ada'));
    } else {
      res.status(500).json(formatResponse(false, 'Error creating pembelian', null, error.message));
    }
  }
};

// Update pembelian
const updatePembelian = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_supplier, no_faktur, tanggal, items } = req.body;

    // Check if pembelian exists
    const existingPembelian = await executeQuery(
      'SELECT * FROM pembelian WHERE id_pembelian = ?', [id]
    );

    if (existingPembelian.length === 0) {
      return res.status(404).json(formatResponse(false, 'Pembelian tidak ditemukan'));
    }

    // Revert previous stock changes
    const existingDetails = await executeQuery(
      'SELECT id_produk, jumlah FROM pembelian_detail WHERE id_pembelian = ?', [id]
    );

    for (const detail of existingDetails) {
      await executeQuery(
        'UPDATE produk SET stok = stok - ?, updated_at = NOW() WHERE id_produk = ?',
        [detail.jumlah, detail.id_produk]
      );
    }

    // Delete existing details
    await executeQuery('DELETE FROM pembelian_detail WHERE id_pembelian = ?', [id]);

    // Calculate new total
    const total = items.reduce((sum, item) => sum + (item.jumlah * item.harga), 0);

    // Update pembelian header
    const updateHeaderQuery = `
      UPDATE pembelian 
      SET id_supplier = ?, no_faktur = ?, tanggal = ?, total = ?, updated_at = NOW()
      WHERE id_pembelian = ?
    `;

    await executeQuery(updateHeaderQuery, [
      id_supplier, no_faktur, tanggal, total, id
    ]);

    // Insert new details and update stock
    for (const item of items) {
      // Insert detail
      const insertDetailQuery = `
        INSERT INTO pembelian_detail (id_pembelian, id_produk, jumlah, harga, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;

      await executeQuery(insertDetailQuery, [
        id, item.id_produk, item.jumlah, item.harga
      ]);

      // Update stok produk (tambah stok)
      await executeQuery(
        'UPDATE produk SET stok = stok + ?, updated_at = NOW() WHERE id_produk = ?',
        [item.jumlah, item.id_produk]
      );
    }

    // Get the updated pembelian with details
    const updatedPembelian = await getPembelianByIdInternal(id);

    res.json(formatResponse(true, 'Pembelian berhasil diupdate', updatedPembelian));
  } catch (error) {
    console.error('Error updating pembelian:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json(formatResponse(false, 'No faktur sudah ada'));
    } else {
      res.status(500).json(formatResponse(false, 'Error updating pembelian', null, error.message));
    }
  }
};

// Delete pembelian
const deletePembelian = async (req, res) => {
  const connection = await require('mysql2/promise').createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'virtusmartretail'
  });

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Check if pembelian exists
    const existingPembelian = await connection.execute(
      'SELECT * FROM pembelian WHERE id_pembelian = ?', [id]
    );

    if (existingPembelian.length === 0) {
      return res.status(404).json(formatResponse(false, 'Pembelian tidak ditemukan'));
    }

    // Revert stock changes
    const existingDetails = await connection.execute(
      'SELECT id_produk, jumlah FROM pembelian_detail WHERE id_pembelian = ?', [id]
    );

    for (const detail of existingDetails) {
      await connection.execute(
        'UPDATE produk SET stok = stok - ?, updated_at = NOW() WHERE id_produk = ?',
        [detail.jumlah, detail.id_produk]
      );
    }

    // Delete details first (foreign key constraint)
    await connection.execute('DELETE FROM pembelian_detail WHERE id_pembelian = ?', [id]);

    // Delete pembelian header
    await connection.execute('DELETE FROM pembelian WHERE id_pembelian = ?', [id]);

    await connection.commit();

    res.json(formatResponse(true, 'Pembelian berhasil dihapus'));
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting pembelian:', error);
    res.status(500).json(formatResponse(false, 'Error deleting pembelian', null, error.message));
  } finally {
    await connection.end();
  }
};

// Search pembelian
const searchPembelian = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json(formatResponse(false, 'Query pencarian tidak boleh kosong'));
    }

    const searchQuery = `
      SELECT 
        p.id_pembelian,
        p.no_faktur,
        p.tanggal,
        p.total,
        s.nama_supplier,
        s.kontak as supplier_kontak
      FROM pembelian p
      LEFT JOIN supplier s ON p.id_supplier = s.id_supplier
      WHERE p.no_faktur LIKE ? OR s.nama_supplier LIKE ?
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    const results = await executeQuery(searchQuery, [`%${query}%`, `%${query}%`]);

    res.json(formatResponse(true, 'Hasil pencarian pembelian', results));
  } catch (error) {
    console.error('Error searching pembelian:', error);
    res.status(500).json(formatResponse(false, 'Error searching pembelian', null, error.message));
  }
};

// Helper function untuk get pembelian by ID (internal use)
const getPembelianByIdInternal = async (id) => {
  // Get pembelian header
  const headerQuery = `
    SELECT 
      p.id_pembelian,
      p.no_faktur,
      p.tanggal,
      p.total,
      p.created_at,
      p.updated_at,
      s.id_supplier,
      s.nama_supplier,
      s.kontak as supplier_kontak,
      s.alamat as supplier_alamat
    FROM pembelian p
    LEFT JOIN supplier s ON p.id_supplier = s.id_supplier
    WHERE p.id_pembelian = ?
  `;

  const pembelianHeader = await executeQuery(headerQuery, [id]);

  // Get pembelian details
  const detailQuery = `
    SELECT 
      pd.id,
      pd.id_produk,
      pd.jumlah,
      pd.harga,
      pd.jumlah * pd.harga as subtotal,
      p.nama_produk,
      p.kategori,
      p.stok as stok_produk
    FROM pembelian_detail pd
    LEFT JOIN produk p ON pd.id_produk = p.id_produk
    WHERE pd.id_pembelian = ?
    ORDER BY pd.id
  `;

  const pembelianDetails = await executeQuery(detailQuery, [id]);

  return {
    ...pembelianHeader,
    items: pembelianDetails,
    total_items: pembelianDetails.length,
    total_qty: pembelianDetails.reduce((sum, item) => sum + item.jumlah, 0)
  };
};

module.exports = {
  getAllPembelian,
  getPembelianById,
  getPembelianStats,
  createPembelian,
  updatePembelian,
  deletePembelian,
  searchPembelian
};
