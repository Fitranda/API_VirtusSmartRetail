const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

const akunController = {
  // Get all akun with pagination and filtering
  async getAllAkun(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const tipe = req.query.tipe || '';

      // Build WHERE clause for filtering
      let whereClause = '';
      let queryParams = [];

      if (search || tipe) {
        const conditions = [];
        
        if (search) {
          conditions.push('nama_akun LIKE ?');
          queryParams.push(`%${search}%`);
        }
        
        if (tipe) {
          conditions.push('tipe = ?');
          queryParams.push(tipe);
        }
        
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM akun ${whereClause}`;
      const countResult = await executeQuery(countQuery, queryParams);
      if (!countResult.success) {
        throw new Error(countResult.error);
      }
      const totalItems = countResult.data[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated data
      const dataQuery = `
        SELECT id_akun, nama_akun, tipe, created_at, updated_at
        FROM akun 
        ${whereClause}
        ORDER BY id_akun DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const dataResult = await executeQuery(dataQuery, [...queryParams, limit, offset]);
      
      if (!dataResult.success) {
        throw new Error(dataResult.error);
      }
      const rows = dataResult.data;

      // Pagination info
      const pagination = {
        current_page: page,
        per_page: limit,
        total: totalItems,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      };

      res.json(formatResponse(true, 'Data akun berhasil diambil', rows, pagination));    } catch (error) {
      console.error('Error in getAllAkun:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengambil data akun', null, error.message));
    }
  },

  // Get akun by ID
  async getAkunById(req, res) {
    try {
      const { id } = req.params;
        const query = `
        SELECT id_akun, nama_akun, tipe, created_at, updated_at
        FROM akun 
        WHERE id_akun = ?
      `;
      
      const result = await executeQuery(query, [id]);
      if (!result.success) {
        throw new Error(result.error);
      }
        if (result.data.length === 0) {
        res.status(404).json(formatResponse(false, 'Akun tidak ditemukan'));
      } else {
        res.json(formatResponse(true, 'Akun berhasil diambil', result.data[0]));
      }    } catch (error) {
      console.error('Error in getAkunById:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengambil data akun', null, error.message));
    }
  },

  // Get akun statistics
  async getAkunStats(req, res) {
    try {      const statsQuery = `
        SELECT 
          COUNT(*) as total_akun,
          SUM(CASE WHEN tipe = 'Asset' THEN 1 ELSE 0 END) as total_asset,
          SUM(CASE WHEN tipe = 'Kewajiban' THEN 1 ELSE 0 END) as total_kewajiban,
          SUM(CASE WHEN tipe = 'Ekuitas' THEN 1 ELSE 0 END) as total_ekuitas,
          SUM(CASE WHEN tipe = 'Pendapatan' THEN 1 ELSE 0 END) as total_pendapatan,
          SUM(CASE WHEN tipe = 'Beban' THEN 1 ELSE 0 END) as total_beban
        FROM akun
      `;

      const statsResult = await executeQuery(statsQuery);
      if (!statsResult.success) {
        throw new Error(statsResult.error);
      }

      // Get distribution by type
      const distributionQuery = `
        SELECT tipe, COUNT(*) as jumlah
        FROM akun
        GROUP BY tipe
        ORDER BY jumlah DESC
      `;

      const distributionResult = await executeQuery(distributionQuery);
      if (!distributionResult.success) {
        throw new Error(distributionResult.error);
      }      const result = {
        summary: statsResult.data[0],
        distribution: distributionResult.data
      };

      res.json(formatResponse(true, 'Statistik akun berhasil diambil', result));    } catch (error) {
      console.error('Error in getAkunStats:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengambil statistik akun', null, error.message));
    }
  },

  // Create new akun
  async createAkun(req, res) {
    try {
      const { nama_akun, tipe } = req.body;      // Check if akun name already exists
      const checkQuery = 'SELECT id_akun FROM akun WHERE nama_akun = ?';
      const checkResult = await executeQuery(checkQuery, [nama_akun]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }
        if (checkResult.data.length > 0) {
        res.status(400).json(formatResponse(false, 'Nama akun sudah ada', null, 'Nama akun harus unik'));
      } else {
        const insertQuery = `
          INSERT INTO akun (nama_akun, tipe, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `;
        
        const insertResult = await executeQuery(insertQuery, [nama_akun, tipe]);
        if (!insertResult.success) {
          throw new Error(insertResult.error);
        }
        
        // Get the created akun
        const selectQuery = `
          SELECT id_akun, nama_akun, tipe, created_at, updated_at
          FROM akun 
          WHERE id_akun = ?
        `;
        
        const selectResult = await executeQuery(selectQuery, [insertResult.data.insertId]);
        if (!selectResult.success) {
          throw new Error(selectResult.error);
        }
        
        res.status(201).json(formatResponse(true, 'Akun berhasil dibuat', selectResult.data[0]));
      }    } catch (error) {
      console.error('Error in createAkun:', error);
      res.status(500).json(formatResponse(false, 'Gagal membuat akun', null, error.message));
    }
  },

  // Update akun
  async updateAkun(req, res) {
    try {
      const { id } = req.params;
      const { nama_akun, tipe } = req.body;      // Check if akun exists
      const checkQuery = 'SELECT id_akun FROM akun WHERE id_akun = ?';
      const checkResult = await executeQuery(checkQuery, [id]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }
        if (checkResult.data.length === 0) {
        res.status(404).json(formatResponse(false, 'Akun tidak ditemukan'));
      } else {
        // Check if new name already exists (excluding current akun)
        if (nama_akun) {
          const nameCheckQuery = 'SELECT id_akun FROM akun WHERE nama_akun = ? AND id_akun != ?';
          const nameCheckResult = await executeQuery(nameCheckQuery, [nama_akun, id]);
          if (!nameCheckResult.success) {
            throw new Error(nameCheckResult.error);
          }
          
          if (nameCheckResult.data.length > 0) {
            return res.status(400).json(formatResponse(false, 'Nama akun sudah ada', null, 'Nama akun harus unik'));
          }
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        
        if (nama_akun !== undefined) {
          updates.push('nama_akun = ?');
          values.push(nama_akun);
        }
        
        if (tipe !== undefined) {
          updates.push('tipe = ?');
          values.push(tipe);
        }
        
        if (updates.length === 0) {
          return res.status(400).json(formatResponse(false, 'Tidak ada data yang diupdate'));
        }

        updates.push('updated_at = NOW()');
        values.push(id);

        const updateQuery = `UPDATE akun SET ${updates.join(', ')} WHERE id_akun = ?`;
        const updateResult = await executeQuery(updateQuery, values);
        if (!updateResult.success) {
          throw new Error(updateResult.error);
        }
        
        // Get updated akun
        const selectQuery = `
          SELECT id_akun, nama_akun, tipe, created_at, updated_at
          FROM akun 
          WHERE id_akun = ?
        `;
        
        const selectResult = await executeQuery(selectQuery, [id]);
        if (!selectResult.success) {
          throw new Error(selectResult.error);
        }
        
        res.json(formatResponse(true, 'Akun berhasil diupdate', selectResult.data[0]));
      }    } catch (error) {
      console.error('Error in updateAkun:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengupdate akun', null, error.message));
    }
  },

  // Delete akun
  async deleteAkun(req, res) {
    try {
      const { id } = req.params;      // Check if akun exists
      const checkQuery = 'SELECT id_akun FROM akun WHERE id_akun = ?';
      const checkResult = await executeQuery(checkQuery, [id]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }
        if (checkResult.data.length === 0) {
        res.status(404).json(formatResponse(false, 'Akun tidak ditemukan'));
      } else {
        // Check if akun is being used in jurnal
        const usageQuery = 'SELECT COUNT(*) as count FROM jurnal WHERE id_akun = ?';
        const usageResult = await executeQuery(usageQuery, [id]);
        if (!usageResult.success) {
          throw new Error(usageResult.error);
        }
        
        if (usageResult.data[0].count > 0) {
          res.status(400).json(formatResponse(false, 'Akun tidak dapat dihapus', null, 'Akun sedang digunakan dalam jurnal'));
        } else {
          const deleteQuery = 'DELETE FROM akun WHERE id_akun = ?';
          const deleteResult = await executeQuery(deleteQuery, [id]);
          if (!deleteResult.success) {
            throw new Error(deleteResult.error);
          }
          
          res.json(formatResponse(true, 'Akun berhasil dihapus'));
        }
      }    } catch (error) {
      console.error('Error in deleteAkun:', error);
      res.status(500).json(formatResponse(false, 'Gagal menghapus akun', null, error.message));
    }
  },

  // Get akun by type
  async getAkunByType(req, res) {
    try {
      const { tipe } = req.params;
        // Validate tipe
      const validTipes = ['Asset', 'Kewajiban', 'Ekuitas', 'Pendapatan', 'Beban'];
      if (!validTipes.includes(tipe)) {
        res.status(400).json(formatResponse(false, 'Tipe akun tidak valid', null, 'Tipe harus: Asset, Kewajiban, Ekuitas, Pendapatan, atau Beban'));
      } else {
        const query = `
          SELECT id_akun, nama_akun, tipe, created_at, updated_at
          FROM akun 
          WHERE tipe = ?
          ORDER BY nama_akun ASC
        `;
        
        const result = await executeQuery(query, [tipe]);
        if (!result.success) {
          throw new Error(result.error);
        }
        
        res.json(formatResponse(true, `Akun ${tipe} berhasil diambil`, result.data));
      }
    } catch (error) {
      console.error('Error in getAkunByType:', error);
      return errorResponse(res, 'Gagal mengambil data akun', error.message);
    }
  }
};

module.exports = akunController;
