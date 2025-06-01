# VirtuSmartRetail API - Postman Documentation

## Overview
Dokumentasi API lengkap untuk sistem VirtuSmartRetail menggunakan Postman Collection dan Environment.

## Files Included
- `VirtuSmartRetail_API.postman_collection.json` - Collection lengkap dengan semua endpoint
- `VirtuSmartRetail_Environment.postman_environment.json` - Environment variables untuk development

## How to Import

### 1. Import Collection
1. Buka Postman
2. Klik **Import** button
3. Pilih file `VirtuSmartRetail_API.postman_collection.json`
4. Klik **Import**

### 2. Import Environment
1. Klik **Environments** tab di Postman
2. Klik **Import** button
3. Pilih file `VirtuSmartRetail_Environment.postman_environment.json`
4. Klik **Import**
5. Set environment sebagai active dengan memilih "VirtuSmartRetail Environment" dari dropdown

## Setup Authentication

### 1. Login to Get Token
1. Expand **Authentication** folder
2. Run **Login** request dengan credentials:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
3. Copy `token` dari response
4. Set `auth_token` variable di environment dengan token yang didapat

### 2. Auto Token Setup (Advanced)
Atau tambahkan script berikut di **Tests** tab pada Login request untuk otomatis set token:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.token) {
        pm.environment.set("auth_token", response.data.token);
        console.log("Token set successfully");
    }
}
```

## API Endpoints Overview

### Authentication
- `POST /auth/login` - Login and get authentication token

### Employee Management (Karyawan)
- `GET /karyawan` - Get all employees with pagination
- `GET /karyawan/{id}` - Get employee by ID
- `POST /karyawan` - Create new employee
- `PUT /karyawan/{id}` - Update employee
- `DELETE /karyawan/{id}` - Delete employee

### Product Management (Produk)
- `GET /produk` - Get all products with pagination and filtering
- `GET /produk/{id}` - Get product by ID
- `POST /produk` - Create new product
- `PUT /produk/{id}` - Update product
- `DELETE /produk/{id}` - Delete product

### Supplier Management
- `GET /supplier` - Get all suppliers
- `GET /supplier/{id}` - Get supplier by ID
- `POST /supplier` - Create new supplier
- `PUT /supplier/{id}` - Update supplier
- `DELETE /supplier/{id}` - Delete supplier

### Purchase Management (Pembelian)
- `GET /pembelian` - Get all purchases with filtering
- `GET /pembelian/{id}` - Get purchase by ID
- `GET /pembelian/stats` - Get purchase statistics
- `POST /pembelian` - Create new purchase order
- `PUT /pembelian/{id}` - Update purchase
- `DELETE /pembelian/{id}` - Delete purchase

### Customer Management (Pelanggan)
- `GET /pelanggan` - Get all customers
- `GET /pelanggan/{id}` - Get customer by ID
- `POST /pelanggan` - Create new customer
- `PUT /pelanggan/{id}` - Update customer
- `DELETE /pelanggan/{id}` - Delete customer

### Point of Sale (POS)
- `GET /pos/sales` - Get all sales transactions
- `GET /pos/sales/{id}` - Get sale by ID
- `POST /pos/sale` - Create new sale transaction

### Chart of Accounts (Akun)
- `GET /akun` - Get all accounts
- `GET /akun/{id}` - Get account by ID
- `POST /akun` - Create new account
- `PUT /akun/{id}` - Update account
- `DELETE /akun/{id}` - Delete account

### Journal Entries (Jurnal)
- `GET /jurnal` - Get all journal entries
- `GET /jurnal/{id}` - Get journal entry by ID
- `POST /jurnal` - Create new journal entry
- `PUT /jurnal/{id}` - Update journal entry
- `DELETE /jurnal/{id}` - Delete journal entry

### Payroll (Penggajian)
- `GET /penggajian` - Get all payroll records
- `GET /penggajian/{id}` - Get payroll by ID
- `POST /penggajian` - Create new payroll record
- `POST /penggajian/bulk` - Generate bulk payroll
- `PUT /penggajian/{id}` - Update payroll
- `DELETE /penggajian/{id}` - Delete payroll

### Stock Opname (Stokopname)
- `GET /stokopname` - Get all stock opname records
- `GET /stokopname/{id}` - Get stock opname by ID
- `POST /stokopname` - Create new stock opname
- `PUT /stokopname/{id}` - Update stock opname
- `DELETE /stokopname/{id}` - Delete stock opname

### Attendance (Absensi)
- `GET /absensi` - Get all attendance records
- `GET /absensi/{id}` - Get attendance by ID
- `POST /absensi` - Create new attendance record
- `PUT /absensi/{id}` - Update attendance (clock out)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | API base URL | `http://localhost:3000/api/v1` |
| `auth_token` | JWT authentication token | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `admin_username` | Admin username for login | `admin` |
| `admin_password` | Admin password for login | `admin123` |

## Sample Request/Response

### Create Product Example
**Request:**
```json
POST {{base_url}}/produk
Authorization: Bearer {{auth_token}}
Content-Type: application/json

{
  "nama_produk": "Laptop Asus",
  "kategori": "Elektronik",
  "stok": 10,
  "harga_beli": 8000000,
  "harga_jual": 10000000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Produk berhasil dibuat",
  "data": {
    "id_produk": 1,
    "nama_produk": "Laptop Asus",
    "kategori": "Elektronik",
    "stok": 10,
    "harga_beli": 8000000,
    "harga_jual": 10000000,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Handling
Semua response error mengikuti format standar:

```json
{
  "success": false,
  "message": "Error message",
  "details": ["Detailed error information"]
}
```

## Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Testing Tips

1. **Use Environment Variables**: Selalu gunakan `{{base_url}}` dan `{{auth_token}}` untuk konsistensi
2. **Chain Requests**: Gunakan Tests scripts untuk mengambil data dari response dan set ke variables
3. **Data Dependencies**: Buat requests dalam urutan yang logis (create → read → update → delete)
4. **Bulk Testing**: Gunakan Collection Runner untuk menjalankan semua tests sekaligus

## Generating Documentation

1. Klik pada Collection name di Postman
2. Pilih **View complete documentation**
3. Klik **Publish** untuk membuat public documentation
4. Atau export as HTML/PDF untuk dokumentasi offline

## Support
Untuk pertanyaan atau issues, hubungi tim development atau buat issue di repository project.
