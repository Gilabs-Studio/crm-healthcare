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

  Future<Account> createAccount({
    required String name,
    required String categoryId,
    String? address,
    String? city,
    String? province,
    String? phone,
    String? email,
    String? status,
    String? assignedTo,
  }) async {
    try {
      final data = <String, dynamic>{
        'name': name,
        'category_id': categoryId,
      };

      if (address != null && address.isNotEmpty) data['address'] = address;
      if (city != null && city.isNotEmpty) data['city'] = city;
      if (province != null && province.isNotEmpty) data['province'] = province;
      if (phone != null && phone.isNotEmpty) data['phone'] = phone;
      if (email != null && email.isNotEmpty) data['email'] = email;
      if (status != null && status.isNotEmpty) data['status'] = status;
      if (assignedTo != null && assignedTo.isNotEmpty) data['assigned_to'] = assignedTo;

      final response = await _dio.post('/api/v1/accounts', data: data);

      if (response.data['success'] == true) {
        return Account.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        final errorData = response.data['error'];
        if (errorData is Map<String, dynamic>) {
          final message = errorData['message'] ?? 'Failed to create account';
          throw Exception(message);
        }
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to create account',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic>) {
          if (error['error'] != null) {
            final errorObj = error['error'];
            if (errorObj is Map<String, dynamic>) {
              final message = errorObj['message'] ?? 'Failed to create account';
              throw Exception(message);
            }
            throw Exception(errorObj.toString());
          }
          // Try to get error message from response
          if (error['message'] != null) {
            throw Exception(error['message']);
          }
        }
        throw Exception('Server error: ${e.response?.statusCode}');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Failed to create account: $e');
    }
  }

  Future<Account> updateAccount({
    required String id,
    String? name,
    String? categoryId,
    String? address,
    String? city,
    String? province,
    String? phone,
    String? email,
    String? status,
    String? assignedTo,
  }) async {
    try {
      final data = <String, dynamic>{};

      if (name != null && name.isNotEmpty) data['name'] = name;
      if (categoryId != null && categoryId.isNotEmpty) data['category_id'] = categoryId;
      if (address != null && address.isNotEmpty) data['address'] = address;
      if (city != null && city.isNotEmpty) data['city'] = city;
      if (province != null && province.isNotEmpty) data['province'] = province;
      if (phone != null && phone.isNotEmpty) data['phone'] = phone;
      if (email != null && email.isNotEmpty) data['email'] = email;
      if (status != null && status.isNotEmpty) data['status'] = status;
      if (assignedTo != null && assignedTo.isNotEmpty) data['assigned_to'] = assignedTo;

      final response = await _dio.put('/api/v1/accounts/$id', data: data);

      if (response.data['success'] == true) {
        return Account.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        final errorData = response.data['error'];
        if (errorData is Map<String, dynamic>) {
          final message = errorData['message'] ?? 'Failed to update account';
          throw Exception(message);
        }
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to update account',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic>) {
          if (error['error'] != null) {
            final errorObj = error['error'];
            if (errorObj is Map<String, dynamic>) {
              final message = errorObj['message'] ?? 'Failed to update account';
              throw Exception(message);
            }
            throw Exception(errorObj.toString());
          }
          if (error['message'] != null) {
            throw Exception(error['message']);
          }
        }
        throw Exception('Server error: ${e.response?.statusCode}');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Failed to update account: $e');
    }
  }

  Future<void> deleteAccount(String id) async {
    try {
      final response = await _dio.delete('/api/v1/accounts/$id');

      if (response.data['success'] != true) {
        final errorData = response.data['error'];
        if (errorData is Map<String, dynamic>) {
          final message = errorData['message'] ?? 'Failed to delete account';
          throw Exception(message);
        }
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to delete account',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic>) {
          if (error['error'] != null) {
            final errorObj = error['error'];
            if (errorObj is Map<String, dynamic>) {
              final message = errorObj['message'] ?? 'Failed to delete account';
              throw Exception(message);
            }
            throw Exception(errorObj.toString());
          }
          if (error['message'] != null) {
            throw Exception(error['message']);
          }
        }
        throw Exception('Server error: ${e.response?.statusCode}');
      }
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Failed to delete account: $e');
    }
  }
}

