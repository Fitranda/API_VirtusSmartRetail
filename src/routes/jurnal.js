const express = require('express');
const router = express.Router();
const jurnalController = require('../controllers/jurnalController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createJurnalSchema, updateJurnalSchema } = require('../utils/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Jurnal:
 *       type: object
 *       properties:
 *         id_jurnal:
 *           type: integer
 *           description: ID jurnal
 *         id_akun:
 *           type: integer
 *           description: ID akun
 *         tanggal_jurnal:
 *           type: string
 *           format: date
 *           description: Tanggal jurnal entry
 *         debet:
 *           type: number
 *           description: Jumlah debet
 *         kredit:
 *           type: number
 *           description: Jumlah kredit
 *         keterangan:
 *           type: string
 *           description: Keterangan transaksi
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         akun:
 *           type: object
 *           properties:
 *             nama_akun:
 *               type: string
 *               description: Nama akun
 *             tipe:
 *               type: string
 *               enum: [Asset, Kewajiban, Ekuitas, Pendapatan, Beban]
 *               description: Tipe akun
 *     
 *     CreateJurnalRequest:
 *       type: object
 *       required:
 *         - id_akun
 *         - tanggal_jurnal
 *         - keterangan
 *       properties:
 *         id_akun:
 *           type: integer
 *           description: ID akun
 *           example: 1
 *         tanggal_jurnal:
 *           type: string
 *           format: date
 *           description: Tanggal jurnal entry
 *           example: "2024-12-01"
 *         debet:
 *           type: number
 *           description: Jumlah debet (0 jika kredit)
 *           example: 100000
 *           default: 0
 *         kredit:
 *           type: number
 *           description: Jumlah kredit (0 jika debet)
 *           example: 0
 *           default: 0
 *         keterangan:
 *           type: string
 *           description: Keterangan transaksi
 *           example: "Penerimaan kas dari penjualan"
 *
 *     UpdateJurnalRequest:
 *       type: object
 *       properties:
 *         id_akun:
 *           type: integer
 *           description: ID akun
 *         tanggal_jurnal:
 *           type: string
 *           format: date
 *           description: Tanggal jurnal entry
 *         debet:
 *           type: number
 *           description: Jumlah debet
 *         kredit:
 *           type: number
 *           description: Jumlah kredit
 *         keterangan:
 *           type: string
 *           description: Keterangan transaksi
 *
 *     TrialBalance:
 *       type: object
 *       properties:
 *         periode:
 *           type: string
 *           description: Periode neraca saldo
 *         accounts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_akun:
 *                 type: integer
 *               nama_akun:
 *                 type: string
 *               tipe:
 *                 type: string
 *               total_debet:
 *                 type: number
 *               total_kredit:
 *                 type: number
 *               saldo:
 *                 type: number
 *         totals:
 *           type: object
 *           properties:
 *             total_debet:
 *               type: number
 *             total_kredit:
 *               type: number
 *         is_balanced:
 *           type: boolean
 *           description: Apakah debet dan kredit seimbang
 *
 *     GeneralLedger:
 *       type: object
 *       properties:
 *         akun:
 *           type: object
 *           properties:
 *             id_akun:
 *               type: integer
 *             nama_akun:
 *               type: string
 *             tipe:
 *               type: string
 *         periode:
 *           type: object
 *           properties:
 *             start_date:
 *               type: string
 *             end_date:
 *               type: string
 *         saldo_awal:
 *           type: number
 *         transactions:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/Jurnal'
 *               - type: object
 *                 properties:
 *                   saldo:
 *                     type: number
 *                     description: Saldo berjalan
 *         saldo_akhir:
 *           type: number
 *         summary:
 *           type: object
 *           properties:
 *             total_transaksi:
 *               type: integer
 *             total_debet:
 *               type: number
 *             total_kredit:
 *               type: number
 */

/**
 * @swagger
 * /api/v1/jurnal:
 *   get:
 *     summary: Get all jurnal dengan pagination dan filter
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search dalam keterangan atau nama akun
 *       - in: query
 *         name: akun
 *         schema:
 *           type: integer
 *         description: Filter by ID akun
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter dari tanggal
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sampai tanggal
 *       - in: query
 *         name: tipe
 *         schema:
 *           type: string
 *           enum: [debet, kredit]
 *         description: Filter by tipe transaksi
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Jurnal'
 *                         pagination:
 *                           $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticateToken, authorizeRole('Admin', 'Keuangan'), jurnalController.getAllJurnal);

/**
 * @swagger
 * /api/v1/jurnal/stats:
 *   get:
 *     summary: Get statistik jurnal
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           type: object
 *                           properties:
 *                             total_jurnal:
 *                               type: integer
 *                             total_debet:
 *                               type: number
 *                             total_kredit:
 *                               type: number
 *                             jurnal_bulan_ini:
 *                               type: integer
 *                             balance_check:
 *                               type: boolean
 *                         saldo_per_tipe:
 *                           type: array
 *                           items:
 *                             type: object
 *                         top_akun:
 *                           type: array
 *                           items:
 *                             type: object
 *                         monthly_trend:
 *                           type: array
 *                           items:
 *                             type: object
 */
router.get('/stats', authenticateToken, authorizeRole('Admin', 'Keuangan'), jurnalController.getJurnalStats);

/**
 * @swagger
 * /api/v1/jurnal/trial-balance:
 *   get:
 *     summary: Get neraca saldo (trial balance)
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *         description: Filter periode (YYYY-MM atau YYYY)
 *         example: "2024-12"
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TrialBalance'
 */
router.get('/trial-balance', authenticateToken, authorizeRole('Admin', 'Keuangan'), jurnalController.getTrialBalance);

/**
 * @swagger
 * /api/v1/jurnal/general-ledger/{id_akun}:
 *   get:
 *     summary: Get buku besar untuk akun tertentu
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_akun
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID akun
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter dari tanggal
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter sampai tanggal
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/GeneralLedger'
 *       404:
 *         description: Akun tidak ditemukan
 */
router.get('/general-ledger/:id_akun', authenticateToken, authorizeRole('Admin', 'Keuangan'), jurnalController.getGeneralLedger);

/**
 * @swagger
 * /api/v1/jurnal/search:
 *   get:
 *     summary: Search jurnal
 *     tags: [Jurnal]
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
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Jurnal'
 */
router.get('/search', authenticateToken, authorizeRole('Admin', 'Keuangan'), jurnalController.searchJurnal);

/**
 * @swagger
 * /api/v1/jurnal/{id}:
 *   get:
 *     summary: Get jurnal by ID
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID jurnal
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Jurnal'
 *       404:
 *         description: Jurnal tidak ditemukan
 */
router.get('/:id', authenticateToken, authorizeRole('Admin', 'Keuangan'), jurnalController.getJurnalById);

/**
 * @swagger
 * /api/v1/jurnal:
 *   post:
 *     summary: Create jurnal entry baru
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJurnalRequest'
 *     responses:
 *       201:
 *         description: Jurnal berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Jurnal'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Akun tidak ditemukan
 */
router.post('/', authenticateToken, authorizeRole('Admin', 'Keuangan'), validate(createJurnalSchema), jurnalController.createJurnal);

/**
 * @swagger
 * /api/v1/jurnal/{id}:
 *   put:
 *     summary: Update jurnal
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID jurnal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateJurnalRequest'
 *     responses:
 *       200:
 *         description: Jurnal berhasil diupdate
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Jurnal'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Jurnal atau akun tidak ditemukan
 */
router.put('/:id', authenticateToken, authorizeRole('Admin', 'Keuangan'), validate(updateJurnalSchema), jurnalController.updateJurnal);

/**
 * @swagger
 * /api/v1/jurnal/{id}:
 *   delete:
 *     summary: Delete jurnal
 *     tags: [Jurnal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID jurnal
 *     responses:
 *       200:
 *         description: Jurnal berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Jurnal tidak ditemukan
 */
router.delete('/:id', authenticateToken, authorizeRole('Admin', 'Keuangan'), jurnalController.deleteJurnal);

module.exports = router;
