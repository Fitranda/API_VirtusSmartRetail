const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validate, createAbsensiSchema, updateAbsensiSchema } = require('../utils/validation');
const absensiController = require('../controllers/absensiController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Absensi:
 *       type: object
 *       required:
 *         - id_karyawan
 *         - tanggal
 *         - jam_masuk
 *         - status_hadir
 *       properties:
 *         id_absensi:
 *           type: integer
 *           description: ID absensi (auto-generated)
 *         id_karyawan:
 *           type: integer
 *           description: ID karyawan yang absen
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal absensi
 *         jam_masuk:
 *           type: string
 *           format: time
 *           description: Jam masuk kerja
 *         jam_keluar:
 *           type: string
 *           format: time
 *           description: Jam keluar kerja
 *         status_hadir:
 *           type: string
 *           enum: [Hadir, Izin, Sakit, Alpha]
 *           description: Status kehadiran
 *         nama_karyawan:
 *           type: string
 *           description: Nama karyawan
 *         posisi:
 *           type: string
 *           description: Posisi karyawan
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateAbsensiRequest:
 *       type: object
 *       required:
 *         - id_karyawan
 *         - tanggal
 *         - jam_masuk
 *         - status_hadir
 *       properties:
 *         id_karyawan:
 *           type: integer
 *           description: ID karyawan yang absen
 *           example: 1
 *         tanggal:
 *           type: string
 *           format: date
 *           description: Tanggal absensi
 *           example: "2025-05-30"
 *         jam_masuk:
 *           type: string
 *           format: time
 *           description: Jam masuk kerja (HH:MM:SS)
 *           example: "08:00:00"
 *         status_hadir:
 *           type: string
 *           enum: [Hadir, Izin, Sakit, Alpha]
 *           description: Status kehadiran
 *           example: "Hadir"
 *     UpdateAbsensiRequest:
 *       type: object
 *       properties:
 *         jam_keluar:
 *           type: string
 *           format: time
 *           description: Jam keluar kerja (HH:MM:SS)
 *           example: "17:00:00"
 *         status_hadir:
 *           type: string
 *           enum: [Hadir, Izin, Sakit, Alpha]
 *           description: Status kehadiran
 *           example: "Hadir"
 *     AbsensiSummary:
 *       type: object
 *       properties:
 *         total_hari_kerja:
 *           type: integer
 *           description: Total hari kerja
 *         total_hadir:
 *           type: integer
 *           description: Total hari hadir
 *         total_izin:
 *           type: integer
 *           description: Total hari izin
 *         total_sakit:
 *           type: integer
 *           description: Total hari sakit
 *         total_alpha:
 *           type: integer
 *           description: Total hari alpha
 *         persentase_kehadiran:
 *           type: string
 *           description: Persentase kehadiran
 *         rata_rata_jam_masuk:
 *           type: string
 *           description: Rata-rata jam masuk
 *         rata_rata_jam_keluar:
 *           type: string
 *           description: Rata-rata jam keluar
 */

/**
 * @swagger
 * /api/v1/absensi:
 *   get:
 *     summary: Get all absensi data with pagination and filters
 *     tags: [Absensi]
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
 *         name: karyawan_id
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID karyawan
 *       - in: query
 *         name: tanggal_dari
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal mulai
 *       - in: query
 *         name: tanggal_sampai
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter tanggal akhir
 *       - in: query
 *         name: status_hadir
 *         schema:
 *           type: string
 *           enum: [Hadir, Izin, Sakit, Alpha]
 *         description: Filter berdasarkan status hadir
 *     responses:
 *       200:
 *         description: Data absensi berhasil diambil
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
 *                     $ref: '#/components/schemas/Absensi'
 *                 pagination:
 *                   type: object
 *   post:
 *     summary: Create new absensi (clock in)
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAbsensiRequest'
 *     responses:
 *       201:
 *         description: Absensi berhasil dibuat
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
 *                   $ref: '#/components/schemas/Absensi'
 *       400:
 *         description: Validation error atau absensi sudah ada
 *       404:
 *         description: Karyawan tidak ditemukan
 */
router.get('/', authenticateToken, absensiController.getAllAbsensi);
router.post('/', authenticateToken, validate(createAbsensiSchema), absensiController.createAbsensi);

/**
 * @swagger
 * /api/v1/absensi/summary:
 *   get:
 *     summary: Get absensi summary/statistics
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: karyawan_id
 *         schema:
 *           type: integer
 *         description: ID karyawan (opsional)
 *       - in: query
 *         name: bulan
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Bulan (1-12)
 *       - in: query
 *         name: tahun
 *         schema:
 *           type: integer
 *         description: Tahun
 *     responses:
 *       200:
 *         description: Ringkasan absensi berhasil diambil
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
 *                   $ref: '#/components/schemas/AbsensiSummary'
 */
router.get('/summary', authenticateToken, absensiController.getAbsensiSummary);

/**
 * @swagger
 * /api/v1/absensi/{id}:
 *   get:
 *     summary: Get absensi by ID
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID absensi
 *     responses:
 *       200:
 *         description: Data absensi berhasil diambil
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
 *                   $ref: '#/components/schemas/Absensi'
 *       404:
 *         description: Absensi tidak ditemukan
 *   put:
 *     summary: Update absensi (clock out)
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID absensi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAbsensiRequest'
 *     responses:
 *       200:
 *         description: Absensi berhasil diupdate
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
 *                   $ref: '#/components/schemas/Absensi'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Absensi tidak ditemukan
 *   delete:
 *     summary: Delete absensi
 *     tags: [Absensi]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID absensi
 *     responses:
 *       200:
 *         description: Absensi berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Absensi tidak ditemukan
 */
router.get('/:id', authenticateToken, absensiController.getAbsensiById);
router.put('/:id', authenticateToken, validate(updateAbsensiSchema), absensiController.updateAbsensi);
router.delete('/:id', authenticateToken, authorizeRole('admin', 'HRD'), absensiController.deleteAbsensi);

module.exports = router;
