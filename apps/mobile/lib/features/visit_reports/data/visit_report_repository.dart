import 'dart:io';

import 'package:dio/dio.dart';

import 'models/visit_report.dart';

class VisitReportRepository {
  VisitReportRepository(this._dio);

  final Dio _dio;

  Future<VisitReportListResponse> getVisitReports({
    int page = 1,
    int perPage = 20,
    String? search,
    String? status,
    String? accountId,
    String? salesRepId,
    String? startDate,
    String? endDate,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'per_page': perPage,
      };

      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }
      if (accountId != null && accountId.isNotEmpty) {
        queryParams['account_id'] = accountId;
      }
      if (salesRepId != null && salesRepId.isNotEmpty) {
        queryParams['sales_rep_id'] = salesRepId;
      }
      if (startDate != null && startDate.isNotEmpty) {
        queryParams['start_date'] = startDate;
      }
      if (endDate != null && endDate.isNotEmpty) {
        queryParams['end_date'] = endDate;
      }

      final response = await _dio.get(
        '/api/v1/visit-reports',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        try {
          return VisitReportListResponse.fromJson(response.data);
        } catch (e) {
          throw Exception(
            'Failed to parse visit reports response: $e. Response: ${response.data}',
          );
        }
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to fetch visit reports',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to fetch visit reports');
        }
      }
      throw Exception('Failed to fetch visit reports: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch visit reports: $e');
    }
  }

  Future<VisitReport> getVisitReportById(String id) async {
    try {
      final response = await _dio.get('/api/v1/visit-reports/$id');

      if (response.data['success'] == true) {
        return VisitReport.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to fetch visit report',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to fetch visit report');
        }
      }
      throw Exception('Failed to fetch visit report: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch visit report: $e');
    }
  }

  Future<VisitReport> createVisitReport({
    required String accountId,
    String? contactId,
    required String visitDate,
    String? purpose,
    String? notes,
  }) async {
    try {
      final response = await _dio.post(
        '/api/v1/visit-reports',
        data: {
          'account_id': accountId,
          if (contactId != null && contactId.isNotEmpty) 'contact_id': contactId,
          'visit_date': visitDate,
          if (purpose != null && purpose.isNotEmpty) 'purpose': purpose,
          if (notes != null && notes.isNotEmpty) 'notes': notes,
        },
      );

      if (response.data['success'] == true) {
        return VisitReport.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to create visit report',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to create visit report');
        }
      }
      throw Exception('Failed to create visit report: ${e.message}');
    } catch (e) {
      throw Exception('Failed to create visit report: $e');
    }
  }

  Future<VisitReport> checkIn({
    required String visitReportId,
    required double latitude,
    required double longitude,
  }) async {
    try {
      final response = await _dio.post(
        '/api/v1/visit-reports/$visitReportId/check-in',
        data: {
          'location': {
            'latitude': latitude,
            'longitude': longitude,
          },
        },
      );

      if (response.data['success'] == true) {
        return VisitReport.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to check in',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to check in');
        }
      }
      throw Exception('Failed to check in: ${e.message}');
    } catch (e) {
      throw Exception('Failed to check in: $e');
    }
  }

  Future<VisitReport> checkOut({
    required String visitReportId,
    required double latitude,
    required double longitude,
  }) async {
    try {
      final response = await _dio.post(
        '/api/v1/visit-reports/$visitReportId/check-out',
        data: {
          'location': {
            'latitude': latitude,
            'longitude': longitude,
          },
        },
      );

      if (response.data['success'] == true) {
        return VisitReport.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to check out',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to check out');
        }
      }
      throw Exception('Failed to check out: ${e.message}');
    } catch (e) {
      throw Exception('Failed to check out: $e');
    }
  }

  Future<void> uploadPhoto({
    required String visitReportId,
    required File photoFile,
  }) async {
    try {
      final formData = FormData.fromMap({
        'photo': await MultipartFile.fromFile(
          photoFile.path,
          filename: photoFile.path.split('/').last,
        ),
      });

      final response = await _dio.post(
        '/api/v1/visit-reports/$visitReportId/photos',
        data: formData,
        // Dio will automatically set Content-Type to multipart/form-data
      );

      if (response.data['success'] != true) {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to upload photo',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to upload photo');
        }
      }
      throw Exception('Failed to upload photo: ${e.message}');
    } catch (e) {
      throw Exception('Failed to upload photo: $e');
    }
  }
}

