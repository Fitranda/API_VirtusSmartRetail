const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

const pelangganController = {
  // Get all customers with pagination and filtering
  async getAllPelanggan(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      // Build WHERE clause for filtering
      let whereClause = '';
      let queryParams = [];

      if (search) {
        whereClause = 'WHERE nama_pelanggan LIKE ? OR kontak LIKE ? OR alamat LIKE ?';
        queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM pelanggan ${whereClause}`;
      const countResult = await executeQuery(countQuery, queryParams);
      if (!countResult.success) {
        throw new Error(countResult.error);
      }
      const totalItems = countResult.data[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated data
      const dataQuery = `
        SELECT id_pelanggan, nama_pelanggan, kontak, alamat, created_at, updated_at
        FROM pelanggan 
        ${whereClause}
        ORDER BY id_pelanggan DESC
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

      res.status(200).json(formatResponse(true, 'Data pelanggan berhasil diambil', {
        pelanggan: rows,
        pagination: pagination
      }));

    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json(formatResponse(false, 'Error mengambil data pelanggan', null, error.message));
    }
  },

  // Get customer by ID
  async getPelangganById(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT id_pelanggan, nama_pelanggan, kontak, alamat, created_at, updated_at
        FROM pelanggan 
        WHERE id_pelanggan = ?
      `;

      const result = await executeQuery(query, [id]);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Pelanggan tidak ditemukan'));
      }

      res.status(200).json(formatResponse(true, 'Data pelanggan berhasil diambil', {
        pelanggan: result.data[0]
      }));

    } catch (error) {
      console.error('Error fetching customer by ID:', error);
      res.status(500).json(formatResponse(false, 'Error mengambil data pelanggan', null, error.message));
    }
  },

  // Get customer statistics
  async getPelangganStats(req, res) {
    try {
      // Total customers
      const totalQuery = 'SELECT COUNT(*) as total FROM pelanggan';
      const totalResult = await executeQuery(totalQuery);
      if (!totalResult.success) {
        throw new Error(totalResult.error);
      }
      const totalPelanggan = totalResult.data[0].total;

      // Customers with recent transactions (last 30 days)
      const recentTransactionsQuery = `
        SELECT COUNT(DISTINCT p.id_pelanggan) as active_customers
        FROM pelanggan p
        INNER JOIN transaksi_penjualan tp ON p.id_pelanggan = tp.id_pelanggan
        WHERE tp.tanggal_penjualan >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      `;
      const recentResult = await executeQuery(recentTransactionsQuery);
      if (!recentResult.success) {
        throw new Error(recentResult.error);
      }
      const activePelanggan = recentResult.data[0].active_customers;

      // Top customers by total purchases
      const topCustomersQuery = `
        SELECT 
          p.id_pelanggan,
          p.nama_pelanggan,
          p.kontak,
          COUNT(tp.id_penjualan) as total_transaksi,
          COALESCE(SUM(tp.total_harga), 0) as total_pembelian
        FROM pelanggan p
        LEFT JOIN transaksi_penjualan tp ON p.id_pelanggan = tp.id_pelanggan
        GROUP BY p.id_pelanggan, p.nama_pelanggan, p.kontak
        ORDER BY total_pembelian DESC
        LIMIT 5
      `;
      const topResult = await executeQuery(topCustomersQuery);
      if (!topResult.success) {
        throw new Error(topResult.error);
      }

      // Customer registration trend (last 6 months)
      const trendQuery = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as registrations
        FROM pelanggan
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month
      `;
      const trendResult = await executeQuery(trendQuery);
      if (!trendResult.success) {
        throw new Error(trendResult.error);
      }

      res.status(200).json(formatResponse(true, 'Statistik pelanggan berhasil diambil', {
        total_pelanggan: totalPelanggan,
        active_pelanggan_30_days: activePelanggan,
        top_customers: topResult.data,
        registration_trend: trendResult.data
      }));

    } catch (error) {
      console.error('Error fetching customer statistics:', error);
      res.status(500).json(formatResponse(false, 'Error mengambil statistik pelanggan', null, error.message));
    }
  },

  // Create new customer
  async createPelanggan(req, res) {
    try {
      const { nama_pelanggan, kontak, alamat } = req.body;

      // Check if customer with same name and contact already exists
      const checkQuery = `
        SELECT id_pelanggan FROM pelanggan 
        WHERE nama_pelanggan = ? AND kontak = ?
      `;
      const checkResult = await executeQuery(checkQuery, [nama_pelanggan, kontak]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }

      if (checkResult.data.length > 0) {
        return res.status(400).json(formatResponse(false, 'Pelanggan dengan nama dan kontak yang sama sudah ada'));
      }

      // Insert new customer
      const insertQuery = `
        INSERT INTO pelanggan (nama_pelanggan, kontak, alamat, created_at, updated_at)
        VALUES (?, ?, ?, NOW(), NOW())
      `;

      const result = await executeQuery(insertQuery, [nama_pelanggan, kontak, alamat]);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const customerId = result.data.insertId;

      // Get the created customer
      const getCustomerQuery = `
        SELECT id_pelanggan, nama_pelanggan, kontak, alamat, created_at, updated_at
        FROM pelanggan 
        WHERE id_pelanggan = ?
      `;
      const customerResult = await executeQuery(getCustomerQuery, [customerId]);
      
      if (!customerResult.success) {
        throw new Error(customerResult.error);
      }

      res.status(201).json(formatResponse(true, 'Pelanggan berhasil ditambahkan', {
        pelanggan: customerResult.data[0]
      }));

    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json(formatResponse(false, 'Error menambahkan pelanggan', null, error.message));
    }
  },

  // Update customer
  async updatePelanggan(req, res) {
    try {
      const { id } = req.params;
      const { nama_pelanggan, kontak, alamat } = req.body;

      // Check if customer exists
      const checkQuery = 'SELECT id_pelanggan FROM pelanggan WHERE id_pelanggan = ?';
      const checkResult = await executeQuery(checkQuery, [id]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }

      if (checkResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Pelanggan tidak ditemukan'));
      }

      // Check if another customer with same name and contact exists (excluding current customer)
      const duplicateQuery = `
        SELECT id_pelanggan FROM pelanggan 
        WHERE nama_pelanggan = ? AND kontak = ? AND id_pelanggan != ?
      `;
      const duplicateResult = await executeQuery(duplicateQuery, [nama_pelanggan, kontak, id]);
      if (!duplicateResult.success) {
        throw new Error(duplicateResult.error);
      }

      if (duplicateResult.data.length > 0) {
        return res.status(400).json(formatResponse(false, 'Pelanggan dengan nama dan kontak yang sama sudah ada'));
      }

      // Update customer
      const updateQuery = `
        UPDATE pelanggan 
        SET nama_pelanggan = ?, kontak = ?, alamat = ?, updated_at = NOW()
        WHERE id_pelanggan = ?
      `;

      const result = await executeQuery(updateQuery, [nama_pelanggan, kontak, alamat, id]);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Get updated customer
      const getCustomerQuery = `
        SELECT id_pelanggan, nama_pelanggan, kontak, alamat, created_at, updated_at
        FROM pelanggan 
        WHERE id_pelanggan = ?
      `;
      const customerResult = await executeQuery(getCustomerQuery, [id]);
      
      if (!customerResult.success) {
        throw new Error(customerResult.error);
      }

      res.status(200).json(formatResponse(true, 'Pelanggan berhasil diperbarui', {
        pelanggan: customerResult.data[0]
      }));

    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json(formatResponse(false, 'Error memperbarui pelanggan', null, error.message));
    }
  },

  // Delete customer
  async deletePelanggan(req, res) {
    try {
      const { id } = req.params;

      // Check if customer exists
      const checkQuery = 'SELECT id_pelanggan FROM pelanggan WHERE id_pelanggan = ?';
      const checkResult = await executeQuery(checkQuery, [id]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }

      if (checkResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Pelanggan tidak ditemukan'));
      }

      // Check if customer has any transactions
      const transactionQuery = 'SELECT COUNT(*) as count FROM transaksi_penjualan WHERE id_pelanggan = ?';
      const transactionResult = await executeQuery(transactionQuery, [id]);
      if (!transactionResult.success) {
        throw new Error(transactionResult.error);
      }

      if (transactionResult.data[0].count > 0) {
        return res.status(400).json(formatResponse(false, 'Tidak dapat menghapus pelanggan yang memiliki riwayat transaksi'));
      }

      // Delete customer
      const deleteQuery = 'DELETE FROM pelanggan WHERE id_pelanggan = ?';
      const result = await executeQuery(deleteQuery, [id]);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      res.status(200).json(formatResponse(true, 'Pelanggan berhasil dihapus'));

    } catch (error) {
      console.error('Error deleting customer:', error);
      res.status(500).json(formatResponse(false, 'Error menghapus pelanggan', null, error.message));
    }
  },

  // Search customers
  async searchPelanggan(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.trim() === '') {
        return res.status(400).json(formatResponse(false, 'Query pencarian harus diisi'));
      }

      const searchQuery = `
        SELECT id_pelanggan, nama_pelanggan, kontak, alamat, created_at, updated_at
        FROM pelanggan 
        WHERE nama_pelanggan LIKE ? OR kontak LIKE ? OR alamat LIKE ?
        ORDER BY nama_pelanggan ASC
        LIMIT 20
      `;

      const searchTerm = `%${query.trim()}%`;
      const result = await executeQuery(searchQuery, [searchTerm, searchTerm, searchTerm]);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      res.status(200).json(formatResponse(true, 'Pencarian pelanggan berhasil', {
        pelanggan: result.data,
        total_found: result.data.length
      }));

    } catch (error) {
      console.error('Error searching customers:', error);
      res.status(500).json(formatResponse(false, 'Error mencari pelanggan', null, error.message));
    }
  },

  // Get customer transaction history
  async getPelangganTransactions(req, res) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Check if customer exists
      const checkQuery = `
        SELECT id_pelanggan, nama_pelanggan, kontak, alamat
        FROM pelanggan 
        WHERE id_pelanggan = ?
      `;
      const checkResult = await executeQuery(checkQuery, [id]);
      if (!checkResult.success) {
        throw new Error(checkResult.error);
      }

      if (checkResult.data.length === 0) {
        return res.status(404).json(formatResponse(false, 'Pelanggan tidak ditemukan'));
      }

      const customer = checkResult.data[0];

      // Get total transaction count
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM transaksi_penjualan 
        WHERE id_pelanggan = ?
      `;
      const countResult = await executeQuery(countQuery, [id]);
      if (!countResult.success) {
        throw new Error(countResult.error);
      }
      const totalItems = countResult.data[0].total;
      const totalPages = Math.ceil(totalItems / limit);

      // Get transactions with details
      const transactionQuery = `
        SELECT 
          tp.id_penjualan,
          tp.tanggal_penjualan,
          tp.total_harga,
          tp.created_at,
          COUNT(dp.id_detail) as total_items,
          GROUP_CONCAT(
            CONCAT(pr.nama_produk, ' (', dp.jumlah, 'x)')
            SEPARATOR ', '
          ) as items_summary
        FROM transaksi_penjualan tp
        LEFT JOIN detail_penjualan dp ON tp.id_penjualan = dp.id_penjualan
        LEFT JOIN produk pr ON dp.id_produk = pr.id_produk
        WHERE tp.id_pelanggan = ?
        GROUP BY tp.id_penjualan, tp.tanggal_penjualan, tp.total_harga, tp.created_at
        ORDER BY tp.tanggal_penjualan DESC, tp.id_penjualan DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const transactionResult = await executeQuery(transactionQuery, [id]);
      if (!transactionResult.success) {
        throw new Error(transactionResult.error);
      }

      // Get summary statistics for this customer
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_transactions,
          COALESCE(SUM(total_harga), 0) as total_spent,
          COALESCE(AVG(total_harga), 0) as avg_transaction,
          MAX(tanggal_penjualan) as last_transaction_date
        FROM transaksi_penjualan
        WHERE id_pelanggan = ?
      `;
      const summaryResult = await executeQuery(summaryQuery, [id]);
      if (!summaryResult.success) {
        throw new Error(summaryResult.error);
      }

      // Pagination info
      const pagination = {
        current_page: page,
        per_page: limit,
        total: totalItems,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1
      };

      res.status(200).json(formatResponse(true, 'Riwayat transaksi pelanggan berhasil diambil', {
        customer: customer,
        summary: summaryResult.data[0],
        transactions: transactionResult.data,
        pagination: pagination
      }));

    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      res.status(500).json(formatResponse(false, 'Error mengambil riwayat transaksi pelanggan', null, error.message));
    }
  }
};

module.exports = pelangganController;
