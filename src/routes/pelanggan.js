const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createPelangganSchema, updatePelangganSchema } = require('../utils/validation');
const {
  getAllPelanggan,
  getPelangganById,
  getPelangganStats,
  createPelanggan,
  updatePelanggan,
  deletePelanggan,
  searchPelanggan,
  getPelangganTransactions
} = require('../controllers/pelangganController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Pelanggan:
 *       type: object
 *       properties:
 *         id_pelanggan:
 *           type: integer
 *           description: ID unik pelanggan
 *         nama_pelanggan:
 *           type: string
 *           description: Nama lengkap pelanggan
 *         kontak:
 *           type: string
 *           description: Nomor telepon atau kontak pelanggan
 *         alamat:
 *           type: string
 *           description: Alamat lengkap pelanggan
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal pelanggan didaftarkan
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Tanggal terakhir data pelanggan diperbarui
 *     PelangganRequest:
 *       type: object
 *       required:
 *         - nama_pelanggan
 *         - kontak
 *         - alamat
 *       properties:
 *         nama_pelanggan:
 *           type: string
 *           minLength: 2
 *           maxLength: 255
 *           description: Nama lengkap pelanggan
 *           example: "John Doe"
 *         kontak:
 *           type: string
 *           minLength: 3
 *           maxLength: 255
 *           description: Nomor telepon atau kontak pelanggan
 *           example: "081234567890"
 *         alamat:
 *           type: string
 *           minLength: 5
 *           description: Alamat lengkap pelanggan
 *           example: "Jl. Sudirman No. 123, Jakarta Pusat"
 *     PelangganStats:
 *       type: object
 *       properties:
 *         total_pelanggan:
 *           type: integer
 *           description: Total jumlah pelanggan
 *         active_pelanggan_30_days:
 *           type: integer
 *           description: Jumlah pelanggan yang bertransaksi dalam 30 hari terakhir
 *         top_customers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_pelanggan:
 *                 type: integer
 *               nama_pelanggan:
 *                 type: string
 *               kontak:
 *                 type: string
 *               total_transaksi:
 *                 type: integer
 *               total_pembelian:
 *                 type: number
 *         registration_trend:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *               registrations:
 *                 type: integer
 *     PelangganTransaction:
 *       type: object
 *       properties:
 *         id_penjualan:
 *           type: integer
 *         tanggal_penjualan:
 *           type: string
 *           format: date
 *         total_harga:
 *           type: number
 *         total_items:
 *           type: integer
 *         items_summary:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     PelangganTransactionHistory:
 *       type: object
 *       properties:
 *         customer:
 *           $ref: '#/components/schemas/Pelanggan'
 *         summary:
 *           type: object
 *           properties:
 *             total_transactions:
 *               type: integer
 *             total_spent:
 *               type: number
 *             avg_transaction:
 *               type: number
 *             last_transaction_date:
 *               type: string
 *               format: date
 *         transactions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PelangganTransaction'
 *         pagination:
 *           $ref: '#/components/schemas/Pagination'
 */

/**
 * @swagger
 * /api/v1/pelanggan:
 *   get:
 *     summary: Get all customers with pagination and filtering
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama, kontak, atau alamat
 *     responses:
 *       200:
 *         description: Data pelanggan berhasil diambil
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
 *                   example: "Data pelanggan berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pelanggan:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pelanggan'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, getAllPelanggan);

/**
 * @swagger
 * /api/v1/pelanggan/stats:
 *   get:
 *     summary: Get customer statistics
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik pelanggan berhasil diambil
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
 *                   example: "Statistik pelanggan berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/PelangganStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', authenticateToken, authorizeRole('admin', 'penjualan'), getPelangganStats);

/**
 * @swagger
 * /api/v1/pelanggan/search:
 *   get:
 *     summary: Search customers
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *     responses:
 *       200:
 *         description: Pencarian pelanggan berhasil
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
 *                   example: "Pencarian pelanggan berhasil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pelanggan:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pelanggan'
 *                     total_found:
 *                       type: integer
 *       400:
 *         description: Query pencarian tidak valid
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/search', authenticateToken, searchPelanggan);

/**
 * @swagger
 * /api/v1/pelanggan/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pelanggan
 *     responses:
 *       200:
 *         description: Data pelanggan berhasil diambil
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
 *                   example: "Data pelanggan berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pelanggan:
 *                       $ref: '#/components/schemas/Pelanggan'
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', authenticateToken, getPelangganById);

/**
 * @swagger
 * /api/v1/pelanggan/{id}/transactions:
 *   get:
 *     summary: Get customer transaction history
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pelanggan
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Riwayat transaksi pelanggan berhasil diambil
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
 *                   example: "Riwayat transaksi pelanggan berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/PelangganTransactionHistory'
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/transactions', authenticateToken, getPelangganTransactions);

/**
 * @swagger
 * /api/v1/pelanggan:
 *   post:
 *     summary: Create new customer
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PelangganRequest'
 *           examples:
 *             example1:
 *               summary: Contoh pelanggan baru
 *               value:
 *                 nama_pelanggan: "John Doe"
 *                 kontak: "081234567890"
 *                 alamat: "Jl. Sudirman No. 123, Jakarta Pusat"
 *     responses:
 *       201:
 *         description: Pelanggan berhasil ditambahkan
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
 *                   example: "Pelanggan berhasil ditambahkan"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pelanggan:
 *                       $ref: '#/components/schemas/Pelanggan'
 *       400:
 *         description: Data tidak valid atau pelanggan sudah ada
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', authenticateToken, authorizeRole('admin', 'penjualan'), validate(createPelangganSchema), createPelanggan);

/**
 * @swagger
 * /api/v1/pelanggan/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pelanggan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PelangganRequest'
 *           examples:
 *             example1:
 *               summary: Update data pelanggan
 *               value:
 *                 nama_pelanggan: "John Doe Updated"
 *                 kontak: "081234567891"
 *                 alamat: "Jl. Sudirman No. 124, Jakarta Pusat"
 *     responses:
 *       200:
 *         description: Pelanggan berhasil diperbarui
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
 *                   example: "Pelanggan berhasil diperbarui"
 *                 data:
 *                   type: object
 *                   properties:
 *                     pelanggan:
 *                       $ref: '#/components/schemas/Pelanggan'
 *       400:
 *         description: Data tidak valid atau pelanggan sudah ada
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', authenticateToken, authorizeRole('admin', 'penjualan'), validate(updatePelangganSchema), updatePelanggan);

/**
 * @swagger
 * /api/v1/pelanggan/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Pelanggan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pelanggan
 *     responses:
 *       200:
 *         description: Pelanggan berhasil dihapus
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
 *                   example: "Pelanggan berhasil dihapus"
 *       400:
 *         description: Tidak dapat menghapus pelanggan yang memiliki riwayat transaksi
 *       404:
 *         description: Pelanggan tidak ditemukan
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticateToken, authorizeRole('admin','penjualan'), deletePelanggan);

module.exports = router;
