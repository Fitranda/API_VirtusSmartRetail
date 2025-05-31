const Joi = require('joi');

// Authentication validation schemas
const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username atau email harus diisi',
    'any.required': 'Username atau email harus diisi'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password harus diisi',
    'any.required': 'Password harus diisi'
  })
});

// Karyawan validation schemas
const createKaryawanSchema = Joi.object({
  nama: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nama harus diisi',
    'string.min': 'Nama minimal 2 karakter',
    'string.max': 'Nama maksimal 255 karakter',
    'any.required': 'Nama harus diisi'
  }),
  posisi: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Posisi harus diisi',
    'string.min': 'Posisi minimal 2 karakter',
    'string.max': 'Posisi maksimal 255 karakter',
    'any.required': 'Posisi harus diisi'
  }),
  gaji_pokok: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Gaji pokok harus berupa angka',
    'number.positive': 'Gaji pokok harus lebih besar dari 0',
    'any.required': 'Gaji pokok harus diisi'
  }),
  id_shift: Joi.number().integer().positive().required().messages({
    'number.base': 'ID shift harus berupa angka',
    'number.positive': 'ID shift harus positif',
    'any.required': 'ID shift harus diisi'
  }),
  username: Joi.string().min(3).max(50).required().messages({
    'string.empty': 'Username harus diisi',
    'string.min': 'Username minimal 3 karakter',
    'string.max': 'Username maksimal 50 karakter',
    'any.required': 'Username harus diisi'
  }),
  password: Joi.string().min(6).max(255).required().messages({
    'string.empty': 'Password harus diisi',
    'string.min': 'Password minimal 6 karakter',
    'string.max': 'Password maksimal 255 karakter',
    'any.required': 'Password harus diisi'
  }),
  email: Joi.string().email().max(100).required().messages({
    'string.empty': 'Email harus diisi',
    'string.email': 'Format email tidak valid',
    'string.max': 'Email maksimal 100 karakter',
    'any.required': 'Email harus diisi'
  }),
  id_role: Joi.number().integer().positive().required().messages({
    'number.base': 'ID role harus berupa angka',
    'number.positive': 'ID role harus positif',
    'any.required': 'ID role harus diisi'
  }),
  status: Joi.string().valid('aktif', 'nonaktif').default('aktif').messages({
    'any.only': 'Status harus aktif atau nonaktif'
  })
});

const updateKaryawanSchema = Joi.object({
  nama: Joi.string().min(2).max(255).messages({
    'string.min': 'Nama minimal 2 karakter',
    'string.max': 'Nama maksimal 255 karakter'
  }),
  posisi: Joi.string().min(2).max(255).messages({
    'string.min': 'Posisi minimal 2 karakter',
    'string.max': 'Posisi maksimal 255 karakter'
  }),
  gaji_pokok: Joi.number().positive().precision(2).messages({
    'number.base': 'Gaji pokok harus berupa angka',
    'number.positive': 'Gaji pokok harus lebih besar dari 0'
  }),
  id_shift: Joi.number().integer().positive().messages({
    'number.base': 'ID shift harus berupa angka',
    'number.positive': 'ID shift harus positif'
  }),
  username: Joi.string().min(3).max(50).messages({
    'string.min': 'Username minimal 3 karakter',
    'string.max': 'Username maksimal 50 karakter'
  }),
  password: Joi.string().min(6).max(255).messages({
    'string.min': 'Password minimal 6 karakter',
    'string.max': 'Password maksimal 255 karakter'
  }),
  email: Joi.string().email().max(100).messages({
    'string.email': 'Format email tidak valid',
    'string.max': 'Email maksimal 100 karakter'
  }),
  id_role: Joi.number().integer().positive().messages({
    'number.base': 'ID role harus berupa angka',
    'number.positive': 'ID role harus positif'
  }),
  status: Joi.string().valid('aktif', 'nonaktif').messages({
    'any.only': 'Status harus aktif atau nonaktif'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});



// Absensi validation schemas
const createAbsensiSchema = Joi.object({
  id_karyawan: Joi.number().integer().positive().required().messages({
    'number.base': 'ID karyawan harus berupa angka',
    'number.positive': 'ID karyawan harus positif',
    'any.required': 'ID karyawan harus diisi'
  }),
  tanggal: Joi.date().iso().required().messages({
    'date.base': 'Tanggal harus dalam format yang valid',
    'any.required': 'Tanggal harus diisi'
  }),
  jam_masuk: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'Jam masuk harus dalam format HH:MM:SS',
    'any.required': 'Jam masuk harus diisi'
  }),
  status_hadir: Joi.string().valid('Hadir', 'Izin', 'Sakit', 'Alpha').required().messages({
    'any.only': 'Status hadir harus salah satu dari: Hadir, Izin, Sakit, Alpha',
    'any.required': 'Status hadir harus diisi'
  })
});

const updateAbsensiSchema = Joi.object({
  jam_keluar: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).messages({
    'string.pattern.base': 'Jam keluar harus dalam format HH:MM:SS'
  }),
  status_hadir: Joi.string().valid('Hadir', 'Izin', 'Sakit', 'Alpha').messages({
    'any.only': 'Status hadir harus salah satu dari: Hadir, Izin, Sakit, Alpha'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});



// Produk validation schemas
const createProdukSchema = Joi.object({
  nama_produk: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nama produk harus diisi',
    'string.min': 'Nama produk minimal 2 karakter',
    'string.max': 'Nama produk maksimal 255 karakter',
    'any.required': 'Nama produk harus diisi'
  }),
  kategori: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Kategori harus diisi',
    'string.min': 'Kategori minimal 2 karakter',
    'string.max': 'Kategori maksimal 255 karakter',
    'any.required': 'Kategori harus diisi'
  }),
  stok: Joi.number().integer().min(0).required().messages({
    'number.base': 'Stok harus berupa angka',
    'number.min': 'Stok tidak boleh negatif',
    'any.required': 'Stok harus diisi'
  }),
  harga_beli: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Harga beli harus berupa angka',
    'number.positive': 'Harga beli harus lebih besar dari 0',
    'any.required': 'Harga beli harus diisi'
  }),
  harga_jual: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Harga jual harus berupa angka',
    'number.positive': 'Harga jual harus lebih besar dari 0',
    'any.required': 'Harga jual harus diisi'
  })
});

const updateProdukSchema = Joi.object({
  nama_produk: Joi.string().min(2).max(255).messages({
    'string.min': 'Nama produk minimal 2 karakter',
    'string.max': 'Nama produk maksimal 255 karakter'
  }),
  kategori: Joi.string().min(2).max(255).messages({
    'string.min': 'Kategori minimal 2 karakter',
    'string.max': 'Kategori maksimal 255 karakter'
  }),
  stok: Joi.number().integer().min(0).messages({
    'number.base': 'Stok harus berupa angka',
    'number.min': 'Stok tidak boleh negatif'
  }),
  harga_beli: Joi.number().positive().precision(2).messages({
    'number.base': 'Harga beli harus berupa angka',
    'number.positive': 'Harga beli harus lebih besar dari 0'
  }),
  harga_jual: Joi.number().positive().precision(2).messages({
    'number.base': 'Harga jual harus berupa angka',
    'number.positive': 'Harga jual harus lebih besar dari 0'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});

const updateStokSchema = Joi.object({
  stok: Joi.number().integer().min(0).required().messages({
    'number.base': 'Stok harus berupa angka',
    'number.min': 'Stok tidak boleh negatif',
    'any.required': 'Stok harus diisi'
  }),
  operasi: Joi.string().valid('set', 'tambah', 'kurang').default('set').messages({
    'any.only': 'Operasi harus salah satu dari: set, tambah, kurang'
  })
});



// Stokopname validation schemas
const createStokopnameSchema = Joi.object({
  id_produk: Joi.number().integer().positive().required().messages({
    'number.base': 'ID produk harus berupa angka',
    'number.positive': 'ID produk harus positif',
    'any.required': 'ID produk harus diisi'
  }),
  tanggal_opname: Joi.date().iso().required().messages({
    'date.base': 'Tanggal opname harus dalam format yang valid (YYYY-MM-DD)',
    'any.required': 'Tanggal opname harus diisi'
  }),
  jumlah_sebenarnya: Joi.number().integer().min(0).required().messages({
    'number.base': 'Jumlah sebenarnya harus berupa angka',
    'number.min': 'Jumlah sebenarnya tidak boleh negatif',
    'any.required': 'Jumlah sebenarnya harus diisi'
  })
});

const updateStokopnameSchema = Joi.object({
  tanggal_opname: Joi.date().iso().messages({
    'date.base': 'Tanggal opname harus dalam format yang valid (YYYY-MM-DD)'
  }),
  jumlah_sebenarnya: Joi.number().integer().min(0).messages({
    'number.base': 'Jumlah sebenarnya harus berupa angka',
    'number.min': 'Jumlah sebenarnya tidak boleh negatif'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});



// Stokrequest validation schemas
const createStokrequestSchema = Joi.object({
  id_produk: Joi.number().integer().positive().required().messages({
    'number.base': 'ID produk harus berupa angka',
    'number.positive': 'ID produk harus positif',
    'any.required': 'ID produk harus diisi'
  }),
  tanggal_pengajuan: Joi.date().iso().required().messages({
    'date.base': 'Tanggal pengajuan harus dalam format yang valid (YYYY-MM-DD)',
    'any.required': 'Tanggal pengajuan harus diisi'
  }),
  jumlah: Joi.number().integer().positive().required().messages({
    'number.base': 'Jumlah harus berupa angka',
    'number.positive': 'Jumlah harus lebih besar dari 0',
    'any.required': 'Jumlah harus diisi'
  })
});

const updateStokrequestSchema = Joi.object({
  tanggal_pengajuan: Joi.date().iso().messages({
    'date.base': 'Tanggal pengajuan harus dalam format yang valid (YYYY-MM-DD)'
  }),
  jumlah: Joi.number().integer().positive().messages({
    'number.base': 'Jumlah harus berupa angka',
    'number.positive': 'Jumlah harus lebih besar dari 0'
  }),
  status: Joi.string().valid('pending', 'approved', 'rejected').messages({
    'any.only': 'Status harus salah satu dari: pending, approved, rejected'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});

// Akun validation schemas
const createAkunSchema = Joi.object({
  nama_akun: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Nama akun harus diisi',
    'string.min': 'Nama akun minimal 1 karakter',
    'string.max': 'Nama akun maksimal 255 karakter',
    'any.required': 'Nama akun harus diisi'
  }),
  tipe: Joi.string().valid('Asset', 'Kewajiban', 'Ekuitas', 'Pendapatan', 'Beban').required().messages({
    'any.only': 'Tipe harus salah satu dari: Asset, Kewajiban, Ekuitas, Pendapatan, Beban',
    'any.required': 'Tipe akun harus diisi'
  })
});

const updateAkunSchema = Joi.object({
  nama_akun: Joi.string().min(1).max(255).messages({
    'string.empty': 'Nama akun tidak boleh kosong',
    'string.min': 'Nama akun minimal 1 karakter',
    'string.max': 'Nama akun maksimal 255 karakter'
  }),  tipe: Joi.string().valid('Asset', 'Kewajiban', 'Ekuitas', 'Pendapatan', 'Beban').messages({
    'any.only': 'Tipe harus salah satu dari: Asset, Kewajiban, Ekuitas, Pendapatan, Beban'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});

// Supplier validation schemas
const createSupplierSchema = Joi.object({
  nama_supplier: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Nama supplier harus diisi',
    'string.min': 'Nama supplier minimal 1 karakter',
    'string.max': 'Nama supplier maksimal 255 karakter',
    'any.required': 'Nama supplier harus diisi'
  }),
  kontak: Joi.string().min(1).max(255).required().messages({
    'string.empty': 'Kontak supplier harus diisi',
    'string.min': 'Kontak minimal 1 karakter',
    'string.max': 'Kontak maksimal 255 karakter',
    'any.required': 'Kontak supplier harus diisi'
  }),
  alamat: Joi.string().min(1).required().messages({
    'string.empty': 'Alamat supplier harus diisi',
    'string.min': 'Alamat minimal 1 karakter',
    'any.required': 'Alamat supplier harus diisi'
  })
});

const updateSupplierSchema = Joi.object({
  nama_supplier: Joi.string().min(1).max(255).messages({
    'string.empty': 'Nama supplier tidak boleh kosong',
    'string.min': 'Nama supplier minimal 1 karakter',
    'string.max': 'Nama supplier maksimal 255 karakter'
  }),
  kontak: Joi.string().min(1).max(255).messages({
    'string.empty': 'Kontak tidak boleh kosong',
    'string.min': 'Kontak minimal 1 karakter',
    'string.max': 'Kontak maksimal 255 karakter'
  }),
  alamat: Joi.string().min(1).messages({
    'string.empty': 'Alamat tidak boleh kosong',
    'string.min': 'Alamat minimal 1 karakter'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});



// Pembelian validation schemas
const createPembelianSchema = Joi.object({
  id_supplier: Joi.number().integer().positive().required().messages({
    'number.base': 'ID supplier harus berupa angka',
    'number.positive': 'ID supplier harus positif',
    'any.required': 'ID supplier harus diisi'
  }),
  no_faktur: Joi.string().trim().min(1).max(255).required().messages({
    'string.base': 'No faktur harus berupa string',
    'string.min': 'No faktur tidak boleh kosong',
    'string.max': 'No faktur maksimal 255 karakter',
    'any.required': 'No faktur harus diisi'
  }),
  tanggal: Joi.date().iso().required().messages({
    'date.base': 'Tanggal harus dalam format yang valid (YYYY-MM-DD)',
    'any.required': 'Tanggal harus diisi'
  }),
  items: Joi.array().items(
    Joi.object({
      id_produk: Joi.number().integer().positive().required().messages({
        'number.base': 'ID produk harus berupa angka',
        'number.positive': 'ID produk harus positif',
        'any.required': 'ID produk harus diisi'
      }),
      jumlah: Joi.number().integer().positive().required().messages({
        'number.base': 'Jumlah harus berupa angka',
        'number.positive': 'Jumlah harus positif',
        'any.required': 'Jumlah harus diisi'
      }),
      harga: Joi.number().positive().required().messages({
        'number.base': 'Harga harus berupa angka',
        'number.positive': 'Harga harus positif',
        'any.required': 'Harga harus diisi'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Minimal harus ada 1 item',
    'any.required': 'Items harus diisi'
  })
});

const updatePembelianSchema = Joi.object({
  id_supplier: Joi.number().integer().positive().messages({
    'number.base': 'ID supplier harus berupa angka',
    'number.positive': 'ID supplier harus positif'
  }),
  no_faktur: Joi.string().trim().min(1).max(255).messages({
    'string.base': 'No faktur harus berupa string',
    'string.min': 'No faktur tidak boleh kosong',
    'string.max': 'No faktur maksimal 255 karakter'
  }),
  tanggal: Joi.date().iso().messages({
    'date.base': 'Tanggal harus dalam format yang valid (YYYY-MM-DD)'
  }),
  items: Joi.array().items(
    Joi.object({
      id_produk: Joi.number().integer().positive().required().messages({
        'number.base': 'ID produk harus berupa angka',
        'number.positive': 'ID produk harus positif',
        'any.required': 'ID produk harus diisi'
      }),
      jumlah: Joi.number().integer().positive().required().messages({
        'number.base': 'Jumlah harus berupa angka',
        'number.positive': 'Jumlah harus positif',
        'any.required': 'Jumlah harus diisi'
      }),
      harga: Joi.number().positive().required().messages({
        'number.base': 'Harga harus berupa angka',
        'number.positive': 'Harga harus positif',
        'any.required': 'Harga harus diisi'
      })
    })
  ).min(1).messages({
    'array.min': 'Minimal harus ada 1 item'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});

// Pelanggan validation schemas
const createPelangganSchema = Joi.object({
  nama_pelanggan: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'Nama pelanggan harus diisi',
    'string.min': 'Nama pelanggan minimal 2 karakter',
    'string.max': 'Nama pelanggan maksimal 255 karakter',
    'any.required': 'Nama pelanggan harus diisi'
  }),
  kontak: Joi.string().min(8).max(20).required().messages({
    'string.empty': 'Kontak harus diisi',
    'string.min': 'Kontak minimal 8 karakter',
    'string.max': 'Kontak maksimal 20 karakter',
    'any.required': 'Kontak harus diisi'
  }),
  alamat: Joi.string().min(5).max(500).required().messages({
    'string.empty': 'Alamat harus diisi',
    'string.min': 'Alamat minimal 5 karakter',
    'string.max': 'Alamat maksimal 500 karakter',
    'any.required': 'Alamat harus diisi'
  })
});

const updatePelangganSchema = Joi.object({
  nama_pelanggan: Joi.string().min(2).max(255).messages({
    'string.min': 'Nama pelanggan minimal 2 karakter',
    'string.max': 'Nama pelanggan maksimal 255 karakter'
  }),
  kontak: Joi.string().min(8).max(20).messages({
    'string.min': 'Kontak minimal 8 karakter',
    'string.max': 'Kontak maksimal 20 karakter'
  }),
  alamat: Joi.string().min(5).max(500).messages({
    'string.min': 'Alamat minimal 5 karakter',
    'string.max': 'Alamat maksimal 500 karakter'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});

// POS/Sale validation schemas
const createSaleSchema = Joi.object({
  id_pelanggan: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID pelanggan harus berupa angka',
    'number.positive': 'ID pelanggan harus positif'
  }),
  tanggal_penjualan: Joi.date().iso().required().messages({
    'date.base': 'Tanggal penjualan harus dalam format yang valid (YYYY-MM-DD)',
    'any.required': 'Tanggal penjualan harus diisi'
  }),
  items: Joi.array().items(
    Joi.object({
      id_produk: Joi.number().integer().positive().required().messages({
        'number.base': 'ID produk harus berupa angka',
        'number.positive': 'ID produk harus positif',
        'any.required': 'ID produk harus diisi'
      }),
      jumlah: Joi.number().integer().positive().required().messages({
        'number.base': 'Jumlah harus berupa angka',
        'number.positive': 'Jumlah harus positif',
        'any.required': 'Jumlah harus diisi'
      }),
      harga_satuan: Joi.number().positive().required().messages({
        'number.base': 'Harga satuan harus berupa angka',
        'number.positive': 'Harga satuan harus positif',
        'any.required': 'Harga satuan harus diisi'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Minimal harus ada 1 item',
    'any.required': 'Items harus diisi'
  })
});

const updateSaleSchema = Joi.object({
  id_pelanggan: Joi.number().integer().positive().optional().messages({
    'number.base': 'ID pelanggan harus berupa angka',
    'number.positive': 'ID pelanggan harus positif'
  }),
  tanggal_penjualan: Joi.date().iso().messages({
    'date.base': 'Tanggal penjualan harus dalam format yang valid (YYYY-MM-DD)'
  }),
  items: Joi.array().items(
    Joi.object({
      id_produk: Joi.number().integer().positive().required().messages({
        'number.base': 'ID produk harus berupa angka',
        'number.positive': 'ID produk harus positif',
        'any.required': 'ID produk harus diisi'
      }),
      jumlah: Joi.number().integer().positive().required().messages({
        'number.base': 'Jumlah harus berupa angka',
        'number.positive': 'Jumlah harus positif',
        'any.required': 'Jumlah harus diisi'
      }),
      harga_satuan: Joi.number().positive().required().messages({
        'number.base': 'Harga satuan harus berupa angka',
        'number.positive': 'Harga satuan harus positif',
        'any.required': 'Harga satuan harus diisi'
      })
    })
  ).min(1).messages({
    'array.min': 'Minimal harus ada 1 item'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});

// Jurnal validation schemas
const createJurnalSchema = Joi.object({
  id_akun: Joi.number().integer().positive().required().messages({
    'number.base': 'ID akun harus berupa angka',
    'number.positive': 'ID akun harus positif',
    'any.required': 'ID akun harus diisi'
  }),
  tanggal_jurnal: Joi.date().iso().required().messages({
    'date.base': 'Tanggal jurnal harus dalam format yang valid (YYYY-MM-DD)',
    'any.required': 'Tanggal jurnal harus diisi'
  }),
  keterangan: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'keterangan harus diisi',
    'string.min': 'keterangan minimal 1 karakter',
    'string.max': 'keterangan maksimal 500 karakter',
    'any.required': 'keterangan harus diisi'
  }),
  debet: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Debet harus berupa angka',
    'number.min': 'Debet tidak boleh negatif'
  }),
  kredit: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Kredit harus berupa angka',
    'number.min': 'Kredit tidak boleh negatif'
  })
}).custom((value, helpers) => {
  if (value.debit === 0 && value.kredit === 0) {
    return helpers.error('any.invalid', { message: 'Debit atau kredit harus diisi' });
  }
  if (value.debit > 0 && value.kredit > 0) {
    return helpers.error('any.invalid', { message: 'Tidak boleh mengisi debit dan kredit secara bersamaan' });
  }
  return value;
});

const updateJurnalSchema = Joi.object({
  id_akun: Joi.number().integer().positive().messages({
    'number.base': 'ID akun harus berupa angka',
    'number.positive': 'ID akun harus positif'
  }),
  tanggal_jurnal: Joi.date().iso().messages({
    'date.base': 'Tanggal jurnal harus dalam format yang valid (YYYY-MM-DD)'
  }),
  deskripsi: Joi.string().min(1).max(500).messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
    'string.min': 'Deskripsi minimal 1 karakter',
    'string.max': 'Deskripsi maksimal 500 karakter'
  }),
  debit: Joi.number().min(0).precision(2).messages({
    'number.base': 'Debit harus berupa angka',
    'number.min': 'Debit tidak boleh negatif'
  }),
  kredit: Joi.number().min(0).precision(2).messages({
    'number.base': 'Kredit harus berupa angka',
    'number.min': 'Kredit tidak boleh negatif'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
}).custom((value, helpers) => {
  if (value.debit !== undefined && value.kredit !== undefined) {
    if (value.debit === 0 && value.kredit === 0) {
      return helpers.error('any.invalid', { message: 'Debit atau kredit harus diisi' });
    }
    if (value.debit > 0 && value.kredit > 0) {
      return helpers.error('any.invalid', { message: 'Tidak boleh mengisi debit dan kredit secara bersamaan' });
    }
  }  return value;
});

// Penggajian validation schemas
const createPenggajianSchema = Joi.object({
  id_karyawan: Joi.number().integer().positive().required().messages({
    'number.base': 'ID karyawan harus berupa angka',
    'number.positive': 'ID karyawan harus positif',
    'any.required': 'ID karyawan harus diisi'
  }),
  tanggal: Joi.date().iso().required().messages({
    'date.base': 'Tanggal harus dalam format yang valid (YYYY-MM-DD)',
    'any.required': 'Tanggal harus diisi'
  }),
  tunjangan: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Tunjangan harus berupa angka',
    'number.min': 'Tunjangan tidak boleh negatif'
  }),
  potongan: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Potongan harus berupa angka',
    'number.min': 'Potongan tidak boleh negatif'
  }),
  overtime: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Overtime harus berupa angka',
    'number.min': 'Overtime tidak boleh negatif'
  }),
  bonus: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Bonus harus berupa angka',
    'number.min': 'Bonus tidak boleh negatif'
  })
});

const updatePenggajianSchema = Joi.object({
  tanggal: Joi.date().iso().messages({
    'date.base': 'Tanggal harus dalam format yang valid (YYYY-MM-DD)'
  }),
  gaji_pokok: Joi.number().positive().precision(2).messages({
    'number.base': 'Gaji pokok harus berupa angka',
    'number.positive': 'Gaji pokok harus lebih besar dari 0'
  }),
  tunjangan: Joi.number().min(0).precision(2).messages({
    'number.base': 'Tunjangan harus berupa angka',
    'number.min': 'Tunjangan tidak boleh negatif'
  }),
  potongan: Joi.number().min(0).precision(2).messages({
    'number.base': 'Potongan harus berupa angka',
    'number.min': 'Potongan tidak boleh negatif'
  }),
  overtime: Joi.number().min(0).precision(2).messages({
    'number.base': 'Overtime harus berupa angka',
    'number.min': 'Overtime tidak boleh negatif'
  }),
  bonus: Joi.number().min(0).precision(2).messages({
    'number.base': 'Bonus harus berupa angka',
    'number.min': 'Bonus tidak boleh negatif'
  })
}).min(1).messages({
  'object.min': 'Minimal satu field harus diisi untuk update'
});

const generateBulkPenggajianSchema = Joi.object({
  tanggal: Joi.date().iso().required().messages({
    'date.base': 'Tanggal harus dalam format yang valid (YYYY-MM-DD)',
    'any.required': 'Tanggal harus diisi'
  }),
  karyawan_ids: Joi.array().items(
    Joi.number().integer().positive()
  ).min(1).optional().messages({
    'array.min': 'Minimal harus ada 1 karyawan',
    'number.base': 'ID karyawan harus berupa angka',
    'number.positive': 'ID karyawan harus positif'
  }),
  tunjangan_tambahan: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Tunjangan tambahan harus berupa angka',
    'number.min': 'Tunjangan tambahan tidak boleh negatif'
  }),
  potongan_umum: Joi.number().min(0).precision(2).default(0).messages({
    'number.base': 'Potongan umum harus berupa angka',
    'number.min': 'Potongan umum tidak boleh negatif'
  })
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

module.exports = {
  loginSchema,
  validate,
  createAbsensiSchema,
  updateAbsensiSchema,
  createKaryawanSchema,
  updateKaryawanSchema,
  createProdukSchema,
  updateProdukSchema,
  updateStokSchema,
  createStokopnameSchema,
  updateStokopnameSchema,  createStokrequestSchema,
  updateStokrequestSchema,
  createAkunSchema,
  updateAkunSchema,
  createSupplierSchema,
  updateSupplierSchema,  createPembelianSchema,
  updatePembelianSchema,
  createPelangganSchema,
  updatePelangganSchema,  createSaleSchema,
  updateSaleSchema,
  createJurnalSchema,
  updateJurnalSchema,
  createPenggajianSchema,
  updatePenggajianSchema,
  generateBulkPenggajianSchema
};
