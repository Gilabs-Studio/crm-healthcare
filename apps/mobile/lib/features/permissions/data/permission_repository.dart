import 'package:dio/dio.dart';

import 'models/permission.dart';

class PermissionRepository {
  const PermissionRepository(this._dio);

  final Dio _dio;

  /// Get mobile permissions for authenticated user
  /// Uses mobile-specific endpoint: /api/v1/auth/mobile/permissions
  /// No userId required - uses token to identify user
  Future<UserPermissionsResponse> getMobilePermissions() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        '/api/v1/auth/mobile/permissions',
      );

      // Parse API response format: { success: true, data: { menus: [...] } }
      if (response.data == null) {
        throw Exception('Invalid response from server');
      }

      final responseData = response.data!;
      if (responseData['success'] != true) {
        final error = responseData['error'] as Map<String, dynamic>?;
        final message = error?['message'] as String? ?? 'Failed to fetch permissions';
        throw Exception(message);
      }

      final data = responseData['data'] as Map<String, dynamic>;
      return UserPermissionsResponse.fromMobileJson(data);
    } on DioException catch (e) {
      if (e.response != null) {
        final responseData = e.response!.data as Map<String, dynamic>?;
        if (responseData != null && responseData['error'] != null) {
          final error = responseData['error'] as Map<String, dynamic>;
          final message = error['message'] as String? ?? 'Failed to fetch permissions';
          throw Exception(message);
        }
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      rethrow;
    }
  }

  /// Legacy method - kept for backward compatibility
  /// Now redirects to mobile endpoint
  @Deprecated('Use getMobilePermissions() instead')
  Future<UserPermissionsResponse> getUserPermissions(String userId) async {
    return getMobilePermissions();
  }
}

