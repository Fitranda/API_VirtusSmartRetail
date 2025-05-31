# VirtuSmartRetail API

API modern untuk sistem retail virtual yang smart dan efisien, dibangun dengan Express.js, MySQL, dan Swagger.

## 🚀 Fitur

- **Autentikasi & Autorisasi**: JWT-based authentication dengan role-based access control
- **Manajemen Produk**: CRUD operations untuk produk dengan kategori
- **Manajemen Kategori**: Sistem kategori produk yang terstruktur
- **Dokumentasi API**: Swagger/OpenAPI 3.0 documentation
- **Keamanan**: Helmet, CORS, Rate limiting, Input validation
- **Error Handling**: Centralized error handling dengan logging
- **Database**: MySQL dengan connection pooling
- **Pagination**: Built-in pagination untuk semua list endpoints

## 🛠️ Teknologi

- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Express Rate Limit
- **Validation**: Joi
- **Password Hashing**: bcryptjs

## 📋 Prerequisites

- Node.js v16.0+ 
- MySQL 8.0+
- npm atau yarn

## 🔧 Installation

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/virtusmartretail-api.git
   cd virtusmartretail-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Copy `.env` file dan sesuaikan dengan konfigurasi Anda:
   ```env
   NODE_ENV=development
   PORT=3000
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=virtusmartretail
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRES_IN=24h
   ```

4. **Setup Database**
   
   Jalankan script SQL untuk membuat database dan tabel:
   ```bash
   mysql -u root -p < database/setup.sql
   ```

5. **Start server**
   ```bash
   # Development mode dengan auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

Setelah server berjalan, akses dokumentasi Swagger di:
- **Local**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/v1/health

## 🔐 Authentication

API menggunakan JWT authentication. Untuk mengakses endpoint yang dilindungi:

1. **Register/Login** untuk mendapatkan token
2. **Include token** di header request:
   ```
   Authorization: Bearer your_jwt_token_here
   ```

### Default Admin Account
- **Email**: admin@virtusmartretail.com
- **Password**: admin123

## 📖 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user baru
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/change-password` - Ganti password

### Products
- `GET /api/v1/products` - Get all products (dengan pagination & filtering)
- `GET /api/v1/products/:id` - Get product by ID
- `POST /api/v1/products` - Create product (Admin only)
- `PUT /api/v1/products/:id` - Update product (Admin only)
- `DELETE /api/v1/products/:id` - Delete product (Admin only)

### Categories
- `GET /api/v1/categories` - Get all categories (dengan pagination & filtering)
- `GET /api/v1/categories/dropdown` - Get categories untuk dropdown
- `GET /api/v1/categories/:id` - Get category by ID
- `POST /api/v1/categories` - Create category (Admin only)
- `PUT /api/v1/categories/:id` - Update category (Admin only)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

### System
- `GET /api/v1/health` - Health check
- `GET /` - API information

## 🔍 Query Parameters

### Pagination
```
?page=1&limit=10
```

### Search & Filter
```
# Products
?search=iphone&category=1&status=active

# Categories  
?search=electronics&status=active
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Joi validation
- **SQL Injection Protection**: Parameterized queries
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt dengan salt rounds 12

## 🗄️ Database Schema

### Users
- id, username, email, password, role, last_login, created_at, updated_at, deleted_at

### Categories
- id, name, description, status, created_at, updated_at, deleted_at

### Products
- id, name, description, price, stock, category_id, sku, status, created_at, updated_at, deleted_at

### Orders (Future)
- id, order_number, user_id, customer_name, customer_email, shipping_address, total_amount, status, created_at, updated_at, deleted_at

### Order Items (Future)
- id, order_id, product_id, product_name, quantity, price, subtotal, created_at

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests dengan coverage
npm run test:coverage
```

## 📦 Production Deployment

1. **Set environment variables**
   ```env
   NODE_ENV=production
   DB_PASSWORD=secure_password
   JWT_SECRET=very_secure_secret_key
   ```

2. **Install production dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Start with PM2 (recommended)**
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name "virtusmartretail-api"
   ```

## 🔄 API Versioning

API menggunakan URL versioning:
- Current: `/api/v1/`
- Future: `/api/v2/`

## 📈 Monitoring & Logging

- Request logging dengan timestamp dan IP address
- Error logging dengan stack trace (development)
- Health check endpoint untuk monitoring

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Express.js community
- MySQL team
- Swagger/OpenAPI team
- All contributors

---

**VirtuSmartRetail API** - Powering the future of retail technology 🚀
