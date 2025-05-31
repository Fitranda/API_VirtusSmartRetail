const express = require('express');
const router = express.Router();
const pembelianController = require('../controllers/pembelianController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createPembelianSchema, updatePembelianSchema } = require('../utils/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Pembelian:
 *       type: object
 *       properties:
 *         id_pembelian:
 *           type: integer
 *           description: ID pembelian
 *         id_supplier:
 *           type: integer
 *           description: ID supplier
 *         no_faktur:
 *           type: string
 *           description: Nomor faktur pembelian
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal pembelian
 *         total:
 *           type: number
 *           description: Total nilai pembelian
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         supplier:
 *           type: object
 *           properties:
 *             nama_supplier:
 *               type: string
 *               description: Nama supplier
 *             kontak:
 *               type: string
 *               description: Kontak supplier
 *             alamat:
 *               type: string
 *               description: Alamat supplier
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID detail pembelian
 *               id_produk:
 *                 type: integer
 *                 description: ID produk
 *               jumlah:
 *                 type: integer
 *                 description: Jumlah produk dibeli
 *               harga:
 *                 type: number
 *                 description: Harga per unit
 *               subtotal:
 *                 type: number
 *                 description: Total harga per item
 *               nama_produk:
 *                 type: string
 *                 description: Nama produk
 *               kategori:
 *                 type: string
 *                 description: Kategori produk
 *     CreatePembelianRequest:
 *       type: object
 *       required:
 *         - id_supplier
 *         - no_faktur
 *         - tanggal
 *         - items
 *       properties:
 *         id_supplier:
 *           type: integer
 *           description: ID supplier
 *           example: 1
 *         no_faktur:
 *           type: string
 *           description: Nomor faktur pembelian
 *           example: "FB-2024-001"
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal pembelian
 *           example: "2024-01-15"
 *         items:
 *           type: array
 *           description: Daftar item yang dibeli
 *           items:
 *             type: object
 *             required:
 *               - id_produk
 *               - jumlah
 *               - harga
 *             properties:
 *               id_produk:
 *                 type: integer
 *                 description: ID produk
 *                 example: 1
 *               jumlah:
 *                 type: integer
 *                 description: Jumlah yang dibeli
 *                 example: 10
 *               harga:
 *                 type: number
 *                 description: Harga per unit
 *                 example: 12000
 *     UpdatePembelianRequest:
 *       type: object
 *       properties:
 *         id_supplier:
 *           type: integer
 *           description: ID supplier
 *           example: 1
 *         no_faktur:
 *           type: string
 *           description: Nomor faktur pembelian
 *           example: "FB-2024-001"
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal pembelian
 *           example: "2024-01-15"
 *         items:
 *           type: array
 *           description: Daftar item yang dibeli
 *           items:
 *             type: object
 *             required:
 *               - id_produk
 *               - jumlah
 *               - harga
 *             properties:
 *               id_produk:
 *                 type: integer
 *                 description: ID produk
 *                 example: 1
 *               jumlah:
 *                 type: integer
 *                 description: Jumlah yang dibeli
 *                 example: 10
 *               harga:
 *                 type: number
 *                 description: Harga per unit
 *                 example: 12000
 */

/**
 * @swagger
 * /api/v1/pembelian:
 *   get:
 *     summary: Get all pembelian dengan pagination dan filter
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Halaman yang diminta
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan no_faktur atau nama supplier
 *       - in: query
 *         name: supplier
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID supplier
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Data pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Pembelian'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *                             totalData:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticateToken, authorizeRole('Admin', 'Keuangan'), pembelianController.getAllPembelian);

/**
 * @swagger
 * /api/v1/pembelian/stats:
 *   get:
 *     summary: Get statistik pembelian
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           type: object
 *                           properties:
 *                             total_pembelian:
 *                               type: integer
 *                               description: Total jumlah pembelian
 *                             total_nilai_pembelian:
 *                               type: number
 *                               description: Total nilai pembelian
 *                             pembelian_bulan_ini:
 *                               type: integer
 *                               description: Jumlah pembelian bulan ini
 *                             nilai_bulan_ini:
 *                               type: number
 *                               description: Total nilai pembelian bulan ini
 *                         top_suppliers:
 *                           type: array
 *                           description: Top 5 supplier berdasarkan nilai pembelian
 *                           items:
 *                             type: object
 *                             properties:
 *                               id_supplier:
 *                                 type: integer
 *                               nama_supplier:
 *                                 type: string
 *                               total_transaksi:
 *                                 type: integer
 *                               total_nilai_pembelian:
 *                                 type: number
 *                         monthly_trend:
 *                           type: array
 *                           description: Trend pembelian per bulan (6 bulan terakhir)
 *                           items:
 *                             type: object
 *                             properties:
 *                               bulan:
 *                                 type: string
 *                               jumlah_transaksi:
 *                                 type: integer
 *                               total_nilai:
 *                                 type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', authenticateToken, authorizeRole('Admin', 'Keuangan'), pembelianController.getPembelianStats);

/**
 * @swagger
 * /api/v1/pembelian/search:
 *   get:
 *     summary: Search pembelian berdasarkan no_faktur atau nama supplier
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Kata kunci pencarian
 *         example: "FB-2024"
 *     responses:
 *       200:
 *         description: Hasil pencarian pembelian
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pembelian'
 *       400:
 *         description: Query pencarian tidak boleh kosong
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', authenticateToken, authorizeRole('Admin', 'Keuangan'), pembelianController.searchPembelian);

/**
 * @swagger
 * /api/v1/pembelian/{id}:
 *   get:
 *     summary: Get pembelian by ID dengan detail items
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pembelian
 *     responses:
 *       200:
 *         description: Detail pembelian berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Pembelian'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pembelian tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticateToken, authorizeRole('Admin', 'Keuangan'), pembelianController.getPembelianById);

/**
 * @swagger
 * /api/v1/pembelian:
 *   post:
 *     summary: Create pembelian baru dengan detail items
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePembelianRequest'
 *           example:
 *             id_supplier: 1
 *             no_faktur: "FB-2024-001"
 *             tanggal: "2024-01-15"
 *             items:
 *               - id_produk: 1
 *                 jumlah: 10
 *                 harga: 12000
 *               - id_produk: 2
 *                 jumlah: 5
 *                 harga: 15000
 *     responses:
 *       201:
 *         description: Pembelian berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Pembelian'
 *       400:
 *         description: Bad request - validation error atau duplicate no_faktur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticateToken, authorizeRole('Admin', 'Keuangan'), validate(createPembelianSchema), pembelianController.createPembelian);

/**
 * @swagger
 * /api/v1/pembelian/{id}:
 *   put:
 *     summary: Update pembelian dan detail items
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pembelian
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePembelianRequest'
 *           example:
 *             id_supplier: 1
 *             no_faktur: "FB-2024-001-REVISED"
 *             tanggal: "2024-01-15"
 *             items:
 *               - id_produk: 1
 *                 jumlah: 15
 *                 harga: 12500
 *               - id_produk: 3
 *                 jumlah: 8
 *                 harga: 18000
 *     responses:
 *       200:
 *         description: Pembelian berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Pembelian'
 *       400:
 *         description: Bad request - validation error atau duplicate no_faktur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pembelian tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticateToken, authorizeRole('Admin', 'Keuangan'), validate(updatePembelianSchema), pembelianController.updatePembelian);

/**
 * @swagger
 * /api/v1/pembelian/{id}:
 *   delete:
 *     summary: Delete pembelian dan detail items
 *     tags: [Pembelian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pembelian
 *     responses:
 *       200:
 *         description: Pembelian berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Pembelian tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), pembelianController.deletePembelian);

module.exports = router;
