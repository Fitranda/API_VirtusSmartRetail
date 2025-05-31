const { executeQuery } = require('../config/database');
const { formatResponse } = require('../utils/response');

// Get all sales transactions with pagination, filter, and search
const getAllSales = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const customer = req.query.customer || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';

    // Build where clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(tp.id_penjualan LIKE ? OR p.nama_pelanggan LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (customer) {
      whereConditions.push('tp.id_pelanggan = ?');
      queryParams.push(customer);
    }

    if (startDate) {
      whereConditions.push('tp.tanggal_penjualan >= ?');
      queryParams.push(startDate);
    }

    if (endDate) {
      whereConditions.push('tp.tanggal_penjualan <= ?');
      queryParams.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.id_pelanggan = p.id_pelanggan
      ${whereClause}
    `;

    const countResult = await executeQuery(countQuery, queryParams);
    const totalData = countResult.total;
    const totalPages = Math.ceil(totalData / limit);

    // Get sales data with customer details
    const dataQuery = `
      SELECT 
        tp.id_penjualan,
        tp.tanggal_penjualan,
        tp.total_harga,
        tp.created_at,
        tp.updated_at,
        p.id_pelanggan,
        p.nama_pelanggan,
        p.kontak as customer_kontak,
        p.alamat as customer_alamat,
        COUNT(dp.id_detail) as total_items,
        COALESCE(SUM(dp.jumlah), 0) as total_qty
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.id_pelanggan = p.id_pelanggan
      LEFT JOIN detail_penjualan dp ON tp.id_penjualan = dp.id_penjualan
      ${whereClause}
      GROUP BY tp.id_penjualan, p.id_pelanggan, p.nama_pelanggan, p.kontak, p.alamat
      ORDER BY tp.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const salesData = await executeQuery(dataQuery, [...queryParams, limit, offset]);

    res.json(formatResponse(true, 'Data penjualan berhasil diambil', {
      data: salesData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalData: totalData,
        limit: limit
      }
    }));
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json(formatResponse(false, 'Error fetching sales', null, error.message));
  }
};

// Get sale by ID with details
const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get sale header
    const headerQuery = `
      SELECT 
        tp.id_penjualan,
        tp.tanggal_penjualan,
        tp.total_harga,
        tp.created_at,
        tp.updated_at,
        p.id_pelanggan,
        p.nama_pelanggan,
        p.kontak as customer_kontak,
        p.alamat as customer_alamat
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.id_pelanggan = p.id_pelanggan
      WHERE tp.id_penjualan = ?
    `;

    const saleHeader = await executeQuery(headerQuery, [id]);

    if (!saleHeader || saleHeader.length === 0) {
      return res.status(404).json(formatResponse(false, 'Transaksi penjualan tidak ditemukan'));
    }

    // Get sale details
    const detailQuery = `
      SELECT 
        dp.id_detail,
        dp.id_produk,
        dp.jumlah,
        dp.harga_satuan,
        dp.jumlah * dp.harga_satuan as subtotal,
        pr.nama_produk,
        pr.kategori,
        pr.stok as stok_produk,
        pr.harga_jual as harga_produk
      FROM detail_penjualan dp
      LEFT JOIN produk pr ON dp.id_produk = pr.id_produk
      WHERE dp.id_penjualan = ?
      ORDER BY dp.id_detail
    `;

    const saleDetails = await executeQuery(detailQuery, [id]);

    // Combine header and details
    const saleData = {
      ...saleHeader.data[0],
      items: saleDetails.data,
      total_items: saleDetails.data.length,
      total_qty: saleDetails.data.reduce((sum, item) => sum + item.jumlah, 0)
    };

    res.json(formatResponse(true, 'Detail penjualan berhasil diambil', saleData));
  } catch (error) {
    console.error('Error fetching sale detail:', error);
    res.status(500).json(formatResponse(false, 'Error fetching sale detail', null, error.message));
  }
};

// Get sales statistics
const getSalesStats = async (req, res) => {    
  try {
    // Total sales
    const totalQuery = 'SELECT COUNT(*) as total_sales FROM transaksi_penjualan';
    const totalResult = await executeQuery(totalQuery);

    // Total revenue
    const revenueQuery = 'SELECT COALESCE(SUM(total_harga), 0) as total_revenue FROM transaksi_penjualan';
    const revenueResult = await executeQuery(revenueQuery);

    // Sales this month
    const monthlyQuery = `
      SELECT COUNT(*) as sales_this_month 
      FROM transaksi_penjualan 
      WHERE MONTH(tanggal_penjualan) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal_penjualan) = YEAR(CURRENT_DATE())
    `;
    const monthlyResult = await executeQuery(monthlyQuery);

    // Revenue this month
    const monthlyRevenueQuery = `
      SELECT COALESCE(SUM(total_harga), 0) as revenue_this_month 
      FROM transaksi_penjualan 
      WHERE MONTH(tanggal_penjualan) = MONTH(CURRENT_DATE()) 
      AND YEAR(tanggal_penjualan) = YEAR(CURRENT_DATE())
    `;
    const monthlyRevenueResult = await executeQuery(monthlyRevenueQuery);

    // Sales today
    const todayQuery = `
      SELECT COUNT(*) as sales_today 
      FROM transaksi_penjualan 
      WHERE DATE(tanggal_penjualan) = CURRENT_DATE()
    `;
    const todayResult = await executeQuery(todayQuery);

    // Revenue today
    const todayRevenueQuery = `
      SELECT COALESCE(SUM(total_harga), 0) as revenue_today 
      FROM transaksi_penjualan 
      WHERE DATE(tanggal_penjualan) = CURRENT_DATE()
    `;
    const todayRevenueResult = await executeQuery(todayRevenueQuery);

    // Top 5 customers by revenue
    const topCustomersQuery = `
      SELECT 
        p.id_pelanggan,
        p.nama_pelanggan,
        COUNT(tp.id_penjualan) as total_transactions,
        COALESCE(SUM(tp.total_harga), 0) as total_spent
      FROM pelanggan p
      LEFT JOIN transaksi_penjualan tp ON p.id_pelanggan = tp.id_pelanggan
      GROUP BY p.id_pelanggan, p.nama_pelanggan
      ORDER BY total_spent DESC
      LIMIT 5
    `;
    const topCustomers = await executeQuery(topCustomersQuery);

    // Top 5 products by quantity sold
    const topProductsQuery = `
      SELECT 
        pr.id_produk,
        pr.nama_produk,
        pr.kategori,
        COALESCE(SUM(dp.jumlah), 0) as total_sold,
        COALESCE(SUM(dp.jumlah * dp.harga_satuan), 0) as total_revenue
      FROM produk pr
      LEFT JOIN detail_penjualan dp ON pr.id_produk = dp.id_produk
      GROUP BY pr.id_produk, pr.nama_produk, pr.kategori
      ORDER BY total_sold DESC
      LIMIT 5
    `;
    const topProducts = await executeQuery(topProductsQuery);

    // Sales trend (last 7 days)
    const salesTrendQuery = `
      SELECT 
        DATE(tanggal_penjualan) as date,
        COUNT(*) as total_transactions,
        COALESCE(SUM(total_harga), 0) as total_revenue
      FROM transaksi_penjualan 
      WHERE tanggal_penjualan >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY DATE(tanggal_penjualan)
      ORDER BY date DESC
    `;
    const salesTrend = await executeQuery(salesTrendQuery);

    const stats = {
      overview: {
        total_sales: totalResult.data.total_sales,
        total_revenue: revenueResult.data.total_revenue,
        sales_this_month: monthlyResult.data.sales_this_month,
        revenue_this_month: monthlyRevenueResult.data.revenue_this_month,
        sales_today: todayResult.data.sales_today,
        revenue_today: todayRevenueResult.data.revenue_today
      },
      top_customers: topCustomers.data,
      top_products: topProducts.data,
      sales_trend: salesTrend.data
    };

    res.json(formatResponse(true, 'Statistik penjualan berhasil diambil', stats));
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    res.status(500).json(formatResponse(false, 'Error fetching sales stats', null, error.message));
  }
};

// Create new sale (POS Transaction)
const createSale = async (req, res) => {
  try {
    const { id_pelanggan, tanggal_penjualan, items } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return res.status(400).json(formatResponse(false, 'Items penjualan tidak boleh kosong'));
    }

    // Check stock availability for all items
    console.log('masuk bro ');
    
    for (const item of items) {
      const stockQuery = 'SELECT stok FROM produk WHERE id_produk = ?';
      const stockResult = await executeQuery(stockQuery, [item.id_produk]);
      
      
      
      if (!stockResult || stockResult.data.length === 0) {
        return res.status(400).json(formatResponse(false, `Produk dengan ID ${item.id_produk} tidak ditemukan`));
      }
      
      
      if (stockResult.data[0].stok < item.jumlah) {
        return res.status(400).json(formatResponse(false, `Stok tidak mencukupi untuk produk ID ${item.id_produk}. Stok tersedia: ${stockResult[0].stok}`));
      }
    }
    

    // Calculate total
    const total_harga = items.reduce((sum, item) => sum + (item.jumlah * item.harga_satuan), 0);

    // Insert sale header
    const insertHeaderQuery = `
      INSERT INTO transaksi_penjualan (id_pelanggan, tanggal_penjualan, total_harga, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;

    const headerResult = await executeQuery(insertHeaderQuery, [
      id_pelanggan, tanggal_penjualan, total_harga
    ]);
    

    const id_penjualan = headerResult.data.insertId;

    // Insert sale details and update stock
    for (const item of items) {
      // Insert detail
      const insertDetailQuery = `
        INSERT INTO detail_penjualan (id_penjualan, id_produk, jumlah, harga_satuan, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;

      await executeQuery(insertDetailQuery, [
        id_penjualan, item.id_produk, item.jumlah, item.harga_satuan
      ]);

      // Update stock (reduce stock)
      const updateStockQuery = `
        UPDATE produk 
        SET stok = stok - ?, updated_at = NOW()
        WHERE id_produk = ?
      `;

      await executeQuery(updateStockQuery, [item.jumlah, item.id_produk]);
    }

    // Get the created sale with details
    const createdSale = await getSaleByIdInternal(id_penjualan);

    res.status(201).json(formatResponse(true, 'Transaksi penjualan berhasil dibuat', createdSale));
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json(formatResponse(false, 'Error creating sale', null, error.message));
  }
};

// Update sale
const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_pelanggan, tanggal_penjualan, items } = req.body;

    // Check if sale exists
    const existingSale = await executeQuery(
      'SELECT * FROM transaksi_penjualan WHERE id_penjualan = ?', [id]
    );

    if (existingSale.length === 0) {
      return res.status(404).json(formatResponse(false, 'Transaksi penjualan tidak ditemukan'));
    }

    // Revert previous stock changes
    const existingDetails = await executeQuery(
      'SELECT id_produk, jumlah FROM detail_penjualan WHERE id_penjualan = ?', [id]
    );

    for (const detail of existingDetails) {
      await executeQuery(
        'UPDATE produk SET stok = stok + ?, updated_at = NOW() WHERE id_produk = ?',
        [detail.jumlah, detail.id_produk]
      );
    }

    // Delete existing details
    await executeQuery('DELETE FROM detail_penjualan WHERE id_penjualan = ?', [id]);

    // Check stock availability for new items
    for (const item of items) {
      const stockQuery = 'SELECT stok FROM produk WHERE id_produk = ?';
      const stockResult = await executeQuery(stockQuery, [item.id_produk]);
      
      if (!stockResult || stockResult.length === 0) {
        return res.status(400).json(formatResponse(false, `Produk dengan ID ${item.id_produk} tidak ditemukan`));
      }
      
      if (stockResult[0].stok < item.jumlah) {
        return res.status(400).json(formatResponse(false, `Stok tidak mencukupi untuk produk ID ${item.id_produk}. Stok tersedia: ${stockResult[0].stok}`));
      }
    }

    // Calculate new total
    const total_harga = items.reduce((sum, item) => sum + (item.jumlah * item.harga_satuan), 0);

    // Update sale header
    const updateHeaderQuery = `
      UPDATE transaksi_penjualan 
      SET id_pelanggan = ?, tanggal_penjualan = ?, total_harga = ?, updated_at = NOW()
      WHERE id_penjualan = ?
    `;

    await executeQuery(updateHeaderQuery, [
      id_pelanggan, tanggal_penjualan, total_harga, id
    ]);

    // Insert new details and update stock
    for (const item of items) {
      // Insert detail
      const insertDetailQuery = `
        INSERT INTO detail_penjualan (id_penjualan, id_produk, jumlah, harga_satuan, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `;

      await executeQuery(insertDetailQuery, [
        id, item.id_produk, item.jumlah, item.harga_satuan
      ]);

      // Update stock (reduce stock)
      await executeQuery(
        'UPDATE produk SET stok = stok - ?, updated_at = NOW() WHERE id_produk = ?',
        [item.jumlah, item.id_produk]
      );
    }

    // Get the updated sale with details
    const updatedSale = await getSaleByIdInternal(id);

    res.json(formatResponse(true, 'Transaksi penjualan berhasil diupdate', updatedSale));
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json(formatResponse(false, 'Error updating sale', null, error.message));
  }
};

// Delete sale
const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if sale exists
    const existingSale = await executeQuery(
      'SELECT * FROM transaksi_penjualan WHERE id_penjualan = ?', [id]
    );

    if (existingSale.length === 0) {
      return res.status(404).json(formatResponse(false, 'Transaksi penjualan tidak ditemukan'));
    }

    // Revert stock changes
    const existingDetails = await executeQuery(
      'SELECT id_produk, jumlah FROM detail_penjualan WHERE id_penjualan = ?', [id]
    );

    for (const detail of existingDetails) {
      await executeQuery(
        'UPDATE produk SET stok = stok + ?, updated_at = NOW() WHERE id_produk = ?',
        [detail.jumlah, detail.id_produk]
      );
    }

    // Delete details first (foreign key constraint)
    await executeQuery('DELETE FROM detail_penjualan WHERE id_penjualan = ?', [id]);

    // Delete sale header
    await executeQuery('DELETE FROM transaksi_penjualan WHERE id_penjualan = ?', [id]);

    res.json(formatResponse(true, 'Transaksi penjualan berhasil dihapus'));
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json(formatResponse(false, 'Error deleting sale', null, error.message));
  }
};

// Search sales
const searchSales = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json(formatResponse(false, 'Query pencarian tidak boleh kosong'));
    }

    const searchQuery = `
      SELECT 
        tp.id_penjualan,
        tp.tanggal_penjualan,
        tp.total_harga,
        p.nama_pelanggan,
        p.kontak as customer_kontak
      FROM transaksi_penjualan tp
      LEFT JOIN pelanggan p ON tp.id_pelanggan = p.id_pelanggan
      WHERE tp.id_penjualan LIKE ? OR p.nama_pelanggan LIKE ?
      ORDER BY tp.created_at DESC
      LIMIT 20
    `;

    const results = await executeQuery(searchQuery, [`%${query}%`, `%${query}%`]);

    res.json(formatResponse(true, 'Hasil pencarian penjualan', results));
  } catch (error) {
    console.error('Error searching sales:', error);
    res.status(500).json(formatResponse(false, 'Error searching sales', null, error.message));
  }
};

// Get available products for POS (with stock check)
const getAvailableProducts = async (req, res) => {
  try {
    const search = req.query.search || '';
    const category = req.query.category || '';

    let whereConditions = ['stok > 0']; // Only show products with stock
    let queryParams = [];

    if (search) {
      whereConditions.push('(nama_produk LIKE ? OR kategori LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      whereConditions.push('kategori = ?');
      queryParams.push(category);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      SELECT 
        id_produk,
        nama_produk,
        kategori,
        harga,
        stok,
        created_at,
        updated_at
      FROM produk
      ${whereClause}
      ORDER BY nama_produk
    `;

    const products = await executeQuery(query, queryParams);

    res.json(formatResponse(true, 'Produk tersedia berhasil diambil', products));
  } catch (error) {
    console.error('Error fetching available products:', error);
    res.status(500).json(formatResponse(false, 'Error fetching available products', null, error.message));
  }
};

// Get available customers
const getAvailableCustomers = async (req, res) => {
  try {
    const search = req.query.search || '';

    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(nama_pelanggan LIKE ? OR kontak LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        id_pelanggan,
        nama_pelanggan,
        kontak,
        alamat,
        created_at,
        updated_at
      FROM pelanggan
      ${whereClause}
      ORDER BY nama_pelanggan
    `;

    const customers = await executeQuery(query, queryParams);

    res.json(formatResponse(true, 'Pelanggan tersedia berhasil diambil', customers));
  } catch (error) {
    console.error('Error fetching available customers:', error);
    res.status(500).json(formatResponse(false, 'Error fetching available customers', null, error.message));
  }
};

// Helper function to get sale by ID (internal use)
const getSaleByIdInternal = async (id) => {
  // Get sale header
  const headerQuery = `
    SELECT 
      tp.id_penjualan,
      tp.tanggal_penjualan,
      tp.total_harga,
      tp.created_at,
      tp.updated_at,
      p.id_pelanggan,
      p.nama_pelanggan,
      p.kontak as customer_kontak,
      p.alamat as customer_alamat
    FROM transaksi_penjualan tp
    LEFT JOIN pelanggan p ON tp.id_pelanggan = p.id_pelanggan
    WHERE tp.id_penjualan = ?
  `;

  const saleHeader = await executeQuery(headerQuery, [id]);

  // Get sale details
  const detailQuery = `
    SELECT 
      dp.id_detail,
      dp.id_produk,
      dp.jumlah,
      dp.harga_satuan,
      dp.jumlah * dp.harga_satuan as subtotal,
      pr.nama_produk,
      pr.kategori,
      pr.stok as stok_produk,
      pr.harga_jual as harga_produk
    FROM detail_penjualan dp
    LEFT JOIN produk pr ON dp.id_produk = pr.id_produk
    WHERE dp.id_penjualan = ?
    ORDER BY dp.id_detail
  `;

  const saleDetails = await executeQuery(detailQuery, [id]);
  
  

  return {
    ...saleHeader.data[0],
    items: saleDetails.data,
    total_items: saleDetails.data.length,
    total_qty: saleDetails.data.reduce((sum, item) => sum + item.jumlah, 0)
  };
};

module.exports = {
  getAllSales,
  getSaleById,
  getSalesStats,
  createSale,
  updateSale,
  deleteSale,
  searchSales,
  getAvailableProducts,
  getAvailableCustomers
};
