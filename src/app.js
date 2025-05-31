const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
require("dotenv").config();

// Import configurations
const { testConnection } = require("./config/database");
const { swaggerUi, specs } = require("./config/swagger");

// Import middleware
const { generalLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Import routes
const routes = require("./routes");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS middleware - Allow all origins
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`
  );
  next();
});

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "VirtuSmartRetail API Documentation",
  })
);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to VirtuSmartRetail API",
    version: "1.0.0",
    documentation: "/api-docs",
    endpoints: {
      health: "/api/v1/health",
      auth: "/api/v1/auth",
      absensi: "/api/v1/absensi",
      categories: "/api/v1/categories",
      products: "/api/v1/products",
      produk: "/api/v1/produk",
      karyawan: "/api/v1/karyawan",
      stokopname: "/api/v1/stokopname",
      stokrequest: "/api/v1/stokrequest",
      akun: "/api/v1/akun",
      supplier: "/api/v1/supplier",
      pembelian: "/api/v1/pembelian",
      penggajian: "/api/v1/penggajian",
      jurnal: "/api/v1/jurnal",
      pos: "/api/v1/pos",
      pelanggan: "/api/v1/pelanggan",
    },
  });
});

// API routes
app.use("/api/v1", routes);

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("❌ Cannot start server: Database connection failed");
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log("🚀 Server Information:");
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 Server running on: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log("✅ Server started successfully!");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
