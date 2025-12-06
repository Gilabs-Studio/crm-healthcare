import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';

import '../application/account_provider.dart';
import '../application/account_state.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/l10n/app_localizations.dart';
import 'widgets/account_card.dart';

class AccountListScreen extends ConsumerStatefulWidget {
  const AccountListScreen({
    super.key,
    this.hideAppBar = false,
    this.searchController,
  });

  final bool hideAppBar;
  final TextEditingController? searchController;

  @override
  ConsumerState<AccountListScreen> createState() => _AccountListScreenState();
}

class _AccountListScreenState extends ConsumerState<AccountListScreen> {
  Timer? _debounceTimer;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(accountListProvider.notifier).loadAccounts();
    });

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(accountListProvider.notifier).loadMore();
    }
  }

  void _onSearchChanged(String query) {
    // Search is handled by parent (AccountsScreen)
    // This method is kept for compatibility but not used when searchController is provided
  }

  Future<void> _onRefresh() async {
    await ref.read(accountListProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(accountListProvider);
    final theme = Theme.of(context);

    final body = widget.searchController != null
        ? RefreshIndicator(
            onRefresh: _onRefresh,
            child: _buildContent(context, state, theme),
          )
        : Column(
            children: [
              // Search Bar (only if not provided by parent)
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  onChanged: _onSearchChanged,
                  decoration: const InputDecoration(
                    hintText: 'Search accounts...',
                    prefixIcon: Icon(Icons.search),
                  ),
                ),
              ),
              // Content
              Expanded(
                child: RefreshIndicator(
                  onRefresh: _onRefresh,
                  child: _buildContent(context, state, theme),
                ),
              ),
            ],
          );

    if (widget.hideAppBar) {
      return body;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Accounts'),
        elevation: 0,
      ),
      body: body,
    );
  }

  Widget _buildContent(
    BuildContext context,
    AccountListState state,
    ThemeData theme,
  ) {
    if (state.isLoading && state.accounts.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.errorMessage != null && state.accounts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              state.errorMessage!,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.error,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                ref.read(accountListProvider.notifier).refresh();
              },
              child: Text(AppLocalizations.of(context)!.retry),
            ),
          ],
        ),
      );
    }

    if (state.accounts.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.business_outlined,
              size: 64,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              AppLocalizations.of(context)!.noAccountsFound,
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      itemCount: state.accounts.length + (state.isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.accounts.length) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final account = state.accounts[index];
        return AccountCard(
          account: account,
          onTap: () {
            Navigator.pushNamed(
              context,
              '${AppRoutes.accounts}/${account.id}',
              arguments: account.id,
            );
          },
        );
      },
    );
  }
}
