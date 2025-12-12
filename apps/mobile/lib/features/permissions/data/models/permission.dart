class Action {
  const Action({
    required this.id,
    required this.code,
    required this.name,
    required this.access,
  });

  final String id;
  final String code;
  final String name;
  final bool access;

  factory Action.fromJson(Map<String, dynamic> json) {
    return Action(
      id: json['id'] as String,
      code: json['code'] as String,
      name: json['name'] as String,
      access: json['access'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'access': access,
    };
  }
}

class MenuWithActions {
  const MenuWithActions({
    required this.id,
    required this.name,
    required this.icon,
    required this.url,
    this.children,
    this.actions,
  });

  final String id;
  final String name;
  final String icon;
  final String url;
  final List<MenuWithActions>? children;
  final List<Action>? actions;

  factory MenuWithActions.fromJson(Map<String, dynamic> json) {
    return MenuWithActions(
      id: json['id'] as String,
      name: json['name'] as String,
      icon: json['icon'] as String? ?? '',
      url: json['url'] as String? ?? '',
      children: json['children'] != null
          ? (json['children'] as List<dynamic>)
              .map((e) => MenuWithActions.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
      actions: json['actions'] != null
          ? (json['actions'] as List<dynamic>)
              .map((e) => Action.fromJson(e as Map<String, dynamic>))
              .toList()
          : null,
    );
  }

  /// Parse mobile API response format
  /// Mobile format: { "menu": "dashboard", "actions": ["VIEW", "CREATE", ...] }
  factory MenuWithActions.fromMobileJson(Map<String, dynamic> json) {
    final menuName = json['menu'] as String? ?? '';
    final actionsList = json['actions'] as List<dynamic>? ?? [];
    
    // Map menu name to URL and display name
    final menuMapping = _getMenuMapping(menuName);
    
    // Convert actions array to Action objects
    final actions = actionsList
        .map((actionCode) {
          final code = actionCode as String;
          return Action(
            id: '${menuName}_$code',
            code: _normalizeActionCode(code, menuName),
            name: _getActionName(code),
            access: true, // All actions in array are accessible
          );
        })
        .toList();
    
    return MenuWithActions(
      id: menuName,
      name: menuMapping['name']!,
      icon: menuMapping['icon']!,
      url: menuMapping['url']!,
      actions: actions,
    );
  }

  /// Map mobile menu name to internal format
  static Map<String, String> _getMenuMapping(String menuName) {
    switch (menuName.toLowerCase()) {
      case 'dashboard':
        return {
          'name': 'Dashboard',
          'icon': 'home',
          'url': '/dashboard',
        };
      case 'task':
      case 'tasks':
        return {
          'name': 'Tasks',
          'icon': 'assignment',
          'url': '/tasks',
        };
      case 'accounts':
        return {
          'name': 'Accounts',
          'icon': 'business',
          'url': '/accounts',
        };
      case 'contacts':
        return {
          'name': 'Contacts',
          'icon': 'person',
          'url': '/contacts',
        };
      case 'visit_reports':
      case 'visit-reports':
        return {
          'name': 'Visit Reports',
          'icon': 'assignment',
          'url': '/visit-reports',
        };
      default:
        return {
          'name': menuName,
          'icon': 'menu',
          'url': '/$menuName',
        };
    }
  }

  /// Normalize action code (e.g., "VIEW" -> "VIEW_DASHBOARD")
  static String _normalizeActionCode(String actionCode, String menuName) {
    final normalizedMenu = menuName.toUpperCase().replaceAll('-', '_');
    return '${actionCode}_$normalizedMenu';
  }

  /// Get action display name
  static String _getActionName(String actionCode) {
    switch (actionCode.toUpperCase()) {
      case 'VIEW':
        return 'View';
      case 'CREATE':
        return 'Create';
      case 'EDIT':
        return 'Edit';
      case 'DELETE':
        return 'Delete';
      default:
        return actionCode;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'icon': icon,
      'url': url,
      'children': children?.map((e) => e.toJson()).toList(),
      'actions': actions?.map((e) => e.toJson()).toList(),
    };
  }
}

class UserPermissionsResponse {
  const UserPermissionsResponse({
    required this.menus,
  });

  final List<MenuWithActions> menus;

  factory UserPermissionsResponse.fromJson(Map<String, dynamic> json) {
    return UserPermissionsResponse(
      menus: (json['menus'] as List<dynamic>?)
              ?.map((e) => MenuWithActions.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  /// Parse mobile API response format
  /// Mobile format: { "menus": [ { "menu": "dashboard", "actions": ["VIEW"] }, ... ] }
  factory UserPermissionsResponse.fromMobileJson(Map<String, dynamic> json) {
    final menusList = json['menus'] as List<dynamic>? ?? [];
    final menus = menusList
        .map((e) => MenuWithActions.fromMobileJson(e as Map<String, dynamic>))
        .toList();
    return UserPermissionsResponse(menus: menus);
  }

  Map<String, dynamic> toJson() {
    return {
      'menus': menus.map((e) => e.toJson()).toList(),
    };
  }
}

