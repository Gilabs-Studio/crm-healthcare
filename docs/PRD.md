# Product Requirements Document (PRD)
## CRM Healthcare/Pharmaceutical Platform

**Versi**: 1.0  
**Status**: Draft  
**Last Updated**: 2025-01-15  
**Target Release**: MVP Q1 2025

---

## 📋 Daftar Isi

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Target Users](#target-users)
4. [Business Objectives](#business-objectives)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [User Stories](#user-stories)
8. [Technical Requirements](#technical-requirements)
9. [Success Metrics](#success-metrics)
10. [Timeline & Milestones](#timeline--milestones)
11. [Risks & Mitigation](#risks--mitigation)

---

## Executive Summary

CRM Healthcare/Pharmaceutical Platform adalah sistem manajemen hubungan pelanggan (CRM) yang dirancang khusus untuk industri kesehatan dan farmasi. Platform ini membantu klinik, rumah sakit, apotek, dan perusahaan farmasi mengelola pasien, dokter, janji temu, resep, rekam medis, inventori obat, dan operasi bisnis mereka secara terintegrasi.

### Key Value Propositions

- **Integrated Patient Management**: Manajemen data pasien yang terpusat dan aman
- **Streamlined Workflow**: Otomatisasi proses dari appointment hingga billing
- **Regulatory Compliance**: Memenuhi standar kesehatan dan farmasi Indonesia
- **Real-time Inventory**: Manajemen stok obat yang akurat dan real-time
- **Comprehensive Reporting**: Laporan dan analitik untuk pengambilan keputusan

---

## Product Overview

### Vision

Menjadi platform CRM terdepan untuk industri kesehatan dan farmasi di Indonesia yang memungkinkan penyedia layanan kesehatan memberikan perawatan yang lebih baik sambil mengoptimalkan operasi bisnis mereka.

### Mission

Menyediakan solusi teknologi yang komprehensif, mudah digunakan, dan mematuhi regulasi untuk membantu transformasi digital industri kesehatan dan farmasi Indonesia.

### Product Goals

1. **Improve Patient Experience**: Mempermudah pasien dalam mengakses layanan kesehatan
2. **Operational Efficiency**: Mengurangi beban administratif dan meningkatkan efisiensi operasional
3. **Data-Driven Decisions**: Memberikan insights yang actionable melalui data dan analitik
4. **Regulatory Compliance**: Memastikan kepatuhan terhadap regulasi kesehatan dan farmasi
5. **Scalability**: Mendukung pertumbuhan bisnis dari klinik kecil hingga jaringan besar

---

## Target Users

### Primary Users

1. **Administrator Klinik/Rumah Sakit**
   - Mengelola seluruh operasi klinik
   - Mengatur user dan permissions
   - Melihat laporan dan analitik

2. **Dokter/Physician**
   - Mengelola jadwal appointment
   - Membuat rekam medis
   - Menulis resep

3. **Apoteker/Pharmacist**
   - Mengelola inventori obat
   - Memproses resep
   - Melakukan dispensing

4. **Front Desk/Receptionist**
   - Mencatat appointment
   - Mengelola data pasien
   - Memproses pembayaran

5. **Kasir/Billing Staff**
   - Memproses tagihan
   - Mengelola pembayaran
   - Mencetak invoice

### Secondary Users

1. **Pasien/Patient** (Future: Patient Portal)
   - Melihat riwayat medis
   - Booking appointment online
   - Melihat resep dan tagihan

2. **Manager/Owner**
   - Melihat dashboard dan laporan
   - Analisis bisnis
   - Pengambilan keputusan strategis

---

## Business Objectives

### Short-term (MVP - 3 bulan)

1. **Core Functionality**: Implementasi fitur-fitur inti untuk operasi harian
2. **User Adoption**: Onboarding minimal 10 klinik/apotek
3. **Data Accuracy**: Akurasi data > 95%
4. **System Uptime**: Uptime > 99%

### Medium-term (6-12 bulan)

1. **Market Expansion**: Ekspansi ke 50+ klinik/apotek
2. **Feature Enhancement**: Penambahan fitur advanced berdasarkan feedback
3. **Integration**: Integrasi dengan sistem eksternal (BPJS, payment gateway)
4. **Mobile App**: Aplikasi mobile untuk dokter dan pasien

### Long-term (12+ bulan)

1. **Market Leadership**: Menjadi market leader di Indonesia
2. **AI/ML Integration**: Implementasi AI untuk diagnosis support dan prediksi
3. **Telemedicine**: Fitur telemedicine terintegrasi
4. **Analytics Platform**: Platform analitik advanced untuk healthcare insights

---

## Functional Requirements

### 1. Authentication & Authorization

#### 1.1 User Authentication
- **FR-1.1.1**: Sistem harus mendukung login dengan email dan password
- **FR-1.1.2**: Sistem harus mendukung multi-factor authentication (MFA)
- **FR-1.1.3**: Sistem harus mendukung password reset via email
- **FR-1.1.4**: Sistem harus mendukung session management dengan token-based authentication
- **FR-1.1.5**: Sistem harus mendukung remember me functionality

#### 1.2 Role-Based Access Control (RBAC)
- **FR-1.2.1**: Sistem harus mendukung multiple roles (Admin, Doctor, Pharmacist, Receptionist, Cashier)
- **FR-1.2.2**: Sistem harus mendukung permission-based access control
- **FR-1.2.3**: Sistem harus mendukung role assignment per user
- **FR-1.2.4**: Sistem harus mendukung audit log untuk semua akses

### 2. Patient Management

#### 2.1 Patient Registration
- **FR-2.1.1**: Sistem harus memungkinkan registrasi pasien baru dengan data lengkap
- **FR-2.1.2**: Sistem harus memvalidasi NIK (Nomor Induk Kependudukan) untuk pasien Indonesia
- **FR-2.1.3**: Sistem harus memvalidasi nomor BPJS jika tersedia
- **FR-2.1.4**: Sistem harus mendukung upload foto pasien
- **FR-2.1.5**: Sistem harus mendukung multiple contact methods (phone, email, address)

#### 2.2 Patient Profile
- **FR-2.2.1**: Sistem harus menyimpan informasi demografis pasien (nama, tanggal lahir, gender, alamat)
- **FR-2.2.2**: Sistem harus menyimpan informasi medis dasar (golongan darah, alergi, kondisi kronis)
- **FR-2.2.3**: Sistem harus menyimpan informasi kontak darurat
- **FR-2.2.4**: Sistem harus mendukung riwayat keluarga medis
- **FR-2.2.5**: Sistem harus mendukung multiple insurance providers

#### 2.3 Patient Search & Filter
- **FR-2.3.1**: Sistem harus memungkinkan pencarian pasien berdasarkan nama, NIK, nomor telepon
- **FR-2.3.2**: Sistem harus memungkinkan filter berdasarkan status, tanggal registrasi, dll
- **FR-2.3.3**: Sistem harus mendukung pagination untuk daftar pasien

### 3. Doctor/Physician Management

#### 3.1 Doctor Registration
- **FR-3.1.1**: Sistem harus memungkinkan registrasi dokter dengan informasi lengkap
- **FR-3.1.2**: Sistem harus memvalidasi STR (Surat Tanda Registrasi) dokter
- **FR-3.1.3**: Sistem harus menyimpan spesialisasi dokter
- **FR-3.1.4**: Sistem harus menyimpan jadwal praktik dokter

#### 3.2 Doctor Profile
- **FR-3.2.1**: Sistem harus menyimpan informasi personal dokter
- **FR-3.2.2**: Sistem harus menyimpan informasi profesional (pendidikan, sertifikasi, pengalaman)
- **FR-3.2.3**: Sistem harus menyimpan informasi kontak dan jadwal
- **FR-3.2.4**: Sistem harus mendukung multiple specializations

### 4. Appointment Scheduling

#### 4.1 Appointment Booking
- **FR-4.1.1**: Sistem harus memungkinkan booking appointment untuk pasien
- **FR-4.1.2**: Sistem harus memvalidasi ketersediaan slot waktu dokter
- **FR-4.1.3**: Sistem harus mendukung multiple appointment types (konsultasi, follow-up, emergency)
- **FR-4.1.4**: Sistem harus mendukung reminder via SMS/Email
- **FR-4.1.5**: Sistem harus mendukung reschedule dan cancel appointment

#### 4.2 Appointment Management
- **FR-4.2.1**: Sistem harus menampilkan calendar view untuk appointments
- **FR-4.2.2**: Sistem harus menampilkan list view untuk appointments
- **FR-4.2.3**: Sistem harus mendukung filter berdasarkan dokter, tanggal, status
- **FR-4.2.4**: Sistem harus mendukung status tracking (scheduled, confirmed, in-progress, completed, cancelled)
- **FR-4.2.5**: Sistem harus mendukung walk-in appointments

### 5. Medical Records

#### 5.1 Medical Record Creation
- **FR-5.1.1**: Sistem harus memungkinkan dokter membuat rekam medis setelah appointment
- **FR-5.1.2**: Sistem harus menyimpan chief complaint (keluhan utama)
- **FR-5.1.3**: Sistem harus menyimpan physical examination results
- **FR-5.1.4**: Sistem harus menyimpan diagnosis
- **FR-5.1.5**: Sistem harus menyimpan treatment plan
- **FR-5.1.6**: Sistem harus mendukung upload file (lab results, X-ray, dll)

#### 5.2 Medical Record History
- **FR-5.2.1**: Sistem harus menampilkan riwayat rekam medis pasien
- **FR-5.2.2**: Sistem harus mendukung filter berdasarkan tanggal, dokter, diagnosis
- **FR-5.2.3**: Sistem harus mendukung search dalam rekam medis
- **FR-5.2.4**: Sistem harus memastikan privacy dan security rekam medis

### 6. Prescription Management

#### 6.1 Prescription Creation
- **FR-6.1.1**: Sistem harus memungkinkan dokter membuat resep
- **FR-6.1.2**: Sistem harus memvalidasi ketersediaan obat di apotek
- **FR-6.1.3**: Sistem harus mendukung multiple medications dalam satu resep
- **FR-6.1.4**: Sistem harus menyimpan dosage, frequency, dan duration
- **FR-6.1.5**: Sistem harus mendukung prescription notes
- **FR-6.1.6**: Sistem harus memvalidasi drug interactions

#### 6.2 Prescription Processing
- **FR-6.2.1**: Sistem harus memungkinkan apoteker memproses resep
- **FR-6.2.2**: Sistem harus memvalidasi stok obat
- **FR-6.2.3**: Sistem harus mendukung partial fulfillment
- **FR-6.2.4**: Sistem harus mendukung prescription status (pending, processing, fulfilled, cancelled)
- **FR-6.2.5**: Sistem harus mencetak label obat

### 7. Pharmacy/Inventory Management

#### 7.1 Medicine Management
- **FR-7.1.1**: Sistem harus memungkinkan registrasi obat baru
- **FR-7.1.2**: Sistem harus menyimpan informasi obat (nama, generic name, manufacturer, batch number, expiry date)
- **FR-7.1.3**: Sistem harus memvalidasi nomor registrasi BPOM
- **FR-7.1.4**: Sistem harus menyimpan harga beli dan harga jual
- **FR-7.1.5**: Sistem harus mendukung barcode scanning

#### 7.2 Stock Management
- **FR-7.2.1**: Sistem harus melacak stok obat real-time
- **FR-7.2.2**: Sistem harus mendukung stock adjustment (masuk, keluar, adjustment)
- **FR-7.2.3**: Sistem harus memberikan alert untuk stok rendah
- **FR-7.2.4**: Sistem harus memberikan alert untuk obat mendekati expiry date
- **FR-7.2.5**: Sistem harus mendukung multiple warehouses/locations
- **FR-7.2.6**: Sistem harus mendukung stock transfer antar lokasi

#### 7.3 Purchase Management
- **FR-7.3.1**: Sistem harus memungkinkan pembuatan purchase order
- **FR-7.3.2**: Sistem harus memungkinkan penerimaan barang (goods receipt)
- **FR-7.3.3**: Sistem harus memvalidasi invoice supplier
- **FR-7.3.4**: Sistem harus mendukung multiple suppliers

### 8. Billing & Invoicing

#### 8.1 Invoice Creation
- **FR-8.1.1**: Sistem harus memungkinkan pembuatan invoice untuk layanan medis
- **FR-8.1.2**: Sistem harus memungkinkan pembuatan invoice untuk obat
- **FR-8.1.3**: Sistem harus mendukung multiple payment methods (cash, transfer, credit card, BPJS)
- **FR-8.1.4**: Sistem harus mendukung discount dan promo
- **FR-8.1.5**: Sistem harus menghitung tax secara otomatis

#### 8.2 Payment Processing
- **FR-8.2.1**: Sistem harus memproses pembayaran
- **FR-8.2.2**: Sistem harus mencetak receipt
- **FR-8.2.3**: Sistem harus mendukung partial payment
- **FR-8.2.4**: Sistem harus mendukung refund
- **FR-8.2.5**: Sistem harus memvalidasi pembayaran BPJS

#### 8.3 Insurance Integration
- **FR-8.3.1**: Sistem harus mendukung verifikasi BPJS
- **FR-8.3.2**: Sistem harus menghitung co-payment
- **FR-8.3.3**: Sistem harus memproses klaim BPJS
- **FR-8.3.4**: Sistem harus menyimpan informasi asuransi swasta

### 9. Reports & Analytics

#### 9.1 Dashboard
- **FR-9.1.1**: Sistem harus menampilkan dashboard dengan key metrics
- **FR-9.1.2**: Sistem harus menampilkan appointment statistics
- **FR-9.1.3**: Sistem harus menampilkan revenue statistics
- **FR-9.1.4**: Sistem harus menampilkan inventory alerts
- **FR-9.1.5**: Sistem harus menampilkan top doctors, top medications

#### 9.2 Reports
- **FR-9.2.1**: Sistem harus menghasilkan laporan harian, mingguan, bulanan
- **FR-9.2.2**: Sistem harus menghasilkan laporan pasien
- **FR-9.2.3**: Sistem harus menghasilkan laporan penjualan obat
- **FR-9.2.4**: Sistem harus menghasilkan laporan inventory
- **FR-9.2.5**: Sistem harus menghasilkan laporan keuangan
- **FR-9.2.6**: Sistem harus mendukung export ke PDF, Excel

### 10. System Administration

#### 10.1 User Management
- **FR-10.1.1**: Sistem harus memungkinkan admin mengelola users
- **FR-10.1.2**: Sistem harus memungkinkan assign roles dan permissions
- **FR-10.1.3**: Sistem harus memungkinkan enable/disable users
- **FR-10.1.4**: Sistem harus menyimpan audit log untuk semua user actions

#### 10.2 Settings
- **FR-10.2.1**: Sistem harus memungkinkan konfigurasi sistem (clinic info, business hours, dll)
- **FR-10.2.2**: Sistem harus memungkinkan konfigurasi notification settings
- **FR-10.2.3**: Sistem harus memungkinkan konfigurasi payment methods
- **FR-10.2.4**: Sistem harus memungkinkan konfigurasi tax rates

---

## Non-Functional Requirements

### 1. Performance
- **NFR-1.1**: Sistem harus dapat menangani minimal 100 concurrent users
- **NFR-1.2**: Response time untuk CRUD operations < 500ms
- **NFR-1.3**: Response time untuk reports < 3 seconds
- **NFR-1.4**: Sistem harus mendukung pagination untuk semua list views

### 2. Security
- **NFR-2.1**: Semua data harus dienkripsi dalam transit (HTTPS)
- **NFR-2.2**: Data sensitif harus dienkripsi di rest (encryption at rest)
- **NFR-2.3**: Sistem harus mematuhi HIPAA/standar privasi data kesehatan Indonesia
- **NFR-2.4**: Sistem harus mendukung audit logging untuk compliance
- **NFR-2.5**: Sistem harus mendukung data backup dan recovery

### 3. Availability
- **NFR-3.1**: Sistem harus memiliki uptime > 99.5%
- **NFR-3.2**: Sistem harus mendukung maintenance mode dengan graceful degradation
- **NFR-3.3**: Sistem harus memiliki disaster recovery plan

### 4. Scalability
- **NFR-4.1**: Sistem harus dapat scale horizontal
- **NFR-4.2**: Database harus dapat handle minimal 1M records per table
- **NFR-4.3**: Sistem harus mendukung multi-tenant architecture

### 5. Usability
- **NFR-5.1**: UI harus responsive (mobile, tablet, desktop)
- **NFR-5.2**: Sistem harus mendukung bilingual (Bahasa Indonesia & English)
- **NFR-5.3**: Sistem harus memiliki intuitive navigation
- **NFR-5.4**: Sistem harus mendukung keyboard shortcuts untuk power users

### 6. Compatibility
- **NFR-6.1**: Sistem harus support modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-6.2**: Sistem harus support mobile browsers
- **NFR-6.3**: Sistem harus support printing untuk receipts, invoices, prescriptions

---

## User Stories

### Epic 1: Patient Management

**US-1.1**: Sebagai receptionist, saya ingin dapat mendaftarkan pasien baru dengan data lengkap agar dapat melayani pasien dengan baik.

**US-1.2**: Sebagai dokter, saya ingin dapat melihat riwayat medis pasien lengkap agar dapat memberikan diagnosis yang akurat.

**US-1.3**: Sebagai admin, saya ingin dapat mencari pasien berdasarkan berbagai kriteria agar dapat menemukan data pasien dengan cepat.

### Epic 2: Appointment Scheduling

**US-2.1**: Sebagai receptionist, saya ingin dapat membuat appointment untuk pasien dengan dokter tertentu agar pasien dapat dijadwalkan dengan tepat.

**US-2.2**: Sebagai dokter, saya ingin dapat melihat jadwal appointment saya hari ini agar dapat mempersiapkan konsultasi.

**US-2.3**: Sebagai sistem, saya ingin mengirim reminder appointment ke pasien 24 jam sebelum jadwal agar mengurangi no-show rate.

### Epic 3: Medical Records

**US-3.1**: Sebagai dokter, saya ingin dapat membuat rekam medis setelah konsultasi agar data medis pasien tersimpan dengan baik.

**US-3.2**: Sebagai dokter, saya ingin dapat melihat riwayat rekam medis pasien sebelumnya agar dapat memberikan continuity of care.

**US-3.3**: Sebagai admin, saya ingin memastikan rekam medis hanya dapat diakses oleh authorized personnel agar privasi pasien terjaga.

### Epic 4: Prescription Management

**US-4.1**: Sebagai dokter, saya ingin dapat membuat resep dengan multiple medications agar dapat memberikan treatment yang komprehensif.

**US-4.2**: Sebagai apoteker, saya ingin dapat melihat resep yang perlu diproses agar dapat mempersiapkan obat dengan tepat.

**US-4.3**: Sebagai sistem, saya ingin memvalidasi drug interactions sebelum resep dibuat agar dapat mencegah medication errors.

### Epic 5: Inventory Management

**US-5.1**: Sebagai apoteker, saya ingin dapat melihat stok obat real-time agar dapat mengetahui ketersediaan obat.

**US-5.2**: Sebagai admin, saya ingin menerima alert ketika stok obat rendah agar dapat melakukan restocking tepat waktu.

**US-5.3**: Sebagai admin, saya ingin menerima alert untuk obat yang mendekati expiry date agar dapat mengelola stok dengan baik.

### Epic 6: Billing

**US-6.1**: Sebagai kasir, saya ingin dapat membuat invoice untuk layanan medis dan obat agar dapat memproses pembayaran.

**US-6.2**: Sebagai kasir, saya ingin dapat memproses pembayaran dengan multiple payment methods agar dapat memberikan fleksibilitas kepada pasien.

**US-6.3**: Sebagai admin, saya ingin dapat melihat laporan keuangan harian agar dapat memantau cash flow.

---

## Technical Requirements

### Technology Stack

#### Frontend
- **Framework**: Next.js 16 (App Router, Server Components)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **UI Components**: shadcn/ui v4
- **Internationalization**: next-intl (Bahasa Indonesia & English)

#### Backend
- **Language**: Go
- **Framework**: Gin
- **Database**: PostgreSQL
- **ORM**: GORM
- **Cache**: Redis
- **Message Queue**: RabbitMQ (optional)

#### Infrastructure
- **Hosting**: Cloud (AWS/GCP/Azure)
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack

### API Standards
- Mengikuti API Response Standards yang sudah didefinisikan
- RESTful API design
- API versioning (v1, v2, dll)
- Bilingual error messages (ID & EN)

### Database Design
- Normalized database schema
- Soft delete untuk data penting
- Audit trails untuk compliance
- Indexing untuk performance

### Security
- JWT-based authentication
- Role-based access control (RBAC)
- Data encryption (at rest & in transit)
- SQL injection prevention
- XSS prevention
- CSRF protection

---

## Success Metrics

### User Adoption
- **Target**: 10+ clinics/pharmacies onboarded dalam 3 bulan pertama
- **Metric**: Number of active users, number of daily logins

### System Performance
- **Target**: 99.5% uptime
- **Metric**: System availability, response time, error rate

### Data Quality
- **Target**: > 95% data accuracy
- **Metric**: Data validation errors, data completeness

### User Satisfaction
- **Target**: NPS > 50
- **Metric**: User surveys, feedback, support tickets

### Business Impact
- **Target**: 30% reduction in administrative time
- **Metric**: Time saved per transaction, efficiency metrics

---

## Timeline & Milestones

### Phase 1: MVP (Months 1-3)

#### Month 1: Foundation
- Authentication & Authorization
- User Management
- Patient Management (Basic)
- Doctor Management (Basic)

#### Month 2: Core Features
- Appointment Scheduling
- Medical Records (Basic)
- Prescription Management (Basic)

#### Month 3: Business Features
- Inventory Management (Basic)
- Billing & Invoicing (Basic)
- Dashboard & Basic Reports

### Phase 2: Enhancement (Months 4-6)
- Advanced Reports
- BPJS Integration
- Mobile Responsive Optimization
- Performance Optimization

### Phase 3: Scale (Months 7-12)
- Multi-tenant Support
- Advanced Analytics
- API for Third-party Integration
- Mobile App (Future)

---

## Risks & Mitigation

### Technical Risks

**Risk 1**: Performance issues dengan large dataset
- **Mitigation**: Implement proper indexing, pagination, caching strategy

**Risk 2**: Security vulnerabilities
- **Mitigation**: Regular security audits, penetration testing, code reviews

**Risk 3**: Integration complexity dengan BPJS
- **Mitigation**: Early research, proof of concept, phased integration

### Business Risks

**Risk 1**: Low user adoption
- **Mitigation**: User training, excellent UX, responsive support

**Risk 2**: Regulatory compliance issues
- **Mitigation**: Early consultation with legal/regulatory experts, compliance audits

**Risk 3**: Competition from established players
- **Mitigation**: Focus on unique value propositions, excellent customer service

### Operational Risks

**Risk 1**: Data loss
- **Mitigation**: Regular backups, disaster recovery plan, data redundancy

**Risk 2**: System downtime
- **Mitigation**: High availability architecture, monitoring, alerting

---

## Appendix

### Glossary

- **BPJS**: Badan Penyelenggara Jaminan Sosial (Social Security Agency)
- **BPOM**: Badan Pengawas Obat dan Makanan (Food and Drug Authority)
- **STR**: Surat Tanda Registrasi (Registration Certificate for Doctors)
- **HIPAA**: Health Insurance Portability and Accountability Act
- **NIK**: Nomor Induk Kependudukan (National ID Number)

### References

- API Response Standards: `/docs/api-standart/api-response-standards.md`
- API Error Codes: `/docs/api-standart/api-error-codes.md`
- Modules Documentation: `/docs/modules/01-modules.md`

---

**Dokumen ini akan diupdate sesuai dengan perkembangan development dan feedback dari stakeholders.**

