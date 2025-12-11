import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../application/permission_provider.dart';
import '../utils/permission_helper.dart';

/// Hook to check if user has a specific action permission
/// Usage: final hasCreate = useHasPermission('/tasks', 'CREATE_TASKS');
bool useHasPermission(
  WidgetRef ref,
  String url,
  String actionCode,
) {
  final permissionsAsync = ref.watch(userPermissionsProvider);
  final menus = permissionsAsync.value?.menus ?? [];
  
  if (permissionsAsync.isLoading || permissionsAsync.hasError) {
    return false;
  }

  return PermissionHelper.hasActionPermission(menus, url, actionCode);
}

/// Hook to check if user has CREATE permission
/// Usage: final hasCreate = useHasCreatePermission(ref, '/tasks');
bool useHasCreatePermission(WidgetRef ref, String url) {
  final permissionsAsync = ref.watch(userPermissionsProvider);
  final menus = permissionsAsync.value?.menus ?? [];
  
  if (permissionsAsync.isLoading || permissionsAsync.hasError) {
    return false;
  }

  return PermissionHelper.hasCreatePermission(menus, url);
}

/// Hook to check if user has EDIT permission
/// Usage: final hasEdit = useHasEditPermission(ref, '/tasks');
bool useHasEditPermission(WidgetRef ref, String url) {
  final permissionsAsync = ref.watch(userPermissionsProvider);
  final menus = permissionsAsync.value?.menus ?? [];
  
  if (permissionsAsync.isLoading || permissionsAsync.hasError) {
    return false;
  }

  return PermissionHelper.hasEditPermission(menus, url);
}

/// Hook to check if user has DELETE permission
/// Usage: final hasDelete = useHasDeletePermission(ref, '/tasks');
bool useHasDeletePermission(WidgetRef ref, String url) {
  final permissionsAsync = ref.watch(userPermissionsProvider);
  final menus = permissionsAsync.value?.menus ?? [];
  
  if (permissionsAsync.isLoading || permissionsAsync.hasError) {
    return false;
  }

  return PermissionHelper.hasDeletePermission(menus, url);
}

