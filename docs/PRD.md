# Product Requirements Document (PRD)
## CRM Healthcare - Customer Relationship Management untuk Industri Farmasi

**Versi:** 1.0  
**Tanggal:** 2024  
**Status:** Draft

---

## 📋 Daftar Isi

1. [Executive Summary](#executive-summary)
2. [Visi & Misi](#visi--misi)
3. [Target Market](#target-market)
4. [Modul Utama](#modul-utama)
5. [Arsitektur Sistem](#arsitektur-sistem)
6. [Tech Stack](#tech-stack)
7. [Roadmap Implementasi](#roadmap-implementasi)
8. [Success Metrics](#success-metrics)

---

## Executive Summary

CRM Healthcare adalah platform **Customer Relationship Management (CRM) berbasis SaaS** yang dirancang khusus untuk industri farmasi di Indonesia. Platform ini memfasilitasi Medical Representative (MedRep) untuk merencanakan kunjungan dokter (Call Plan), melaporkan hasil kunjungan (Call Report), mengelola produk dan stok sample, serta memberikan insights untuk meningkatkan efektivitas penjualan.

### Value Proposition

- **Real-time Tracking**: GPS-based visit validation untuk memastikan kunjungan valid
- **Efektif**: Call Plan & Call Report terintegrasi untuk optimasi waktu MedRep
- **Terstruktur**: Manajemen produk, sample, dan detailing yang sistematis
- **Insightful**: Analytics dan laporan untuk evaluasi kinerja
- **Mobile-First**: Aplikasi mobile untuk MedRep di lapangan
- **Scalable**: Dukungan multi-tenant untuk perusahaan farmasi

---

## Visi & Misi

### Visi
Menjadi platform CRM terdepan di Indonesia untuk industri farmasi yang memberdayakan Medical Representative dan perusahaan farmasi untuk meningkatkan efektivitas penjualan melalui teknologi modern.

### Misi
1. Memfasilitasi perencanaan dan pelaporan kunjungan dokter secara real-time
2. Memastikan validitas kunjungan melalui geo-tagging dan validasi lokasi
3. Memberikan insights yang actionable melalui analitik dan laporan
4. Meningkatkan efisiensi operasional MedRep di lapangan

---

## Target Market

### Primary Target
- **Perusahaan Farmasi**: Perusahaan farmasi nasional dan multinasional
- **Distributor Farmasi**: Distributor yang memiliki tim Medical Representative
- **Agen Farmasi**: Agen yang mengelola tim sales di bidang farmasi

### Secondary Target
- **Perusahaan Alat Kesehatan**: Perusahaan yang menjual alat kesehatan ke rumah sakit/klinik
- **Perusahaan Nutrisi Medis**: Perusahaan yang fokus pada nutrisi medis

### User Personas

1. **Medical Representative (MedRep)**
   - Butuh aplikasi mobile untuk call plan dan call report
   - Fokus pada kunjungan dokter dan detailing produk
   - Butuh validasi GPS untuk check-in/check-out
   - Mengelola stok sample yang dibawa

2. **Sales Manager / Area Manager**
   - Monitor real-time aktivitas MedRep
   - Review call plan dan realization
   - Analisis performa tim dan produk
   - Approve force check-in jika diperlukan

3. **Admin / Data Entry**
   - Manage data dokter, produk, dan user
   - Setup area dan teritori
   - Generate laporan dan analytics

---

## Modul Utama

Platform CRM Healthcare terdiri dari modul-modul berikut dengan **Visit Management** sebagai modul paling krusial:

1. **[Modul Visit Management (Call Plan & Call Report)](./modules/01-visit-management.md)** ⭐ **PRIORITAS UTAMA**
   - Call Plan (Perencanaan Kunjungan)
   - Visit Execution (Check-in dengan GPS validation)
   - Call Report (Detailing produk & Sample drop)
   - Visit History & Analytics

2. **[Modul Master Data](./modules/02-master-data.md)**
   - Manajemen Dokter (Customer)
   - Manajemen Produk
   - Manajemen User (MedRep, Manager, Admin)
   - Manajemen Area & Teritori

3. **[Modul Sample Management](./modules/03-sample-management.md)**
   - Stok Sample MedRep
   - Distribusi Sample
   - Tracking Batch & Expiry
   - Laporan Sample Usage

4. **[Modul Analytics & Reporting](./modules/04-analytics-reporting.md)**
   - Dashboard Real-time
   - Laporan Call Plan vs Realization
   - Product Performance Analytics
   - MedRep Performance Tracking

5. **[Modul User Management](./modules/05-user-management.md)**
   - Role-based Access Control (RBAC)
   - Hierarki Organisasi
   - Audit Log

### Fitur Per Paket Detail

#### Free (Rp 0/bulan)
- ✅ Kasir POS dasar
  - Transaksi penjualan
  - Scan barcode (kamera)
  - Keranjang & checkout
  - Pembayaran: Tunai, QRIS
- ✅ Manajemen produk dasar
  - CRUD produk (maks 50 produk)
  - Kategori sederhana (maks 5 kategori)
  - Stok dasar (single gudang, tanpa stock opname)
  - Upload gambar produk (maks 1 gambar per produk)
- ✅ Laporan sangat dasar
  - Laporan penjualan harian (30 hari terakhir)
  - Total omzet hari ini
  - Jumlah transaksi hari ini
  - Tidak ada export Excel/PDF
- ✅ Nota digital
  - Email nota (tanpa WhatsApp)
  - Download PDF nota
- ✅ 1 perangkat aktif
- ✅ 1 outlet
- ✅ 1 user (owner)
- ✅ Support: Dokumentasi & community forum

**Batasan Free Plan:**
- ❌ Maks 50 produk
- ❌ Maks 5 kategori
- ❌ Maks 30 hari history penjualan (data lama di-archive)
- ❌ Tidak ada multi-user
- ❌ Tidak ada loyalty program
- ❌ Tidak ada diskon/promo
- ❌ Tidak ada WhatsApp notifikasi
- ❌ Tidak ada e-wallet (hanya tunai & QRIS)
- ❌ Tidak ada stock opname
- ❌ Tidak ada laporan analitik
- ❌ Tidak ada export data
- ❌ Tidak ada offline mode (online only)

#### Basic (Rp 99.000/bulan)
- ✅ Semua fitur Free
- ✅ **Unlimited produk** (tidak ada batas 50 produk)
- ✅ **Unlimited kategori** (tidak ada batas 5 kategori)
- ✅ **Unlimited history penjualan** (tidak ada batas 30 hari)
- ✅ Multi user (hingga 3 user)
- ✅ Export laporan ke Excel/PDF
- ✅ Laporan analitik dasar
- ✅ Diskon & promo
- ✅ 1 perangkat aktif
- ✅ 1 outlet
- ✅ Support email

#### Pro (Rp 199.000/bulan)
- ✅ Semua fitur Basic
- ✅ Multi user (hingga 5 user)
- ✅ Stok lengkap (multi gudang, stock opname)
- ✅ Laporan lengkap (penjualan, produk, keuangan)
- ✅ Notifikasi WhatsApp otomatis
- ✅ Pembayaran: + E-wallet, Transfer
- ✅ Loyalty program & poin pelanggan
- ✅ Diskon & promo
- ✅ 3 perangkat aktif
- ✅ 1 outlet
- ✅ Support email + chat

#### Business (Rp 399.000/bulan)
- ✅ Semua fitur Pro
- ✅ Multi outlet (hingga 5 outlet)
- ✅ Transfer stok antar outlet
- ✅ Role-based access control (RBAC)
- ✅ Laporan konsolidasi multi-outlet
- ✅ API dasar untuk integrasi
- ✅ Dashboard mobile owner
- ✅ 10 perangkat aktif
- ✅ 5 outlet
- ✅ Support prioritas

#### Enterprise (Custom)
- ✅ Semua fitur Business
- ✅ Unlimited outlet & perangkat
- ✅ Integrasi ERP (Accurate, Jurnal.id)
- ✅ Custom report & dashboard
- ✅ White-label option
- ✅ Dedicated support
- ✅ SLA guarantee
- ✅ Custom training

### Model Pembayaran
- **Bulanan**: Pembayaran per bulan
- **Tahunan**: Diskon 20% (bayar 10 bulan, dapat 12 bulan)
- **Free Plan**: Selamanya gratis, tidak perlu kartu kredit

### Add-ons Berbayar (Opsional)

Add-ons dapat ditambahkan ke paket Free, Basic, atau Pro untuk fitur tambahan:

| Add-on | Harga (IDR) | Deskripsi | Cocok untuk Paket |
|--------|-------------|-----------|-------------------|
| **Unlimited Sales History** | Rp 75.000/bulan per outlet | Akses history penjualan tanpa batas waktu (untuk Free Plan) | Free, Basic |
| **Employee Management** | Rp 375.000/bulan per outlet | Multi-user, RBAC, shift management, audit log | Free, Basic |
| **Advanced Inventory** | Rp 375.000/bulan per outlet | Multi gudang, stock opname, transfer stok, stock movement tracking | Free, Basic |
| **WhatsApp Notifications** | Rp 50.000/bulan per outlet | Notifikasi otomatis via WhatsApp (nota, promo, reminder) | Free, Basic |
| **Loyalty Program** | Rp 100.000/bulan per outlet | Poin pelanggan, tier member, promo otomatis | Free, Basic |
| **E-Wallet Payment** | Rp 50.000/bulan per outlet | Pembayaran via GoPay, OVO, ShopeePay, DANA | Free, Basic |
| **Offline Mode** | Rp 75.000/bulan per outlet | Mode offline dengan sync otomatis saat online kembali | Free, Basic |

**Catatan:**
- Add-ons sudah termasuk di paket **Pro** dan **Business** (tidak perlu bayar terpisah)
- Add-ons dapat diaktifkan/nonaktifkan kapan saja
- Harga add-ons per outlet (jika multi-outlet, bayar per outlet)
- Semua add-ons termasuk 14 hari free trial

### Strategi Upgrade Path

**Free → Basic** (Rp 99.000/bulan)
- **Trigger**: Produk > 50, butuh history > 30 hari, butuh multi-user
- **Value Proposition**: "Unlock unlimited products & full history"
- **Conversion Goal**: 15-20% free users upgrade ke Basic

**Basic → Pro** (Rp 199.000/bulan)
- **Trigger**: Butuh WhatsApp, loyalty program, stok lengkap, multi-user lebih banyak
- **Value Proposition**: "Grow your business with advanced features"
- **Conversion Goal**: 30-40% Basic users upgrade ke Pro

**Pro → Business** (Rp 399.000/bulan)
- **Trigger**: Buka cabang kedua, butuh RBAC, API, multi-outlet
- **Value Proposition**: "Scale to multiple locations"
- **Conversion Goal**: 20-30% Pro users upgrade ke Business

**Keuntungan Model Freemium:**
- ✅ Lower barrier to entry: Gratis untuk mulai
- ✅ Viral growth: Pengguna gratis bisa jadi referensi
- ✅ Data acquisition: Lebih banyak pengguna = lebih banyak data untuk insights
- ✅ Competitive advantage: Sejalan dengan model Loyverse
- ✅ Upsell opportunities: Add-ons memberikan fleksibilitas

---

## Arsitektur Sistem

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Frontend  │     │  Mobile App     │     │  Admin Portal   │
│   (Next.js 16)  │     │  (Flutter)      │     │  (Next.js 16)   │
│   Manager/Admin │     │  MedRep App     │     │  Data Entry    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │   API Gateway / Load      │
                    │   Balancer (Cloudflare)   │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   Backend API (Go + Gin)  │
                    │   - REST API              │
                    │   - GPS Validation        │
                    │   - Background workers     │
                    └─────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
┌────────▼────────┐    ┌─────────▼─────────┐   ┌─────────▼─────────┐
│   PostgreSQL    │    │   Redis (Cache)    │   │  Cloudflare R2    │
│   (Multi-tenant)│    │   (Sessions)       │   │  (Object Storage) │
│   - Visits       │    │   - GPS Cache      │   │  - Visit Reports  │
│   - Doctors      │    │   - Hot Data      │   │  - Signatures     │
│   - Products     │    │                    │   │  - Documents      │
│   - Samples      │    │                    │   │                   │
└─────────────────┘    └────────────────────┘   └───────────────────┘
         │
         │
┌────────▼──────────────────────────────────────────────┐
│   External Services                                   │
│   - Google Maps API (Geocoding, Distance Matrix)     │
│   - WhatsApp API (Fonnte/Qontak) - Notifikasi        │
│   - Push Notifications (FCM)                          │
└───────────────────────────────────────────────────────┘
```

### Komponen Utama

1. **Frontend Web** (Next.js 16)
   - Dashboard Manager/Admin
   - Call Plan Calendar
   - Analytics & Reporting
   - Master Data Management

2. **Mobile App** (Flutter)
   - Visit Execution (Check-in/Check-out)
   - Call Report Form (Detailing & Sample)
   - Daily Visit Dashboard
   - Offline-first dengan sync

3. **Backend API** (Go + Gin)
   - REST API untuk web & mobile
   - GPS validation & distance calculation
   - Background workers untuk analytics

4. **Database** (PostgreSQL)
   - Multi-tenant dengan shared schema
   - Row-level security (RLS)
   - Relasi Many-to-Many untuk Visit-Product

5. **Storage** (Cloudflare R2)
   - Visit reports & documents
   - Digital signatures
   - Backup data

6. **Cache** (Redis)
   - Session storage
   - GPS data caching
   - Hot data caching

---

## Tech Stack

### Frontend (Next.js 16)
- **Framework**: Next.js 16 + React + TypeScript
  - Improved routing, caching, Turbopack untuk build cepat
  - SSR / SSG / Edge rendering untuk dashboard & landing
- **UI Library**: TailwindCSS + shadcn/ui / Radix UI
  - Accessible primitives, design system konsisten
  - Icons: lucide-icons / Heroicons
- **State Management**: 
  - **TanStack Query (React Query)** untuk server state + optimistic updates
  - **Zustand** untuk global state (simple) atau **Redux Toolkit** untuk kompleksitas tinggi
- **Forms**: React Hook Form + Zod untuk schema validation
- **Auth**: NextAuth.js (OIDC) atau Clerk/Auth0 untuk managed auth
- **Internationalization**: next-intl atau i18next (bahasa Indonesia default)
- **Edge & Caching**: Next.js Edge functions + Cloudflare untuk static assets

### Mobile (Flutter)
- **Framework**: Flutter (Dart) - Android & iOS native
- **State Management**: Riverpod (modern, testable) atau BLoC
- **Network**: 
  - **Dio** untuk HTTP dengan interceptors & retry
  - **gRPC** (grpc-dart) untuk mobile sync & high performance (optional)
- **Local Storage / Offline**: 
  - **Hive** atau **Sqflite** untuk structured data
  - **sembast** untuk simple key-value
  - **flutter_secure_storage** untuk tokens
- **Sync Strategy**: Local write-ahead log (WAL) + background sync + idempotent APIs
- **GPS & Location**: 
  - **geolocator** untuk GPS tracking
  - **geocoding** untuk reverse geocoding
  - **google_maps_flutter** untuk peta (optional)
- **Push Notifications**: Firebase Cloud Messaging (FCM) atau OneSignal
- **Native Integration**: 
  - Camera untuk foto dokumentasi
  - Signature pad untuk tanda tangan digital
  - File picker untuk upload dokumen

### Backend (Go + Gin)
- **Language**: Golang
- **Web Framework**: Gin (fast) atau chi (minimalism)
- **Database Tools**: 
  - **sqlc** (type-safe SQL generation) - recommended
  - **ent** (schema-driven) sebagai alternatif
- **Migrations**: golang-migrate
- **Auth & Authorization**: 
  - JWT access token + refresh tokens (rotate refresh tokens)
  - Refresh tokens stored in Redis
  - **Casbin** (Go) untuk RBAC/ABAC
- **API Styles**: 
  - REST (OpenAPI) untuk web
  - **gRPC** untuk mobile & internal sync endpoints (optional, high performance)
- **Background Workers**: 
  - Go routines + NATS / RabbitMQ untuk tasks (email, invoice retries, settlement jobs)
  - Scheduled jobs untuk subscription billing
- **File Uploads**: Presigned URLs ke Cloudflare R2 (S3 compatible)
- **Security**: 
  - TLS everywhere
  - Vulnerability scanning (Snyk)
  - Rate-limiting (Cloudflare + Gin middleware)
  - WAF via Cloudflare

### Database & Multi-Tenant Strategy
- **Primary DB**: PostgreSQL (managed)
  - **Neon** / **Supabase** (developer-friendly, serverless)
  - **Amazon RDS** / **Google Cloud SQL** (enterprise)
  - Read replicas untuk reporting
- **Multi-Tenant Approach**: 
  - **Phase 1**: Shared schema + tenant_id column + Row-Level Security (RLS)
    - Simple queries, easy horizontal scaling
    - Operational simplicity
  - **Phase 2+**: Schema-per-tenant atau Database-per-tenant untuk enterprise
    - Better isolation, per-tenant backup/restore
- **Backup & Recovery**: 
  - Regular DB snapshots (daily) + point-in-time recovery
  - Store backups in Cloudflare R2 dengan versioning + lifecycle
  - RTO/RPO SLAs sesuai paket

### Object Storage & CDN
- **Cloudflare R2**: 
  - S3-compatible, zero egress fees
  - Images produk, invoice PDFs, backups
  - Presigned URLs untuk secure uploads/downloads
- **CDN**: Cloudflare CDN + Workers
  - Edge caching & edge logic (image resizing, caching static assets)
- **Static Assets**: Deploy via Vercel untuk Next.js

### Payments & Subscriptions
- **Local-First (Indonesia)**: 
  - **Xendit**: Subscriptions API + QRIS + local channels (recommended)
  - **Midtrans**: Recurring/Subscription + Snap/Core APIs (alternative)
- **International**: 
  - **Stripe**: Global card processing & Stripe Billing (availability terbatas di Indonesia)
- **Design Pattern**: 
  - Provider-managed subscriptions (Xendit/Midtrans)
  - Local subscription state mirror + webhook reconciliation
  - Failed payment handling: retry/backoff + dunning emails/WhatsApp
  - Invoice & VAT: attach tax lines, generate PDFs (store to R2), send via email/WhatsApp
- **Billing Microservice**: 
  - Manage plans, coupons, pro-rata calculations
  - Usage metering (per-device/per-outlet billing)

### Message Queue & Events
- **NATS** (lightweight) untuk MVP
- **RabbitMQ** / **Kafka** untuk skala besar (future)

### Cache & Session
- **Redis**: 
  - **Upstash** (serverless) atau **Redis Enterprise** / **ElastiCache**
  - Session storage
  - Hot data caching
  - Refresh token storage

### Observability & Monitoring
- **Tracing**: OpenTelemetry (Go & JS clients)
- **Metrics**: Prometheus + Grafana untuk server metrics
- **Logs**: Loki atau ELK stack; integrate dengan Cloudflare logs
- **Error Tracking**: Sentry untuk frontend & backend
- **Uptime/Alerts**: PagerDuty atau OpsGenie + Grafana alerting
- **Product Analytics**: Amplitude atau PostHog (optional)

### DevOps & Infrastructure
- **Containerization**: Docker
- **Orchestration**: 
  - **Start**: Managed services (Cloud Run / Fly.io / Render untuk Go, Vercel untuk Next.js)
  - **Scale**: Kubernetes (EKS/GKE) jika diperlukan
- **CI/CD**: GitHub Actions
  - Run tests, build containers
  - Infrastructure plan via Terraform
- **Infrastructure as Code**: Terraform + Terragrunt untuk environment isolation (dev/staging/prod)
- **Secrets Management**: Vault / Cloud KMS / GitHub Secrets
- **SRE Playbooks**: Snapshot restore, failover DB, incident runbooks

### Data Privacy & Compliance
- **Localization**: Bahasa Indonesia, currency (IDR), date/time formats
- **Data Protection**: 
  - Encrypt sensitive data at rest
  - PII access controls
  - PCI-DSS compliance (via payment providers)
- **Data Residency**: Store backups in Jakarta region jika diperlukan

---

## Roadmap Implementasi

### Pertimbangan Teknis untuk Free Plan

**Rate Limiting & Resource Management:**
- Rate limiting untuk API calls (prevent abuse)
- Data retention policy: Archive data > 30 hari untuk Free Plan
- Storage limits: Maks 50 produk, 5 kategori
- Bandwidth limits: Maks 1GB per bulan untuk upload gambar
- Database query optimization untuk free users (prevent resource hogging)

**Feature Gating:**
- Feature flags untuk enable/disable fitur berdasarkan plan
- UI/UX indicators untuk batasan Free Plan (upgrade prompts)
- Soft limits dengan warning sebelum hard limit (contoh: warning di 45 produk)
- Graceful degradation saat limit tercapai

**Data Management:**
- Auto-archive transaksi > 30 hari untuk Free Plan
- Export data sebelum archive (opsional, untuk user yang mau upgrade)
- Backup data tetap dilakukan (untuk compliance & recovery)

**Conversion Optimization:**
- In-app upgrade prompts (non-intrusive)
- Usage analytics untuk track conversion triggers
- Email campaigns untuk free users yang mendekati limit
- Onboarding flow yang highlight value paid plans

### Phase 1: MVP (1-3 bulan) - Visit Management Focus
- ✅ Visit Management Core (Call Plan & Call Report)
- ✅ GPS validation & distance calculation
- ✅ Master Data (Doctors, Products, Users)
- ✅ Sample Management (Inventory tracking)
- ✅ PostgreSQL shared schema dengan relasi Many-to-Many
- ✅ Next.js dashboard (Manager/Admin) + Flutter mobile app (MedRep)
- ✅ Offline-first mobile dengan sync

### Phase 2: Growth (3-6 bulan)
- ✅ Analytics & Reporting (Call Plan vs Realization)
- ✅ Multi-user & RBAC
- ✅ Advanced GPS features (route optimization)
- ✅ Digital signature untuk dokter
- ✅ Observability + backups
- ✅ CI/CD pipelines

### Phase 3: Scale (6-12 bulan)
- ✅ Multi-tenant hardening (RLS)
- ✅ Advanced analytics (Product performance, MedRep performance)
- ✅ WhatsApp notifications
- ✅ Push notifications untuk reminder
- ✅ Enterprise features (custom reports, white-label)

### Phase 4: Enterprise
- ✅ Custom SLAs
- ✅ Dedicated DBs
- ✅ Audit/compliance
- ✅ 24/7 support
- ✅ Dedicated onboarding

---

## Success Metrics

### Business Metrics
- **Active MedRep**: Jumlah MedRep yang aktif melakukan visit per bulan
- **Visit Completion Rate**: % Call Plan yang ter-realize (target > 80%)
- **GPS Validation Success Rate**: % visit yang valid secara GPS (target > 95%)
- **Sample Distribution Accuracy**: Akurasi tracking sample (target > 98%)
- **User Adoption**: 80% active users per bulan
- **Customer Retention**: 90% perusahaan tetap menggunakan platform setelah 3 bulan

### Product Metrics
- **Feature Usage**: 70% MedRep menggunakan fitur core (Call Plan, Call Report)
- **Performance**: < 2s page load time (web), < 1s response time (mobile)
- **Uptime**: 99.9% availability
- **Mobile App Rating**: > 4.5 stars
- **Offline Sync Success Rate**: > 99%
- **GPS Accuracy**: Distance calculation error < 5%

### User Satisfaction
- **NPS (Net Promoter Score)**: > 50
- **Support Response Time**: < 2 jam
- **MedRep Satisfaction**: > 4.5/5 untuk kemudahan penggunaan mobile app
- **Manager Satisfaction**: > 4.5/5 untuk analytics & reporting

---

## Appendix

### Referensi Dokumentasi

**Frontend & Mobile**
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Flutter Documentation](https://docs.flutter.dev/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)

**Backend & Database**
- [Go Documentation](https://go.dev/doc/)
- [Gin Framework](https://gin-gonic.com/docs/)
- [sqlc Documentation](https://docs.sqlc.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [API Response Standards](./api-response-standards.md) - Standar format API response
- [API Error Codes](./api-error-codes.md) - Daftar lengkap error codes
- [API Implementation Example](./api-implementation-example.go) - Contoh implementasi Go

**Infrastructure & Storage**
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Vercel Documentation](https://vercel.com/docs)
- [Terraform Documentation](https://www.terraform.io/docs)

**Payments & Subscriptions**
- [Xendit Subscriptions](https://docs.xendit.co/docs/how-subscriptions-work)
- [Xendit Payment API](https://docs.xendit.co/)
- [Midtrans Documentation](https://docs.midtrans.com/)
- [Stripe Indonesia Requirements](https://support.stripe.com/questions/requirements-to-open-a-stripe-account-in-indonesia)

**Observability**
- [OpenTelemetry](https://opentelemetry.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Sentry Documentation](https://docs.sentry.io/)

### Kontak
- **Product Owner**: [Nama]
- **Tech Lead**: [Nama]
- **Email**: support@gipos.id

---

**Dokumen ini akan diupdate secara berkala sesuai dengan perkembangan produk.**

