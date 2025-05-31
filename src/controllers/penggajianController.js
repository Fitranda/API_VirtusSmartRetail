const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

// Get all penggajian dengan pagination, filter, dan search
const getAllPenggajian = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const karyawan = req.query.karyawan || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';
    const bulan = req.query.bulan || '';
    const tahun = req.query.tahun || '';

    // Build where clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(k.nama LIKE ? OR k.posisi LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (karyawan) {
      whereConditions.push('p.id_karyawan = ?');
      queryParams.push(karyawan);
    }

    if (startDate) {
      whereConditions.push('p.tanggal >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('p.tanggal <= ?');
      queryParams.push(endDate);
    }

    if (bulan && tahun) {
      whereConditions.push('MONTH(p.tanggal) = ? AND YEAR(p.tanggal) = ?');
      queryParams.push(bulan, tahun);
    } else if (tahun) {
      whereConditions.push('YEAR(p.tanggal) = ?');
      queryParams.push(tahun);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM penggajian p
      LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, queryParams);
    const totalData = countResult.data[0].total;
    const totalPages = Math.ceil(totalData / limit);

    // Get penggajian data dengan detail karyawan
    const dataQuery = `
      SELECT 
        p.id_penggajian,
        p.id_karyawan,
        p.tanggal,
        p.gaji_pokok,
        p.tunjangan,
        p.potongan,
        p.total_gaji,
        p.created_at,
        p.updated_at,
        k.nama as nama_karyawan,
        k.posisi,
        k.username,
        k.status as status_karyawan
      FROM penggajian p
      LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const penggajianData = await executeQuery(dataQuery, [...queryParams, limit, offset]);

    res.json(formatResponse(true, 'Data penggajian berhasil diambil', {
      data: penggajianData.data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalData: totalData,
        limit: limit
      }
    }));
  } catch (error) {
    console.error('Error fetching penggajian:', error);
    res.status(500).json(formatResponse(false, 'Error fetching penggajian', null, error.message));
  }
};

// Get penggajian by ID
const getPenggajianById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.id_penggajian,
        p.id_karyawan,
        p.tanggal,
        p.gaji_pokok,
        p.tunjangan,
        p.potongan,
        p.total_gaji,
        p.created_at,
        p.updated_at,
        k.nama as nama_karyawan,
        k.posisi,
        k.username,
        k.email,
        k.status as status_karyawan,
        s.nama_shift,
        s.jam_mulai,
        s.jam_selesai
      FROM penggajian p
      LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
      LEFT JOIN shifts s ON k.id_shift = s.id_shift
      WHERE p.id_penggajian = ?
    `;

    const result = await executeQuery(query, [id]);

    if (!result.data || result.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Penggajian tidak ditemukan'));
    }

    res.json(formatResponse(true, 'Detail penggajian berhasil diambil', result.data[0]));
  } catch (error) {
    console.error('Error fetching penggajian detail:', error);
    res.status(500).json(formatResponse(false, 'Error fetching penggajian detail', null, error.message));
  }
};

// Get statistik penggajian
const getPenggajianStats = async (req, res) => {
  try {
    // Total penggajian
    const totalQuery = 'SELECT COUNT(*) as total_penggajian FROM penggajian';
    const totalResult = await executeQuery(totalQuery);

    // Total gaji dibayarkan
    const totalGajiQuery = 'SELECT COALESCE(SUM(total_gaji), 0) as total_gaji_dibayarkan FROM penggajian';
    const totalGajiResult = await executeQuery(totalGajiQuery);

    // Penggajian bulan ini
    const monthlyQuery = `
      SELECT COUNT(*) as penggajian_bulan_ini 
      FROM penggajian 
      WHERE MONTH(tanggal) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal) = YEAR(CURRENT_DATE())
    `;
    const monthlyResult = await executeQuery(monthlyQuery);

    // Total gaji bulan ini
    const monthlyGajiQuery = `
      SELECT COALESCE(SUM(total_gaji), 0) as total_gaji_bulan_ini 
      FROM penggajian 
      WHERE MONTH(tanggal) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal) = YEAR(CURRENT_DATE())
    `;
    const monthlyGajiResult = await executeQuery(monthlyGajiQuery);

    // Rata-rata gaji
    const avgGajiQuery = 'SELECT COALESCE(AVG(total_gaji), 0) as rata_rata_gaji FROM penggajian';
    const avgGajiResult = await executeQuery(avgGajiQuery);

    // Total karyawan aktif
    const totalKaryawanQuery = "SELECT COUNT(*) as total_karyawan_aktif FROM karyawan WHERE status = 'aktif'";
    const totalKaryawanResult = await executeQuery(totalKaryawanQuery);

    // Penggajian per bulan (6 bulan terakhir)
    const monthlyTrendQuery = `
      SELECT 
        DATE_FORMAT(tanggal, '%Y-%m') as bulan,
        COUNT(*) as jumlah_penggajian,
        COALESCE(SUM(total_gaji), 0) as total_gaji,
        COALESCE(AVG(total_gaji), 0) as rata_rata_gaji
      FROM penggajian 
      WHERE tanggal >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
      ORDER BY bulan DESC
    `;
    const monthlyTrend = await executeQuery(monthlyTrendQuery);

    // Top 5 karyawan dengan gaji tertinggi bulan ini
    const topEarnerQuery = `
      SELECT 
        k.nama as nama_karyawan,
        k.posisi,
        p.total_gaji,
        p.tanggal
      FROM penggajian p
      LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
      WHERE MONTH(p.tanggal) = MONTH(CURRENT_DATE()) 
      AND YEAR(p.tanggal) = YEAR(CURRENT_DATE())
      ORDER BY p.total_gaji DESC
      LIMIT 5
    `;
    const topEarners = await executeQuery(topEarnerQuery);

    const stats = {
      overview: {
        total_penggajian: totalResult.data[0].total_penggajian,
        total_gaji_dibayarkan: totalGajiResult.data[0].total_gaji_dibayarkan,
        penggajian_bulan_ini: monthlyResult.data[0].penggajian_bulan_ini,
        total_gaji_bulan_ini: monthlyGajiResult.data[0].total_gaji_bulan_ini,
        rata_rata_gaji: avgGajiResult.data[0].rata_rata_gaji,
        total_karyawan_aktif: totalKaryawanResult.data[0].total_karyawan_aktif
      },
      monthly_trend: monthlyTrend.data,
      top_earners: topEarners.data
    };

    res.json(formatResponse(true, 'Statistik penggajian berhasil diambil', stats));
  } catch (error) {
    console.error('Error fetching penggajian stats:', error);
    res.status(500).json(formatResponse(false, 'Error fetching penggajian stats', null, error.message));
  }
};

// Create penggajian baru
const createPenggajian = async (req, res) => {
  try {
    const { id_karyawan, tanggal, tunjangan = 0, potongan = 0 } = req.body;

    // Cek apakah karyawan exists dan aktif
    const karyawanQuery = `
      SELECT id_karyawan, nama, gaji_pokok, status 
      FROM karyawan 
      WHERE id_karyawan = ?
    `;
    const karyawanResult = await executeQuery(karyawanQuery, [id_karyawan]);

    if (!karyawanResult.data || karyawanResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Karyawan tidak ditemukan'));
    }

    const karyawan = karyawanResult.data[0];

    if (karyawan.status !== 'aktif') {
      return res.status(400).json(formatResponse(false, 'Karyawan tidak aktif'));
    }

    // Cek apakah sudah ada penggajian untuk karyawan di tanggal yang sama
    const existingQuery = `
      SELECT id_penggajian 
      FROM penggajian 
      WHERE id_karyawan = ? AND tanggal = ?
    `;
    const existingResult = await executeQuery(existingQuery, [id_karyawan, tanggal]);

    if (existingResult.data && existingResult.data.length > 0) {
      return res.status(400).json(formatResponse(false, 'Penggajian untuk tanggal ini sudah ada'));
    }

    // Calculate total gaji
    const gaji_pokok = parseFloat(karyawan.gaji_pokok);
    const total_tunjangan = parseFloat(tunjangan);
    const total_potongan = parseFloat(potongan);
    const total_gaji = gaji_pokok + total_tunjangan - total_potongan;

    // Insert penggajian
    const insertQuery = `
      INSERT INTO penggajian (id_karyawan, tanggal, gaji_pokok, tunjangan, potongan, total_gaji, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(insertQuery, [
      id_karyawan, tanggal, gaji_pokok, total_tunjangan, total_potongan, total_gaji
    ]);

    // Get the created penggajian with details
    const createdPenggajian = await getPenggajianByIdInternal(result.data.insertId);

    res.status(201).json(formatResponse(true, 'Penggajian berhasil dibuat', createdPenggajian));
  } catch (error) {
    console.error('Error creating penggajian:', error);
    res.status(500).json(formatResponse(false, 'Error creating penggajian', null, error.message));
  }
};

// Update penggajian
const updatePenggajian = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_karyawan, tanggal, tunjangan, potongan } = req.body;

    // Check if penggajian exists
    const existingQuery = 'SELECT * FROM penggajian WHERE id_penggajian = ?';
    const existingResult = await executeQuery(existingQuery, [id]);

    if (!existingResult.data || existingResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Penggajian tidak ditemukan'));
    }

    const existing = existingResult.data[0];

    // If id_karyawan is being changed, validate the new karyawan
    let gaji_pokok = existing.gaji_pokok;
    if (id_karyawan && id_karyawan !== existing.id_karyawan) {
      const karyawanQuery = `
        SELECT id_karyawan, nama, gaji_pokok, status 
        FROM karyawan 
        WHERE id_karyawan = ?
      `;
      const karyawanResult = await executeQuery(karyawanQuery, [id_karyawan]);

      if (!karyawanResult.data || karyawanResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Karyawan tidak ditemukan'));
      }

      const karyawan = karyawanResult.data[0];
      if (karyawan.status !== 'aktif') {
        return res.status(400).json(formatResponse(false, 'Karyawan tidak aktif'));
      }

      gaji_pokok = parseFloat(karyawan.gaji_pokok);
    }

    // Calculate new total gaji
    const new_tunjangan = tunjangan !== undefined ? parseFloat(tunjangan) : parseFloat(existing.tunjangan);
    const new_potongan = potongan !== undefined ? parseFloat(potongan) : parseFloat(existing.potongan);
    const total_gaji = parseFloat(gaji_pokok) + new_tunjangan - new_potongan;

    // Update penggajian
    const updateQuery = `
      UPDATE penggajian 
      SET id_karyawan = ?, tanggal = ?, gaji_pokok = ?, tunjangan = ?, potongan = ?, total_gaji = ?, updated_at = NOW()
      WHERE id_penggajian = ?
    `;

    await executeQuery(updateQuery, [
      id_karyawan || existing.id_karyawan,
      tanggal || existing.tanggal,
      gaji_pokok,
      new_tunjangan,
      new_potongan,
      total_gaji,
      id
    ]);

    // Get the updated penggajian with details
    const updatedPenggajian = await getPenggajianByIdInternal(id);

    res.json(formatResponse(true, 'Penggajian berhasil diupdate', updatedPenggajian));
  } catch (error) {
    console.error('Error updating penggajian:', error);
    res.status(500).json(formatResponse(false, 'Error updating penggajian', null, error.message));
  }
};

// Delete penggajian
const deletePenggajian = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if penggajian exists
    const existingQuery = 'SELECT * FROM penggajian WHERE id_penggajian = ?';
    const existingResult = await executeQuery(existingQuery, [id]);

    if (!existingResult.data || existingResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Penggajian tidak ditemukan'));
    }

    // Delete penggajian
    const deleteQuery = 'DELETE FROM penggajian WHERE id_penggajian = ?';
    await executeQuery(deleteQuery, [id]);

    res.json(formatResponse(true, 'Penggajian berhasil dihapus'));
  } catch (error) {
    console.error('Error deleting penggajian:', error);
    res.status(500).json(formatResponse(false, 'Error deleting penggajian', null, error.message));
  }
};

// Search penggajian
const searchPenggajian = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json(formatResponse(false, 'Query pencarian tidak boleh kosong'));
    }

    const searchQuery = `
      SELECT 
        p.id_penggajian,
        p.tanggal,
        p.gaji_pokok,
        p.tunjangan,
        p.potongan,
        p.total_gaji,
        k.nama as nama_karyawan,
        k.posisi
      FROM penggajian p
      LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
      WHERE k.nama LIKE ? OR k.posisi LIKE ?
      ORDER BY p.created_at DESC
      LIMIT 20
    `;

    const result = await executeQuery(searchQuery, [`%${query}%`, `%${query}%`]);

    res.json(formatResponse(true, 'Hasil pencarian penggajian', result.data));
  } catch (error) {
    console.error('Error searching penggajian:', error);
    res.status(500).json(formatResponse(false, 'Error searching penggajian', null, error.message));
  }
};

// Generate bulk penggajian untuk semua karyawan aktif
const generateBulkPenggajian = async (req, res) => {
  try {
    const { tanggal, default_tunjangan = 0, default_potongan = 0 } = req.body;

    if (!tanggal) {
      return res.status(400).json(formatResponse(false, 'Tanggal harus diisi'));
    }

    // Get all active karyawan
    const karyawanQuery = `
      SELECT id_karyawan, nama, gaji_pokok 
      FROM karyawan 
      WHERE status = 'aktif'
    `;
    const karyawanResult = await executeQuery(karyawanQuery);

    if (!karyawanResult.data || karyawanResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Tidak ada karyawan aktif'));
    }

    const createdPenggajian = [];
    const errors = [];

    // Process each karyawan
    for (const karyawan of karyawanResult.data) {
      try {
        // Check if penggajian already exists
        const existingQuery = `
          SELECT id_penggajian 
          FROM penggajian 
          WHERE id_karyawan = ? AND tanggal = ?
        `;
        const existingResult = await executeQuery(existingQuery, [karyawan.id_karyawan, tanggal]);

        if (existingResult.data && existingResult.data.length > 0) {
          errors.push(`Penggajian untuk ${karyawan.nama} sudah ada`);
          continue;
        }

        // Calculate total gaji
        const gaji_pokok = parseFloat(karyawan.gaji_pokok);
        const tunjangan = parseFloat(default_tunjangan);
        const potongan = parseFloat(default_potongan);
        const total_gaji = gaji_pokok + tunjangan - potongan;

        // Insert penggajian
        const insertQuery = `
          INSERT INTO penggajian (id_karyawan, tanggal, gaji_pokok, tunjangan, potongan, total_gaji, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const result = await executeQuery(insertQuery, [
          karyawan.id_karyawan, tanggal, gaji_pokok, tunjangan, potongan, total_gaji
        ]);

        createdPenggajian.push({
          id_penggajian: result.data.insertId,
          nama_karyawan: karyawan.nama,
          total_gaji: total_gaji
        });

      } catch (error) {
        console.error(`Error creating penggajian for ${karyawan.nama}:`, error);
        errors.push(`Gagal membuat penggajian untuk ${karyawan.nama}: ${error.message}`);
      }
    }

    const response = {
      created: createdPenggajian,
      errors: errors,
      summary: {
        total_karyawan: karyawanResult.data.length,
        berhasil_dibuat: createdPenggajian.length,
        gagal: errors.length
      }
    };

    res.status(201).json(formatResponse(true, 'Bulk penggajian selesai diproses', response));
  } catch (error) {
    console.error('Error generating bulk penggajian:', error);
    res.status(500).json(formatResponse(false, 'Error generating bulk penggajian', null, error.message));
  }
};

// Helper function untuk get penggajian by ID (internal use)
const getPenggajianByIdInternal = async (id) => {
  const query = `
    SELECT 
      p.id_penggajian,
      p.id_karyawan,
      p.tanggal,
      p.gaji_pokok,
      p.tunjangan,
      p.potongan,
      p.total_gaji,
      p.created_at,
      p.updated_at,
      k.nama as nama_karyawan,
      k.posisi,
      k.username,
      k.email,
      k.status as status_karyawan
    FROM penggajian p
    LEFT JOIN karyawan k ON p.id_karyawan = k.id_karyawan
    WHERE p.id_penggajian = ?
  `;

  const result = await executeQuery(query, [id]);
  return result.data[0];
};

module.exports = {
  getAllPenggajian,
  getPenggajianById,
  getPenggajianStats,
  createPenggajian,
  updatePenggajian,
  deletePenggajian,
  searchPenggajian,
  generateBulkPenggajian
};
