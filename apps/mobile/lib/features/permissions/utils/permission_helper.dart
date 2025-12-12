import '../data/models/permission.dart';

class PermissionHelper {
  const PermissionHelper._();

  /// Check if user has VIEW permission for a menu
  /// Logic: Check if menu has VIEW_* action with access = true
  static bool hasViewPermission(MenuWithActions menu) {
    // Check if menu has VIEW action with access = true
    if (menu.actions != null && menu.actions!.isNotEmpty) {
      final viewAction = menu.actions!.firstWhere(
        (action) => action.code.startsWith('VIEW_') && action.access,
        orElse: () => const Action(
          id: '',
          code: '',
          name: '',
          access: false,
        ),
      );
      if (viewAction.access) {
        return true;
      }
    }
    
    // If no actions, check children recursively
    if (menu.children != null && menu.children!.isNotEmpty) {
      return menu.children!.any((child) => hasViewPermission(child));
    }
    
    // Default: if menu has URL but no VIEW permission, don't show
    return false;
  }

  /// Check if user has permission to access a specific URL
  /// This searches through all menus to find matching URL
  static bool canAccessUrl(
    List<MenuWithActions> menus,
    String url,
  ) {
    for (final menu in menus) {
      if (_checkMenuUrl(menu, url)) {
        return true;
      }
    }
    return false;
  }

  /// Recursively check if a menu or its children match the URL
  static bool _checkMenuUrl(MenuWithActions menu, String url) {
    // Check current menu
    if (menu.url == url && hasViewPermission(menu)) {
      return true;
    }
    
    // Check children
    if (menu.children != null) {
      for (final child in menu.children!) {
        if (_checkMenuUrl(child, url)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /// Get menu by URL
  static MenuWithActions? getMenuByUrl(
    List<MenuWithActions> menus,
    String url,
  ) {
    for (final menu in menus) {
      final found = _findMenuByUrl(menu, url);
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  /// Recursively find menu by URL
  static MenuWithActions? _findMenuByUrl(MenuWithActions menu, String url) {
    if (menu.url == url) {
      return menu;
    }
    
    if (menu.children != null) {
      for (final child in menu.children!) {
        final found = _findMenuByUrl(child, url);
        if (found != null) {
          return found;
        }
      }
    }
    
    return null;
  }

  /// Map mobile navigation routes to web URLs for permission checking
  static String getWebUrlForRoute(String mobileRoute) {
    // Map mobile routes to web URLs
    switch (mobileRoute) {
      case '/dashboard':
        return '/dashboard';
      case '/accounts':
        return '/accounts';
      case '/visit-reports':
        return '/visit-reports';
      case '/profile':
        return '/profile'; // Profile is always accessible
      default:
        return mobileRoute;
    }
  }

  /// Check if user has a specific action permission
  /// Example: hasActionPermission(menus, '/tasks', 'CREATE_TASKS')
  static bool hasActionPermission(
    List<MenuWithActions> menus,
    String url,
    String actionCode,
  ) {
    final menu = getMenuByUrl(menus, url);
    if (menu == null) {
      return false;
    }

    // Check if menu has the action with access = true
    if (menu.actions != null && menu.actions!.isNotEmpty) {
      final action = menu.actions!.firstWhere(
        (a) => a.code == actionCode && a.access,
        orElse: () => const Action(
          id: '',
          code: '',
          name: '',
          access: false,
        ),
      );
      if (action.access) {
        return true;
      }
    }

    // Check children recursively
    if (menu.children != null && menu.children!.isNotEmpty) {
      for (final child in menu.children!) {
        if (hasActionPermission([child], child.url, actionCode)) {
          return true;
        }
      }
    }

    return false;
  }

  /// Check if user has CREATE permission for a URL
  static bool hasCreatePermission(
    List<MenuWithActions> menus,
    String url,
  ) {
    // Try common CREATE action codes (mobile API format)
    final entityName = _getEntityNameFromUrl(url);
    final createCodes = [
      'CREATE_$entityName', // e.g., CREATE_TASK
      'CREATE_${entityName}S', // e.g., CREATE_TASKS (fallback)
    ];

    for (final code in createCodes) {
      if (hasActionPermission(menus, url, code)) {
        return true;
      }
    }

    return false;
  }

  /// Check if user has EDIT permission for a URL
  static bool hasEditPermission(
    List<MenuWithActions> menus,
    String url,
  ) {
    // Try common EDIT action codes (mobile API format)
    final entityName = _getEntityNameFromUrl(url);
    final editCodes = [
      'EDIT_$entityName', // e.g., EDIT_TASK
      'EDIT_${entityName}S', // e.g., EDIT_TASKS (fallback)
      'UPDATE_$entityName', // e.g., UPDATE_TASK
      'UPDATE_${entityName}S', // e.g., UPDATE_TASKS (fallback)
    ];

    for (final code in editCodes) {
      if (hasActionPermission(menus, url, code)) {
        return true;
      }
    }

    return false;
  }

  /// Check if user has DELETE permission for a URL
  static bool hasDeletePermission(
    List<MenuWithActions> menus,
    String url,
  ) {
    // Try common DELETE action codes (mobile API format)
    final entityName = _getEntityNameFromUrl(url);
    final deleteCodes = [
      'DELETE_$entityName', // e.g., DELETE_TASK
      'DELETE_${entityName}S', // e.g., DELETE_TASKS (fallback)
    ];

    for (final code in deleteCodes) {
      if (hasActionPermission(menus, url, code)) {
        return true;
      }
    }

    return false;
  }

  /// Extract entity name from URL for permission code generation
  static String _getEntityNameFromUrl(String url) {
    // Remove leading slash and convert to entity name
    final cleanUrl = url.replaceAll('/', '').replaceAll('-', '_');
    
    // Map common URLs to entity names (matching mobile API format)
    final urlToEntity = {
      '/tasks': 'TASK', // Mobile API uses "task" not "tasks"
      '/visit-reports': 'VISIT_REPORTS',
      '/accounts': 'ACCOUNTS',
      '/contacts': 'CONTACTS',
      '/dashboard': 'DASHBOARD',
    };

    return urlToEntity[url] ?? cleanUrl.toUpperCase();
  }
}

