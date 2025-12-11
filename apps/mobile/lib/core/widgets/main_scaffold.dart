import 'package:flutter/material.dart';

import '../../features/accounts/presentation/accounts_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/visit_reports/presentation/reports_screen.dart';
import '../routing/app_router.dart';
import 'auth_gate.dart';
import 'bottom_nav_bar.dart';
import 'offline_indicator.dart';

class MainScaffold extends StatelessWidget {
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

  void _handleNavTap(BuildContext context, int index) {
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

    switch (index) {
      case 0:
        Navigator.pushReplacement(
          context,
          _createNoAnimationRoute(
            const AuthGate(child: DashboardScreen()),
            AppRoutes.dashboard,
          ),
        );
        break;
      case 1:
        Navigator.pushReplacement(
          context,
          _createNoAnimationRoute(
            const AuthGate(child: AccountsScreen()),
            AppRoutes.accounts,
          ),
        );
        break;
      case 2:
        Navigator.pushReplacement(
          context,
          _createNoAnimationRoute(
            const AuthGate(child: ReportsScreen()),
            AppRoutes.visitReports,
          ),
        );
        break;
      case 3:
        Navigator.pushReplacement(
          context,
          _createNoAnimationRoute(
            const AuthGate(child: ProfileScreen()),
            AppRoutes.profile,
          ),
        );
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
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
        onTap: onNavTap ?? ((index) => _handleNavTap(context, index)),
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}

