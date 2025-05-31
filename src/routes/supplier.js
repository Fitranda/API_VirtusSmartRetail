const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createSupplierSchema, updateSupplierSchema } = require('../utils/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Supplier:
 *       type: object
 *       properties:
 *         id_supplier:
 *           type: integer
 *           description: ID supplier
 *         nama_supplier:
 *           type: string
 *           description: Nama supplier
 *         kontak:
 *           type: string
 *           description: Kontak supplier (nomor telepon/email)
 *         alamat:
 *           type: string
 *           description: Alamat supplier
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       example:
 *         id_supplier: 1
 *         nama_supplier: "PT Supplier ABC"
 *         kontak: "081234567890"
 *         alamat: "Jl. Supplier No. 123, Jakarta"
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 * 
 *     CreateSupplier:
 *       type: object
 *       required:
 *         - nama_supplier
 *         - kontak
 *         - alamat
 *       properties:
 *         nama_supplier:
 *           type: string
 *           description: Nama supplier
 *           minLength: 1
 *           maxLength: 255
 *         kontak:
 *           type: string
 *           description: Kontak supplier
 *           minLength: 1
 *           maxLength: 255
 *         alamat:
 *           type: string
 *           description: Alamat supplier
 *           minLength: 1
 *       example:
 *         nama_supplier: "PT Supplier ABC"
 *         kontak: "081234567890"
 *         alamat: "Jl. Supplier No. 123, Jakarta"
 * 
 *     UpdateSupplier:
 *       type: object
 *       properties:
 *         nama_supplier:
 *           type: string
 *           description: Nama supplier
 *           minLength: 1
 *           maxLength: 255
 *         kontak:
 *           type: string
 *           description: Kontak supplier
 *           minLength: 1
 *           maxLength: 255
 *         alamat:
 *           type: string
 *           description: Alamat supplier
 *           minLength: 1
 *       example:
 *         nama_supplier: "PT Supplier ABC Updated"
 *         kontak: "081234567891"
 *         alamat: "Jl. Supplier Baru No. 456, Jakarta"
 * 
 *     SupplierStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             total_supplier:
 *               type: integer
 *               description: Total jumlah supplier
 *             supplier_baru_bulan_ini:
 *               type: integer
 *               description: Jumlah supplier baru bulan ini
 *             supplier_baru_minggu_ini:
 *               type: integer
 *               description: Jumlah supplier baru minggu ini
 *         recent_suppliers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id_supplier:
 *                 type: integer
 *               nama_supplier:
 *                 type: string
 *               kontak:
 *                 type: string
 *               created_at:
 *                 type: string
 *                 format: date-time
 */

/**
 * @swagger
 * /api/v1/supplier:
 *   get:
 *     summary: Get all suppliers with pagination and filtering
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by nama_supplier, kontak, or alamat
 *     responses:
 *       200:
 *         description: List of suppliers retrieved successfully
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
 *                   example: "Data supplier berhasil diambil"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Supplier'
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
 *         description: Unauthorized - Token missing or invalid
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, supplierController.getAllSuppliers);

/**
 * @swagger
 * /api/v1/supplier/stats:
 *   get:
 *     summary: Get supplier statistics
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Supplier statistics retrieved successfully
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
 *                   example: "Statistik supplier berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/SupplierStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authenticateToken, authorizeRole('admin', 'Manager'), supplierController.getSupplierStats);

/**
 * @swagger
 * /api/v1/supplier/search:
 *   get:
 *     summary: Search suppliers
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for supplier name, contact, or address
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
 *                   example: "Hasil pencarian supplier untuk \"PT ABC\""
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Bad request - Query parameter required
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/search', authenticateToken, supplierController.searchSuppliers);

/**
 * @swagger
 * /api/v1/supplier/{id}:
 *   get:
 *     summary: Get supplier by ID
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier retrieved successfully
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
 *                   example: "Supplier berhasil diambil"
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *       404:
 *         description: Supplier not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, supplierController.getSupplierById);

/**
 * @swagger
 * /api/v1/supplier:
 *   post:
 *     summary: Create new supplier
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSupplier'
 *     responses:
 *       201:
 *         description: Supplier created successfully
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
 *                   example: "Supplier berhasil dibuat"
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Bad request - Validation error or supplier already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, authorizeRole('admin', 'Manager'), validate(createSupplierSchema), supplierController.createSupplier);

/**
 * @swagger
 * /api/v1/supplier/{id}:
 *   put:
 *     summary: Update supplier
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSupplier'
 *     responses:
 *       200:
 *         description: Supplier updated successfully
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
 *                   example: "Supplier berhasil diupdate"
 *                 data:
 *                   $ref: '#/components/schemas/Supplier'
 *       400:
 *         description: Bad request - Validation error or no data to update
 *       404:
 *         description: Supplier not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, authorizeRole('admin', 'Manager'), validate(updateSupplierSchema), supplierController.updateSupplier);

/**
 * @swagger
 * /api/v1/supplier/{id}:
 *   delete:
 *     summary: Delete supplier
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Supplier ID
 *     responses:
 *       200:
 *         description: Supplier deleted successfully
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
 *                   example: "Supplier berhasil dihapus"
 *       400:
 *         description: Bad request - Supplier is being used in transactions
 *       404:
 *         description: Supplier not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, authorizeRole('admin'), supplierController.deleteSupplier);

module.exports = router;
