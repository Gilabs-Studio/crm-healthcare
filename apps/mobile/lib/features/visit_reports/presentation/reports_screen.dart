import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/routing/app_router.dart';
import '../../../core/widgets/main_scaffold.dart';
import '../../tasks/presentation/task_list_screen.dart';
import '../application/visit_report_provider.dart';
import 'visit_report_form_screen.dart';
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
      title: null, // Remove title header
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (_tabController.index == 0) {
            // Create Visit Report
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const VisitReportFormScreen(),
              ),
            ).then((result) {
              // Refresh list after creating visit report
              if (result != null) {
                ref.read(visitReportListProvider.notifier).refresh();
              }
            });
          } else {
            // Create Task
            Navigator.pushNamed(
              context,
              AppRoutes.tasksCreate,
            );
          }
        },
        child: const Icon(Icons.add),
      ),
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
                  Tab(text: l10n.reports),
                  Tab(text: l10n.tasks),
                ],
              ),
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

