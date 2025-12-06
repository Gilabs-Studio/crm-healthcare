import 'package:dio/dio.dart';

import 'models/contact.dart';

class ContactRepository {
  ContactRepository(this._dio);

  final Dio _dio;

  Future<ContactListResponse> getContacts({
    int page = 1,
    int perPage = 20,
    String? search,
    String? accountId,
    String? roleId,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'per_page': perPage,
      };

      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      if (accountId != null && accountId.isNotEmpty) {
        queryParams['account_id'] = accountId;
      }
      if (roleId != null && roleId.isNotEmpty) {
        queryParams['role_id'] = roleId;
      }

      final response = await _dio.get(
        '/api/v1/contacts',
        queryParameters: queryParams,
      );

      if (response.data['success'] == true) {
        try {
          return ContactListResponse.fromJson(response.data);
        } catch (e) {
          throw Exception(
            'Failed to parse contacts response: $e. Response: ${response.data}',
          );
        }
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to fetch contacts',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to fetch contacts');
        }
      }
      throw Exception('Failed to fetch contacts: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch contacts: $e');
    }
  }

  Future<Contact> getContactById(String id) async {
    try {
      final response = await _dio.get('/api/v1/contacts/$id');

      if (response.data['success'] == true) {
        return Contact.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to fetch contact',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic> && error['error'] != null) {
          throw Exception(error['error']['message'] ?? 'Failed to fetch contact');
        }
      }
      throw Exception('Failed to fetch contact: ${e.message}');
    } catch (e) {
      throw Exception('Failed to fetch contact: $e');
    }
  }

  Future<Contact> createContact({
    required String accountId,
    required String name,
    required String roleId,
    String? phone,
    String? email,
    String? position,
    String? notes,
  }) async {
    try {
      final data = <String, dynamic>{
        'account_id': accountId,
        'name': name,
        'role_id': roleId,
      };

      if (phone != null && phone.isNotEmpty) data['phone'] = phone;
      if (email != null && email.isNotEmpty) data['email'] = email;
      if (position != null && position.isNotEmpty) data['position'] = position;
      if (notes != null && notes.isNotEmpty) data['notes'] = notes;

      final response = await _dio.post('/api/v1/contacts', data: data);

      if (response.data['success'] == true) {
        return Contact.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        final errorData = response.data['error'];
        if (errorData is Map<String, dynamic>) {
          final message = errorData['message'] ?? 'Failed to create contact';
          throw Exception(message);
        }
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to create contact',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic>) {
          if (error['error'] != null) {
            final errorObj = error['error'];
            if (errorObj is Map<String, dynamic>) {
              final message = errorObj['message'] ?? 'Failed to create contact';
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
      throw Exception('Failed to create contact: $e');
    }
  }

  Future<Contact> updateContact({
    required String id,
    String? accountId,
    String? name,
    String? roleId,
    String? phone,
    String? email,
    String? position,
    String? notes,
  }) async {
    try {
      final data = <String, dynamic>{};

      if (accountId != null && accountId.isNotEmpty) data['account_id'] = accountId;
      if (name != null && name.isNotEmpty) data['name'] = name;
      if (roleId != null && roleId.isNotEmpty) data['role_id'] = roleId;
      if (phone != null && phone.isNotEmpty) data['phone'] = phone;
      if (email != null && email.isNotEmpty) data['email'] = email;
      if (position != null && position.isNotEmpty) data['position'] = position;
      if (notes != null && notes.isNotEmpty) data['notes'] = notes;

      final response = await _dio.put('/api/v1/contacts/$id', data: data);

      if (response.data['success'] == true) {
        return Contact.fromJson(response.data['data'] as Map<String, dynamic>);
      } else {
        final errorData = response.data['error'];
        if (errorData is Map<String, dynamic>) {
          final message = errorData['message'] ?? 'Failed to update contact';
          throw Exception(message);
        }
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to update contact',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic>) {
          if (error['error'] != null) {
            final errorObj = error['error'];
            if (errorObj is Map<String, dynamic>) {
              final message = errorObj['message'] ?? 'Failed to update contact';
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
      throw Exception('Failed to update contact: $e');
    }
  }

  Future<void> deleteContact(String id) async {
    try {
      final response = await _dio.delete('/api/v1/contacts/$id');

      if (response.data['success'] != true) {
        final errorData = response.data['error'];
        if (errorData is Map<String, dynamic>) {
          final message = errorData['message'] ?? 'Failed to delete contact';
          throw Exception(message);
        }
        throw Exception(
          response.data['error']?['message'] ?? 'Failed to delete contact',
        );
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final error = e.response!.data;
        if (error is Map<String, dynamic>) {
          if (error['error'] != null) {
            final errorObj = error['error'];
            if (errorObj is Map<String, dynamic>) {
              final message = errorObj['message'] ?? 'Failed to delete contact';
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
      throw Exception('Failed to delete contact: $e');
    }
  }
}

