import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/accounts/presentation/accounts_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/visit_reports/presentation/reports_screen.dart';
import '../../features/permissions/application/permission_provider.dart';
import '../../features/permissions/utils/permission_helper.dart';
import '../routing/app_router.dart';
import 'auth_gate.dart';
import 'bottom_nav_bar.dart';
import 'offline_indicator.dart';

class MainScaffold extends ConsumerWidget {
  const MainScaffold({
    super.key,
    required this.body,
    required this.currentIndex,
    this.onNavTap,
    this.title,
    this.actions,
    this.floatingActionButton,
  });

  final Widget body;
  final int currentIndex;
  final ValueChanged<int>? onNavTap;
  final String? title;
  final List<Widget>? actions;
  final Widget? floatingActionButton;

  void _handleNavTap(BuildContext context, WidgetRef ref, int index) {
    if (index == currentIndex) return;

    // Helper function to create a route without animation
    Route<T> _createNoAnimationRoute<T>(Widget page, String routeName) {
      return PageRouteBuilder<T>(
        settings: RouteSettings(name: routeName),
        pageBuilder: (context, animation, secondaryAnimation) => page,
        transitionDuration: Duration.zero,
        reverseTransitionDuration: Duration.zero,
      );
    }

    // Get permissions to check access
    final permissionsAsync = ref.read(userPermissionsProvider);
    final menus = permissionsAsync.value?.menus ?? [];

    // Define routes
    final routes = [
      {
        'route': AppRoutes.dashboard,
        'webUrl': '/dashboard',
        'screen': const AuthGate(
          child: DashboardScreen(),
          requiredRoute: AppRoutes.dashboard,
        ),
      },
      {
        'route': AppRoutes.accounts,
        'webUrl': '/accounts',
        'screen': const AuthGate(
          child: AccountsScreen(),
          requiredRoute: AppRoutes.accounts,
        ),
      },
      {
        'route': AppRoutes.visitReports,
        'webUrl': '/visit-reports',
        'screen': const AuthGate(
          child: ReportsScreen(),
          requiredRoute: AppRoutes.visitReports,
        ),
      },
      {
        'route': AppRoutes.profile,
        'webUrl': '/profile',
        'screen': const AuthGate(
          child: ProfileScreen(),
          requiredRoute: AppRoutes.profile,
        ),
        'alwaysAccessible': true,
      },
    ];

    if (index < 0 || index >= routes.length) {
      return;
    }

    final routeData = routes[index];
    final webUrl = routeData['webUrl'] as String;
    final alwaysAccessible = routeData['alwaysAccessible'] as bool? ?? false;

    // Check permission (profile is always accessible)
    if (!alwaysAccessible) {
      final hasPermission = PermissionHelper.canAccessUrl(menus, webUrl);
      if (!hasPermission) {
        // Redirect to dashboard if no permission
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('You do not have permission to access this page'),
            duration: Duration(seconds: 3),
          ),
        );
        Navigator.pushReplacement(
          context,
          _createNoAnimationRoute(
            const AuthGate(
              child: DashboardScreen(),
              requiredRoute: AppRoutes.dashboard,
            ),
            AppRoutes.dashboard,
          ),
        );
        return;
      }
    }

    // Navigate to the route
    Navigator.pushReplacement(
      context,
      _createNoAnimationRoute(
        routeData['screen'] as Widget,
        routeData['route'] as String,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: title != null
          ? AppBar(
              title: Text(title!),
              elevation: 0,
              actions: actions,
            )
          : null,
      body: Column(
        children: [
          const OfflineIndicator(),
          Expanded(child: body),
        ],
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: currentIndex,
        onTap: onNavTap ?? ((index) => _handleNavTap(context, ref, index)),
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}

