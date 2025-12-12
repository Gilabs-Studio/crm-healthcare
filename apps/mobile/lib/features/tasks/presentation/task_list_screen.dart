import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';

import '../application/task_provider.dart';
import '../application/task_state.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/l10n/app_localizations.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/skeleton_widget.dart';
import 'widgets/task_card.dart';

class TaskListScreen extends ConsumerStatefulWidget {
  const TaskListScreen({
    super.key,
    this.hideAppBar = false,
  });

  final bool hideAppBar;

  @override
  ConsumerState<TaskListScreen> createState() => _TaskListScreenState();
}

class _TaskListScreenState extends ConsumerState<TaskListScreen> {
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(taskListProvider.notifier).loadTasks();
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
      ref.read(taskListProvider.notifier).loadMore();
    }
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      ref.read(taskListProvider.notifier).updateSearchQuery(query);
      ref.read(taskListProvider.notifier).loadTasks(
            page: 1,
            refresh: true,
            search: query,
          );
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(taskListProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(taskListProvider);
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;

    final body = Column(
      children: [
        // Search Bar
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: TextField(
            controller: _searchController,
            onChanged: _onSearchChanged,
            decoration: InputDecoration(
              hintText: l10n.searchTasks,
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
        // Filters
        _buildFilters(context, state),
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

    // Sales users don't need create button - removed
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.tasks),
      ),
      body: body,
      // No FloatingActionButton for sales users
    );
  }

  Widget _buildFilters(BuildContext context, TaskListState state) {
    final l10n = AppLocalizations.of(context)!;
    final hasActiveFilters = state.selectedStatus != null ||
        state.selectedPriority != null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: _FilterChip(
              label: l10n.status,
              value: state.selectedStatus ?? l10n.all,
              onTap: () => _showStatusFilter(context),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _FilterChip(
              label: l10n.priority,
              value: state.selectedPriority ?? l10n.all,
              onTap: () => _showPriorityFilter(context),
            ),
          ),
          if (hasActiveFilters) ...[
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.clear),
              onPressed: () {
                ref.read(taskListProvider.notifier).clearFilters();
              },
              tooltip: l10n.clearFilters,
            ),
          ],
        ],
      ),
    );
  }

  void _showStatusFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (_) => _StatusFilterSheet(
        selectedStatus: ref.read(taskListProvider).selectedStatus,
        onSelect: (status) {
          ref.read(taskListProvider.notifier).updateStatusFilter(status);
          Navigator.pop(context);
        },
      ),
    );
  }

  void _showPriorityFilter(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (_) => _PriorityFilterSheet(
        selectedPriority: ref.read(taskListProvider).selectedPriority,
        onSelect: (priority) {
          ref.read(taskListProvider.notifier).updatePriorityFilter(priority);
          Navigator.pop(context);
        },
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    TaskListState state,
    ThemeData theme,
  ) {
    final l10n = AppLocalizations.of(context)!;

    if (state.isLoading && state.tasks.isEmpty) {
      return const LoadingWidget();
    }

    if (state.errorMessage != null) {
      return ErrorStateWidget(
        message: state.errorMessage!,
        onRetry: () => ref.read(taskListProvider.notifier).refresh(),
      );
    }

    if (state.tasks.isEmpty) {
      return EmptyStateWidget(
        message: l10n.noTasksFound,
        subtitle: l10n.tapToCreateTask,
        icon: Icons.check_box,
      );
    }

    // Show skeleton screens if loading first page
    if (state.isLoading && state.tasks.isEmpty) {
      return ListView.builder(
        itemCount: 5, // Show 5 skeleton items
        itemBuilder: (context, index) {
          return const SkeletonListItem(height: 100);
        },
      );
    }

    return ListView.builder(
      controller: _scrollController,
      itemCount: state.tasks.length + (state.isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.tasks.length) {
          return const Padding(
            padding: EdgeInsets.all(16.0),
            child: LoadingWidget(size: 24),
          );
        }
        final task = state.tasks[index];
        return TaskCard(
          task: task,
          onTap: () async {
            await Navigator.of(context).pushNamed(
              '${AppRoutes.tasks}/${task.id}',
            );
            // Refresh list after returning from detail screen
            // This ensures list is updated if task was deleted, completed, or updated
            if (mounted) {
              ref.read(taskListProvider.notifier).refresh();
            }
          },
        );
      },
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.value,
    required this.onTap,
  });

  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: colorScheme.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: colorScheme.outline.withOpacity(0.2),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$label: ',
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurface.withOpacity(0.7),
              ),
            ),
            Text(
              value,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: colorScheme.onSurface,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down,
              size: 16,
              color: colorScheme.onSurface.withOpacity(0.7),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusFilterSheet extends StatelessWidget {
  const _StatusFilterSheet({
    this.selectedStatus,
    required this.onSelect,
  });

  final String? selectedStatus;
  final ValueChanged<String?> onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final colorScheme = theme.colorScheme;
    final statuses = [
      null,
      'pending',
      'in_progress',
      'completed',
      'cancelled',
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.filterByStatus,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          ...statuses.map((status) {
            final label = status == null ? l10n.all : status.toUpperCase().replaceAll('_', ' ');
            final isSelected = selectedStatus == status;
            return ListTile(
              title: Text(label),
              trailing: isSelected
                  ? Icon(Icons.check, color: colorScheme.primary)
                  : null,
              onTap: () => onSelect(status),
            );
          }),
        ],
      ),
    );
  }
}

class _PriorityFilterSheet extends StatelessWidget {
  const _PriorityFilterSheet({
    this.selectedPriority,
    required this.onSelect,
  });

  final String? selectedPriority;
  final ValueChanged<String?> onSelect;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final colorScheme = theme.colorScheme;
    final priorities = [
      null,
      'low',
      'medium',
      'high',
      'urgent',
    ];

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.filterByPriority,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 16),
          ...priorities.map((priority) {
            final label = priority == null ? l10n.all : priority.toUpperCase();
            final isSelected = selectedPriority == priority;
            return ListTile(
              title: Text(label),
              trailing: isSelected
                  ? Icon(Icons.check, color: colorScheme.primary)
                  : null,
              onTap: () => onSelect(priority),
            );
          }),
        ],
      ),
    );
  }
}
