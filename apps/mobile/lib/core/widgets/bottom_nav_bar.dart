import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/permissions/application/permission_provider.dart';
import '../../features/permissions/utils/permission_helper.dart';
import '../l10n/app_localizations.dart';

enum NavItem {
  home,
  accounts,
  reports,
  profile,
}

class BottomNavBar extends ConsumerWidget {
  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context);
    
    // Get permissions
    final permissionsAsync = ref.watch(userPermissionsProvider);
    final menus = permissionsAsync.value?.menus ?? [];

    // Define menu items with their routes and URLs
    final menuItems = [
      _MenuItemData(
        index: 0,
        icon: Icons.home_outlined,
        activeIcon: Icons.home,
        label: l10n?.home ?? 'Home',
        route: '/dashboard',
        webUrl: '/dashboard',
      ),
      _MenuItemData(
        index: 1,
        icon: Icons.business_outlined,
        activeIcon: Icons.business,
        label: l10n?.accountsAndContacts ?? 'Accounts',
        route: '/accounts',
        webUrl: '/accounts',
      ),
      _MenuItemData(
        index: 2,
        icon: Icons.assignment_outlined,
        activeIcon: Icons.assignment,
        label: l10n?.reportsAndTasks ?? 'Reports',
        route: '/visit-reports',
        webUrl: '/visit-reports',
      ),
      _MenuItemData(
        index: 3,
        icon: Icons.person_outline,
        activeIcon: Icons.person,
        label: l10n?.profile ?? 'Profile',
        route: '/profile',
        webUrl: '/profile', // Profile is always accessible
        alwaysAccessible: true,
      ),
    ];

    // Filter menu items based on permissions
    final visibleItems = menuItems.where((item) {
      // Profile is always accessible
      if (item.alwaysAccessible) {
        return true;
      }
      
      // Check if user has permission to access this URL
      return PermissionHelper.canAccessUrl(menus, item.webUrl);
    }).toList();

    // If no permissions loaded yet, show loading state
    if (permissionsAsync.isLoading) {
      return Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Container(
            height: 70,
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: const Center(
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
          ),
        ),
      );
    }

    // If error loading permissions, show all items (fallback)
    if (permissionsAsync.hasError) {
      // Fallback: show all items if permissions fail to load
      return _buildNavBar(context, theme, menuItems, currentIndex, onTap);
    }

    // Build navbar with filtered items
    return _buildNavBar(context, theme, visibleItems, currentIndex, onTap);
  }

  Widget _buildNavBar(
    BuildContext context,
    ThemeData theme,
    List<_MenuItemData> items,
    int currentIndex,
    ValueChanged<int> onTap,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 70,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: items.map((item) {
              // Map original index to new index for visible items
              final visibleIndex = items.indexOf(item);
              final isActive = items[visibleIndex].index == currentIndex;
              
              return Expanded(
                child: _NavItem(
                  icon: item.icon,
                  activeIcon: item.activeIcon,
                  label: item.label,
                  isActive: isActive,
                  onTap: () => onTap(item.index),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}

class _MenuItemData {
  const _MenuItemData({
    required this.index,
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
    required this.webUrl,
    this.alwaysAccessible = false,
  });

  final int index;
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;
  final String webUrl;
  final bool alwaysAccessible;
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isActive ? activeIcon : icon,
              color: isActive
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurface.withOpacity(0.7),
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                color: isActive
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
            if (isActive) ...[
              const SizedBox(height: 4),
              Container(
                width: 24,
                height: 2,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primary,
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

