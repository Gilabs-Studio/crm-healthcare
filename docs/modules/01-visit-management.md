# PRD: Modul Visit Management (Call Plan & Call Report)

**Modul ID**: MOD-001  
**Versi**: 1.0  
**Status**: Draft  
**Prioritas**: P0 (Critical) - Modul Paling Krusial

---

## 📋 Ringkasan

Modul Visit Management adalah modul paling krusial dalam CRM Healthcare yang menghubungkan Medical Representative (MedRep), Dokter, Produk, dan Stok Sample. Modul ini memfasilitasi MedRep untuk merencanakan kunjungan (Call Plan) dan melaporkan hasil kunjungan (Realization/Call Report) secara real-time dengan validasi lokasi (Geo-tagging).

---

## 🎯 Tujuan & Value Proposition

### Tujuan
- Memfasilitasi perencanaan kunjungan dokter secara sistematis
- Memastikan validitas kunjungan melalui GPS validation
- Mencatat hasil kunjungan (detailing produk & sample drop) secara real-time
- Memberikan data untuk analisis efektivitas kunjungan

### Value Proposition
- **Real-time Tracking**: GPS-based validation untuk memastikan kunjungan valid
- **Terstruktur**: Call Plan & Call Report terintegrasi
- **Efektif**: Optimasi waktu MedRep dengan perencanaan yang jelas
- **Akurat**: Data detailing produk dan sample drop yang detail

---

## 👥 User Personas

### Primary User: Medical Representative (MedRep)
- **Kebutuhan**: Aplikasi mobile untuk call plan dan call report di lapangan
- **Skill Level**: Basic (bisa menggunakan smartphone)
- **Context**: Mobile, di lapangan, butuh cepat dan mudah

### Secondary User: Sales Manager / Area Manager
- **Kebutuhan**: Monitor real-time aktivitas MedRep, review call plan dan realization
- **Skill Level**: Intermediate
- **Context**: Web dashboard, butuh overview dan analytics

---

## 🎨 User Stories

### Epic 1: Call Plan (Perencanaan Kunjungan)
- **US-001**: Sebagai MedRep, saya ingin membuat rencana kunjungan dokter untuk tanggal tertentu, agar jadwal terorganisir
- **US-002**: Sebagai MedRep, saya ingin melihat calendar call plan saya, agar tahu dokter mana yang harus dikunjungi
- **US-003**: Sebagai Manager, saya ingin melihat call plan semua MedRep di tim saya, agar bisa monitor aktivitas

### Epic 2: Visit Execution (Check-in dengan GPS)
- **US-004**: Sebagai MedRep, saya ingin check-in saat tiba di lokasi dokter, agar kunjungan tercatat
- **US-005**: Sebagai sistem, saya ingin validasi GPS MedRep vs lokasi dokter, agar memastikan kunjungan valid
- **US-006**: Sebagai MedRep, saya ingin force check-in jika GPS tidak akurat (dengan alasan), agar fleksibel

### Epic 3: Call Report (Detailing & Sample)
- **US-007**: Sebagai MedRep, saya ingin input produk yang dipresentasikan (detailing), agar feedback dokter tercatat
- **US-008**: Sebagai MedRep, saya ingin input sample yang diberikan, agar stok sample ter-update
- **US-009**: Sebagai MedRep, saya ingin input general notes dan next action, agar follow-up jelas
- **US-010**: Sebagai MedRep, saya ingin minta tanda tangan digital dokter (opsional), agar ada bukti kunjungan

### Epic 4: Visit History & Analytics
- **US-011**: Sebagai Manager, saya ingin lihat history kunjungan MedRep, agar bisa evaluasi performa
- **US-012**: Sebagai Manager, saya ingin lihat peta lokasi check-in vs lokasi dokter, agar audit validitas
- **US-013**: Sebagai Manager, saya ingin lihat call plan vs realization, agar tahu efektivitas kunjungan

---

## 🔧 Functional Requirements

### FR-001: Call Plan (Perencanaan)
- **FR-001.1**: Create Call Plan
  - Pilih tanggal
  - Pilih dokter dari list (filter by area/spesialis)
  - Validasi: Tidak boleh ada double plan untuk dokter yang sama di hari yang sama
  - System create row di tabel `visits` dengan status `Planned`
- **FR-001.2**: View Call Plan Calendar
  - Calendar view dengan list dokter per tanggal
  - Filter by date range, area, spesialis
  - Status indicator (Planned, In-Progress, Completed, Cancelled)
- **FR-001.3**: Update/Delete Call Plan
  - Edit tanggal atau dokter (jika belum check-in)
  - Delete plan (jika belum check-in)
  - Cancel plan dengan alasan

### FR-002: Visit Execution (Check-in dengan GPS Validation)
- **FR-002.1**: Check-in Process
  - MedRep klik tombol "Check In" di mobile app
  - System ambil GPS device (latitude, longitude)
  - System hitung jarak GPS MedRep vs GPS Dokter (Distance Matrix)
  - Validasi: Jika jarak > 200 meter, tolak check-in atau minta alasan ("Force Check-in")
  - Update `visits` set `check_in_time = NOW()`, `status = 'In-Progress'`
  - Redirect ke Call Report Form
- **FR-002.2**: GPS Validation Logic
  - Hitung jarak menggunakan Haversine formula atau Google Maps Distance Matrix API
  - Radius validation: Max 200 meter (configurable)
  - Jika > 200m: Tampilkan warning, minta alasan untuk force check-in
  - Force check-in butuh approval Manager (optional)
- **FR-002.3**: Check-out Process
  - MedRep klik "Check Out & Submit" setelah selesai Call Report
  - Update `visits` set `check_out_time = NOW()`, `status = 'Completed'`
  - Commit semua transaksi (atomic transaction)

### FR-003: Call Report - Detailing (Presentasi Produk)
- **FR-003.1**: Add Products untuk Detailing
  - Multi-select produk dari dropdown
  - Input feedback dokter untuk tiap produk:
    - Response Level: High Interest, Low Interest, Rejected
    - Competitor Info: Text (info obat pesaing jika ada)
  - Backend: Insert ke `visit_product_details` (Many-to-Many)
  - UI harus mudah, tidak refresh halaman tiap tambah produk (gunakan state management lokal)
- **FR-003.2**: Edit/Delete Product Details
  - Edit feedback sebelum submit
  - Delete produk dari list detailing

### FR-004: Call Report - Sample Drop (Pemberian Sample)
- **FR-004.1**: Add Sample Products
  - Pilih produk sample dari dropdown
  - Input quantity
  - System validasi: Apakah stok sample di tas MedRep cukup?
    - Cek table `inventory` (current_stock - input_qty >= 0)
    - Jika minus, block submit atau tampilkan warning
  - Input batch number (untuk tracking expired)
  - Backend: Insert ke `visit_sample_drops` (Many-to-Many)
  - Backend: Update `inventory` (kurangi stok MedRep)
- **FR-004.2**: Sample Inventory Check
  - Real-time check stok sebelum submit
  - Tampilkan stok tersedia untuk tiap produk
  - Validasi quantity tidak boleh melebihi stok

### FR-005: Call Report - Closing
- **FR-005.1**: General Notes
  - Input text area untuk feedback dokter secara umum
  - Input next action / follow-up
- **FR-005.2**: Digital Signature (Optional)
  - Minta tanda tangan digital dokter
  - Upload signature image atau use signature pad
  - Store di Cloudflare R2
- **FR-005.3**: Submit Call Report
  - Validasi semua field required
  - Transaksi Database (Transaction Commit) harus atomik
    - Jika insert sample gagal, header visit jangan ter-update completed
    - Rollback semua jika ada error
  - Update status visit ke `Completed`
  - Set check_out_time

### FR-006: Visit History & Detail
- **FR-006.1**: View Visit History
  - List kunjungan yang sudah Completed
  - Filter by date range, dokter, MedRep, status
  - Sort by tanggal, dokter, MedRep
- **FR-006.2**: Visit Detail View
  - Read-only view untuk melihat detail kunjungan
  - Tampilkan:
    - Info visit (tanggal, waktu check-in/out, status)
    - Info dokter
    - Info MedRep
    - List produk detailing (dengan feedback)
    - List sample drop (dengan quantity, batch)
    - General notes
    - Digital signature (jika ada)
    - Peta lokasi check-in vs lokasi dokter (untuk audit Manager)

---

## 🗄️ Database Schema & Relationships

### Entities & Relationships

**Relasi Utama:**
- `visits` ke `users` (MedRep): One-to-Many (Satu MedRep memiliki banyak Visits)
- `visits` ke `doctors`: One-to-Many (Satu Dokter bisa dikunjungi berkali-kali)
- `visits` ke `products` (Detailing): Many-to-Many via `visit_product_details`
- `visits` ke `products` (Samples): Many-to-Many via `visit_sample_drops`

### Schema Design

#### A. Tabel `visits` (Header)
Menyimpan data umum kunjungan.

```sql
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medrep_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    planned_date DATE NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) NOT NULL DEFAULT 'Planned',
        -- Enum: Planned, In-Progress, Completed, Cancelled
    notes TEXT,
    next_action TEXT,
    signature_url TEXT,
    force_check_in BOOLEAN DEFAULT FALSE,
    force_check_in_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visits_medrep ON visits(medrep_id);
CREATE INDEX idx_visits_doctor ON visits(doctor_id);
CREATE INDEX idx_visits_planned_date ON visits(planned_date);
CREATE INDEX idx_visits_status ON visits(status);
```

#### B. Tabel `visit_product_details` (Pivot / Many-to-Many)
Menyimpan obat apa saja yang dipresentasikan (tanpa mengurangi stok).

```sql
CREATE TABLE visit_product_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    response_level VARCHAR(20) NOT NULL,
        -- Enum: High Interest, Low Interest, Rejected
    competitor_info TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visit_product_details_visit ON visit_product_details(visit_id);
CREATE INDEX idx_visit_product_details_product ON visit_product_details(product_id);
```

#### C. Tabel `visit_sample_drops` (Pivot / Many-to-Many)
Menyimpan obat apa saja yang diberikan sebagai sampel (mengurangi stok MedRep).

```sql
CREATE TABLE visit_sample_drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    batch_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visit_sample_drops_visit ON visit_sample_drops(visit_id);
CREATE INDEX idx_visit_sample_drops_product ON visit_sample_drops(product_id);
```

---

## 🎨 UI/UX Requirements

### Page 1: Call Plan Calendar (Web/Mobile)

```
┌─────────────────────────────────────────┐
│  Call Plan Calendar                     │
│  ─────────────────────────────────────  │
│  [← Prev]  [Januari 2024]  [Next →]    │
│                                          │
│  ┌───┬───┬───┬───┬───┬───┬───┐         │
│  │ S │ M │ T │ W │ T │ F │ S │         │
│  ├───┼───┼───┼───┼───┼───┼───┤         │
│  │   │ 1 │ 2 │ 3 │ 4 │ 5 │ 6 │         │
│  │   │[+]│[+]│[+]│[+]│[+]│[+]│         │
│  ├───┼───┼───┼───┼───┼───┼───┤         │
│  │ 7 │ 8 │ 9 │10 │11 │12 │13 │         │
│  │[+]│[+]│[+]│[+]│[+]│[+]│[+]│         │
│  └───┴───┴───┴───┴───┴───┴───┘         │
│                                          │
│  [Filter: Area] [Filter: Spesialis]     │
└─────────────────────────────────────────┘
```

**Action**: User tekan "+" pada tanggal → Muncul modal pilih dokter → System create visit dengan status Planned

---

### Page 2: Visit Execution / Dashboard Harian (Mobile Only)

```
┌─────────────────────────────────────────┐
│  Kunjungan Hari Ini                     │
│  ─────────────────────────────────────  │
│  ┌──────────────────────────────────┐  │
│  │ Dr. Budi Santoso                 │  │
│  │ Spesialis: Jantung               │  │
│  │ Alamat: Jl. Merdeka No. 123      │  │
│  │ Status: Planned                  │  │
│  │ [Check In]                       │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ Dr. Siti Nurhaliza               │  │
│  │ Spesialis: Anak                  │  │
│  │ Alamat: Jl. Sudirman No. 456     │  │
│  │ Status: In-Progress               │  │
│  │ [Lanjutkan]                      │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Action**: User klik "Check In" → System ambil GPS → Validasi jarak → Update status ke In-Progress → Redirect ke Call Report Form

---

### Page 3: Visit Form / Call Report (Mobile Only)

```
┌─────────────────────────────────────────┐
│  Call Report - Dr. Budi Santoso         │
│  ─────────────────────────────────────  │
│  [Detailing] [Sample] [Closing]        │
│                                          │
│  ┌─ Detailing ───────────────────────┐ │
│  │ + Tambah Produk                    │ │
│  │                                    │ │
│  │ Produk: Obat A                     │ │
│  │ Response: [High Interest ▼]       │ │
│  │ Competitor Info: [___________]    │ │
│  │                                    │ │
│  │ Produk: Obat B                     │ │
│  │ Response: [Low Interest ▼]        │ │
│  │ Competitor Info: [___________]     │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [Next: Sample]                         │
└─────────────────────────────────────────┘
```

**Section A: Detailing**
- Multi-select produk
- Input feedback per produk
- Tidak refresh halaman (state management lokal)

**Section B: Sample Drop**
- Pilih produk sample
- Input quantity (dengan validasi stok)
- Input batch number

**Section C: Closing**
- General notes
- Next action
- Digital signature (optional)
- Tombol "Check Out & Submit"

---

### Page 4: Visit Detail / History (Web & Mobile)

```
┌─────────────────────────────────────────┐
│  Detail Kunjungan                      │
│  ─────────────────────────────────────  │
│  Dokter: Dr. Budi Santoso               │
│  MedRep: John Doe                       │
│  Tanggal: 15 Jan 2024                   │
│  Check-in: 09:00 | Check-out: 10:30    │
│  Status: Completed                      │
│                                          │
│  [Peta Lokasi]                          │
│  ┌──────────────────────────────────┐  │
│  │  [Map showing check-in location] │  │
│  │  vs doctor location              │  │
│  └──────────────────────────────────┘  │
│                                          │
│  Detailing:                              │
│  - Obat A (High Interest)               │
│  - Obat B (Low Interest)                │
│                                          │
│  Sample Drop:                            │
│  - Obat A: 5 pcs (Batch: ABC123)        │
│                                          │
│  Notes: Dokter tertarik dengan Obat A   │
│  Next Action: Follow-up minggu depan    │
└─────────────────────────────────────────┘
```

---

## 🔒 Security & Compliance

### SEC-001: GPS Validation
- GPS data encrypted saat transit
- Distance calculation dilakukan di server (tidak di client)
- Force check-in memerlukan alasan dan approval (optional)

### SEC-002: Data Integrity
- Transaksi database harus atomik (transaction commit)
- Rollback jika ada error
- Validasi stok sample sebelum commit

### SEC-003: Authorization
- MedRep hanya bisa create/edit visit miliknya sendiri
- Manager bisa view semua visit di timnya
- Force check-in butuh approval Manager

---

## 📊 Performance Requirements

### PERF-001: Response Time
- Load call plan calendar: < 1 detik
- GPS validation: < 2 detik
- Submit call report: < 3 detik
- Load visit history (100 visits): < 2 detik

### PERF-002: Offline Capability
- Call report bisa dibuat offline
- Auto-sync saat online kembali
- Conflict resolution untuk duplicate visits

### PERF-003: Scalability
- Support hingga 1000 visits per hari per MedRep
- Support hingga 100 MedRep per perusahaan
- GPS validation concurrent: 50 requests/second

---

## 🧪 Acceptance Criteria

### AC-001: Call Plan
- ✅ MedRep bisa create call plan untuk tanggal tertentu
- ✅ Tidak boleh ada double plan untuk dokter yang sama di hari yang sama
- ✅ Calendar view menampilkan list dokter per tanggal

### AC-002: GPS Check-in
- ✅ System validasi GPS MedRep vs lokasi dokter
- ✅ Jika jarak > 200m, tampilkan warning atau minta alasan force check-in
- ✅ Check-in update status visit ke In-Progress

### AC-003: Call Report - Detailing
- ✅ MedRep bisa tambah produk untuk detailing (multi-select)
- ✅ Input feedback dokter per produk
- ✅ UI tidak refresh halaman tiap tambah produk

### AC-004: Call Report - Sample Drop
- ✅ System validasi stok sample sebelum submit
- ✅ Jika stok tidak cukup, block submit atau tampilkan warning
- ✅ Stok MedRep ter-update setelah submit

### AC-005: Submit Call Report
- ✅ Transaksi database atomik (semua atau tidak sama sekali)
- ✅ Status visit ter-update ke Completed
- ✅ Check-out time tercatat

---

## 🔗 Integrations

### INT-001: Google Maps API
- **Geocoding**: Convert alamat dokter ke lat/long
- **Distance Matrix**: Hitung jarak GPS MedRep vs lokasi dokter
- **Maps Embed**: Tampilkan peta di visit detail

### INT-002: Storage
- **Cloudflare R2**: Store digital signature images
- **Presigned URLs**: Secure upload/download

### INT-003: Notifications (Future)
- **Push Notifications**: Reminder call plan
- **WhatsApp**: Notifikasi visit completion ke Manager

---

## 📈 Success Metrics

### Business Metrics
- **Visit Completion Rate**: % Call Plan yang ter-realize (target > 80%)
- **GPS Validation Success Rate**: % visit yang valid secara GPS (target > 95%)
- **Average Visit Duration**: Rata-rata waktu per kunjungan

### User Metrics
- **Time to Check-in**: Target < 30 detik
- **Time to Complete Call Report**: Target < 5 menit
- **User Satisfaction**: > 4.5/5 untuk MedRep

### Technical Metrics
- **GPS Accuracy**: Distance calculation error < 5%
- **Offline Sync Success Rate**: > 99%
- **API Response Time**: < 2 detik untuk GPS validation

---

## 🚀 Implementation Phases

### Phase 1: MVP (Sprint 1-4)
- Call Plan CRUD
- GPS Check-in dengan validasi dasar
- Call Report form (Detailing & Sample)
- Basic visit history

### Phase 2: Enhanced (Sprint 5-6)
- Offline mode dengan sync
- Force check-in dengan approval
- Digital signature
- Advanced GPS features

### Phase 3: Advanced (Sprint 7-9)
- Analytics & reporting
- Route optimization (optional)
- Push notifications
- Performance optimization

---

## 📝 Notes & Considerations

### Edge Cases
- GPS tidak tersedia (indoor, GPS off)
- Internet putus saat check-in
- Duplicate visit (double tap check-in)
- Stok sample habis saat input
- Force check-in tanpa alasan

### Future Enhancements
- Route optimization untuk multiple visits
- AI recommendation produk untuk detailing
- Voice input untuk notes
- Auto-detect competitor info

---

**Dokumen ini akan diupdate sesuai dengan feedback dan development progress.**

