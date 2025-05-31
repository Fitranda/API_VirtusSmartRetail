const express = require('express');
const router = express.Router();
const stokrequestController = require('../controllers/stokrequestController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createStokrequestSchema, updateStokrequestSchema } = require('../utils/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Stokrequest:
 *       type: object
 *       properties:
 *         id_request:
 *           type: integer
 *           description: ID stock request
 *         id_produk:
 *           type: integer
 *           description: ID produk
 *         nama_produk:
 *           type: string
 *           description: Nama produk
 *         kategori:
 *           type: string
 *           description: Kategori produk
 *         stok_saat_ini:
 *           type: integer
 *           description: Stok saat ini di sistem
 *         tanggal_pengajuan:
 *           type: string
 *           format: date
 *           description: Tanggal pengajuan stock request
 *         jumlah:
 *           type: integer
 *           description: Jumlah yang diminta
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status stock request
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       example:
 *         id_request: 1
 *         id_produk: 5
 *         nama_produk: "Sabun Mandi"
 *         kategori: "Kebutuhan Pribadi"
 *         stok_saat_ini: 8
 *         tanggal_pengajuan: "2024-01-15"
 *         jumlah: 50
 *         status: "pending"
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 * 
 *     CreateStokrequest:
 *       type: object
 *       required:
 *         - id_produk
 *         - tanggal_pengajuan
 *         - jumlah
 *       properties:
 *         id_produk:
 *           type: integer
 *           description: ID produk yang akan di-request
 *         tanggal_pengajuan:
 *           type: string
 *           format: date
 *           description: Tanggal pengajuan stock request
 *         jumlah:
 *           type: integer
 *           minimum: 1
 *           description: Jumlah yang diminta
 *       example:
 *         id_produk: 5
 *         tanggal_pengajuan: "2024-01-15"
 *         jumlah: 50
 * 
 *     UpdateStokrequest:
 *       type: object
 *       properties:
 *         tanggal_pengajuan:
 *           type: string
 *           format: date
 *           description: Tanggal pengajuan stock request
 *         jumlah:
 *           type: integer
 *           minimum: 1
 *           description: Jumlah yang diminta
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status stock request
 *       example:
 *         status: "approved"
 * 
 *     StokrequestStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             total_request:
 *               type: integer
 *               description: Total stock request
 *             pending_request:
 *               type: integer
 *               description: Total pending requests
 *             approved_request:
 *               type: integer
 *               description: Total approved requests
 *             rejected_request:
 *               type: integer
 *               description: Total rejected requests
 *             total_jumlah_diminta:
 *               type: integer
 *               description: Total quantity requested
 *             total_jumlah_disetujui:
 *               type: integer
 *               description: Total quantity approved
 *         top_requested_products:
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
 *               stok_saat_ini:
 *                 type: integer
 *               total_request:
 *                 type: integer
 *               total_jumlah_diminta:
 *                 type: integer
 *               total_jumlah_disetujui:
 *                 type: integer
 *         recent_requests:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Stokrequest'
 */

/**
 * @swagger
 * /api/v1/stokrequest:
 *   get:
 *     summary: Get all stock request records
 *     tags: [Stock Request]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
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
 *                     $ref: '#/components/schemas/Stokrequest'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, authorizeRole('admin', 'inventaris', 'keuangan'), stokrequestController.getAllStokrequest);

/**
 * @swagger
 * /api/v1/stokrequest/stats:
 *   get:
 *     summary: Get stock request statistics
 *     tags: [Stock Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Success
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
 *                   $ref: '#/components/schemas/StokrequestStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authenticateToken, authorizeRole('admin', 'Inventaris','keuangan'), stokrequestController.getStokrequestStats);

/**
 * @swagger
 * /api/v1/stokrequest/low-stock:
 *   get:
 *     summary: Get products with low stock that need restocking
 *     tags: [Stock Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Stock threshold (products with stock <= threshold will be returned)
 *     responses:
 *       200:
 *         description: Success
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
 *                     type: object
 *                     properties:
 *                       id_produk:
 *                         type: integer
 *                       nama_produk:
 *                         type: string
 *                       kategori:
 *                         type: string
 *                       stok:
 *                         type: integer
 *                       harga_beli:
 *                         type: number
 *                       harga_jual:
 *                         type: number
 *                       pending_requests:
 *                         type: integer
 *                       total_pending_qty:
 *                         type: integer
 *                       recommended_order_qty:
 *                         type: integer
 *                       priority:
 *                         type: string
 *                         enum: [urgent, high, medium]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/low-stock', authenticateToken, authorizeRole('admin', 'Inventaris','keuangan'), stokrequestController.getLowStockProducts);

/**
 * @swagger
 * /api/v1/stokrequest/{id}:
 *   get:
 *     summary: Get stock request by ID
 *     tags: [Stock Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock request ID
 *     responses:
 *       200:
 *         description: Success
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
 *                   $ref: '#/components/schemas/Stokrequest'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Stock request not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), stokrequestController.getStokrequestById);

/**
 * @swagger
 * /api/v1/stokrequest:
 *   post:
 *     summary: Create new stock request
 *     tags: [Stock Request]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStokrequest'
 *     responses:
 *       201:
 *         description: Stock request created successfully
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
 *                   $ref: '#/components/schemas/Stokrequest'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, authorizeRole('admin', 'Inventaris'), validate(createStokrequestSchema), stokrequestController.createStokrequest);

/**
 * @swagger
 * /api/v1/stokrequest/{id}:
 *   put:
 *     summary: Update stock request
 *     tags: [Stock Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStokrequest'
 *     responses:
 *       200:
 *         description: Stock request updated successfully
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
 *                   $ref: '#/components/schemas/Stokrequest'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Stock request not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), validate(updateStokrequestSchema), stokrequestController.updateStokrequest);

/**
 * @swagger
 * /api/v1/stokrequest/{id}:
 *   delete:
 *     summary: Delete stock request
 *     tags: [Stock Request]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock request ID
 *     responses:
 *       200:
 *         description: Stock request deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Stock request not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), stokrequestController.deleteStokrequest);

module.exports = router;
