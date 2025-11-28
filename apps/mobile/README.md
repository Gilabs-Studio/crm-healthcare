# CRM Healthcare Mobile App (Flutter)

Aplikasi mobile untuk **CRM Healthcare/Pharmaceutical Platform** yang digunakan oleh **Sales Representative**.  
Project ini adalah bagian dari monorepo `crm-healthcare` dan mengikuti perencanaan sprint di `docs/SPRINT_PLANNING_DEV3.md`.

## 📱 Tujuan & Scope

- Menyediakan aplikasi mobile untuk sales rep dengan fitur utama:
  - Autentikasi (login/logout)
  - Account & Contact (list & detail)
  - Visit Report (dengan GPS & foto) — sprint berikutnya
  - Task & Reminder — sprint berikutnya
  - Dashboard ringkas — sprint berikutnya
- Aplikasi ini menjadi **client** dari backend API (`apps/api`) dan menjaga konsistensi UI/UX dengan web app (`apps/web`).

## 🧱 Teknologi

- **Flutter** (stable) + **Dart ≥ 3**
- **State Management**: `flutter_riverpod`
- **HTTP Client**: `dio`
- **Local Storage**: `shared_preferences` (untuk token auth dan konfigurasi ringan)
- **Arsitektur**: feature-based dengan pemisahan `core/` dan `features/` sesuai `mobile-dev3` rules

## 🗂 Struktur Project (Mobile)

Lokasi project mobile di dalam monorepo:

```text
apps/
  mobile/
    lib/
      main.dart
      core/
        config/        # Env & konfigurasi global
        routing/       # AppRouter & AppRoutes
        theme/         # AppTheme (light/dark)
        network/       # ApiClient (Dio + interceptors)
        storage/       # LocalStorage (shared_preferences)
        widgets/       # Widget shared (mis. AuthGate)
      features/
        auth/
          data/        # AuthRepository, models (nanti)
          application/ # AuthState, AuthNotifier, providers
          presentation/# LoginScreen & UI terkait auth
        accounts/
          data/
          application/
          presentation/
        contacts/
        visit_reports/
        tasks/
        dashboard/
```

Struktur ini mengikuti **Sprint 0** dan akan diisi bertahap sesuai sprint berikutnya (Account & Contact, Visit Report, Task & Reminder, Dashboard).

## 🚀 Setup & Menjalankan Aplikasi

### Prasyarat

- Flutter SDK (channel **stable**)
- Android Studio / VS Code dengan Flutter plugin
- Device/emulator Android atau iOS
- Backend API (Go + Gin) dari repo ini (opsional untuk Sprint 0, wajib untuk integrasi penuh)

### Instalasi Dependency

```bash
cd apps/mobile
flutter pub get
```

### Menjalankan Aplikasi

Direkomendasikan menjalankan Flutter langsung (bukan lewat `pnpm`):

```bash
cd apps/mobile
flutter run
```

Atau jika ingin tetap melalui Turborepo:

```bash
pnpm dev --filter=@repo/mobile
```

> Catatan: Di Windows, jalankan perintah Flutter dari **Command Prompt / PowerShell** agar environment (`LOCALAPPDATA`) terdeteksi dengan benar.

## 🔗 Koneksi ke Backend API

- Base URL API diatur di `lib/core/config/env.dart` melalui `Env.apiBaseUrl`.
- **Default otomatis berdasarkan platform:**
  - **Android Emulator**: `http://10.0.2.2:8080` (alias untuk host machine)
  - **iOS Simulator**: `http://localhost:8080`
  - **Device Fisik**: Harus set manual dengan IP address PC

- **Override dengan environment variable** (jika perlu):
  ```bash
  # Untuk device fisik Android, gunakan IP PC
  flutter run --dart-define=API_BASE_URL=http://192.168.1.100:8080
  ```

- **Pastikan backend API sudah running:**
  - Jalankan API dari `apps/api` sesuai `apps/api/SETUP.md`.
  - Untuk development, bisa pakai: `pnpm run dev:web-api-docker` (dari root repo).
  - Pastikan endpoint dan skema respons sesuai standar di `docs/api-standart/`.

## 🧩 Sprint 0 – Flutter Setup (Dev 3)

Sesuai `docs/SPRINT_PLANNING_DEV3.md`, Sprint 0 mencakup:

- Setup struktur project Flutter (`core/`, `features/`)
- Setup state management (`flutter_riverpod`)
- Setup HTTP client (`dio`) dengan `ApiClient`
- Setup local storage (`shared_preferences`) untuk auth token (wrapper `LocalStorage`)
- Setup theme (light/dark) dan routing (`AppRouter`, `AppRoutes`)
- Setup login screen dengan tampilan yang konsisten dengan web (`apps/web`)

Status Sprint 0 di project ini:

- ✅ Struktur folder dasar (`core`, `features/*`)
- ✅ Riverpod setup (`ProviderScope` di `main.dart`, `authProvider`)
- ✅ HTTP client (`ApiClient` dengan base URL dari `Env`)
- ✅ Local storage wrapper (`LocalStorage`)
- ✅ Login screen + AuthGate (proteksi route dasar)

Untuk update status sprint, gunakan:

- `docs/SPRINT_PLANNING_DEV3.md` (detail untuk Dev 3)
- `docs/SPRINT_PLANNING.md` (master sprint)

## 🧪 Lint & Testing

Jalankan sebelum push/perubahan besar:

```bash
cd apps/mobile
flutter analyze
flutter test
```

Pastikan tidak ada error lint besar, terutama saat menyelesaikan acceptance criteria sprint.

## 🤝 Koordinasi dengan Tim Lain

Sesuai `docs/SPRINT_PLANNING.md`:

- **Developer 1 (Web)**: koordinasi untuk konsistensi UI/UX (warna, layout, copy teks).
- **Developer 2 (Backend)**: koordinasi untuk desain API (endpoint, payload, error codes).
- Gunakan Postman collection di `docs/postman/CRM-Healthcare-API.postman_collection.json` sebagai referensi kontrak API saat mulai integrasi.

---

Untuk detail lengkap mengenai scope dan timeline Dev 3, lihat:

- `docs/SPRINT_PLANNING_DEV3.md`
- `docs/SPRINT_PLANNING.md`

