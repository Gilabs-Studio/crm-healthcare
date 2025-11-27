import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';

class AuthRepository {
  const AuthRepository(this._dio);

  final Dio _dio;

  Future<void> login({
    required String email,
    required String password,
  }) async {
    // TODO: replace with real API call when backend auth is available.
    // Example:
    // await _dio.post('/api/v1/auth/login', data: {
    //   'email': email,
    //   'password': password,
    // });

    // For Sprint 0 we simulate a network call.
    await Future<void>.delayed(const Duration(milliseconds: 600));
  }
}


