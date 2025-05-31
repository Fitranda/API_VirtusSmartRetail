const express = require('express');
const router = express.Router();
const penggajianController = require('../controllers/penggajianController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createPenggajianSchema, updatePenggajianSchema, generateBulkPenggajianSchema } = require('../utils/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Penggajian:
 *       type: object
 *       properties:
 *         id_penggajian:
 *           type: integer
 *           description: ID penggajian
 *         id_karyawan:
 *           type: integer
 *           description: ID karyawan
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal penggajian
 *         gaji_pokok:
 *           type: number
 *           description: Gaji pokok karyawan
 *         tunjangan:
 *           type: number
 *           description: Tunjangan tambahan
 *         potongan:
 *           type: number
 *           description: Potongan gaji
 *         total_gaji:
 *           type: number
 *           description: Total gaji yang diterima
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         karyawan:
 *           type: object
 *           properties:
 *             nama:
 *               type: string
 *               description: Nama karyawan
 *             posisi:
 *               type: string
 *               description: Posisi karyawan
 *             username:
 *               type: string
 *               description: Username karyawan
 *             status:
 *               type: string
 *               description: Status karyawan
 *     
 *     CreatePenggajianRequest:
 *       type: object
 *       required:
 *         - id_karyawan
 *         - tanggal
 *       properties:
 *         id_karyawan:
 *           type: integer
 *           description: ID karyawan
 *           example: 1
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal penggajian
 *           example: "2025-01-15"
 *         tunjangan:
 *           type: number
 *           description: Tunjangan tambahan
 *           example: 500000
 *           default: 0
 *         potongan:
 *           type: number
 *           description: Potongan gaji
 *           example: 100000
 *           default: 0
 *     
 *     UpdatePenggajianRequest:
 *       type: object
 *       properties:
 *         id_karyawan:
 *           type: integer
 *           description: ID karyawan
 *           example: 1
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal penggajian
 *           example: "2025-01-15"
 *         tunjangan:
 *           type: number
 *           description: Tunjangan tambahan
 *           example: 500000
 *         potongan:
 *           type: number
 *           description: Potongan gaji
 *           example: 100000
 *     
 *     GenerateBulkPenggajianRequest:
 *       type: object
 *       required:
 *         - tanggal
 *       properties:
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal penggajian untuk semua karyawan
 *           example: "2025-01-31"
 *         default_tunjangan:
 *           type: number
 *           description: Default tunjangan untuk semua karyawan
 *           example: 300000
 *           default: 0
 *         default_potongan:
 *           type: number
 *           description: Default potongan untuk semua karyawan
 *           example: 50000
 *           default: 0
 */

/**
 * @swagger
 * /api/v1/penggajian:
 *   get:
 *     summary: Get all penggajian dengan pagination dan filter
 *     tags: [Penggajian]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama atau posisi karyawan
 *       - in: query
 *         name: karyawan
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID karyawan
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir
 *       - in: query
 *         name: bulan
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Filter berdasarkan bulan
 *       - in: query
 *         name: tahun
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan tahun
 *     responses:
 *       200:
 *         description: Data penggajian berhasil diambil
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
 *                   example: "Data penggajian berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Penggajian'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *                         totalData:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, authorizeRole('Admin', 'HRD', 'Keuangan'), penggajianController.getAllPenggajian);

/**
 * @swagger
 * /api/v1/penggajian/{id}:
 *   get:
 *     summary: Get penggajian by ID
 *     tags: [Penggajian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID penggajian
 *     responses:
 *       200:
 *         description: Detail penggajian berhasil diambil
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
 *                   example: "Detail penggajian berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/Penggajian'
 *       404:
 *         description: Penggajian tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateToken, authorizeRole('Admin', 'HRD', 'Keuangan'), penggajianController.getPenggajianById);

/**
 * @swagger
 * /api/v1/penggajian/stats/overview:
 *   get:
 *     summary: Get statistik penggajian
 *     tags: [Penggajian]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik penggajian berhasil diambil
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
 *                   example: "Statistik penggajian berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         total_penggajian:
 *                           type: integer
 *                           description: Total penggajian yang telah dibuat
 *                         total_gaji_dibayarkan:
 *                           type: number
 *                           description: Total gaji yang telah dibayarkan
 *                         penggajian_bulan_ini:
 *                           type: integer
 *                           description: Jumlah penggajian bulan ini
 *                         total_gaji_bulan_ini:
 *                           type: number
 *                           description: Total gaji bulan ini
 *                         rata_rata_gaji:
 *                           type: number
 *                           description: Rata-rata gaji
 *                         total_karyawan_aktif:
 *                           type: integer
 *                           description: Total karyawan aktif
 *                     monthly_trend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           bulan:
 *                             type: string
 *                           jumlah_penggajian:
 *                             type: integer
 *                           total_gaji:
 *                             type: number
 *                           rata_rata_gaji:
 *                             type: number
 *                     top_earners:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           nama_karyawan:
 *                             type: string
 *                           posisi:
 *                             type: string
 *                           total_gaji:
 *                             type: number
 *                           tanggal:
 *                             type: string
 *                             format: date
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats/overview', authenticateToken, authorizeRole('Admin', 'HRD', 'Keuangan'), penggajianController.getPenggajianStats);

/**
 * @swagger
 * /api/v1/penggajian:
 *   post:
 *     summary: Create penggajian baru
 *     tags: [Penggajian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePenggajianRequest'
 *     responses:
 *       201:
 *         description: Penggajian berhasil dibuat
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
 *                   example: "Penggajian berhasil dibuat"
 *                 data:
 *                   $ref: '#/components/schemas/Penggajian'
 *       400:
 *         description: Validation error atau karyawan tidak aktif
 *       404:
 *         description: Karyawan tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, authorizeRole('Admin', 'Keuangan'), validate(createPenggajianSchema), penggajianController.createPenggajian);

/**
 * @swagger
 * /api/v1/penggajian/bulk/generate:
 *   post:
 *     summary: Generate bulk penggajian untuk semua karyawan aktif
 *     tags: [Penggajian]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateBulkPenggajianRequest'
 *     responses:
 *       201:
 *         description: Bulk penggajian berhasil diproses
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
 *                   example: "Bulk penggajian selesai diproses"
 *                 data:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_penggajian:
 *                             type: integer
 *                           nama_karyawan:
 *                             type: string
 *                           total_gaji:
 *                             type: number
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_karyawan:
 *                           type: integer
 *                         berhasil_dibuat:
 *                           type: integer
 *                         gagal:
 *                           type: integer
 *       400:
 *         description: Validation error
 *       404:
 *         description: Tidak ada karyawan aktif
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/bulk/generate', authenticateToken, authorizeRole('Admin', 'Keuangan'), validate(generateBulkPenggajianSchema), penggajianController.generateBulkPenggajian);

/**
 * @swagger
 * /api/v1/penggajian/{id}:
 *   put:
 *     summary: Update penggajian
 *     tags: [Penggajian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID penggajian
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePenggajianRequest'
 *     responses:
 *       200:
 *         description: Penggajian berhasil diupdate
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
 *                   example: "Penggajian berhasil diupdate"
 *                 data:
 *                   $ref: '#/components/schemas/Penggajian'
 *       400:
 *         description: Validation error atau karyawan tidak aktif
 *       404:
 *         description: Penggajian atau karyawan tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, authorizeRole('Admin', 'Keuangan'), validate(updatePenggajianSchema), penggajianController.updatePenggajian);

/**
 * @swagger
 * /api/v1/penggajian/{id}:
 *   delete:
 *     summary: Delete penggajian
 *     tags: [Penggajian]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID penggajian
 *     responses:
 *       200:
 *         description: Penggajian berhasil dihapus
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
 *                   example: "Penggajian berhasil dihapus"
 *       404:
 *         description: Penggajian tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, authorizeRole('Admin', 'Keuangan'), penggajianController.deletePenggajian);

/**
 * @swagger
 * /api/v1/penggajian/search:
 *   get:
 *     summary: Search penggajian berdasarkan nama atau posisi karyawan
 *     tags: [Penggajian]
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
 *         description: Hasil pencarian penggajian
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
 *                   example: "Hasil pencarian penggajian"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_penggajian:
 *                         type: integer
 *                       tanggal:
 *                         type: string
 *                         format: date
 *                       gaji_pokok:
 *                         type: number
 *                       tunjangan:
 *                         type: number
 *                       potongan:
 *                         type: number
 *                       total_gaji:
 *                         type: number
 *                       nama_karyawan:
 *                         type: string
 *                       posisi:
 *                         type: string
 *       400:
 *         description: Query pencarian tidak boleh kosong
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/search', authenticateToken, authorizeRole('Admin', 'HRD', 'Keuangan'), penggajianController.searchPenggajian);

module.exports = router;
