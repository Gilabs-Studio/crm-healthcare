import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';

import '../application/visit_report_provider.dart';
import '../application/visit_report_state.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/l10n/app_localizations.dart';
import 'widgets/visit_report_card.dart';

class VisitReportListScreen extends ConsumerStatefulWidget {
  const VisitReportListScreen({
    super.key,
    this.hideAppBar = false,
  });

  final bool hideAppBar;

  @override
  ConsumerState<VisitReportListScreen> createState() =>
      _VisitReportListScreenState();
}

class _VisitReportListScreenState
    extends ConsumerState<VisitReportListScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(visitReportListProvider.notifier).loadVisitReports();
    });

    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounceTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.8) {
      ref.read(visitReportListProvider.notifier).loadMore();
    }
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      ref.read(visitReportListProvider.notifier).updateSearchQuery(query);
      ref.read(visitReportListProvider.notifier).loadVisitReports(
            page: 1,
            refresh: true,
            search: query,
          );
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(visitReportListProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(visitReportListProvider);
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    final body = Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: l10n.searchVisitReports,
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
        title: Text(l10n.visitReports),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.pushNamed(context, '${AppRoutes.visitReports}/create');
            },
            tooltip: l10n.createVisitReport,
          ),
        ],
      ),
      body: body,
    );
  }

  Widget _buildContent(
    BuildContext context,
    VisitReportListState state,
    ThemeData theme,
  ) {
    final l10n = AppLocalizations.of(context)!;
    if (state.isLoading && state.visitReports.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.errorMessage != null && state.visitReports.isEmpty) {
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
                ref.read(visitReportListProvider.notifier).refresh();
              },
              child: Text(l10n.retry),
            ),
          ],
        ),
      );
    }

    if (state.visitReports.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.assignment_outlined,
              size: 64,
              color: theme.colorScheme.onSurface.withOpacity(0.3),
            ),
            const SizedBox(height: 16),
            Text(
              l10n.noVisitReportsFound,
              style: theme.textTheme.titleMedium?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              l10n.tapToCreateVisitReport,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withOpacity(0.5),
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      itemCount: state.visitReports.length + (state.isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.visitReports.length) {
          return const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator()),
          );
        }

        final visitReport = state.visitReports[index];
        return VisitReportCard(
          visitReport: visitReport,
          onTap: () {
            Navigator.pushNamed(
              context,
              '${AppRoutes.visitReports}/${visitReport.id}',
              arguments: visitReport.id,
            );
          },
        );
      },
    );
  }
}
