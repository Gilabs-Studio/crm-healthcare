import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/application/auth_provider.dart';
import '../../features/auth/application/auth_state.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/permissions/application/permission_provider.dart';
import '../../features/permissions/utils/permission_helper.dart';
import '../routing/app_router.dart';

class AuthGate extends ConsumerWidget {
  const AuthGate({
    super.key,
    required this.child,
    this.requiredRoute,
  });

  final Widget child;
  final String? requiredRoute;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(authProvider);

    // Show loading saat check auth status (unknown)
    if (state.status == AuthStatus.unknown) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // If not authenticated, redirect to login
    if (state.status != AuthStatus.authenticated) {
      return const LoginScreen();
    }

    // If no route specified, just return child (for backward compatibility)
    if (requiredRoute == null) {
      return child;
    }

    // Check permissions for the route
    return _PermissionGate(
      route: requiredRoute!,
      child: child,
    );
  }
}

class _PermissionGate extends ConsumerWidget {
  const _PermissionGate({
    required this.route,
    required this.child,
  });

  final String route;
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final permissionsAsync = ref.watch(userPermissionsProvider);
    final menus = permissionsAsync.value?.menus ?? [];

    // Show loading while permissions are being fetched
    if (permissionsAsync.isLoading) {
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    // If error loading permissions, allow access (fallback)
    if (permissionsAsync.hasError) {
      return child;
    }

    // Map mobile route to web URL
    final webUrl = PermissionHelper.getWebUrlForRoute(route);

    // Profile is always accessible
    if (webUrl == '/profile') {
      return child;
    }

    // Check if user has permission to access this route
    final hasPermission = PermissionHelper.canAccessUrl(menus, webUrl);

    if (!hasPermission) {
      // Redirect to dashboard if no permission
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed(AppRoutes.dashboard);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('You do not have permission to access this page'),
            duration: Duration(seconds: 3),
          ),
        );
      });
      return const Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return child;
  }
}


