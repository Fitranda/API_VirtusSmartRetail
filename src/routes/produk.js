const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createProdukSchema, updateProdukSchema, updateStokSchema } = require('../utils/validation');
const produkController = require('../controllers/produkController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Produk:
 *       type: object
 *       properties:
 *         id_produk:
 *           type: integer
 *           description: ID produk (auto-generated)
 *         nama_produk:
 *           type: string
 *           description: Nama produk
 *         kategori:
 *           type: string
 *           description: Kategori produk
 *         stok:
 *           type: integer
 *           description: Jumlah stok
 *         harga_beli:
 *           type: number
 *           description: Harga beli produk
 *         harga_jual:
 *           type: number
 *           description: Harga jual produk
 *         profit:
 *           type: number
 *           description: Profit per unit (harga_jual - harga_beli)
 *         margin_persen:
 *           type: number
 *           description: Margin profit dalam persen
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateProdukRequest:
 *       type: object
 *       required:
 *         - nama_produk
 *         - kategori
 *         - stok
 *         - harga_beli
 *         - harga_jual
 *       properties:
 *         nama_produk:
 *           type: string
 *           description: Nama produk
 *           example: "Beras Premium"
 *         kategori:
 *           type: string
 *           description: Kategori produk
 *           example: "Sembako"
 *         stok:
 *           type: integer
 *           description: Jumlah stok
 *           example: 50
 *         harga_beli:
 *           type: number
 *           description: Harga beli produk
 *           example: 10000
 *         harga_jual:
 *           type: number
 *           description: Harga jual produk
 *           example: 12500
 *     UpdateProdukRequest:
 *       type: object
 *       properties:
 *         nama_produk:
 *           type: string
 *           description: Nama produk
 *           example: "Beras Premium Grade A"
 *         kategori:
 *           type: string
 *           description: Kategori produk
 *           example: "Sembako"
 *         stok:
 *           type: integer
 *           description: Jumlah stok
 *           example: 75
 *         harga_beli:
 *           type: number
 *           description: Harga beli produk
 *           example: 11000
 *         harga_jual:
 *           type: number
 *           description: Harga jual produk
 *           example: 13000
 *     UpdateStokRequest:
 *       type: object
 *       required:
 *         - stok
 *       properties:
 *         stok:
 *           type: integer
 *           description: Jumlah stok
 *           example: 20
 *         operasi:
 *           type: string
 *           enum: [set, tambah, kurang]
 *           description: Jenis operasi stok
 *           example: "tambah"
 *     ProdukStats:
 *       type: object
 *       properties:
 *         total_produk:
 *           type: integer
 *           description: Total jumlah produk
 *         total_stok:
 *           type: integer
 *           description: Total stok semua produk
 *         produk_stok_rendah:
 *           type: integer
 *           description: Jumlah produk dengan stok <= 10
 *         rata_rata_harga:
 *           type: string
 *           description: Rata-rata harga jual
 *         nilai_stok_beli:
 *           type: string
 *           description: Total nilai stok berdasarkan harga beli
 *         nilai_stok_jual:
 *           type: string
 *           description: Total nilai stok berdasarkan harga jual
 *         profit_potensial:
 *           type: string
 *           description: Profit potensial dari seluruh stok
 *         harga_termurah:
 *           type: number
 *           description: Harga produk termurah
 *         harga_termahal:
 *           type: number
 *           description: Harga produk termahal
 *         distribusi_kategori:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               kategori:
 *                 type: string
 *               jumlah_produk:
 *                 type: integer
 *               total_stok:
 *                 type: integer
 *               rata_rata_harga:
 *                 type: string
 *         produk_stok_rendah_detail:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_produk:
 *                 type: integer
 *               nama_produk:
 *                 type: string
 *               kategori:
 *                 type: string
 *               stok:
 *                 type: integer
 */

/**
 * @swagger
 * /api/v1/produk:
 *   get:
 *     summary: Get all produk with pagination and filters
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *       - in: query
 *         name: kategori
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori
 *       - in: query
 *         name: stok_min
 *         schema:
 *           type: integer
 *         description: Filter stok minimum
 *       - in: query
 *         name: stok_max
 *         schema:
 *           type: integer
 *         description: Filter stok maksimum
 *       - in: query
 *         name: harga_min
 *         schema:
 *           type: number
 *         description: Filter harga minimum
 *       - in: query
 *         name: harga_max
 *         schema:
 *           type: number
 *         description: Filter harga maksimum
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama produk
 *       - in: query
 *         name: stok_rendah
 *         schema:
 *           type: boolean
 *         description: Filter produk stok rendah (stok <= 10)
 *     responses:
 *       200:
 *         description: Data produk berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Produk'
 *                 pagination:
 *                   type: object
 *   post:
 *     summary: Create new produk
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProdukRequest'
 *     responses:
 *       201:
 *         description: Produk berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Produk'
 *       400:
 *         description: Validation error atau nama produk sudah ada
 *       403:
 *         description: Tidak memiliki akses untuk menambah produk
 */
router.get('/', authenticateToken, produkController.getAllProduk);
router.post('/', authenticateToken, authorizeRole('admin', 'Inventaris'), validate(createProdukSchema), produkController.createProduk);

/**
 * @swagger
 * /api/v1/produk/stats:
 *   get:
 *     summary: Get produk statistics
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik produk berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ProdukStats'
 */
router.get('/stats', authenticateToken, authorizeRole('admin', 'Inventaris'), produkController.getProdukStats);

/**
 * @swagger
 * /api/v1/produk/kategori:
 *   get:
 *     summary: Get list of product categories
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar kategori berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/kategori', authenticateToken, produkController.getKategoriList);

/**
 * @swagger
 * /api/v1/produk/{id}:
 *   get:
 *     summary: Get produk by ID
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produk
 *     responses:
 *       200:
 *         description: Data produk berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Produk'
 *       404:
 *         description: Produk tidak ditemukan
 *   put:
 *     summary: Update produk
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProdukRequest'
 *     responses:
 *       200:
 *         description: Data produk berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Produk'
 *       400:
 *         description: Validation error atau nama produk sudah ada
 *       404:
 *         description: Produk tidak ditemukan
 *       403:
 *         description: Tidak memiliki akses untuk mengupdate produk
 *   delete:
 *     summary: Delete produk
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produk
 *     responses:
 *       200:
 *         description: Produk berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Produk tidak ditemukan
 *       403:
 *         description: Tidak memiliki akses untuk menghapus produk
 */
router.get('/:id', authenticateToken, produkController.getProdukById);
router.put('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), validate(updateProdukSchema), produkController.updateProduk);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), produkController.deleteProduk);

/**
 * @swagger
 * /api/v1/produk/{id}/stok:
 *   patch:
 *     summary: Update stok produk
 *     tags: [Produk]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID produk
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStokRequest'
 *     responses:
 *       200:
 *         description: Stok produk berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_produk:
 *                       type: integer
 *                     nama_produk:
 *                       type: string
 *                     stok:
 *                       type: integer
 *                     updated_at:
 *                       type: string
 *       400:
 *         description: Validation error atau stok negatif
 *       404:
 *         description: Produk tidak ditemukan
 */
router.patch('/:id/stok', authenticateToken, authorizeRole('admin', 'Inventaris','Keuangan','Penjualan'), validate(updateStokSchema), produkController.updateStok);

module.exports = router;
