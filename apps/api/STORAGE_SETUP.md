# Storage Setup Guide

Aplikasi ini mendukung dua jenis storage untuk file upload:
1. **Local Storage** (default) - Menyimpan file di local filesystem
2. **Cloudflare R2** - Menyimpan file di Cloudflare R2 (S3-compatible)

## Local Storage (Default)

Local storage adalah default storage yang menyimpan file di local filesystem server.

### Konfigurasi

Tambahkan ke `.env`:

```env
STORAGE_TYPE=local
STORAGE_UPLOAD_DIR=/app/uploads
STORAGE_BASE_URL=/uploads
```

### Catatan

- File disimpan di direktori yang ditentukan oleh `STORAGE_UPLOAD_DIR`
- File di-serve secara static melalui endpoint `STORAGE_BASE_URL`
- Pastikan direktori upload memiliki permission yang tepat

## Cloudflare R2 Storage

Cloudflare R2 adalah object storage yang kompatibel dengan S3 API, tanpa egress fees.

### Setup Cloudflare R2

#### 1. Buat R2 Bucket

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih account Anda
3. Navigate ke **R2** di sidebar
4. Klik **Create bucket**
5. Beri nama bucket (contoh: `crm-healthcare-uploads`)
6. Pilih location (opsional)

#### 2. Buat API Token

1. Di halaman R2, klik **Manage R2 API Tokens**
2. Klik **Create API Token**
3. Pilih permissions:
   - **Object Read & Write** (untuk upload dan delete)
   - Atau **Admin Read & Write** (untuk full access)
4. Pilih bucket yang akan digunakan
5. Klik **Create API Token**
6. **PENTING**: Simpan **Access Key ID** dan **Secret Access Key** (hanya ditampilkan sekali)

#### 3. Setup Public Access (Optional)

Jika ingin file bisa diakses secara public:

**Opsi 1: Custom Domain (Recommended)**
1. Di bucket settings, pilih **Settings** tab
2. Scroll ke **Public Access**
3. Klik **Connect Domain**
4. Pilih atau tambahkan custom domain
5. Setup DNS records sesuai instruksi
6. Public URL akan menjadi: `https://your-domain.com`

**Opsi 2: R2.dev Subdomain**
1. Di bucket settings, pilih **Settings** tab
2. Scroll ke **Public Access**
3. Klik **Allow Access**
4. Public URL akan menjadi: `https://<bucket-name>.<account-id>.r2.dev`

#### 4. Dapatkan Endpoint URL

Endpoint URL untuk R2 biasanya dalam format:
```
https://<account-id>.r2.cloudflarestorage.com
```

Untuk mendapatkan Account ID:
1. Di Cloudflare Dashboard, pilih account Anda
2. Account ID terlihat di sidebar kanan

### Konfigurasi Aplikasi

Tambahkan ke `.env`:

```env
# Storage Type
STORAGE_TYPE=r2

# R2 Configuration
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET=crm-healthcare-uploads
R2_PUBLIC_URL=https://your-domain.com
# atau jika menggunakan r2.dev subdomain:
# R2_PUBLIC_URL=https://crm-healthcare-uploads.<account-id>.r2.dev

# Base URL (optional, digunakan sebagai prefix di dalam bucket)
STORAGE_BASE_URL=uploads
```

### Contoh Konfigurasi Lengkap

**Local Storage:**
```env
STORAGE_TYPE=local
STORAGE_UPLOAD_DIR=/app/uploads
STORAGE_BASE_URL=/uploads
```

**Cloudflare R2:**
```env
STORAGE_TYPE=r2
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=abc123def456789
R2_SECRET_ACCESS_KEY=xyz789abc123def456ghi789jkl012mno345pqr678
R2_BUCKET=crm-healthcare-uploads
R2_PUBLIC_URL=https://cdn.yourdomain.com
STORAGE_BASE_URL=uploads
```

### Docker Configuration

Untuk production dengan Docker, tambahkan environment variables di `docker-compose.production.yml`:

```yaml
services:
  api:
    environment:
      - STORAGE_TYPE=${STORAGE_TYPE:-local}
      - R2_ENDPOINT=${R2_ENDPOINT}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
      - R2_BUCKET=${R2_BUCKET}
      - R2_PUBLIC_URL=${R2_PUBLIC_URL}
      - STORAGE_BASE_URL=${STORAGE_BASE_URL:-uploads}
```

### Testing

Setelah konfigurasi, test upload file melalui API:

```bash
curl -X POST http://localhost:8080/api/v1/visit-reports/{id}/photos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

Response akan mengembalikan URL file yang sudah di-upload.

### Troubleshooting

**Error: "Failed to initialize R2 storage"**
- Pastikan `R2_ENDPOINT` format benar
- Pastikan `R2_ACCESS_KEY_ID` dan `R2_SECRET_ACCESS_KEY` valid
- Pastikan API token memiliki permission yang tepat

**Error: "Access Denied" saat upload**
- Pastikan bucket name benar
- Pastikan API token memiliki permission untuk bucket tersebut
- Pastikan bucket policy mengizinkan upload

**File tidak bisa diakses secara public**
- Pastikan `R2_PUBLIC_URL` sudah dikonfigurasi dengan benar
- Pastikan public access sudah di-enable di bucket settings
- Jika menggunakan custom domain, pastikan DNS sudah dikonfigurasi dengan benar

### Migration dari Local ke R2

1. Backup file yang ada di local storage
2. Upload file ke R2 bucket (bisa menggunakan Cloudflare Dashboard atau tools lain)
3. Update konfigurasi `.env` dengan R2 settings
4. Restart aplikasi
5. File baru akan otomatis tersimpan di R2

### Best Practices

1. **Gunakan Custom Domain** untuk production (lebih professional dan mudah di-manage)
2. **Enable CORS** di R2 bucket jika perlu diakses dari frontend
3. **Setup CDN** jika menggunakan custom domain untuk performa lebih baik
4. **Rotate API Tokens** secara berkala untuk security
5. **Monitor Usage** di Cloudflare Dashboard untuk tracking storage dan bandwidth

