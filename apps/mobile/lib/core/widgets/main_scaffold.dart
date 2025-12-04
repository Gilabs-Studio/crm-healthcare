import 'package:flutter/material.dart';

import '../routing/app_router.dart';
import 'bottom_nav_bar.dart';

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

    switch (index) {
      case 0:
        Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
        break;
      case 1:
        Navigator.pushReplacementNamed(context, AppRoutes.accounts);
        break;
      case 2:
        Navigator.pushReplacementNamed(context, AppRoutes.visitReports);
        break;
      case 3:
        Navigator.pushReplacementNamed(context, AppRoutes.profile);
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
      body: body,
      bottomNavigationBar: BottomNavBar(
        currentIndex: currentIndex,
        onTap: onNavTap ?? ((index) => _handleNavTap(context, index)),
      ),
      floatingActionButton: floatingActionButton,
    );
  }
}

