import 'package:dio/dio.dart';

import '../config/env.dart';
import '../storage/local_storage.dart';

class ApiClient {
  const ApiClient._();

  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
      contentType: 'application/json',
    ),
  )..interceptors.addAll([
      _AuthInterceptor(),
      LogInterceptor(
        requestBody: true,
        responseBody: true,
      ),
    ]);
}

class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Get token from local storage
    final storage = await LocalStorage.create();
    final token = storage.getAuthToken();

    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // Handle API error response format
    if (err.response != null) {
      final responseData = err.response!.data;
      if (responseData is Map<String, dynamic> &&
          responseData['error'] != null) {
        final error = responseData['error'] as Map<String, dynamic>;
        final message = error['message'] as String? ?? 'An error occurred';
        err = err.copyWith(
          message: message,
        );
      }
    }
    handler.next(err);
  }
}


