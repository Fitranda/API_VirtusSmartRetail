const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

const supplierController = {
  // Get all suppliers with pagination and filtering
  async getAllSuppliers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      // Build WHERE clause for filtering
      let whereClause = '';
      let queryParams = [];

      if (search) {
        whereClause = 'WHERE nama_supplier LIKE ? OR kontak LIKE ? OR alamat LIKE ?';
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM supplier ${whereClause}`;
      const countResult = await executeQuery(countQuery, queryParams);
      if (!countResult.success) {
        throw new Error(countResult.error);
      }
      const totalItems = countResult.data[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated data
      const dataQuery = `
        SELECT id_supplier, nama_supplier, kontak, alamat, created_at, updated_at
        FROM supplier 
        ${whereClause}
        ORDER BY id_supplier DESC
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

      res.json(formatResponse(true, 'Data supplier berhasil diambil', rows, pagination));
    } catch (error) {
      console.error('Error in getAllSuppliers:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengambil data supplier', null, error.message));
    }
  },

  // Get supplier by ID
  async getSupplierById(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT id_supplier, nama_supplier, kontak, alamat, created_at, updated_at
        FROM supplier 
        WHERE id_supplier = ?
      `;
      
      const result = await executeQuery(query, [id]);
      if (!result.success) {
        throw new Error(result.error);
      }
      
      if (result.data.length === 0) {
        res.status(404).json(formatResponse(false, 'Supplier tidak ditemukan'));
      } else {
        res.json(formatResponse(true, 'Supplier berhasil diambil', result.data[0]));
      }
    } catch (error) {
      console.error('Error in getSupplierById:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengambil data supplier', null, error.message));
    }
  },

  // Get supplier statistics
  async getSupplierStats(req, res) {
    try {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_supplier,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as supplier_baru_bulan_ini,
          COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as supplier_baru_minggu_ini
        FROM supplier
      `;

      const statsResult = await executeQuery(statsQuery);
      if (!statsResult.success) {
        throw new Error(statsResult.error);
      }

      // Get recent suppliers
      const recentQuery = `
        SELECT id_supplier, nama_supplier, kontak, created_at
        FROM supplier
        ORDER BY created_at DESC
        LIMIT 5
      `;

      const recentResult = await executeQuery(recentQuery);
      if (!recentResult.success) {
        throw new Error(recentResult.error);
      }

      const result = {
        summary: statsResult.data[0],
        recent_suppliers: recentResult.data
      };

      res.json(formatResponse(true, 'Statistik supplier berhasil diambil', result));
    } catch (error) {
      console.error('Error in getSupplierStats:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengambil statistik supplier', null, error.message));
    }
  },

  // Create new supplier
  async createSupplier(req, res) {
    try {
      const { nama_supplier, kontak, alamat } = req.body;

      // Check if supplier name already exists
      const checkQuery = 'SELECT id_supplier FROM supplier WHERE nama_supplier = ?';
      const checkResult = await executeQuery(checkQuery, [nama_supplier]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }
      
      if (checkResult.data.length > 0) {
        res.status(400).json(formatResponse(false, 'Nama supplier sudah ada', null, 'Nama supplier harus unik'));
      } else {
        const insertQuery = `
          INSERT INTO supplier (nama_supplier, kontak, alamat, created_at, updated_at)
          VALUES (?, ?, ?, NOW(), NOW())
        `;
        
        const insertResult = await executeQuery(insertQuery, [nama_supplier, kontak, alamat]);
        if (!insertResult.success) {
          throw new Error(insertResult.error);
        }
        
        // Get the created supplier
        const selectQuery = `
          SELECT id_supplier, nama_supplier, kontak, alamat, created_at, updated_at
          FROM supplier 
          WHERE id_supplier = ?
        `;
        
        const selectResult = await executeQuery(selectQuery, [insertResult.data.insertId]);
        if (!selectResult.success) {
          throw new Error(selectResult.error);
        }
        
        res.status(201).json(formatResponse(true, 'Supplier berhasil dibuat', selectResult.data[0]));
      }
    } catch (error) {
      console.error('Error in createSupplier:', error);
      res.status(500).json(formatResponse(false, 'Gagal membuat supplier', null, error.message));
    }
  },

  // Update supplier
  async updateSupplier(req, res) {
    try {
      const { id } = req.params;
      const { nama_supplier, kontak, alamat } = req.body;

      // Check if supplier exists
      const checkQuery = 'SELECT id_supplier FROM supplier WHERE id_supplier = ?';
      const checkResult = await executeQuery(checkQuery, [id]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }
      
      if (checkResult.data.length === 0) {
        res.status(404).json(formatResponse(false, 'Supplier tidak ditemukan'));
      } else {
        // Check if new name already exists (excluding current supplier)
        if (nama_supplier) {
          const nameCheckQuery = 'SELECT id_supplier FROM supplier WHERE nama_supplier = ? AND id_supplier != ?';
          const nameCheckResult = await executeQuery(nameCheckQuery, [nama_supplier, id]);
          if (!nameCheckResult.success) {
            throw new Error(nameCheckResult.error);
          }
          
          if (nameCheckResult.data.length > 0) {
            return res.status(400).json(formatResponse(false, 'Nama supplier sudah ada', null, 'Nama supplier harus unik'));
          }
        }

        // Build dynamic update query
        const updates = [];
        const values = [];
        
        if (nama_supplier !== undefined) {
          updates.push('nama_supplier = ?');
          values.push(nama_supplier);
        }
        
        if (kontak !== undefined) {
          updates.push('kontak = ?');
          values.push(kontak);
        }
        
        if (alamat !== undefined) {
          updates.push('alamat = ?');
          values.push(alamat);
        }
        
        if (updates.length === 0) {
          return res.status(400).json(formatResponse(false, 'Tidak ada data yang diupdate'));
        }

        updates.push('updated_at = NOW()');
        values.push(id);

        const updateQuery = `UPDATE supplier SET ${updates.join(', ')} WHERE id_supplier = ?`;
        const updateResult = await executeQuery(updateQuery, values);
        if (!updateResult.success) {
          throw new Error(updateResult.error);
        }
        
        // Get updated supplier
        const selectQuery = `
          SELECT id_supplier, nama_supplier, kontak, alamat, created_at, updated_at
          FROM supplier 
          WHERE id_supplier = ?
        `;
        
        const selectResult = await executeQuery(selectQuery, [id]);
        if (!selectResult.success) {
          throw new Error(selectResult.error);
        }
        
        res.json(formatResponse(true, 'Supplier berhasil diupdate', selectResult.data[0]));
      }
    } catch (error) {
      console.error('Error in updateSupplier:', error);
      res.status(500).json(formatResponse(false, 'Gagal mengupdate supplier', null, error.message));
    }
  },

  // Delete supplier
  async deleteSupplier(req, res) {
    try {
      const { id } = req.params;

      // Check if supplier exists
      const checkQuery = 'SELECT id_supplier FROM supplier WHERE id_supplier = ?';
      const checkResult = await executeQuery(checkQuery, [id]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }
      
      if (checkResult.data.length === 0) {
        res.status(404).json(formatResponse(false, 'Supplier tidak ditemukan'));
      } else {
        // Check if supplier is being used in pembelian or hutang
        const usageQuery = `
          SELECT 
            (SELECT COUNT(*) FROM pembelian WHERE id_supplier = ?) +
            (SELECT COUNT(*) FROM hutang WHERE id_supplier = ?) as count
        `;
        const usageResult = await executeQuery(usageQuery, [id, id]);
        if (!usageResult.success) {
          throw new Error(usageResult.error);
        }
        
        if (usageResult.data[0].count > 0) {
          res.status(400).json(formatResponse(false, 'Supplier tidak dapat dihapus', null, 'Supplier sedang digunakan dalam transaksi pembelian atau hutang'));
        } else {
          const deleteQuery = 'DELETE FROM supplier WHERE id_supplier = ?';
          const deleteResult = await executeQuery(deleteQuery, [id]);
          if (!deleteResult.success) {
            throw new Error(deleteResult.error);
          }
          
          res.json(formatResponse(true, 'Supplier berhasil dihapus'));
        }
      }
    } catch (error) {
      console.error('Error in deleteSupplier:', error);
      res.status(500).json(formatResponse(false, 'Gagal menghapus supplier', null, error.message));
    }
  },

  // Search suppliers
  async searchSuppliers(req, res) {
    try {
      const { query: searchQuery } = req.query;
      
      if (!searchQuery) {
        res.status(400).json(formatResponse(false, 'Parameter query diperlukan'));
      } else {
        const query = `
          SELECT id_supplier, nama_supplier, kontak, alamat, created_at, updated_at
          FROM supplier 
          WHERE nama_supplier LIKE ? OR kontak LIKE ? OR alamat LIKE ?
          ORDER BY nama_supplier ASC
          LIMIT 20
        `;
        
        const searchTerm = `%${searchQuery}%`;
        const result = await executeQuery(query, [searchTerm, searchTerm, searchTerm]);
        if (!result.success) {
          throw new Error(result.error);
        }
        
        res.json(formatResponse(true, `Hasil pencarian supplier untuk "${searchQuery}"`, result.data));
      }
    } catch (error) {
      console.error('Error in searchSuppliers:', error);
      res.status(500).json(formatResponse(false, 'Gagal mencari supplier', null, error.message));
    }
  }
};

module.exports = supplierController;
