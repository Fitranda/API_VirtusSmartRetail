const express = require('express');
const router = express.Router();
const stokopnameController = require('../controllers/stokopnameController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createStokopnameSchema, updateStokopnameSchema } = require('../utils/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Stokopname:
 *       type: object
 *       properties:
 *         id_stokopname:
 *           type: integer
 *           description: ID stokopname
 *         id_produk:
 *           type: integer
 *           description: ID produk
 *         nama_produk:
 *           type: string
 *           description: Nama produk
 *         kategori:
 *           type: string
 *           description: Kategori produk
 *         stok_sistem:
 *           type: integer
 *           description: Stok menurut sistem
 *         tanggal_opname:
 *           type: string
 *           format: date
 *           description: Tanggal stock opname
 *         jumlah_sebenarnya:
 *           type: integer
 *           description: Jumlah stok yang ditemukan saat opname
 *         selisih:
 *           type: integer
 *           description: Selisih antara stok sistem dan jumlah sebenarnya
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       example:
 *         id_stokopname: 1
 *         id_produk: 5
 *         nama_produk: "Laptop ASUS"
 *         kategori: "Elektronik"
 *         stok_sistem: 50
 *         tanggal_opname: "2024-01-15"
 *         jumlah_sebenarnya: 48
 *         selisih: -2
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 * 
 *     CreateStokopname:
 *       type: object
 *       required:
 *         - id_produk
 *         - tanggal_opname
 *         - jumlah_sebenarnya
 *       properties:
 *         id_produk:
 *           type: integer
 *           description: ID produk yang akan diopname
 *         tanggal_opname:
 *           type: string
 *           format: date
 *           description: Tanggal pelaksanaan stock opname
 *         jumlah_sebenarnya:
 *           type: integer
 *           minimum: 0
 *           description: Jumlah stok yang ditemukan saat opname
 *       example:
 *         id_produk: 5
 *         tanggal_opname: "2024-01-15"
 *         jumlah_sebenarnya: 48
 * 
 *     UpdateStokopname:
 *       type: object
 *       properties:
 *         tanggal_opname:
 *           type: string
 *           format: date
 *           description: Tanggal pelaksanaan stock opname
 *         jumlah_sebenarnya:
 *           type: integer
 *           minimum: 0
 *           description: Jumlah stok yang ditemukan saat opname
 *       example:
 *         tanggal_opname: "2024-01-16"
 *         jumlah_sebenarnya: 50
 * 
 *     StokopnameStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             total_opname:
 *               type: integer
 *               description: Total jumlah stock opname
 *             kelebihan_stok:
 *               type: integer
 *               description: Jumlah produk dengan kelebihan stok
 *             kekurangan_stok:
 *               type: integer
 *               description: Jumlah produk dengan kekurangan stok
 *             stok_sesuai:
 *               type: integer
 *               description: Jumlah produk dengan stok sesuai
 *             total_selisih:
 *               type: integer
 *               description: Total absolut selisih stok
 *             rata_rata_selisih:
 *               type: number
 *               description: Rata-rata absolut selisih stok
 *         top_discrepancies:
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
 *               absolut_selisih:
 *                 type: integer
 *               selisih:
 *                 type: integer
 *               tanggal_opname:
 *                 type: string
 *                 format: date
 */

/**
 * @swagger
 * /api/v1/stokopname:
 *   get:
 *     summary: Get all stokopname records
 *     tags: [Stokopname]
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name or category
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
 *       - in: query
 *         name: id_produk
 *         schema:
 *           type: integer
 *         description: Filter by product ID
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
 *                     $ref: '#/components/schemas/Stokopname'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     per_page:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     has_next:
 *                       type: boolean
 *                     has_prev:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, authorizeRole('admin', 'Inventaris'), stokopnameController.getAllStokopname);

/**
 * @swagger
 * /api/v1/stokopname/stats:
 *   get:
 *     summary: Get stokopname statistics
 *     tags: [Stokopname]
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
 *                   $ref: '#/components/schemas/StokopnameStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authenticateToken, authorizeRole('admin', 'Inventaris'), stokopnameController.getStokopnameStats);

/**
 * @swagger
 * /api/v1/stokopname/{id}:
 *   get:
 *     summary: Get stokopname by ID
 *     tags: [Stokopname]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stokopname ID
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
 *                   $ref: '#/components/schemas/Stokopname'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Stokopname not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), stokopnameController.getStokopnameById);

/**
 * @swagger
 * /api/v1/stokopname:
 *   post:
 *     summary: Create new stokopname record
 *     tags: [Stokopname]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStokopname'
 *     responses:
 *       201:
 *         description: Stokopname created successfully
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
 *                   $ref: '#/components/schemas/Stokopname'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, authorizeRole('admin', 'Inventaris'), validate(createStokopnameSchema), stokopnameController.createStokopname);

/**
 * @swagger
 * /api/v1/stokopname/{id}:
 *   put:
 *     summary: Update stokopname record
 *     tags: [Stokopname]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stokopname ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStokopname'
 *     responses:
 *       200:
 *         description: Stokopname updated successfully
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
 *                   $ref: '#/components/schemas/Stokopname'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Stokopname not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), validate(updateStokopnameSchema), stokopnameController.updateStokopname);

/**
 * @swagger
 * /api/v1/stokopname/{id}:
 *   delete:
 *     summary: Delete stokopname record
 *     tags: [Stokopname]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stokopname ID
 *     responses:
 *       200:
 *         description: Stokopname deleted successfully
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
 *         description: Stokopname not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, authorizeRole('admin', 'Inventaris'), stokopnameController.deleteStokopname);

/**
 * @swagger
 * /api/v1/stokopname/{id}/apply-adjustment:
 *   patch:
 *     summary: Apply stock adjustment based on stokopname record
 *     description: Updates the product stock to match the actual count found during stock opname
 *     tags: [Stokopname]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stokopname ID
 *     responses:
 *       200:
 *         description: Stock adjustment applied successfully
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
 *         description: Stokopname not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/apply-adjustment', authenticateToken, authorizeRole('admin', 'Inventaris'), stokopnameController.applyStockAdjustment);

module.exports = router;
