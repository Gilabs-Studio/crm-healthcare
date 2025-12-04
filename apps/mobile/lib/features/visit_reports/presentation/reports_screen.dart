import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/widgets/main_scaffold.dart';
import '../../tasks/presentation/task_list_screen.dart';
import 'visit_report_list_screen.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return MainScaffold(
      currentIndex: 2,
      title: l10n.reports,
      actions: [
        // Show add button only when on Reports tab
        if (_tabController.index == 0)
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.pushNamed(
                context,
                '${AppRoutes.visitReports}/create',
              );
            },
            tooltip: 'Create Visit Report',
          ),
        // Show add button when on Tasks tab
        if (_tabController.index == 1)
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              Navigator.pushNamed(
                context,
                AppRoutes.tasksCreate,
              );
            },
            tooltip: 'Create Task',
          ),
      ],
      body: Column(
        children: [
          // Tab Bar
          Container(
            color: theme.colorScheme.surface,
            child: TabBar(
              controller: _tabController,
              labelColor: theme.colorScheme.primary,
              unselectedLabelColor: theme.colorScheme.onSurface.withOpacity(0.7),
              indicatorColor: theme.colorScheme.primary,
              onTap: (index) {
                setState(() {}); // Rebuild to update actions
              },
              tabs: [
                Tab(text: l10n.reports),
                Tab(text: l10n.tasks),
              ],
            ),
          ),
          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: const [
                VisitReportListScreen(hideAppBar: true),
                TaskListScreen(hideAppBar: true),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

