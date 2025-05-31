const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createSaleSchema, updateSaleSchema } = require('../utils/validation');
const {
  getAllSales,
  getSaleById,
  getSalesStats,
  createSale,
  updateSale,
  deleteSale,
  searchSales,
  getAvailableProducts,
  getAvailableCustomers
} = require('../controllers/posController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SaleItem:
 *       type: object
 *       required:
 *         - id_produk
 *         - jumlah
 *         - harga_satuan
 *       properties:
 *         id_produk:
 *           type: integer
 *           description: ID produk
 *           example: 1
 *         jumlah:
 *           type: integer
 *           minimum: 1
 *           description: Jumlah produk yang dibeli
 *           example: 2
 *         harga_satuan:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: Harga satuan produk
 *           example: 15000.00
 *     
 *     CreateSale:
 *       type: object
 *       required:
 *         - id_pelanggan
 *         - tanggal_penjualan
 *         - items
 *       properties:
 *         id_pelanggan:
 *           type: integer
 *           description: ID pelanggan
 *           example: 1
 *         tanggal_penjualan:
 *           type: string
 *           format: date
 *           description: Tanggal penjualan
 *           example: "2024-12-07"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *           description: Daftar item yang dijual
 *     
 *     UpdateSale:
 *       type: object
 *       required:
 *         - id_pelanggan
 *         - tanggal_penjualan
 *         - items
 *       properties:
 *         id_pelanggan:
 *           type: integer
 *           description: ID pelanggan
 *           example: 1
 *         tanggal_penjualan:
 *           type: string
 *           format: date
 *           description: Tanggal penjualan
 *           example: "2024-12-07"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *           description: Daftar item yang dijual
 *     
 *     Sale:
 *       type: object
 *       properties:
 *         id_penjualan:
 *           type: integer
 *           description: ID penjualan
 *           example: 1
 *         tanggal_penjualan:
 *           type: string
 *           format: date
 *           description: Tanggal penjualan
 *           example: "2024-12-07"
 *         total_harga:
 *           type: number
 *           format: decimal
 *           description: Total harga penjualan
 *           example: 150000.00
 *         id_pelanggan:
 *           type: integer
 *           description: ID pelanggan
 *           example: 1
 *         nama_pelanggan:
 *           type: string
 *           description: Nama pelanggan
 *           example: "John Doe"
 *         customer_kontak:
 *           type: string
 *           description: Kontak pelanggan
 *           example: "081234567890"
 *         customer_alamat:
 *           type: string
 *           description: Alamat pelanggan
 *           example: "Jl. Example No. 123"
 *         total_items:
 *           type: integer
 *           description: Total jenis item
 *           example: 2
 *         total_qty:
 *           type: integer
 *           description: Total quantity
 *           example: 5
 *         created_at:
 *           type: string
 *           format: datetime
 *           description: Waktu pembuatan
 *         updated_at:
 *           type: string
 *           format: datetime
 *           description: Waktu pembaruan
 *     
 *     SaleDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/Sale'
 *         - type: object
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_detail:
 *                     type: integer
 *                     description: ID detail penjualan
 *                     example: 1
 *                   id_produk:
 *                     type: integer
 *                     description: ID produk
 *                     example: 1
 *                   jumlah:
 *                     type: integer
 *                     description: Jumlah produk
 *                     example: 2
 *                   harga_satuan:
 *                     type: number
 *                     format: decimal
 *                     description: Harga satuan
 *                     example: 15000.00
 *                   subtotal:
 *                     type: number
 *                     format: decimal
 *                     description: Subtotal
 *                     example: 30000.00
 *                   nama_produk:
 *                     type: string
 *                     description: Nama produk
 *                     example: "Produk A"
 *                   kategori:
 *                     type: string
 *                     description: Kategori produk
 *                     example: "Elektronik"
 *                   stok_produk:
 *                     type: integer
 *                     description: Stok produk saat ini
 *                     example: 50
 *                   harga_produk:
 *                     type: number
 *                     format: decimal
 *                     description: Harga produk saat ini
 *                     example: 15000.00
 *     
 *     SalesStats:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             total_sales:
 *               type: integer
 *               description: Total penjualan
 *               example: 150
 *             total_revenue:
 *               type: number
 *               format: decimal
 *               description: Total pendapatan
 *               example: 5000000.00
 *             sales_this_month:
 *               type: integer
 *               description: Penjualan bulan ini
 *               example: 25
 *             revenue_this_month:
 *               type: number
 *               format: decimal
 *               description: Pendapatan bulan ini
 *               example: 750000.00
 *             sales_today:
 *               type: integer
 *               description: Penjualan hari ini
 *               example: 5
 *             revenue_today:
 *               type: number
 *               format: decimal
 *               description: Pendapatan hari ini
 *               example: 150000.00
 *         top_customers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_pelanggan:
 *                 type: integer
 *                 example: 1
 *               nama_pelanggan:
 *                 type: string
 *                 example: "John Doe"
 *               total_transactions:
 *                 type: integer
 *                 example: 15
 *               total_spent:
 *                 type: number
 *                 format: decimal
 *                 example: 500000.00
 *         top_products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_produk:
 *                 type: integer
 *                 example: 1
 *               nama_produk:
 *                 type: string
 *                 example: "Produk A"
 *               kategori:
 *                 type: string
 *                 example: "Elektronik"
 *               total_sold:
 *                 type: integer
 *                 example: 100
 *               total_revenue:
 *                 type: number
 *                 format: decimal
 *                 example: 1500000.00
 *         sales_trend:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-07"
 *               total_transactions:
 *                 type: integer
 *                 example: 10
 *               total_revenue:
 *                 type: number
 *                 format: decimal
 *                 example: 300000.00
 *     
 *     Product:
 *       type: object
 *       properties:
 *         id_produk:
 *           type: integer
 *           description: ID produk
 *           example: 1
 *         nama_produk:
 *           type: string
 *           description: Nama produk
 *           example: "Produk A"
 *         kategori:
 *           type: string
 *           description: Kategori produk
 *           example: "Elektronik"
 *         harga:
 *           type: number
 *           format: decimal
 *           description: Harga produk
 *           example: 15000.00
 *         stok:
 *           type: integer
 *           description: Stok produk
 *           example: 50
 *         created_at:
 *           type: string
 *           format: datetime
 *           description: Waktu pembuatan
 *         updated_at:
 *           type: string
 *           format: datetime
 *           description: Waktu pembaruan
 *     
 *     Customer:
 *       type: object
 *       properties:
 *         id_pelanggan:
 *           type: integer
 *           description: ID pelanggan
 *           example: 1
 *         nama_pelanggan:
 *           type: string
 *           description: Nama pelanggan
 *           example: "John Doe"
 *         kontak:
 *           type: string
 *           description: Kontak pelanggan
 *           example: "081234567890"
 *         alamat:
 *           type: string
 *           description: Alamat pelanggan
 *           example: "Jl. Example No. 123"
 *         created_at:
 *           type: string
 *           format: datetime
 *           description: Waktu pembuatan
 *         updated_at:
 *           type: string
 *           format: datetime
 *           description: Waktu pembaruan
 */

/**
 * @swagger
 * /api/v1/pos/sales:
 *   get:
 *     summary: Get all sales transactions
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by transaction ID or customer name
 *       - in: query
 *         name: customer
 *         schema:
 *           type: integer
 *         description: Filter by customer ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Sales retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Data penjualan berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sale'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/sales', authenticateToken, getAllSales);

/**
 * @swagger
 * /api/v1/pos/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Detail penjualan berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/SaleDetail'
 *       404:
 *         description: Sale not found
 */
router.get('/sales/:id', authenticateToken, getSaleById);

/**
 * @swagger
 * /api/v1/pos/sales/stats:
 *   get:
 *     summary: Get sales statistics
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sales statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Statistik penjualan berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/SalesStats'
 */
router.get('/sales/stats', authenticateToken, getSalesStats);

/**
 * @swagger
 * /api/v1/pos/sales:
 *   post:
 *     summary: Create new sale transaction
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSale'
 *     responses:
 *       201:
 *         description: Sale created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaksi penjualan berhasil dibuat"
 *                 data:
 *                   $ref: '#/components/schemas/SaleDetail'
 *       400:
 *         description: Invalid request or insufficient stock
 */
router.post('/sales', authenticateToken, authorizeRole('admin', 'Penjualan'), validate(createSaleSchema), createSale);

/**
 * @swagger
 * /api/v1/pos/sales/{id}:
 *   put:
 *     summary: Update sale transaction
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSale'
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaksi penjualan berhasil diupdate"
 *                 data:
 *                   $ref: '#/components/schemas/SaleDetail'
 *       400:
 *         description: Invalid request or insufficient stock
 *       404:
 *         description: Sale not found
 */
router.put('/sales/:id', authenticateToken, authorizeRole('admin', 'Penjualan'), (req, res, next) => {
  const { error } = updateSaleSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
}, updateSale);

/**
 * @swagger
 * /api/v1/pos/sales/{id}:
 *   delete:
 *     summary: Delete sale transaction
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaksi penjualan berhasil dihapus"
 *       404:
 *         description: Sale not found
 */
router.delete('/sales/:id', authenticateToken, authorizeRole('admin'), deleteSale);

/**
 * @swagger
 * /api/v1/pos/sales/search:
 *   get:
 *     summary: Search sales transactions
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Hasil pencarian penjualan"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Search query is required
 */
router.get('/sales/search', authenticateToken, searchSales);

/**
 * @swagger
 * /api/v1/pos/products:
 *   get:
 *     summary: Get available products for POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Available products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Produk tersedia berhasil diambil"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/products', authenticateToken, getAvailableProducts);

/**
 * @swagger
 * /api/v1/pos/customers:
 *   get:
 *     summary: Get available customers for POS
 *     tags: [POS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name or contact
 *     responses:
 *       200:
 *         description: Available customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Pelanggan tersedia berhasil diambil"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 */
router.get('/customers', authenticateToken, getAvailableCustomers);

module.exports = router;
