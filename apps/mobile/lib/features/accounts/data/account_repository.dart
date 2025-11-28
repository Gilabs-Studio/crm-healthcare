import 'package:dio/dio.dart';

import 'models/account.dart';

class AccountRepository {
  AccountRepository(this._dio);

  final Dio _dio;

  Future<AccountListResponse> getAccounts({
    int page = 1,
    int perPage = 20,
    String? search,
    String? status,
    String? categoryId,
    String? assignedTo,
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
      if (categoryId != null && categoryId.isNotEmpty) {
        queryParams['category_id'] = categoryId;
      }
      if (assignedTo != null && assignedTo.isNotEmpty) {
        queryParams['assigned_to'] = assignedTo;
      }

      final response = await _dio.get(
        '/api/v1/accounts',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        try {
          return AccountListResponse.fromJson(response.data);
        } catch (e) {
          throw Exception(
            'Failed to parse accounts response: $e. Response: ${response.data}',
          );
        }
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to fetch accounts',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to fetch accounts');
        }
      }
      throw Exception('Failed to fetch accounts: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch accounts: $e');
    }
  }

  Future<Account> getAccountById(String id) async {
    try {
      final response = await _dio.get('/api/v1/accounts/$id');

      if (response.data['success'] == true) {
        return Account.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to fetch account',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to fetch account');
        }
      }
      throw Exception('Failed to fetch account: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch account: $e');
    }
  }
}

