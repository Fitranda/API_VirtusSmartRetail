const { executeQuery } = require('../config/database');
const { successResponse, errorResponse, paginationResponse } = require('../utils/response');

class AbsensiController {
  // Create new absensi (clock in)
  async createAbsensi(req, res) {
    try {
      const { id_karyawan, tanggal, jam_masuk, status_hadir } = req.body;

      // Check if absensi already exists for this karyawan on this date
      const checkQuery = 'SELECT id_absensi FROM absensi WHERE id_karyawan = ? AND tanggal = ?';
      const existingResult = await executeQuery(checkQuery, [id_karyawan, tanggal]);

      if (existingResult.success && existingResult.data.length > 0) {
        return errorResponse(res, 'Absensi untuk tanggal ini sudah ada', null, 400);
      }

      // Verify karyawan exists and is active
      const karyawanQuery = 'SELECT id_karyawan, nama FROM karyawan WHERE id_karyawan = ? AND status = \'aktif\'';
      const karyawanResult = await executeQuery(karyawanQuery, [id_karyawan]);

      if (!karyawanResult.success || karyawanResult.data.length === 0) {
        return errorResponse(res, 'Karyawan tidak ditemukan atau tidak aktif', null, 404);
      }

      // Create absensi record
      const insertQuery = `
        INSERT INTO absensi (id_karyawan, tanggal, jam_masuk, jam_keluar, status_hadir, created_at, updated_at)
        VALUES (?, ?, ?, '00:00:00', ?, NOW(), NOW())
      `;
      
      const insertResult = await executeQuery(insertQuery, [id_karyawan, tanggal, jam_masuk, status_hadir]);

      if (!insertResult.success) {
        return errorResponse(res, 'Gagal membuat absensi', insertResult.error, 500);
      }

      // Get the created absensi with karyawan info
      const selectQuery = `
        SELECT 
          a.id_absensi,
          a.id_karyawan,
          a.tanggal,
          a.jam_masuk,
          a.jam_keluar,
          a.status_hadir,
          a.created_at,
          k.nama as nama_karyawan,
          k.posisi
        FROM absensi a
        JOIN karyawan k ON a.id_karyawan = k.id_karyawan
        WHERE a.id_absensi = ?
      `;
      
      const selectResult = await executeQuery(selectQuery, [insertResult.data.insertId]);

      if (!selectResult.success) {
        return errorResponse(res, 'Gagal mengambil data absensi', selectResult.error, 500);
      }

      return successResponse(res, 'Absensi berhasil dibuat', selectResult.data[0], 201);

    } catch (error) {
      console.error('Create absensi error:', error);
      return errorResponse(res, 'Server error saat membuat absensi', error.message, 500);
    }
  }

  // Update absensi (clock out)
  async updateAbsensi(req, res) {
    try {
      const { id } = req.params;
      const { jam_keluar, status_hadir } = req.body;

      // Check if absensi exists
      const checkQuery = `
        SELECT 
          a.id_absensi,
          a.id_karyawan,
          a.tanggal,
          a.jam_masuk,
          a.jam_keluar,
          a.status_hadir,
          k.nama as nama_karyawan
        FROM absensi a
        JOIN karyawan k ON a.id_karyawan = k.id_karyawan
        WHERE a.id_absensi = ?
      `;
      
      const existingResult = await executeQuery(checkQuery, [id]);

      if (!existingResult.success || existingResult.data.length === 0) {
        return errorResponse(res, 'Absensi tidak ditemukan', null, 404);
      }

      const existingAbsensi = existingResult.data[0];

      // Prepare update data
      const updateData = {};
      const updateParams = [];
      let updateQuery = 'UPDATE absensi SET ';
      const updateFields = [];

      if (jam_keluar !== undefined) {
        updateFields.push('jam_keluar = ?');
        updateParams.push(jam_keluar);
      }

      if (status_hadir !== undefined) {
        updateFields.push('status_hadir = ?');
        updateParams.push(status_hadir);
      }

      if (updateFields.length === 0) {
        return errorResponse(res, 'Tidak ada data yang diupdate', null, 400);
      }

      updateFields.push('updated_at = NOW()');
      updateQuery += updateFields.join(', ') + ' WHERE id_absensi = ?';
      updateParams.push(id);

      const updateResult = await executeQuery(updateQuery, updateParams);

      if (!updateResult.success) {
        return errorResponse(res, 'Gagal mengupdate absensi', updateResult.error, 500);
      }

      // Get updated absensi
      const updatedResult = await executeQuery(checkQuery, [id]);
      
      return successResponse(res, 'Absensi berhasil diupdate', updatedResult.data[0]);

    } catch (error) {
      console.error('Update absensi error:', error);
      return errorResponse(res, 'Server error saat mengupdate absensi', error.message, 500);
    }
  }

  // Get all absensi with pagination and filters
  async getAllAbsensi(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const karyawan_id = req.query.karyawan_id || '';
      const tanggal_dari = req.query.tanggal_dari || '';
      const tanggal_sampai = req.query.tanggal_sampai || '';
      const status_hadir = req.query.status_hadir || '';

      let whereClause = 'WHERE 1=1';
      let queryParams = [];

      if (karyawan_id) {
        whereClause += ' AND a.id_karyawan = ?';
        queryParams.push(karyawan_id);
      }

      if (tanggal_dari) {
        whereClause += ' AND a.tanggal >= ?';
        queryParams.push(tanggal_dari);
      }

      if (tanggal_sampai) {
        whereClause += ' AND a.tanggal <= ?';
        queryParams.push(tanggal_sampai);
      }

      if (status_hadir) {
        whereClause += ' AND a.status_hadir = ?';
        queryParams.push(status_hadir);
      }

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM absensi a
        JOIN karyawan k ON a.id_karyawan = k.id_karyawan
        ${whereClause}
      `;
      const countResult = await executeQuery(countQuery, queryParams);
      const total = countResult.data[0].total;

      // Get absensi data
      const absensiQuery = `
        SELECT 
          a.id_absensi,
          a.id_karyawan,
          a.tanggal,
          a.jam_masuk,
          a.jam_keluar,
          a.status_hadir,
          a.created_at,
          a.updated_at,
          k.nama as nama_karyawan,
          k.posisi,
          k.username
        FROM absensi a
        JOIN karyawan k ON a.id_karyawan = k.id_karyawan
        ${whereClause}
        ORDER BY a.tanggal DESC, a.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const absensiResult = await executeQuery(absensiQuery, [...queryParams, limit, offset]);

      if (!absensiResult.success) {
        return errorResponse(res, 'Gagal mengambil data absensi', absensiResult.error, 500);
      }

      const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };

      return paginationResponse(res, 'Data absensi berhasil diambil', absensiResult.data, pagination);

    } catch (error) {
      console.error('Get all absensi error:', error);
      return errorResponse(res, 'Server error saat mengambil data absensi', error.message, 500);
    }
  }

  // Get absensi by ID
  async getAbsensiById(req, res) {
    try {
      const { id } = req.params;

      const absensiQuery = `
        SELECT 
          a.id_absensi,
          a.id_karyawan,
          a.tanggal,
          a.jam_masuk,
          a.jam_keluar,
          a.status_hadir,
          a.created_at,
          a.updated_at,
          k.nama as nama_karyawan,
          k.posisi,
          k.username,
          k.email
        FROM absensi a
        JOIN karyawan k ON a.id_karyawan = k.id_karyawan
        WHERE a.id_absensi = ?
      `;
      
      const absensiResult = await executeQuery(absensiQuery, [id]);

      if (!absensiResult.success || absensiResult.data.length === 0) {
        return errorResponse(res, 'Absensi tidak ditemukan', null, 404);
      }

      return successResponse(res, 'Data absensi berhasil diambil', absensiResult.data[0]);

    } catch (error) {
      console.error('Get absensi by ID error:', error);
      return errorResponse(res, 'Server error saat mengambil data absensi', error.message, 500);
    }
  }

  // Delete absensi
  async deleteAbsensi(req, res) {
    try {
      const { id } = req.params;

      // Check if absensi exists
      const checkQuery = 'SELECT id_absensi FROM absensi WHERE id_absensi = ?';
      const existingResult = await executeQuery(checkQuery, [id]);

      if (!existingResult.success || existingResult.data.length === 0) {
        return errorResponse(res, 'Absensi tidak ditemukan', null, 404);
      }

      // Delete absensi
      const deleteQuery = 'DELETE FROM absensi WHERE id_absensi = ?';
      const deleteResult = await executeQuery(deleteQuery, [id]);

      if (!deleteResult.success) {
        return errorResponse(res, 'Gagal menghapus absensi', deleteResult.error, 500);
      }

      return successResponse(res, 'Absensi berhasil dihapus');

    } catch (error) {
      console.error('Delete absensi error:', error);
      return errorResponse(res, 'Server error saat menghapus absensi', error.message, 500);
    }
  }

  // Get absensi summary/statistics
  async getAbsensiSummary(req, res) {
    try {
      const { karyawan_id, bulan, tahun } = req.query;

      let whereClause = 'WHERE 1=1';
      let queryParams = [];

      if (karyawan_id) {
        whereClause += ' AND a.id_karyawan = ?';
        queryParams.push(karyawan_id);
      }

      if (bulan && tahun) {
        whereClause += ' AND MONTH(a.tanggal) = ? AND YEAR(a.tanggal) = ?';
        queryParams.push(bulan, tahun);
      } else if (tahun) {
        whereClause += ' AND YEAR(a.tanggal) = ?';
        queryParams.push(tahun);
      }

      const summaryQuery = `
        SELECT 
          COUNT(*) as total_hari_kerja,
          SUM(CASE WHEN a.status_hadir = 'Hadir' THEN 1 ELSE 0 END) as total_hadir,
          SUM(CASE WHEN a.status_hadir = 'Izin' THEN 1 ELSE 0 END) as total_izin,
          SUM(CASE WHEN a.status_hadir = 'Sakit' THEN 1 ELSE 0 END) as total_sakit,
          SUM(CASE WHEN a.status_hadir = 'Alpha' THEN 1 ELSE 0 END) as total_alpha,
          AVG(TIME_TO_SEC(a.jam_masuk)) as avg_jam_masuk_seconds,
          AVG(CASE WHEN a.jam_keluar != '00:00:00' THEN TIME_TO_SEC(a.jam_keluar) ELSE NULL END) as avg_jam_keluar_seconds
        FROM absensi a
        ${whereClause}
      `;
      
      const summaryResult = await executeQuery(summaryQuery, queryParams);

      if (!summaryResult.success) {
        return errorResponse(res, 'Gagal mengambil ringkasan absensi', summaryResult.error, 500);
      }

      const summary = summaryResult.data[0];
      
      // Convert average seconds back to time format
      const formatTime = (seconds) => {
        if (!seconds) return null;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      };

      const formattedSummary = {
        total_hari_kerja: summary.total_hari_kerja,
        total_hadir: summary.total_hadir,
        total_izin: summary.total_izin,
        total_sakit: summary.total_sakit,
        total_alpha: summary.total_alpha,
        persentase_kehadiran: summary.total_hari_kerja > 0 ? 
          ((summary.total_hadir / summary.total_hari_kerja) * 100).toFixed(2) : 0,
        rata_rata_jam_masuk: formatTime(summary.avg_jam_masuk_seconds),
        rata_rata_jam_keluar: formatTime(summary.avg_jam_keluar_seconds)
      };

      return successResponse(res, 'Ringkasan absensi berhasil diambil', formattedSummary);

    } catch (error) {
      console.error('Get absensi summary error:', error);
      return errorResponse(res, 'Server error saat mengambil ringkasan absensi', error.message, 500);
    }
  }
}

module.exports = new AbsensiController();
