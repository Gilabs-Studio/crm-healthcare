import 'dart:io';

import 'package:dio/dio.dart';

import '../../../core/network/connectivity_service.dart';
import '../../../core/storage/offline_storage.dart';
import 'models/visit_report.dart';

class VisitReportRepository {
  VisitReportRepository(this._dio, this._connectivity);

  final Dio _dio;
  final ConnectivityService _connectivity;

  Future<VisitReportListResponse> getVisitReports({
    int page = 1,
    int perPage = 20,
    String? search,
    String? status,
    String? accountId,
    String? salesRepId,
    String? startDate,
    String? endDate,
    bool forceRefresh = false,
  }) async {
    // 1. Try to load from cache first (offline-first) - only for first page and no filters
    if (!forceRefresh && page == 1 && (search == null || search.isEmpty) && 
        status == null && accountId == null && startDate == null && endDate == null) {
      final cachedVisitReports = await OfflineStorage.getVisitReports();
      if (cachedVisitReports != null && cachedVisitReports.isNotEmpty) {
        try {
          final visitReports = cachedVisitReports
              .map((json) => VisitReport.fromJson(json))
              .toList();
          return VisitReportListResponse(
            items: visitReports,
            pagination: Pagination(
              page: 1,
              perPage: visitReports.length,
              total: visitReports.length,
              totalPages: 1,
            ),
          );
        } catch (e) {
          // If parsing fails, continue to API call
        }
      }
    }

    // 2. If online, fetch from API
    if (_connectivity.isOnline) {
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
            final visitReportListResponse = VisitReportListResponse.fromJson(response.data);
            
            // 3. Save to cache (only for first page and no filters)
            if (page == 1 && (search == null || search.isEmpty) && 
                status == null && accountId == null && startDate == null && endDate == null) {
              final visitReportsJson = visitReportListResponse.items
                  .map((report) => report.toJson())
                  .toList();
              await OfflineStorage.saveVisitReports(visitReportsJson);
            }
            
            return visitReportListResponse;
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
        // If API fails, try to return cached data if available
        if (page == 1 && (search == null || search.isEmpty) && 
            status == null && accountId == null && startDate == null && endDate == null) {
          final cachedVisitReports = await OfflineStorage.getVisitReports();
          if (cachedVisitReports != null && cachedVisitReports.isNotEmpty) {
            try {
              final visitReports = cachedVisitReports
                  .map((json) => VisitReport.fromJson(json))
                  .toList();
              return VisitReportListResponse(
                items: visitReports,
                pagination: Pagination(
                  page: 1,
                  perPage: visitReports.length,
                  total: visitReports.length,
                  totalPages: 1,
                ),
              );
            } catch (_) {
              // Ignore parsing errors
            }
          }
        }
        
        if (e.response != null) {
          final error = e.response!.data;
          if (error is Map<String, dynamic> && error['error'] != null) {
            throw Exception(error['error']['message'] ?? 'Failed to fetch visit reports');
          }
        }
        throw Exception('Failed to fetch visit reports: ${e.message}');
      } catch (e) {
        // If other error, try cached data
        if (page == 1 && (search == null || search.isEmpty) && 
            status == null && accountId == null && startDate == null && endDate == null) {
          final cachedVisitReports = await OfflineStorage.getVisitReports();
          if (cachedVisitReports != null && cachedVisitReports.isNotEmpty) {
            try {
              final visitReports = cachedVisitReports
                  .map((json) => VisitReport.fromJson(json))
                  .toList();
              return VisitReportListResponse(
                items: visitReports,
                pagination: Pagination(
                  page: 1,
                  perPage: visitReports.length,
                  total: visitReports.length,
                  totalPages: 1,
                ),
              );
            } catch (_) {
              // Ignore parsing errors
            }
          }
        }
        throw Exception('Failed to fetch visit reports: $e');
      }
    }

    // 4. Offline: return cached data or throw error
    if (page == 1 && (search == null || search.isEmpty) && 
        status == null && accountId == null && startDate == null && endDate == null) {
      final cachedVisitReports = await OfflineStorage.getVisitReports();
      if (cachedVisitReports != null && cachedVisitReports.isNotEmpty) {
        try {
          final visitReports = cachedVisitReports
              .map((json) => VisitReport.fromJson(json))
              .toList();
          return VisitReportListResponse(
            items: visitReports,
            pagination: Pagination(
              page: 1,
              perPage: visitReports.length,
              total: visitReports.length,
              totalPages: 1,
            ),
          );
        } catch (e) {
          throw Exception('Failed to load cached visit reports: $e');
        }
      }
    }
    
    throw Exception('No internet connection and no cached data available');
  }

  Future<VisitReport> getVisitReportById(String id) async {
    // 1. Try to load from cache first (offline-first)
    final cachedVisitReport = await OfflineStorage.getVisitReportDetail(id);
    if (cachedVisitReport != null) {
      try {
        final visitReport = VisitReport.fromJson(cachedVisitReport);
        // If online, fetch from API in background to update cache
        if (_connectivity.isOnline) {
          _fetchAndUpdateVisitReportDetail(id).catchError((_) {
            // Ignore errors, use cached data
          });
        }
        return visitReport;
      } catch (e) {
        // If parsing fails, continue to API call
      }
    }

    // 2. If online, fetch from API
    if (_connectivity.isOnline) {
      try {
        final response = await _dio.get('/api/v1/visit-reports/$id');

        if (response.data['success'] == true) {
          final visitReport = VisitReport.fromJson(
            response.data['data'] as Map<String, dynamic>,
          );
          
          // 3. Save to cache
          await OfflineStorage.saveVisitReportDetail(id, visitReport.toJson());
          
          return visitReport;
        } else {
          throw Exception(
            response.data['error']?['message'] ?? 'Failed to fetch visit report',
          );
        }
      } on DioException catch (e) {
        // If API fails, try to return cached data if available
        if (cachedVisitReport != null) {
          try {
            return VisitReport.fromJson(cachedVisitReport);
          } catch (_) {
            // Ignore parsing errors
          }
        }
        
        if (e.response != null) {
          final error = e.response!.data;
          if (error is Map<String, dynamic> && error['error'] != null) {
            throw Exception(error['error']['message'] ?? 'Failed to fetch visit report');
          }
        }
        throw Exception('Failed to fetch visit report: ${e.message}');
      } catch (e) {
        // If other error, try cached data
        if (cachedVisitReport != null) {
          try {
            return VisitReport.fromJson(cachedVisitReport);
          } catch (_) {
            // Ignore parsing errors
          }
        }
        throw Exception('Failed to fetch visit report: $e');
      }
    }

    // 4. Offline: return cached data or throw error
    if (cachedVisitReport != null) {
      try {
        return VisitReport.fromJson(cachedVisitReport);
      } catch (e) {
        throw Exception('Failed to load cached visit report: $e');
      }
    }
    
    throw Exception('No internet connection and no cached data available');
  }

  /// Fetch visit report detail from API and update cache (background operation)
  Future<void> _fetchAndUpdateVisitReportDetail(String id) async {
    try {
      final response = await _dio.get('/api/v1/visit-reports/$id');
      if (response.data['success'] == true) {
        final visitReport = VisitReport.fromJson(
          response.data['data'] as Map<String, dynamic>,
        );
        await OfflineStorage.saveVisitReportDetail(id, visitReport.toJson());
      }
    } catch (_) {
      // Ignore errors in background operation
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

