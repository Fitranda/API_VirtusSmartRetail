const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token diperlukan'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    // Cek apakah karyawan masih ada di database dan aktif
    const karyawanQuery = `
      SELECT 
        k.id_karyawan as id,
        k.nama,
        k.username,
        k.email,
        k.posisi,
        k.status,
        r.role_name as role
      FROM karyawan k
      LEFT JOIN role r ON k.id_role = r.id_role
      WHERE k.id_karyawan = ? AND k.status = 'aktif'
    `;
    
    const karyawanResult = await executeQuery(karyawanQuery, [decoded.userId]);
    
    
    if (!karyawanResult.success || karyawanResult.data.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau karyawan tidak ditemukan/tidak aktif'
      });
    }

    req.user = karyawanResult.data[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token telah expired'
      });
    }
    
    return res.status(403).json({
      success: false,
      message: 'Token tidak valid'
    });
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Karyawan tidak terautentikasi'
      });
    }
    

    // Convert both user role and allowed roles to lowercase for case-insensitive comparison
    const userRole = req.user.role?.toLowerCase();
    
    const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());
    

    if (!allowedRolesLower.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Role tidak memiliki izin'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
