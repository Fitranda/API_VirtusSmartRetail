const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

const produkController = {
  // Get all produk with pagination and filters
  async getAllProduk(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Build WHERE clause for filters
      let whereClause = 'WHERE 1=1';
      const queryParams = [];
      
      if (req.query.kategori) {
        whereClause += ' AND kategori LIKE ?';
        queryParams.push(`%${req.query.kategori}%`);
      }
      
      if (req.query.stok_min) {
        whereClause += ' AND stok >= ?';
        queryParams.push(parseInt(req.query.stok_min));
      }
      
      if (req.query.stok_max) {
        whereClause += ' AND stok <= ?';
        queryParams.push(parseInt(req.query.stok_max));
      }
      
      if (req.query.harga_min) {
        whereClause += ' AND harga_jual >= ?';
        queryParams.push(parseFloat(req.query.harga_min));
      }
      
      if (req.query.harga_max) {
        whereClause += ' AND harga_jual <= ?';
        queryParams.push(parseFloat(req.query.harga_max));
      }
      
      if (req.query.search) {
        whereClause += ' AND nama_produk LIKE ?';
        queryParams.push(`%${req.query.search}%`);
      }
      
      if (req.query.stok_rendah === 'true') {
        whereClause += ' AND stok <= 10';
      }
        // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM produk ${whereClause}`;
      const countResult = await executeQuery(countQuery, queryParams);
      if (!countResult.success) {
        throw new Error(countResult.error);
      }
      const total = countResult.data[0].total;
      
      // Get produk data
      const dataQuery = `
        SELECT 
          id_produk,
          nama_produk,
          kategori,
          stok,
          harga_beli,
          harga_jual,
          (harga_jual - harga_beli) as profit,
          ROUND(((harga_jual - harga_beli) / harga_beli * 100), 2) as margin_persen,
          created_at,
          updated_at
        FROM produk 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
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
      
      res.json(formatResponse(true, 'Data produk berhasil diambil', rows, pagination));
    } catch (error) {
      console.error('Error getting produk:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Get produk by ID
  async getProdukById(req, res) {
    try {
      const { id } = req.params;
        const query = `
        SELECT 
          id_produk,
          nama_produk,
          kategori,
          stok,
          harga_beli,
          harga_jual,
          (harga_jual - harga_beli) as profit,
          ROUND(((harga_jual - harga_beli) / harga_beli * 100), 2) as margin_persen,
          created_at,
          updated_at
        FROM produk 
        WHERE id_produk = ?
      `;
      
      const result = await executeQuery(query, [id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      if (result.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Produk tidak ditemukan'));
      }
      
      res.json(formatResponse(true, 'Data produk berhasil diambil', result.data[0]));
    } catch (error) {
      console.error('Error getting produk by ID:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Create new produk
  async createProduk(req, res) {
    try {
      const { nama_produk, kategori, stok, harga_beli, harga_jual } = req.body;
        // Check if product name already exists
      const checkQuery = 'SELECT id_produk FROM produk WHERE nama_produk = ?';
      const checkResult = await executeQuery(checkQuery, [nama_produk]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }
      
      if (checkResult.data.length > 0) {
        return res.status(400).json(formatResponse(false, 'Nama produk sudah ada'));
      }
      
      // Validate that harga_jual > harga_beli
      if (harga_jual <= harga_beli) {
        return res.status(400).json(formatResponse(false, 'Harga jual harus lebih besar dari harga beli'));
      }
        const insertQuery = `
        INSERT INTO produk (nama_produk, kategori, stok, harga_beli, harga_jual, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const insertResult = await executeQuery(insertQuery, [
        nama_produk, kategori, stok, harga_beli, harga_jual
      ]);
      if (!insertResult.success) {
        throw new Error(insertResult.error);
      }
      
      // Get the created produk
      const newProdukResult = await executeQuery(`
        SELECT 
          id_produk,
          nama_produk,
          kategori,
          stok,
          harga_beli,
          harga_jual,
          (harga_jual - harga_beli) as profit,
          ROUND(((harga_jual - harga_beli) / harga_beli * 100), 2) as margin_persen,
          created_at
        FROM produk 
        WHERE id_produk = ?
      `, [insertResult.data.insertId]);
      if (!newProdukResult.success) {
        throw new Error(newProdukResult.error);
      }
      
      res.status(201).json(formatResponse(true, 'Produk berhasil ditambahkan', newProdukResult.data[0]));
    } catch (error) {
      console.error('Error creating produk:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },
  // Update produk
  async updateProduk(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if produk exists
      const existingResult = await executeQuery('SELECT id_produk FROM produk WHERE id_produk = ?', [id]);
      if (!existingResult.success) {
        throw new Error(existingResult.error);
      }
      if (existingResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Produk tidak ditemukan'));
      }
      
      // If nama_produk is being updated, check for duplicates
      if (updateData.nama_produk) {
        const checkQuery = 'SELECT id_produk FROM produk WHERE nama_produk = ? AND id_produk != ?';
        const duplicateResult = await executeQuery(checkQuery, [updateData.nama_produk, id]);
        if (!duplicateResult.success) {
          throw new Error(duplicateResult.error);
        }
        
        if (duplicateResult.data.length > 0) {
          return res.status(400).json(formatResponse(false, 'Nama produk sudah ada'));
        }
      }
      
      // Validate harga if both are provided
      if (updateData.harga_beli && updateData.harga_jual) {
        if (updateData.harga_jual <= updateData.harga_beli) {
          return res.status(400).json(formatResponse(false, 'Harga jual harus lebih besar dari harga beli'));
        }
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
        const updateQuery = `UPDATE produk SET ${updateFields.join(', ')} WHERE id_produk = ?`;
      const updateResult = await executeQuery(updateQuery, updateValues);
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }
      
      // Get updated produk
      const updatedResult = await executeQuery(`
        SELECT 
          id_produk,
          nama_produk,
          kategori,
          stok,
          harga_beli,
          harga_jual,
          (harga_jual - harga_beli) as profit,
          ROUND(((harga_jual - harga_beli) / harga_beli * 100), 2) as margin_persen,
          updated_at
        FROM produk 
        WHERE id_produk = ?
      `, [id]);
      if (!updatedResult.success) {
        throw new Error(updatedResult.error);
      }
      
      res.json(formatResponse(true, 'Data produk berhasil diupdate', updatedResult.data[0]));
    } catch (error) {
      console.error('Error updating produk:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },
  // Delete produk
  async deleteProduk(req, res) {
    try {
      const { id } = req.params;
      
      // Check if produk exists
      const existingResult = await executeQuery('SELECT id_produk FROM produk WHERE id_produk = ?', [id]);
      if (!existingResult.success) {
        throw new Error(existingResult.error);
      }
      if (existingResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Produk tidak ditemukan'));
      }
      
      const deleteResult = await executeQuery('DELETE FROM produk WHERE id_produk = ?', [id]);
      if (!deleteResult.success) {
        throw new Error(deleteResult.error);
      }
      
      res.json(formatResponse(true, 'Produk berhasil dihapus'));
    } catch (error) {
      console.error('Error deleting produk:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Update stok produk
  async updateStok(req, res) {
    try {
      const { id } = req.params;
      const { stok, operasi = 'set' } = req.body; // operasi: 'set', 'tambah', 'kurang'
        // Check if produk exists
      const existingResult = await executeQuery('SELECT id_produk, stok FROM produk WHERE id_produk = ?', [id]);
      if (!existingResult.success) {
        throw new Error(existingResult.error);
      }
      if (existingResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Produk tidak ditemukan'));
      }
      
      let newStok;
      const currentStok = existingResult.data[0].stok;
      
      switch (operasi) {
        case 'tambah':
          newStok = currentStok + stok;
          break;
        case 'kurang':
          newStok = currentStok - stok;
          if (newStok < 0) {
            return res.status(400).json(formatResponse(false, 'Stok tidak boleh negatif'));
          }
          break;
        case 'set':
        default:
          newStok = stok;
          break;      }
      
      const updateResult = await executeQuery('UPDATE produk SET stok = ?, updated_at = NOW() WHERE id_produk = ?', [newStok, id]);
      if (!updateResult.success) {
        throw new Error(updateResult.error);
      }
      
      // Get updated produk
      const updatedResult = await executeQuery(`
        SELECT 
          id_produk,
          nama_produk,
          stok,
          updated_at
        FROM produk 
        WHERE id_produk = ?
      `, [id]);
      if (!updatedResult.success) {
        throw new Error(updatedResult.error);
      }
      
      res.json(formatResponse(true, 'Stok produk berhasil diupdate', updatedResult.data[0]));
    } catch (error) {
      console.error('Error updating stok:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Get produk statistics
  async getProdukStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_produk,
          SUM(stok) as total_stok,
          COUNT(CASE WHEN stok <= 10 THEN 1 END) as produk_stok_rendah,
          AVG(harga_jual) as rata_rata_harga,
          SUM(stok * harga_beli) as nilai_stok_beli,
          SUM(stok * harga_jual) as nilai_stok_jual,
          MIN(harga_jual) as harga_termurah,
          MAX(harga_jual) as harga_termahal
        FROM produk
      `;
      
      const kategoriQuery = `
        SELECT 
          kategori, 
          COUNT(*) as jumlah_produk,
          SUM(stok) as total_stok,
          AVG(harga_jual) as rata_rata_harga
        FROM produk 
        GROUP BY kategori
        ORDER BY jumlah_produk DESC
      `;
      
      const stokRendahQuery = `
        SELECT 
          id_produk,
          nama_produk,
          kategori,
          stok
        FROM produk 
        WHERE stok <= 10
        ORDER BY stok ASC
        LIMIT 10
      `;
        const statsResult = await executeQuery(statsQuery);
      const kategoriResult = await executeQuery(kategoriQuery);
      const stokRendahResult = await executeQuery(stokRendahQuery);
      
      if (!statsResult.success || !kategoriResult.success || !stokRendahResult.success) {
        throw new Error('Error executing statistics queries');
      }
      
      const stats = {
        ...statsResult.data[0],
        rata_rata_harga: parseFloat(statsResult.data[0].rata_rata_harga).toFixed(2),
        nilai_stok_beli: parseFloat(statsResult.data[0].nilai_stok_beli).toFixed(2),
        nilai_stok_jual: parseFloat(statsResult.data[0].nilai_stok_jual).toFixed(2),
        profit_potensial: (statsResult.data[0].nilai_stok_jual - statsResult.data[0].nilai_stok_beli).toFixed(2),
        distribusi_kategori: kategoriResult.data.map(item => ({
          ...item,
          rata_rata_harga: parseFloat(item.rata_rata_harga).toFixed(2)
        })),
        produk_stok_rendah_detail: stokRendahResult.data
      };
      
      res.json(formatResponse(true, 'Statistik produk berhasil diambil', stats));
    } catch (error) {
      console.error('Error getting produk stats:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  },

  // Get kategori list
  async getKategoriList(req, res) {
    try {      const query = `
        SELECT DISTINCT kategori 
        FROM produk 
        ORDER BY kategori ASC
      `;
      
      const result = await executeQuery(query);
      if (!result.success) {
        throw new Error(result.error);
      }
      const kategoriList = result.data.map(row => row.kategori);
      
      res.json(formatResponse(true, 'Daftar kategori berhasil diambil', kategoriList));
    } catch (error) {
      console.error('Error getting kategori list:', error);
      res.status(500).json(formatResponse(false, 'Terjadi kesalahan server', null, error.message));
    }
  }
};

module.exports = produkController;
