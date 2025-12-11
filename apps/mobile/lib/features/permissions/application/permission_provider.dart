import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/offline_storage.dart';
import '../data/models/permission.dart';
import '../data/permission_repository.dart';
import '../../auth/application/auth_provider.dart';

final permissionRepositoryProvider = Provider<PermissionRepository>((ref) {
  return PermissionRepository(ApiClient.dio);
});

final userPermissionsProvider = FutureProvider.autoDispose<UserPermissionsResponse>((ref) async {
  final repository = ref.read(permissionRepositoryProvider);
  final authState = ref.watch(authProvider);
  
  // Get user ID from auth state
  final userId = authState.user?.id;
  if (userId == null) {
    throw Exception('User not authenticated');
  }

    // Try to get from cache first
    try {
      final cached = await OfflineStorage.get<UserPermissionsResponse>(
        'user_permissions_$userId',
        (json) => UserPermissionsResponse.fromJson(json),
      );
    
    if (cached != null) {
      // Return cached data immediately, then refresh in background
      Future.microtask(() async {
        try {
          final fresh = await repository.getUserPermissions(userId);
          await OfflineStorage.set(
            'user_permissions_$userId',
            fresh.toJson(),
          );
        } catch (e) {
          // Ignore refresh errors, use cache
        }
      });
      return cached;
    }
  } catch (e) {
    // Cache error, continue to fetch from API
  }

  // Fetch from API
  final permissions = await repository.getUserPermissions(userId);
  
  // Cache the result
  try {
    await OfflineStorage.set(
      'user_permissions_$userId',
      permissions.toJson(),
    );
  } catch (e) {
    // Ignore cache errors
  }

  return permissions;
});

