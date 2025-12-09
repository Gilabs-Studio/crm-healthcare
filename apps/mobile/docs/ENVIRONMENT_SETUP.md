# Environment Setup Guide - Mobile App

## Overview

Dokumen ini menjelaskan cara mengkonfigurasi environment variables untuk mobile app CRM Healthcare.

## Environment Variables

Mobile app menggunakan environment variables yang di-set melalui `--dart-define` saat build atau run.

### Available Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `API_BASE_URL` | Base URL untuk backend API | Platform-specific | Yes |

## Setup Instructions

### 1. Development (Android Emulator)

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080
```

**Catatan:**
- `10.0.2.2` adalah alias khusus Android emulator untuk mengakses host machine
- Jangan gunakan `localhost` atau `127.0.0.1` di Android emulator

### 2. Development (iOS Simulator)

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:8080
```

**Catatan:**
- iOS simulator bisa langsung akses `localhost`
- Atau gunakan `127.0.0.1:8080`

### 3. Development (Physical Device)

```bash
# Ganti 192.168.1.100 dengan IP address PC/server Anda
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:8080
```

**Catatan:**
- Pastikan PC dan device dalam network WiFi yang sama
- Pastikan firewall tidak memblokir port 8080
- Test koneksi dengan browser di device: `http://<PC_IP>:8080/health`

### 4. Staging

```bash
flutter build apk --dart-define=API_BASE_URL=https://staging-api.crmhealthcare.com
```

### 5. Production

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.crmhealthcare.com
```

## Platform-Specific Defaults

Jika `API_BASE_URL` tidak di-set, aplikasi akan menggunakan default berdasarkan platform:

- **Android**: `http://10.0.2.2:8080`
- **iOS**: `http://localhost:8080`
- **Other**: `http://localhost:8080`

## WebSocket Configuration

WebSocket URL otomatis di-generate dari `API_BASE_URL`:

- `http://` → `ws://`
- `https://` → `wss://`

Contoh:
- `API_BASE_URL=http://10.0.2.2:8080`
  - WebSocket: `ws://10.0.2.2:8080/api/v1/ws/notifications?token=...`

## Using Scripts (Recommended)

Untuk memudahkan, buat script di `package.json`:

```json
{
  "scripts": {
    "dev:android": "flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080",
    "dev:ios": "flutter run --dart-define=API_BASE_URL=http://localhost:8080",
    "dev:device": "flutter run --dart-define=API_BASE_URL=http://192.168.1.100:8080",
    "build:staging": "flutter build apk --dart-define=API_BASE_URL=https://staging-api.crmhealthcare.com",
    "build:prod": "flutter build apk --release --dart-define=API_BASE_URL=https://api.crmhealthcare.com"
  }
}
```

Kemudian jalankan:
```bash
npm run dev:android
npm run dev:ios
npm run dev:device
```

## VS Code Launch Configuration

Tambahkan ke `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flutter (Android - Dev)",
      "request": "launch",
      "type": "dart",
      "args": [
        "--dart-define=API_BASE_URL=http://10.0.2.2:8080"
      ]
    },
    {
      "name": "Flutter (iOS - Dev)",
      "request": "launch",
      "type": "dart",
      "args": [
        "--dart-define=API_BASE_URL=http://localhost:8080"
      ]
    },
    {
      "name": "Flutter (Device - Dev)",
      "request": "launch",
      "type": "dart",
      "args": [
        "--dart-define=API_BASE_URL=http://192.168.1.100:8080"
      ]
    }
  ]
}
```

## Internet Permissions

Aplikasi sudah dikonfigurasi dengan permission yang diperlukan untuk akses internet:

### Android
- ✅ `INTERNET` permission - Diperlukan untuk semua network requests
- ✅ `ACCESS_NETWORK_STATE` permission - Untuk check network availability
- ✅ Network Security Config - Mengizinkan HTTPS untuk production API

### iOS
- ✅ NSAppTransportSecurity - Konfigurasi untuk HTTPS connections
- ✅ Production API domain (api.gilabs.id) sudah di-whitelist

**Catatan:** Jika aplikasi tidak bisa connect ke production API, pastikan:
1. Build aplikasi dengan `--dart-define=API_BASE_URL=https://api.gilabs.id`
2. Pastikan device memiliki koneksi internet aktif
3. Pastikan tidak ada firewall atau VPN yang memblokir akses

## Troubleshooting

### Cannot connect to Production API

**Problem:** Error connection timeout atau "Unable to connect to server" saat login ke production API

**Solutions:**
1. **Pastikan permission internet sudah ada:**
   - Check `android/app/src/main/AndroidManifest.xml` - harus ada `<uses-permission android:name="android.permission.INTERNET" />`
   - Check `ios/Runner/Info.plist` - harus ada `NSAppTransportSecurity` config

2. **Pastikan build dengan production URL:**
   ```bash
   flutter build apk --release --dart-define=API_BASE_URL=https://api.gilabs.id
   ```

3. **Test koneksi manual:**
   - Buka browser di device dan test: `https://api.gilabs.id/api/v1/health`
   - Jika tidak bisa, kemungkinan masalah network/firewall

4. **Check network security config (Android):**
   - File `android/app/src/main/res/xml/network_security_config.xml` harus ada
   - Pastikan domain `api.gilabs.id` sudah dikonfigurasi

5. **Check iOS App Transport Security:**
   - Pastikan `Info.plist` memiliki `NSAppTransportSecurity` dengan domain `api.gilabs.id`

### Cannot connect to API dari Android emulator

**Problem:** Error connection refused atau timeout

**Solutions:**
1. Pastikan menggunakan `10.0.2.2`, bukan `localhost`
2. Pastikan backend server running di port 8080
3. Test dengan browser di PC: `http://localhost:8080/health`
4. Pastikan tidak ada firewall yang memblokir

### Cannot connect to API dari device fisik

**Problem:** Error connection refused atau network unreachable

**Solutions:**
1. Pastikan PC dan device dalam network WiFi yang sama
2. Gunakan IP address PC, bukan localhost
3. Test dengan browser di device: `http://<PC_IP>:8080/health`
4. Pastikan firewall tidak memblokir port 8080
5. Pastikan backend server listening di `0.0.0.0:8080`, bukan `127.0.0.1:8080`

### CORS error di web

**Problem:** CORS policy error saat akses API

**Solutions:**
1. Pastikan backend sudah dikonfigurasi untuk allow CORS
2. Check `apps/api/internal/api/middleware/cors.go`
3. Pastikan origin web app sudah di-whitelist

### WebSocket connection failed

**Problem:** WebSocket tidak bisa connect

**Solutions:**
1. Pastikan `API_BASE_URL` sudah benar
2. Pastikan token masih valid
3. Check backend WebSocket endpoint: `/api/v1/ws/notifications`
4. Pastikan protocol match (ws:// untuk http://, wss:// untuk https://)

## Security Best Practices

1. **Jangan hardcode URLs di code**
   - Selalu gunakan environment variables
   - Jangan commit sensitive data ke repository

2. **Gunakan HTTPS di production**
   - Pastikan `API_BASE_URL` menggunakan `https://` di production
   - WebSocket akan otomatis menggunakan `wss://`

3. **Validate environment variables**
   - Aplikasi akan menggunakan default jika variable tidak di-set
   - Pastikan default values sesuai dengan environment

4. **Secure storage untuk sensitive data**
   - Gunakan `shared_preferences` atau `flutter_secure_storage` untuk tokens
   - Jangan simpan sensitive data di plain text

## References

- [Flutter Environment Variables](https://docs.flutter.dev/deployment/environment-variables)
- [Dart Define](https://dart.dev/tools/dart-compile#dart-define)
- File konfigurasi: `apps/mobile/lib/core/config/env.dart`

