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
  
  // Get user ID for cache key (mobile endpoint doesn't require userId, but we need it for cache)
  final userId = authState.user?.id;
  final cacheKey = userId != null ? 'user_permissions_$userId' : 'user_permissions_mobile';

  // Try to get from cache first
  try {
    final cached = await OfflineStorage.get<UserPermissionsResponse>(
      cacheKey,
      (json) => UserPermissionsResponse.fromJson(json),
    );
    
    if (cached != null) {
      // Return cached data immediately, then refresh in background
      Future.microtask(() async {
        try {
          final fresh = await repository.getMobilePermissions();
          await OfflineStorage.set(
            cacheKey,
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

  // Fetch from mobile API endpoint (no userId required)
  final permissions = await repository.getMobilePermissions();
  
  // Cache the result
  try {
    await OfflineStorage.set(
      cacheKey,
      permissions.toJson(),
    );
  } catch (e) {
    // Ignore cache errors
  }

  return permissions;
});

