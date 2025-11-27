import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  LocalStorage(this._prefs);

  final SharedPreferences _prefs;

  static Future<LocalStorage> create() async {
    final prefs = await SharedPreferences.getInstance();
    return LocalStorage(prefs);
  }

  Future<void> saveAuthToken(String token) async {
    await _prefs.setString('auth_token', token);
  }

  String? getAuthToken() => _prefs.getString('auth_token');

  Future<void> clearAuthToken() async {
    await _prefs.remove('auth_token');
  }
}


