const { executeQuery } = require('../config/database');
const bcrypt = require('bcryptjs');
const { formatResponse } = require('../utils/response');

const karyawanController = {
  // Get all karyawan with pagination and filters
  async getAllKaryawan(req, res) {
    try {
      console.log("nashm");
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Build WHERE clause for filters
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      
      if (req.query.status) {
        whereClause += ' AND k.status = ?';
        queryParams.push(req.query.status);
      }
      
      if (req.query.posisi) {
        whereClause += ' AND k.posisi LIKE ?';
        queryParams.push(`%${req.query.posisi}%`);
      }
      
      if (req.query.id_role) {
        whereClause += ' AND k.id_role = ?';
        queryParams.push(req.query.id_role);
      }
      
      if (req.query.id_shift) {
        whereClause += ' AND k.id_shift = ?';
        queryParams.push(req.query.id_shift);
      }
      
      if (req.query.search) {
        whereClause += ' AND (k.nama LIKE ? OR k.email LIKE ? OR k.username LIKE ?)';
        const searchTerm = `%${req.query.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM karyawan k 
        LEFT JOIN role r ON k.id_role = r.id_role 
        LEFT JOIN shifts s ON k.id_shift = s.id_shift 
        ${whereClause}
      `;
      
      const countResult = await executeQuery(countQuery, queryParams);
      if (!countResult.success) {
        throw new Error(countResult.error);
      }
      const total = countResult.data[0].total;
      
      // Get karyawan data
      const dataQuery = `
        SELECT 
          k.id_karyawan,
          k.nama,
          k.posisi,
          k.gaji_pokok,
          k.username,
          k.email,
          k.status,
          k.created_at,
          k.updated_at,
          r.nama_role,
          s.nama_shift,
          s.jam_mulai,
          s.jam_selesai
        FROM karyawan k
        LEFT JOIN role r ON k.id_role = r.id_role
        LEFT JOIN shifts s ON k.id_shift = s.id_shift
        ${whereClause}
        ORDER BY k.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      queryParams.push(limit, offset);
      const dataResult = await executeQuery(dataQuery, queryParams);
      if (!dataResult.success) {
        throw new Error(dataResult.error);
      }
      const rows = dataResult.data;
      
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      };
      
      res.json(formatResponse(true, 'Data karyawan berhasil diambil', rows, pagination));
    } catch (error) {
      console.error('Error getting karyawan:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Get karyawan by ID
  async getKaryawanById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          k.id_karyawan,
          k.nama,
          k.posisi,
          k.gaji_pokok,
          k.username,
          k.email,
          k.status,
          k.created_at,
          k.updated_at,
          r.id_role,
          r.nama_role,
          s.id_shift,
          s.nama_shift,
          s.jam_mulai,
          s.jam_selesai
        FROM karyawan k
        LEFT JOIN role r ON k.id_role = r.id_role
        LEFT JOIN shifts s ON k.id_shift = s.id_shift
        WHERE k.id_karyawan = ?
      `;
      
      const result = await executeQuery(query, [id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      const rows = result.data;
      
      if (rows.length === 0) {
        return res.status(404).json(formatResponse(false, 'Karyawan tidak ditemukan'));
      }
      
      res.json(formatResponse(true, 'Data karyawan berhasil diambil', rows[0]));
    } catch (error) {
      console.error('Error getting karyawan by ID:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Create new karyawan
  async createKaryawan(req, res) {
    try {
      const { nama, posisi, gaji_pokok, id_shift, username, password, email, id_role, status = 'aktif' } = req.body;
      
      // Check if username or email already exists
      const checkQuery = 'SELECT id_karyawan FROM karyawan WHERE username = ? OR email = ?';
      const existingResult = await executeQuery(checkQuery, [username, email]);
      if (!existingResult.success) {
        throw new Error(existingResult.error);
      }
      
      if (existingResult.data.length > 0) {
        return res.status(400).json(formatResponse(false, 'Username atau email sudah digunakan'));
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const insertQuery = `
        INSERT INTO karyawan (nama, posisi, gaji_pokok, id_shift, username, password, email, id_role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const insertResult = await executeQuery(insertQuery, [
        nama, posisi, gaji_pokok, id_shift, username, hashedPassword, email, id_role, status
      ]);
      if (!insertResult.success) {
        throw new Error(insertResult.error);
      }
      
      // Get the created karyawan
      const newKaryawanQuery = `
        SELECT 
          k.id_karyawan,
          k.nama,
          k.posisi,
          k.gaji_pokok,
          k.username,
          k.email,
          k.status,
          k.created_at,
          r.nama_role,
          s.nama_shift
        FROM karyawan k
        LEFT JOIN role r ON k.id_role = r.id_role
        LEFT JOIN shifts s ON k.id_shift = s.id_shift
        WHERE k.id_karyawan = ?
      `;
      
      const newKaryawanResult = await executeQuery(newKaryawanQuery, [insertResult.insertId]);
      if (!newKaryawanResult.success) {
        throw new Error(newKaryawanResult.error);
      }
      
      res.status(201).json(formatResponse(true, 'Karyawan berhasil ditambahkan', newKaryawanResult.data[0]));
    } catch (error) {
      console.error('Error creating karyawan:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Update karyawan
  async updateKaryawan(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if karyawan exists
      const existingResult = await executeQuery('SELECT id_karyawan FROM karyawan WHERE id_karyawan = ?', [id]);
      if (!existingResult.success) {
        throw new Error(existingResult.error);
      }
      if (existingResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Karyawan tidak ditemukan'));
      }
      
      // If username or email is being updated, check for duplicates
      if (updateData.username || updateData.email) {
        const checkQuery = 'SELECT id_karyawan FROM karyawan WHERE (username = ? OR email = ?) AND id_karyawan != ?';
        const duplicateResult = await executeQuery(checkQuery, [
          updateData.username || '', 
          updateData.email || '', 
          id
        ]);
        if (!duplicateResult.success) {
          throw new Error(duplicateResult.error);
        }
        
        if (duplicateResult.data.length > 0) {
          return res.status(400).json(formatResponse(false, 'Username atau email sudah digunakan'));
        }
      }
      
      // If password is being updated, hash it
      if (updateData.password) {
        const saltRounds = 12;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
      
      // Build update query
      const updateFields = [];
      const updateValues = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(updateData[key]);
        }
      });
      
      if (updateFields.length === 0) {
        return res.status(400).json(formatResponse(false, 'Tidak ada data yang diupdate'));
      }
      
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      
      const updateQuery = `UPDATE karyawan SET ${updateFields.join(', ')} WHERE id_karyawan = ?`;
      const updateResult = await executeQuery(updateQuery, updateValues);
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }
      
      // Get updated karyawan
      const updatedKaryawanQuery = `
        SELECT 
          k.id_karyawan,
          k.nama,
          k.posisi,
          k.gaji_pokok,
          k.username,
          k.email,
          k.status,
          k.updated_at,
          r.nama_role,
          s.nama_shift
        FROM karyawan k
        LEFT JOIN role r ON k.id_role = r.id_role
        LEFT JOIN shifts s ON k.id_shift = s.id_shift
        WHERE k.id_karyawan = ?
      `;
      
      const updatedResult = await executeQuery(updatedKaryawanQuery, [id]);
      if (!updatedResult.success) {
        throw new Error(updatedResult.error);
      }
      
      res.json(formatResponse(true, 'Data karyawan berhasil diupdate', updatedResult.data[0]));
    } catch (error) {
      console.error('Error updating karyawan:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Delete karyawan (soft delete by changing status)
  async deleteKaryawan(req, res) {
    try {
      const { id } = req.params;
      
      // Check if karyawan exists
      const existingResult = await executeQuery('SELECT id_karyawan FROM karyawan WHERE id_karyawan = ?', [id]);
      if (!existingResult.success) {
        throw new Error(existingResult.error);
      }
      if (existingResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Karyawan tidak ditemukan'));
      }
      
      // Soft delete by changing status to nonaktif
      const deleteResult = await executeQuery('UPDATE karyawan SET status = ?, updated_at = NOW() WHERE id_karyawan = ?', ['nonaktif', id]);
      if (!deleteResult.success) {
        throw new Error(deleteResult.error);
      }
      
      res.json(formatResponse(true, 'Karyawan berhasil dinonaktifkan'));
    } catch (error) {
      console.error('Error deleting karyawan:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Get karyawan statistics
  async getKaryawanStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_karyawan,
          SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END) as karyawan_aktif,
          SUM(CASE WHEN status = 'nonaktif' THEN 1 ELSE 0 END) as karyawan_nonaktif,
          AVG(gaji_pokok) as rata_rata_gaji,
          MIN(gaji_pokok) as gaji_minimum,
          MAX(gaji_pokok) as gaji_maksimum
        FROM karyawan
      `;
      
      const posisiQuery = `
        SELECT posisi, COUNT(*) as jumlah
        FROM karyawan 
        WHERE status = 'aktif'
        GROUP BY posisi
        ORDER BY jumlah DESC
      `;
      
      const roleQuery = `
        SELECT r.nama_role, COUNT(*) as jumlah
        FROM karyawan k
        JOIN role r ON k.id_role = r.id_role
        WHERE k.status = 'aktif'
        GROUP BY r.id_role, r.nama_role
        ORDER BY jumlah DESC
      `;
      
      const statsResult = await executeQuery(statsQuery);
      if (!statsResult.success) {
        throw new Error(statsResult.error);
      }
      
      const posisiResult = await executeQuery(posisiQuery);
      if (!posisiResult.success) {
        throw new Error(posisiResult.error);
      }
      
      const roleResult = await executeQuery(roleQuery);
      if (!roleResult.success) {
        throw new Error(roleResult.error);
      }
      
      const stats = {
        ...statsResult.data[0],
        rata_rata_gaji: parseFloat(statsResult.data[0].rata_rata_gaji).toFixed(2),
        distribusi_posisi: posisiResult.data,
        distribusi_role: roleResult.data
      };
      
      res.json(formatResponse(true, 'Statistik karyawan berhasil diambil', stats));
    } catch (error) {
      console.error('Error getting karyawan stats:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  }
};

module.exports = karyawanController;
