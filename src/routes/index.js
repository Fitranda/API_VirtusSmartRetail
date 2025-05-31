const express = require('express');
const authRoutes = require('./auth');
const absensiRoutes = require('./absensi');
const karyawanRoutes = require('./karyawan');
const produkRoutes = require('./produk');
const stokopnameRoutes = require('./stokopname');
const stokrequestRoutes = require('./stokrequest');
const akunRoutes = require('./akun');
const supplierRoutes = require('./supplier');
const pembelianRoutes = require('./pembelian');
const penggajianRoutes = require('./penggajian');
const jurnalRoutes = require('./jurnal');
const posRoutes = require('./pos');
const pelangganRoutes = require('./pelanggan');

const router = express.Router();

// Health check endpoint
/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is running
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
 *                   example: API is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'VirtuSmartRetail API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/absensi', absensiRoutes);
router.use('/karyawan', karyawanRoutes);
router.use('/produk', produkRoutes);
router.use('/stokopname', stokopnameRoutes);
router.use('/stokrequest', stokrequestRoutes);
router.use('/akun', akunRoutes);
router.use('/supplier', supplierRoutes);
router.use('/pembelian', pembelianRoutes);
router.use('/penggajian', penggajianRoutes);
router.use('/jurnal', jurnalRoutes);
router.use('/pos', posRoutes);
router.use('/pelanggan', pelangganRoutes);

module.exports = router;
