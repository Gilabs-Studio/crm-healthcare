import 'package:dio/dio.dart';

import '../config/env.dart';

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
      // TODO: add auth interceptor when token is available.
      LogInterceptor(
        requestBody: true,
        responseBody: true,
      ),
    ]);
}


