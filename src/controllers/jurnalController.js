const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

// Get all jurnal dengan pagination, filter, dan search
const getAllJurnal = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const akun = req.query.akun || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';
    const tipe_transaksi = req.query.tipe || ''; // debet/kredit

    // Build where clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(j.keterangan LIKE ? OR a.nama_akun LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (akun) {
      whereConditions.push('j.id_akun = ?');
      queryParams.push(akun);
    }

    if (startDate) {
      whereConditions.push('j.tanggal_jurnal >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('j.tanggal_jurnal <= ?');
      queryParams.push(endDate);
    }

    if (tipe_transaksi === 'debet') {
      whereConditions.push('j.debet > 0');
    } else if (tipe_transaksi === 'kredit') {
      whereConditions.push('j.kredit > 0');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM jurnal j
      LEFT JOIN akun a ON j.id_akun = a.id_akun
      ${whereClause}
    `;
    
    const countResult = await executeQuery(countQuery, queryParams);
    const totalData = countResult.data[0].total;
    const totalPages = Math.ceil(totalData / limit);

    // Get jurnal data dengan detail akun
    const dataQuery = `
      SELECT 
        j.id_jurnal,
        j.id_akun,
        j.tanggal_jurnal,
        j.debet,
        j.kredit,
        j.keterangan,
        j.created_at,
        j.updated_at,
        a.nama_akun,
        a.tipe as tipe_akun
      FROM jurnal j
      LEFT JOIN akun a ON j.id_akun = a.id_akun
      ${whereClause}
      ORDER BY j.tanggal_jurnal DESC, j.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const jurnalData = await executeQuery(dataQuery, [...queryParams, limit, offset]);

    res.json(formatResponse(true, 'Data jurnal berhasil diambil', {
      data: jurnalData.data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalData: totalData,
        limit: limit
      }
    }));
  } catch (error) {
    console.error('Error fetching jurnal:', error);
    res.status(500).json(formatResponse(false, 'Error fetching jurnal', null, error.message));
  }
};

// Get jurnal by ID
const getJurnalById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        j.id_jurnal,
        j.id_akun,
        j.tanggal_jurnal,
        j.debet,
        j.kredit,
        j.keterangan,
        j.created_at,
        j.updated_at,
        a.nama_akun,
        a.tipe as tipe_akun
      FROM jurnal j
      LEFT JOIN akun a ON j.id_akun = a.id_akun
      WHERE j.id_jurnal = ?
    `;

    const result = await executeQuery(query, [id]);

    if (!result.data || result.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Jurnal tidak ditemukan'));
    }

    res.json(formatResponse(true, 'Detail jurnal berhasil diambil', result.data[0]));
  } catch (error) {
    console.error('Error fetching jurnal detail:', error);
    res.status(500).json(formatResponse(false, 'Error fetching jurnal detail', null, error.message));
  }
};

// Get statistik jurnal
const getJurnalStats = async (req, res) => {
  try {
    // Total jurnal entries
    const totalQuery = 'SELECT COUNT(*) as total_jurnal FROM jurnal';
    const totalResult = await executeQuery(totalQuery);

    // Total debet
    const totalDebetQuery = 'SELECT COALESCE(SUM(debet), 0) as total_debet FROM jurnal';
    const totalDebetResult = await executeQuery(totalDebetQuery);

    // Total kredit
    const totalKreditQuery = 'SELECT COALESCE(SUM(kredit), 0) as total_kredit FROM jurnal';
    const totalKreditResult = await executeQuery(totalKreditQuery);

    // Jurnal bulan ini
    const monthlyQuery = `
      SELECT COUNT(*) as jurnal_bulan_ini 
      FROM jurnal 
      WHERE MONTH(tanggal_jurnal) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal_jurnal) = YEAR(CURRENT_DATE())
    `;
    const monthlyResult = await executeQuery(monthlyQuery);

    // Saldo per tipe akun
    const saldoPerTipeQuery = `
      SELECT 
        a.tipe,
        COUNT(j.id_jurnal) as jumlah_transaksi,
        COALESCE(SUM(j.debet), 0) as total_debet,
        COALESCE(SUM(j.kredit), 0) as total_kredit,
        COALESCE(SUM(j.debet) - SUM(j.kredit), 0) as saldo_bersih
      FROM akun a
      LEFT JOIN jurnal j ON a.id_akun = j.id_akun
      GROUP BY a.tipe
      ORDER BY a.tipe
    `;
    const saldoPerTipe = await executeQuery(saldoPerTipeQuery);

    // Top 5 akun dengan transaksi terbanyak
    const topAkunQuery = `
      SELECT 
        a.id_akun,
        a.nama_akun,
        a.tipe,
        COUNT(j.id_jurnal) as jumlah_transaksi,
        COALESCE(SUM(j.debet), 0) as total_debet,
        COALESCE(SUM(j.kredit), 0) as total_kredit
      FROM akun a
      LEFT JOIN jurnal j ON a.id_akun = j.id_akun
      GROUP BY a.id_akun, a.nama_akun, a.tipe
      HAVING jumlah_transaksi > 0
      ORDER BY jumlah_transaksi DESC
      LIMIT 5
    `;
    const topAkun = await executeQuery(topAkunQuery);

    // Jurnal per bulan (6 bulan terakhir)
    const monthlyTrendQuery = `
      SELECT 
        DATE_FORMAT(tanggal_jurnal, '%Y-%m') as bulan,
        COUNT(*) as jumlah_transaksi,
        COALESCE(SUM(debet), 0) as total_debet,
        COALESCE(SUM(kredit), 0) as total_kredit
      FROM jurnal 
      WHERE tanggal_jurnal >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(tanggal_jurnal, '%Y-%m')
      ORDER BY bulan DESC
    `;
    const monthlyTrend = await executeQuery(monthlyTrendQuery);

    const stats = {
      overview: {
        total_jurnal: totalResult.data[0].total_jurnal,
        total_debet: totalDebetResult.data[0].total_debet,
        total_kredit: totalKreditResult.data[0].total_kredit,
        jurnal_bulan_ini: monthlyResult.data[0].jurnal_bulan_ini,
        balance_check: totalDebetResult.data[0].total_debet === totalKreditResult.data[0].total_kredit
      },
      saldo_per_tipe: saldoPerTipe.data,
      top_akun: topAkun.data,
      monthly_trend: monthlyTrend.data
    };

    res.json(formatResponse(true, 'Statistik jurnal berhasil diambil', stats));
  } catch (error) {
    console.error('Error fetching jurnal stats:', error);
    res.status(500).json(formatResponse(false, 'Error fetching jurnal stats', null, error.message));
  }
};

// Create jurnal entry baru
const createJurnal = async (req, res) => {
  try {
    const { id_akun, tanggal_jurnal, debet = 0, kredit = 0, keterangan } = req.body;

    // Validate that either debet or kredit is > 0, but not both
    if ((debet > 0 && kredit > 0) || (debet === 0 && kredit === 0)) {
      return res.status(400).json(formatResponse(false, 'Harus mengisi debet atau kredit, tidak boleh keduanya atau kosong'));
    }

    // Cek apakah akun exists
    const akunQuery = 'SELECT id_akun, nama_akun, tipe FROM akun WHERE id_akun = ?';
    const akunResult = await executeQuery(akunQuery, [id_akun]);

    if (!akunResult.data || akunResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Akun tidak ditemukan'));
    }

    // Insert jurnal
    const insertQuery = `
      INSERT INTO jurnal (id_akun, tanggal_jurnal, debet, kredit, keterangan, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await executeQuery(insertQuery, [
      id_akun, tanggal_jurnal, debet, kredit, keterangan
    ]);

    // Get the created jurnal with details
    const createdJurnal = await getJurnalByIdInternal(result.data.insertId);

    res.status(201).json(formatResponse(true, 'Jurnal berhasil dibuat', createdJurnal));
  } catch (error) {
    console.error('Error creating jurnal:', error);
    res.status(500).json(formatResponse(false, 'Error creating jurnal', null, error.message));
  }
};

// Update jurnal
const updateJurnal = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_akun, tanggal_jurnal, debet = 0, kredit = 0, keterangan } = req.body;

    // Check if jurnal exists
    const existingQuery = 'SELECT * FROM jurnal WHERE id_jurnal = ?';
    const existingResult = await executeQuery(existingQuery, [id]);

    if (!existingResult.data || existingResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Jurnal tidak ditemukan'));
    }

    // Validate that either debet or kredit is > 0, but not both
    if ((debet > 0 && kredit > 0) || (debet === 0 && kredit === 0)) {
      return res.status(400).json(formatResponse(false, 'Harus mengisi debet atau kredit, tidak boleh keduanya atau kosong'));
    }

    // If id_akun is being changed, validate the new akun
    if (id_akun) {
      const akunQuery = 'SELECT id_akun, nama_akun, tipe FROM akun WHERE id_akun = ?';
      const akunResult = await executeQuery(akunQuery, [id_akun]);

      if (!akunResult.data || akunResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Akun tidak ditemukan'));
      }
    }

    // Update jurnal
    const updateQuery = `
      UPDATE jurnal 
      SET id_akun = ?, tanggal_jurnal = ?, debet = ?, kredit = ?, keterangan = ?, updated_at = NOW()
      WHERE id_jurnal = ?
    `;

    await executeQuery(updateQuery, [
      id_akun || existingResult.data[0].id_akun,
      tanggal_jurnal || existingResult.data[0].tanggal_jurnal,
      debet,
      kredit,
      keterangan || existingResult.data[0].keterangan,
      id
    ]);

    // Get the updated jurnal with details
    const updatedJurnal = await getJurnalByIdInternal(id);

    res.json(formatResponse(true, 'Jurnal berhasil diupdate', updatedJurnal));
  } catch (error) {
    console.error('Error updating jurnal:', error);
    res.status(500).json(formatResponse(false, 'Error updating jurnal', null, error.message));
  }
};

// Delete jurnal
const deleteJurnal = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if jurnal exists
    const existingQuery = 'SELECT * FROM jurnal WHERE id_jurnal = ?';
    const existingResult = await executeQuery(existingQuery, [id]);

    if (!existingResult.data || existingResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Jurnal tidak ditemukan'));
    }

    // Delete jurnal
    const deleteQuery = 'DELETE FROM jurnal WHERE id_jurnal = ?';
    await executeQuery(deleteQuery, [id]);

    res.json(formatResponse(true, 'Jurnal berhasil dihapus'));
  } catch (error) {
    console.error('Error deleting jurnal:', error);
    res.status(500).json(formatResponse(false, 'Error deleting jurnal', null, error.message));
  }
};

// Search jurnal
const searchJurnal = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json(formatResponse(false, 'Query pencarian tidak boleh kosong'));
    }

    const searchQuery = `
      SELECT 
        j.id_jurnal,
        j.tanggal_jurnal,
        j.debet,
        j.kredit,
        j.keterangan,
        a.nama_akun,
        a.tipe as tipe_akun
      FROM jurnal j
      LEFT JOIN akun a ON j.id_akun = a.id_akun
      WHERE j.keterangan LIKE ? OR a.nama_akun LIKE ?
      ORDER BY j.tanggal_jurnal DESC
      LIMIT 20
    `;

    const result = await executeQuery(searchQuery, [`%${query}%`, `%${query}%`]);

    res.json(formatResponse(true, 'Hasil pencarian jurnal', result.data));
  } catch (error) {
    console.error('Error searching jurnal:', error);
    res.status(500).json(formatResponse(false, 'Error searching jurnal', null, error.message));
  }
};

// Get trial balance (neraca saldo)
const getTrialBalance = async (req, res) => {
  try {
    const { periode } = req.query; // Format: YYYY-MM or YYYY

    let whereClause = '';
    let queryParams = [];

    if (periode) {
      if (periode.length === 7) { // YYYY-MM format
        whereClause = 'WHERE DATE_FORMAT(j.tanggal_jurnal, "%Y-%m") = ?';
        queryParams.push(periode);
      } else if (periode.length === 4) { // YYYY format
        whereClause = 'WHERE YEAR(j.tanggal_jurnal) = ?';
        queryParams.push(periode);
      }
    }

    const trialBalanceQuery = `
      SELECT 
        a.id_akun,
        a.nama_akun,
        a.tipe,
        COALESCE(SUM(j.debet), 0) as total_debet,
        COALESCE(SUM(j.kredit), 0) as total_kredit,
        COALESCE(SUM(j.debet) - SUM(j.kredit), 0) as saldo
      FROM akun a
      LEFT JOIN jurnal j ON a.id_akun = j.id_akun ${whereClause}
      GROUP BY a.id_akun, a.nama_akun, a.tipe
      ORDER BY a.tipe, a.nama_akun
    `;

    const result = await executeQuery(trialBalanceQuery, queryParams);

    // Calculate totals
    const totals = result.data.reduce((acc, item) => {
      acc.total_debet += parseFloat(item.total_debet);
      acc.total_kredit += parseFloat(item.total_kredit);
      return acc;
    }, { total_debet: 0, total_kredit: 0 });

    const trialBalance = {
      periode: periode || 'Semua periode',
      accounts: result.data,
      totals: totals,
      is_balanced: totals.total_debet === totals.total_kredit
    };

    res.json(formatResponse(true, 'Neraca saldo berhasil diambil', trialBalance));
  } catch (error) {
    console.error('Error fetching trial balance:', error);
    res.status(500).json(formatResponse(false, 'Error fetching trial balance', null, error.message));
  }
};

// Get jurnal umum (general ledger) untuk akun tertentu
const getGeneralLedger = async (req, res) => {
  try {
    const { id_akun } = req.params;
    const { start_date, end_date } = req.query;

    // Validate akun exists
    const akunQuery = 'SELECT id_akun, nama_akun, tipe FROM akun WHERE id_akun = ?';
    const akunResult = await executeQuery(akunQuery, [id_akun]);

    if (!akunResult.data || akunResult.data.length === 0) {
      return res.status(404).json(formatResponse(false, 'Akun tidak ditemukan'));
    }

    const akun = akunResult.data[0];

    // Build where clause for date range
    let whereClause = 'WHERE j.id_akun = ?';
    let queryParams = [id_akun];

    if (start_date) {
      whereClause += ' AND j.tanggal_jurnal >= ?';
      queryParams.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND j.tanggal_jurnal <= ?';
      queryParams.push(end_date);
    }

    // Get saldo awal (before start_date if specified)
    let saldoAwal = 0;
    if (start_date) {
      const saldoAwalQuery = `
        SELECT 
          COALESCE(SUM(debet), 0) - COALESCE(SUM(kredit), 0) as saldo_awal
        FROM jurnal 
        WHERE id_akun = ? AND tanggal_jurnal < ?
      `;
      const saldoAwalResult = await executeQuery(saldoAwalQuery, [id_akun, start_date]);
      saldoAwal = parseFloat(saldoAwalResult.data[0].saldo_awal);
    }

    // Get transactions
    const transactionsQuery = `
      SELECT 
        j.id_jurnal,
        j.tanggal_jurnal,
        j.debet,
        j.kredit,
        j.keterangan,
        j.created_at
      FROM jurnal j
      ${whereClause}
      ORDER BY j.tanggal_jurnal ASC, j.created_at ASC
    `;

    const transactions = await executeQuery(transactionsQuery, queryParams);

    // Calculate running balance
    let runningBalance = saldoAwal;
    const transactionsWithBalance = transactions.data.map(transaction => {
      runningBalance += parseFloat(transaction.debet) - parseFloat(transaction.kredit);
      return {
        ...transaction,
        saldo: runningBalance
      };
    });

    const generalLedger = {
      akun: akun,
      periode: {
        start_date: start_date || 'Awal',
        end_date: end_date || 'Akhir'
      },
      saldo_awal: saldoAwal,
      transactions: transactionsWithBalance,
      saldo_akhir: runningBalance,
      summary: {
        total_transaksi: transactions.data.length,
        total_debet: transactions.data.reduce((sum, t) => sum + parseFloat(t.debet), 0),
        total_kredit: transactions.data.reduce((sum, t) => sum + parseFloat(t.kredit), 0)
      }
    };

    res.json(formatResponse(true, 'Buku besar berhasil diambil', generalLedger));
  } catch (error) {
    console.error('Error fetching general ledger:', error);
    res.status(500).json(formatResponse(false, 'Error fetching general ledger', null, error.message));
  }
};

// Helper function untuk get jurnal by ID (internal use)
const getJurnalByIdInternal = async (id) => {
  const query = `
    SELECT 
      j.id_jurnal,
      j.id_akun,
      j.tanggal_jurnal,
      j.debet,
      j.kredit,
      j.keterangan,
      j.created_at,
      j.updated_at,
      a.nama_akun,
      a.tipe as tipe_akun
    FROM jurnal j
    LEFT JOIN akun a ON j.id_akun = a.id_akun
    WHERE j.id_jurnal = ?
  `;

  const result = await executeQuery(query, [id]);
  return result.data[0];
};

module.exports = {
  getAllJurnal,
  getJurnalById,
  getJurnalStats,
  createJurnal,
  updateJurnal,
  deleteJurnal,
  searchJurnal,
  getTrialBalance,
  getGeneralLedger
};
