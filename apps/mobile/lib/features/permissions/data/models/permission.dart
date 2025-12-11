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

  Map<String, dynamic> toJson() {
    return {
      'menus': menus.map((e) => e.toJson()).toList(),
    };
  }
}

