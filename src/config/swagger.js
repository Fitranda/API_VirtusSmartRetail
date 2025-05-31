const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VirtuSmartRetail API",
      version: "1.0.0",
      description:
        "API untuk sistem retail virtual yang smart dan modern by Fitranda Ramadhana",
      contact: {
        name: "API Support",
        email: "ramadhana689@gmail.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://api.virtusmartretail.com"
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error message",
            },
            error: {
              type: "string",
              example: "Detailed error information",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            data: {
              type: "object",
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "Endpoint untuk autentikasi karyawan",
      },
      {
        name: "System",
        description: "System health dan monitoring",
      },
      {
        name: "Absensi",
        description: "Manajemen absensi karyawan",
      },
      {
        name: "Karyawan",
        description: "Manajemen data karyawan",
      },
      {
        name: "Produk",
        description: "Manajemen produk dan stok",
      },      {
        name: "Stokopname",
        description: "Manajemen stock opname dan audit stok",
      },
      {
        name: "Akun",
        description: "Manajemen chart of accounts",
      },      {
        name: "Supplier",
        description: "Manajemen data supplier",
      },      {
        name: "Pembelian",
        description: "Manajemen pembelian dan purchase order",
      },
      {
        name: "Penggajian",
        description: "Manajemen penggajian karyawan",
      },      {
        name: "Jurnal",
        description: "Manajemen jurnal akuntansi dan buku besar",
      },
      {
        name: "POS",
        description: "Point of Sale - Manajemen transaksi penjualan",
      },
      {
        name: "Pelanggan",
        description: "Manajemen data pelanggan dan riwayat transaksi",
      },
      {
        name: "Stock Request",
        description: "Manajemen permintaan stok",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"], // Path ke file yang berisi anotasi swagger
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
