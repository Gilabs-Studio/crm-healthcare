import 'dart:io';

class Env {
  const Env._();

  /// Base URL untuk backend API.
  /// 
  /// Untuk Android emulator, gunakan `10.0.2.2` (alias untuk host machine).
  /// Untuk iOS simulator, gunakan `localhost`.
  /// Untuk device fisik, gunakan IP address PC (misalnya `192.168.x.x`).
  /// 
  /// Bisa di-override dengan environment variable: `API_BASE_URL`
  /// Contoh: `flutter run --dart-define=API_BASE_URL=http://192.168.1.100:8080`
  static String get apiBaseUrl {
    // Jika sudah di-set via environment variable, pakai itu
    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }

    // Default berdasarkan platform
    if (Platform.isAndroid) {
      // Android emulator: 10.0.2.2 adalah alias untuk host machine
      // Untuk device fisik, user harus set API_BASE_URL dengan IP PC
      return 'http://10.0.2.2:8080';
    } else if (Platform.isIOS) {
      // iOS simulator bisa pakai localhost
      return 'http://localhost:8080';
    }

    // Fallback
    return 'http://localhost:8080';
  }
}




