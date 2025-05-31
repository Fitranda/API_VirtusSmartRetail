const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createKaryawanSchema, updateKaryawanSchema } = require('../utils/validation');
const karyawanController = require('../controllers/karyawanController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Karyawan:
 *       type: object
 *       properties:
 *         id_karyawan:
 *           type: integer
 *           description: ID karyawan (auto-generated)
 *         nama:
 *           type: string
 *           description: Nama lengkap karyawan
 *         posisi:
 *           type: string
 *           description: Posisi/jabatan karyawan
 *         gaji_pokok:
 *           type: number
 *           description: Gaji pokok karyawan
 *         username:
 *           type: string
 *           description: Username untuk login
 *         email:
 *           type: string
 *           description: Email karyawan
 *         status:
 *           type: string
 *           enum: [aktif, nonaktif]
 *           description: Status karyawan
 *         nama_role:
 *           type: string
 *           description: Nama role karyawan
 *         nama_shift:
 *           type: string
 *           description: Nama shift kerja
 *         jam_mulai:
 *           type: string
 *           description: Jam mulai shift
 *         jam_selesai:
 *           type: string
 *           description: Jam selesai shift
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateKaryawanRequest:
 *       type: object
 *       required:
 *         - nama
 *         - posisi
 *         - gaji_pokok
 *         - id_shift
 *         - username
 *         - password
 *         - email
 *         - id_role
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama lengkap karyawan
 *           example: "John Doe"
 *         posisi:
 *           type: string
 *           description: Posisi/jabatan karyawan
 *           example: "Manager"
 *         gaji_pokok:
 *           type: number
 *           description: Gaji pokok karyawan
 *           example: 5000000
 *         id_shift:
 *           type: integer
 *           description: ID shift kerja
 *           example: 1
 *         username:
 *           type: string
 *           description: Username untuk login
 *           example: "john.doe"
 *         password:
 *           type: string
 *           description: Password untuk login
 *           example: "password123"
 *         email:
 *           type: string
 *           format: email
 *           description: Email karyawan
 *           example: "john.doe@company.com"
 *         id_role:
 *           type: integer
 *           description: ID role karyawan
 *           example: 1
 *         status:
 *           type: string
 *           enum: [aktif, nonaktif]
 *           description: Status karyawan
 *           example: "aktif"
 *     UpdateKaryawanRequest:
 *       type: object
 *       properties:
 *         nama:
 *           type: string
 *           description: Nama lengkap karyawan
 *           example: "John Doe"
 *         posisi:
 *           type: string
 *           description: Posisi/jabatan karyawan
 *           example: "Senior Manager"
 *         gaji_pokok:
 *           type: number
 *           description: Gaji pokok karyawan
 *           example: 6000000
 *         id_shift:
 *           type: integer
 *           description: ID shift kerja
 *           example: 2
 *         username:
 *           type: string
 *           description: Username untuk login
 *           example: "john.doe.updated"
 *         password:
 *           type: string
 *           description: Password baru (opsional)
 *           example: "newpassword123"
 *         email:
 *           type: string
 *           format: email
 *           description: Email karyawan
 *           example: "john.doe.new@company.com"
 *         id_role:
 *           type: integer
 *           description: ID role karyawan
 *           example: 2
 *         status:
 *           type: string
 *           enum: [aktif, nonaktif]
 *           description: Status karyawan
 *           example: "aktif"
 *     KaryawanStats:
 *       type: object
 *       properties:
 *         total_karyawan:
 *           type: integer
 *           description: Total jumlah karyawan
 *         karyawan_aktif:
 *           type: integer
 *           description: Jumlah karyawan aktif
 *         karyawan_nonaktif:
 *           type: integer
 *           description: Jumlah karyawan nonaktif
 *         rata_rata_gaji:
 *           type: string
 *           description: Rata-rata gaji karyawan
 *         gaji_minimum:
 *           type: number
 *           description: Gaji minimum
 *         gaji_maksimum:
 *           type: number
 *           description: Gaji maksimum
 *         distribusi_posisi:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               posisi:
 *                 type: string
 *               jumlah:
 *                 type: integer
 *         distribusi_role:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               nama_role:
 *                 type: string
 *               jumlah:
 *                 type: integer
 */

/**
 * @swagger
 * /api/v1/karyawan:
 *   get:
 *     summary: Get all karyawan with pagination and filters
 *     tags: [Karyawan]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [aktif, nonaktif]
 *         description: Filter berdasarkan status
 *       - in: query
 *         name: posisi
 *         schema:
 *           type: string
 *         description: Filter berdasarkan posisi
 *       - in: query
 *         name: id_role
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan role
 *       - in: query
 *         name: id_shift
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan shift
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama, email, atau username
 *     responses:
 *       200:
 *         description: Data karyawan berhasil diambil
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
 *                     $ref: '#/components/schemas/Karyawan'
 *                 pagination:
 *                   type: object
 *   post:
 *     summary: Create new karyawan
 *     tags: [Karyawan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateKaryawanRequest'
 *     responses:
 *       201:
 *         description: Karyawan berhasil ditambahkan
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
 *                   $ref: '#/components/schemas/Karyawan'
 *       400:
 *         description: Validation error atau username/email sudah digunakan
 *       403:
 *         description: Tidak memiliki akses untuk menambah karyawan
 */
router.get('/', authenticateToken,authorizeRole('Admin', 'HRD'), karyawanController.getAllKaryawan);
router.post('/', authenticateToken, authorizeRole('Admin', 'HRD'), validate(createKaryawanSchema), karyawanController.createKaryawan);

/**
 * @swagger
 * /api/v1/karyawan/stats:
 *   get:
 *     summary: Get karyawan statistics
 *     tags: [Karyawan]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik karyawan berhasil diambil
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
 *                   $ref: '#/components/schemas/KaryawanStats'
 */
router.get('/stats', authenticateToken, authorizeRole('admin', 'HRD'), karyawanController.getKaryawanStats);

/**
 * @swagger
 * /api/v1/karyawan/{id}:
 *   get:
 *     summary: Get karyawan by ID
 *     tags: [Karyawan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID karyawan
 *     responses:
 *       200:
 *         description: Data karyawan berhasil diambil
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
 *                   $ref: '#/components/schemas/Karyawan'
 *       404:
 *         description: Karyawan tidak ditemukan
 *   put:
 *     summary: Update karyawan
 *     tags: [Karyawan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID karyawan
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateKaryawanRequest'
 *     responses:
 *       200:
 *         description: Data karyawan berhasil diupdate
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
 *                   $ref: '#/components/schemas/Karyawan'
 *       400:
 *         description: Validation error atau username/email sudah digunakan
 *       404:
 *         description: Karyawan tidak ditemukan
 *       403:
 *         description: Tidak memiliki akses untuk mengupdate karyawan
 *   delete:
 *     summary: Delete karyawan (soft delete)
 *     tags: [Karyawan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID karyawan
 *     responses:
 *       200:
 *         description: Karyawan berhasil dinonaktifkan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Karyawan tidak ditemukan
 *       403:
 *         description: Tidak memiliki akses untuk menghapus karyawan
 */
// Temporary test route without authentication (remove in production)
router.get('/test', karyawanController.getAllKaryawan);

router.get('/:id', authenticateToken, karyawanController.getKaryawanById);
router.put('/:id', authenticateToken, authorizeRole('admin', 'HRD'), validate(updateKaryawanSchema), karyawanController.updateKaryawan);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'HRD'), karyawanController.deleteKaryawan);

module.exports = router;
