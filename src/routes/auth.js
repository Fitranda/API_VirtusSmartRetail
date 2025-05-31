const express = require('express');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate, loginSchema } = require('../utils/validation');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Karyawan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the karyawan
 *         nama:
 *           type: string
 *           description: The name of the karyawan
 *         username:
 *           type: string
 *           description: The username of the karyawan
 *         email:
 *           type: string
 *           description: The email of the karyawan
 *         posisi:
 *           type: string
 *           description: The position of the karyawan
 *         role:
 *           type: string
 *           description: The role of the karyawan
 *         status:
 *           type: string
 *           enum: [aktif, nonaktif]
 *           description: The status of the karyawan
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The date the karyawan was created
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username atau email karyawan
 *         password:
 *           type: string
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             karyawan:
 *               $ref: '#/components/schemas/Karyawan'
 *             token:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login karyawan
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             example1:
 *               summary: Login dengan username
 *               value:
 *                 username: "andi.pratama"
 *                 password: "password123"
 *             example2:
 *               summary: Login dengan email
 *               value:
 *                 username: "andi.pratama@gmail.com"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: Karyawan berhasil login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Username/email atau password salah
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

module.exports = router;
