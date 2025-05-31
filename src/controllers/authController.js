const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
  // Login karyawan
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Cari karyawan berdasarkan username atau email dan status aktif
      const karyawanQuery = `
        SELECT 
          k.id_karyawan,
          k.nama,
          k.username,
          k.email,
          k.password,
          k.posisi,
          k.status,
          r.role_name,
          r.description as role_description
        FROM karyawan k
        LEFT JOIN role r ON k.id_role = r.id_role
        WHERE (k.username = ? OR k.email = ?) AND k.status = 'aktif'
      `;
      const karyawanResult = await executeQuery(karyawanQuery, [username, username]);

      if (!karyawanResult.success || karyawanResult.data.length === 0) {
        return errorResponse(res, 'Username/email atau password salah', null, 401);
      }

      const karyawan = karyawanResult.data[0];

      // Verifikasi password
      const isValidPassword = await bcrypt.compare(password, karyawan.password);
      if (!isValidPassword) {
        return errorResponse(res, 'Username/email atau password salah', null, 401);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: karyawan.id_karyawan, 
          username: karyawan.username,
          email: karyawan.email, 
          role: karyawan.role_name,
          posisi: karyawan.posisi
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      return successResponse(res, 'Login berhasil', {
        karyawan: {
          id: karyawan.id_karyawan,
          nama: karyawan.nama,
          username: karyawan.username,
          email: karyawan.email,
          posisi: karyawan.posisi,
          role: karyawan.role_name,
          role_description: karyawan.role_description,
          status: karyawan.status
        },
        token
      });    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 'Server error saat login', error.message, 500);
    }
  }
}

module.exports = new AuthController();
