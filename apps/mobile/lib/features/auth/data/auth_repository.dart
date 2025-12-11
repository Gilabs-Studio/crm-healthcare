import 'package:dio/dio.dart';

import 'models/login_response.dart';

class AuthRepository {
  const AuthRepository(this._dio);

  final Dio _dio;

  Future<LoginResponse> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/v1/auth/mobile/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      // Parse API response format: { success: true, data: { ... } }
      if (response.data == null) {
        throw Exception('Invalid response from server');
      }

      final responseData = response.data!;
      if (responseData['success'] != true) {
        final error = responseData['error'] as Map<String, dynamic>?;
        final message = error?['message'] as String? ?? 'Login failed';
        throw Exception(message);
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return LoginResponse.fromJson(data);
    } on DioException catch (e) {
      if (e.response != null) {
        final responseData = e.response!.data as Map<String, dynamic>?;
        if (responseData != null && responseData['error'] != null) {
          final error = responseData['error'] as Map<String, dynamic>;
          final message = error['message'] as String? ?? 'Login failed';
          throw Exception(message);
        }
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      rethrow;
    }
  }

  Future<LoginResponse> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/api/v1/auth/refresh',
        data: {
          'refresh_token': refreshToken,
        },
      );

      // Parse API response format: { success: true, data: { ... } }
      if (response.data == null) {
        throw Exception('Invalid response from server');
      }

      final responseData = response.data!;
      if (responseData['success'] != true) {
        final error = responseData['error'] as Map<String, dynamic>?;
        final message = error?['message'] as String? ?? 'Failed to refresh token';
        throw Exception(message);
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return LoginResponse.fromJson(data);
    } on DioException catch (e) {
      if (e.response != null) {
        final responseData = e.response!.data as Map<String, dynamic>?;
        if (responseData != null && responseData['error'] != null) {
          final error = responseData['error'] as Map<String, dynamic>;
          final message = error['message'] as String? ?? 'Failed to refresh token';
          throw Exception(message);
        }
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      rethrow;
    }
  }
}


