import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/widgets/main_scaffold.dart';
import '../../contacts/presentation/contact_list_screen.dart';
import '../../contacts/presentation/contact_form_screen.dart';
import '../../contacts/application/contact_provider.dart';
import '../../permissions/hooks/use_has_permission.dart';
import '../application/account_provider.dart';
import '../presentation/account_form_screen.dart';
import 'account_list_screen.dart';

class AccountsScreen extends ConsumerStatefulWidget {
  const AccountsScreen({super.key});

  @override
  ConsumerState<AccountsScreen> createState() => _AccountsScreenState();
}

class _AccountsScreenState extends ConsumerState<AccountsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(_onTabChanged);
  }

  @override
  void dispose() {
    _tabController.removeListener(_onTabChanged);
    _tabController.dispose();
    _searchController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onTabChanged() {
    if (!_tabController.indexIsChanging) {
      // Tab change completed - clear search and reload data for new tab
      _searchController.clear();
      // Clear search query in providers
      if (_tabController.index == 0) {
        // Accounts tab
        ref.read(accountListProvider.notifier).updateSearchQuery('');
        ref.read(accountListProvider.notifier).loadAccounts(
              page: 1,
              refresh: true,
              search: '',
            );
      } else {
        // Contacts tab
        ref.read(contactListProvider.notifier).updateSearchQuery('');
        ref.read(contactListProvider.notifier).loadContacts(
              page: 1,
              refresh: true,
              search: '',
            );
      }
      setState(() {}); // Update UI to reflect new placeholder
    }
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      // Update search based on current tab
      if (_tabController.index == 0) {
        // Accounts tab
        ref.read(accountListProvider.notifier).updateSearchQuery(query);
        ref.read(accountListProvider.notifier).loadAccounts(
              page: 1,
              refresh: true,
              search: query,
            );
      } else {
        // Contacts tab
        ref.read(contactListProvider.notifier).updateSearchQuery(query);
        ref.read(contactListProvider.notifier).loadContacts(
              page: 1,
              refresh: true,
              search: query,
            );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    // Check CREATE permissions
    final hasCreateAccountPermission = useHasCreatePermission(ref, '/accounts');
    final hasCreateContactPermission = useHasCreatePermission(ref, '/contacts');

    // Show FAB only if user has permission for current tab
    final showFAB = (_tabController.index == 0 && hasCreateAccountPermission) ||
        (_tabController.index == 1 && hasCreateContactPermission);

    return MainScaffold(
      currentIndex: 1,
      title: null, // Remove title header
      floatingActionButton: showFAB
          ? FloatingActionButton(
              onPressed: () {
                if (_tabController.index == 0) {
                  // Create Account
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const AccountFormScreen(),
                    ),
                  ).then((_) {
                    // Refresh list after creating
                    ref.read(accountListProvider.notifier).refresh();
                  });
                } else {
                  // Create Contact
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const ContactFormScreen(),
                    ),
                  ).then((_) {
                    // Refresh list after creating
                    ref.read(contactListProvider.notifier).refresh();
                  });
                }
              },
              child: const Icon(Icons.add),
            )
          : null,
      body: Column(
        children: [
          // Tab Bar with SafeArea and larger text
          SafeArea(
            bottom: false,
            child: Container(
              color: theme.colorScheme.surface,
              padding: const EdgeInsets.only(top: 8),
              child: TabBar(
                controller: _tabController,
                labelColor: theme.colorScheme.primary,
                unselectedLabelColor: theme.colorScheme.onSurface.withOpacity(0.7),
                indicatorColor: theme.colorScheme.primary,
                labelStyle: theme.textTheme.titleMedium?.copyWith(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
                unselectedLabelStyle: theme.textTheme.titleMedium?.copyWith(
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
                tabs: [
                  Tab(text: l10n.accounts),
                  Tab(text: l10n.contacts),
                ],
              ),
            ),
          ),
          // Search Bar - Sticky (doesn't scroll)
          AnimatedBuilder(
            animation: _tabController,
            builder: (context, _) {
              return Container(
                color: theme.colorScheme.surface,
                padding: const EdgeInsets.all(16),
                child: TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: _tabController.index == 0
                        ? l10n.searchAccounts
                        : l10n.searchContacts,
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              _onSearchChanged('');
                            },
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: theme.colorScheme.surfaceContainerHighest,
                  ),
                ),
              );
            },
          ),
          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                AccountListScreen(
                  hideAppBar: true,
                  searchController: _searchController,
                ),
                ContactListScreen(
                  hideAppBar: true,
                  searchController: _searchController,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

