const express = require('express');
const router = express.Router();
const akunController = require('../controllers/akunController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createAkunSchema, updateAkunSchema } = require('../utils/validation');

/**
 * @swagger
 * components:
 *   schemas:
 *     Akun:
 *       type: object
 *       properties:
 *         id_akun:
 *           type: integer
 *           description: ID akun
 *         nama_akun:
 *           type: string
 *           description: Nama akun
 *         tipe:
 *           type: string
 *           enum: [Asset, Kewajiban, Ekuitas, Pendapatan, Beban]
 *           description: Tipe akun
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *       example:
 *         id_akun: 1
 *         nama_akun: "Kas"
 *         tipe: "Asset"
 *         created_at: "2024-01-15T10:30:00Z"
 *         updated_at: "2024-01-15T10:30:00Z"
 * 
 *     CreateAkun:
 *       type: object
 *       required:
 *         - nama_akun
 *         - tipe
 *       properties:
 *         nama_akun:
 *           type: string
 *           description: Nama akun
 *           minLength: 1
 *           maxLength: 255
 *         tipe:
 *           type: string
 *           enum: [Asset, Kewajiban, Ekuitas, Pendapatan, Beban]
 *           description: Tipe akun
 *       example:
 *         nama_akun: "Kas"
 *         tipe: "Asset"
 * 
 *     UpdateAkun:
 *       type: object
 *       properties:
 *         nama_akun:
 *           type: string
 *           description: Nama akun
 *           minLength: 1
 *           maxLength: 255
 *         tipe:
 *           type: string
 *           enum: [Asset, Kewajiban, Ekuitas, Pendapatan, Beban]
 *           description: Tipe akun
 *       example:
 *         nama_akun: "Kas Besar"
 *         tipe: "Asset"
 * 
 *     AkunStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             total_akun:
 *               type: integer
 *               description: Total jumlah akun
 *             total_asset:
 *               type: integer
 *               description: Jumlah akun asset
 *             total_kewajiban:
 *               type: integer
 *               description: Jumlah akun kewajiban
 *             total_ekuitas:
 *               type: integer
 *               description: Jumlah akun ekuitas
 *             total_pendapatan:
 *               type: integer
 *               description: Jumlah akun pendapatan
 *             total_beban:
 *               type: integer
 *               description: Jumlah akun beban
 *         distribution:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipe:
 *                 type: string
 *               jumlah:
 *                 type: integer
 */

/**
 * @swagger
 * /api/v1/akun:
 *   get:
 *     summary: Get all akun records
 *     tags: [Akun]
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
 *         description: Search by account name
 *       - in: query
 *         name: tipe
 *         schema:
 *           type: string
 *           enum: [Asset, Kewajiban, Ekuitas, Pendapatan, Beban]
 *         description: Filter by account type
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
 *                     $ref: '#/components/schemas/Akun'
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
router.get('/', authenticateToken, authorizeRole('admin', 'Keuangan'), akunController.getAllAkun);

/**
 * @swagger
 * /api/v1/akun/stats:
 *   get:
 *     summary: Get akun statistics
 *     tags: [Akun]
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
 *                   $ref: '#/components/schemas/AkunStats'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/stats', authenticateToken, authorizeRole('admin', 'Keuangan'), akunController.getAkunStats);

/**
 * @swagger
 * /api/v1/akun/type/{tipe}:
 *   get:
 *     summary: Get akun by type
 *     tags: [Akun]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipe
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Asset, Kewajiban, Ekuitas, Pendapatan, Beban]
 *         description: Account type
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
 *                     $ref: '#/components/schemas/Akun'
 *       400:
 *         description: Invalid account type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/type/:tipe', authenticateToken, authorizeRole('admin', 'Keuangan'), akunController.getAkunByType);

/**
 * @swagger
 * /api/v1/akun/{id}:
 *   get:
 *     summary: Get akun by ID
 *     tags: [Akun]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Akun ID
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
 *                   $ref: '#/components/schemas/Akun'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Akun not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateToken, authorizeRole('admin', 'Keuangan'), akunController.getAkunById);

/**
 * @swagger
 * /api/v1/akun:
 *   post:
 *     summary: Create new akun record
 *     tags: [Akun]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAkun'
 *     responses:
 *       201:
 *         description: Akun created successfully
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
 *                   $ref: '#/components/schemas/Akun'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, authorizeRole('admin', 'Keuangan'), validate(createAkunSchema), akunController.createAkun);

/**
 * @swagger
 * /api/v1/akun/{id}:
 *   put:
 *     summary: Update akun record
 *     tags: [Akun]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Akun ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAkun'
 *     responses:
 *       200:
 *         description: Akun updated successfully
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
 *                   $ref: '#/components/schemas/Akun'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Akun not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, authorizeRole('admin', 'Keuangan'), validate(updateAkunSchema), akunController.updateAkun);

/**
 * @swagger
 * /api/v1/akun/{id}:
 *   delete:
 *     summary: Delete akun record
 *     tags: [Akun]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Akun ID
 *     responses:
 *       200:
 *         description: Akun deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete akun being used
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Akun not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, authorizeRole('admin', 'Keuangan'), akunController.deleteAkun);

module.exports = router;
