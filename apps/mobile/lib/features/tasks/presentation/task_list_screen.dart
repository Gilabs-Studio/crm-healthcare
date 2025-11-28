import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';

import '../application/task_provider.dart';
import '../application/task_state.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/theme/app_theme.dart';
import 'widgets/task_card.dart';

class TaskListScreen extends ConsumerStatefulWidget {
  const TaskListScreen({super.key});

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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () async {
              await Navigator.of(context).pushNamed(AppRoutes.tasksCreate);
              // Refresh list after returning from create screen
              if (mounted) {
                ref.read(taskListProvider.notifier).refresh();
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              decoration: InputDecoration(
                hintText: 'Search tasks...',
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
                fillColor: theme.colorScheme.surface,
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
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          await Navigator.of(context).pushNamed(AppRoutes.tasksCreate);
          // Refresh list after returning from create screen
          if (mounted) {
            ref.read(taskListProvider.notifier).refresh();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildFilters(BuildContext context, TaskListState state) {
    final hasActiveFilters = state.selectedStatus != null ||
        state.selectedPriority != null;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: _FilterChip(
              label: 'Status',
              value: state.selectedStatus ?? 'All',
              onTap: () => _showStatusFilter(context),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _FilterChip(
              label: 'Priority',
              value: state.selectedPriority ?? 'All',
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
              tooltip: 'Clear filters',
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
    if (state.isLoading && state.tasks.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (state.errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: Colors.red, size: 48),
            const SizedBox(height: 16),
            Text(
              state.errorMessage!,
              style: theme.textTheme.titleMedium?.copyWith(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => ref.read(taskListProvider.notifier).refresh(),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (state.tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_box, size: 64, color: AppTheme.textSecondary),
            const SizedBox(height: 16),
            Text(
              'No tasks found',
              style: theme.textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              'Create a new task to get started',
              style: theme.textTheme.bodyMedium?.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      itemCount: state.tasks.length +
          (state.pagination?.hasNextPage == true ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == state.tasks.length) {
          return const Padding(
            padding: EdgeInsets.all(16.0),
            child: Center(child: CircularProgressIndicator()),
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
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppTheme.borderColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '$label: ',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppTheme.textSecondary,
              ),
            ),
            Text(
              value,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down,
              size: 16,
              color: AppTheme.textSecondary,
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
            'Filter by Status',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ...statuses.map((status) {
            final label = status == null ? 'All' : status.toUpperCase().replaceAll('_', ' ');
            final isSelected = selectedStatus == status;
            return ListTile(
              title: Text(label),
              trailing: isSelected
                  ? Icon(Icons.check, color: theme.colorScheme.primary)
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
            'Filter by Priority',
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          ...priorities.map((priority) {
            final label = priority == null ? 'All' : priority.toUpperCase();
            final isSelected = selectedPriority == priority;
            return ListTile(
              title: Text(label),
              trailing: isSelected
                  ? Icon(Icons.check, color: theme.colorScheme.primary)
                  : null,
              onTap: () => onSelect(priority),
            );
          }),
        ],
      ),
    );
  }
}
