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
}

