import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/offline_storage.dart';
import '../data/models/permission.dart';
import '../data/permission_repository.dart';
import '../../auth/application/auth_provider.dart';
import '../../auth/application/auth_state.dart';

final permissionRepositoryProvider = Provider<PermissionRepository>((ref) {
  return PermissionRepository(ApiClient.dio);
});

final userPermissionsProvider = FutureProvider.autoDispose<UserPermissionsResponse>((ref) async {
  final repository = ref.read(permissionRepositoryProvider);
  final authState = ref.watch(authProvider);
  
  // Wait for authentication to be determined
  if (authState.status == AuthStatus.unknown) {
    // Wait a bit for auth state to be determined
    await Future.delayed(const Duration(milliseconds: 100));
    // Re-read auth state after delay
    final updatedAuthState = ref.read(authProvider);
    if (updatedAuthState.status != AuthStatus.authenticated) {
      throw Exception('User not authenticated');
    }
  }
  
  // Check if user is authenticated
  if (authState.status != AuthStatus.authenticated) {
    throw Exception('User not authenticated');
  }
  
  // Get user ID from auth state
  final userId = authState.user?.id;
  if (userId == null) {
    // If user is authenticated but user data is null, try to get from storage or wait
    // This can happen when app resumes and auth state is still loading
    await Future.delayed(const Duration(milliseconds: 200));
    final updatedAuthState = ref.read(authProvider);
    final updatedUserId = updatedAuthState.user?.id;
    if (updatedUserId == null) {
      throw Exception('User not authenticated');
    }
    // Use updated user ID
    final cached = await OfflineStorage.get<UserPermissionsResponse>(
      'user_permissions_$updatedUserId',
      (json) => UserPermissionsResponse.fromJson(json),
    );
    if (cached != null) {
      return cached;
    }
    final permissions = await repository.getUserPermissions(updatedUserId);
    await OfflineStorage.set('user_permissions_$updatedUserId', permissions.toJson());
    return permissions;
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

