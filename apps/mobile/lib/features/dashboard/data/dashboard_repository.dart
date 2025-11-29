import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import 'models/dashboard.dart';

class DashboardRepository {
  final Dio _dio;

  DashboardRepository({Dio? dio}) : _dio = dio ?? ApiClient.dio;

  Future<DashboardOverview> getOverview({
    String? period,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (period != null && period.isNotEmpty) {
        queryParams['period'] = period;
      }
      if (startDate != null && startDate.isNotEmpty) {
        queryParams['start_date'] = startDate;
      }
      if (endDate != null && endDate.isNotEmpty) {
        queryParams['end_date'] = endDate;
      }

      final response = await _dio.get(
        '/api/v1/dashboard/overview',
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      if (response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          final data = responseData['data'];
          if (data == null) {
            throw Exception('Dashboard data is null');
          }
          if (data is! Map<String, dynamic>) {
            throw Exception('Invalid dashboard data format');
          }
          return DashboardOverview.fromJson(data);
        } else {
          throw Exception(
            responseData['error']?['message'] ?? 'Failed to fetch dashboard overview',
          );
        }
      } else if (response.data is Map) {
        // Handle direct data response
        final data = response.data;
        if (data == null) {
          throw Exception('Dashboard data is null');
        }
        if (data is! Map<String, dynamic>) {
          throw Exception('Invalid dashboard data format');
        }
        return DashboardOverview.fromJson(data);
      } else {
        throw Exception('Invalid response format: ${response.data.runtimeType}');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        if (errorData is Map<String, dynamic> && errorData['error'] != null) {
          throw Exception(
            errorData['error']['message'] ?? 'Failed to fetch dashboard overview',
          );
        }
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch dashboard overview: $e');
    }
  }

  Future<List<RecentActivity>> getRecentActivities({
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (limit != null && limit > 0) {
        queryParams['limit'] = limit;
      }

      final response = await _dio.get(
        '/api/v1/dashboard/recent-activities',
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
      );

      if (response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          final data = responseData['data'];
          if (data is List) {
            return data
                .map((e) => RecentActivity.fromJson(e as Map<String, dynamic>))
                .toList();
          } else if (data is Map<String, dynamic> && data['items'] != null) {
            return (data['items'] as List<dynamic>)
                .map((e) => RecentActivity.fromJson(e as Map<String, dynamic>))
                .toList();
          } else {
            return [];
          }
        } else {
          throw Exception(
            responseData['error']?['message'] ?? 'Failed to fetch recent activities',
          );
        }
      } else if (response.data is List) {
        // Handle direct array response
        return (response.data as List<dynamic>)
            .map((e) => RecentActivity.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        return [];
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        if (errorData is Map<String, dynamic> && errorData['error'] != null) {
          throw Exception(
            errorData['error']['message'] ?? 'Failed to fetch recent activities',
          );
        }
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch recent activities: $e');
    }
  }
}

