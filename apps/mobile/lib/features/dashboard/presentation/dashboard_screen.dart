import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/routing/app_router.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/main_scaffold.dart';
import '../application/dashboard_provider.dart';
import 'widgets/pipeline_summary_widget.dart';
import 'widgets/recent_activities_widget.dart';
import 'widgets/stat_card.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(dashboardProvider.notifier).loadDashboard();
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(dashboardProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final dashboardState = ref.watch(dashboardProvider);

    return MainScaffold(
      currentIndex: 0,
      title: 'Dashboard',
      actions: [
        // Period selector
        PopupMenuButton<String>(
          icon: const Icon(Icons.calendar_today),
          onSelected: (period) {
            ref.read(dashboardProvider.notifier).changePeriod(period);
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'today',
              child: Text('Today'),
            ),
            const PopupMenuItem(
              value: 'week',
              child: Text('This Week'),
            ),
            const PopupMenuItem(
              value: 'month',
              child: Text('This Month'),
            ),
            const PopupMenuItem(
              value: 'year',
              child: Text('This Year'),
            ),
          ],
        ),
      ],
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: dashboardState.isLoading
            ? const Center(child: CircularProgressIndicator())
            : dashboardState.errorMessage != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 48,
                          color: Colors.red,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          dashboardState.errorMessage!,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.red,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () {
                            ref.read(dashboardProvider.notifier).refresh();
                          },
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Welcome Section
                        const _WelcomeCard(),
                        const SizedBox(height: 24),
                        // Period indicator
                        if (dashboardState.selectedPeriod != 'today')
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: colorScheme.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.calendar_today,
                                  size: 16,
                                  color: colorScheme.primary,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  _getPeriodLabel(dashboardState.selectedPeriod),
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    color: colorScheme.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        if (dashboardState.selectedPeriod != 'today')
                          const SizedBox(height: 16),
                        // Stats Cards
                        if (dashboardState.overview != null) ...[
                          GridView.count(
                            crossAxisCount: 2,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                            childAspectRatio: 0.88,
                            children: [
                              StatCard(
                                title: 'Total Visits',
                                value: dashboardState.overview!.visitStats.total
                                    .toString(),
                                icon: Icons.location_on,
                                color: Colors.orange,
                                subtitle:
                                    '${dashboardState.overview!.visitStats.completed} completed',
                                changePercent: dashboardState
                                    .overview!.visitStats.changePercent,
                              ),
                              StatCard(
                                title: 'Total Accounts',
                                value: dashboardState.overview!.accountStats.total
                                    .toString(),
                                icon: Icons.business,
                                color: colorScheme.primary,
                                subtitle:
                                    '${dashboardState.overview!.accountStats.active} active',
                                changePercent: dashboardState
                                    .overview!.accountStats.changePercent,
                              ),
                              StatCard(
                                title: 'Total Activities',
                                value: dashboardState
                                    .overview!.activityStats.total
                                    .toString(),
                                icon: Icons.timeline,
                                color: Colors.blue,
                                subtitle:
                                    '${dashboardState.overview!.activityStats.visits} visits, ${dashboardState.overview!.activityStats.calls} calls',
                                changePercent: dashboardState
                                    .overview!.activityStats.changePercent,
                              ),
                              StatCard(
                                title: 'Revenue',
                                value: dashboardState.overview!.revenue
                                    .totalRevenueFormatted,
                                icon: Icons.attach_money,
                                color: Colors.green,
                                subtitle: 'From won deals',
                                changePercent: dashboardState
                                    .overview!.revenue.changePercent,
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          // Pipeline Summary
                          if (dashboardState.overview!.pipelineStages.isNotEmpty)
                            PipelineSummaryWidget(
                              pipelineStages:
                                  dashboardState.overview!.pipelineStages,
                              dealsStats: dashboardState.overview!.deals,
                            ),
                          if (dashboardState.overview!.pipelineStages.isNotEmpty)
                            const SizedBox(height: 24),
                          // Recent Activities
                          if (dashboardState.recentActivities != null &&
                              dashboardState.recentActivities!.isNotEmpty)
                            RecentActivitiesWidget(
                              activities: dashboardState.recentActivities!,
                            ),
                          if (dashboardState.recentActivities != null &&
                              dashboardState.recentActivities!.isNotEmpty)
                            const SizedBox(height: 24),
                        ],
                        // Quick Actions Title
                        Text(
                          'Quick Actions',
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),
                        // Menu Grid
                        GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 1.1,
                          children: [
                            _MenuCard(
                              icon: Icons.people_outline,
                              title: 'Contacts',
                              color: Colors.blue,
                              onTap: () {
                                Navigator.pushNamed(context, AppRoutes.contacts);
                              },
                            ),
                            _MenuCard(
                              icon: Icons.task_outlined,
                              title: 'Tasks',
                              color: Colors.purple,
                              onTap: () {
                                Navigator.pushNamed(context, AppRoutes.tasks);
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }

  String _getPeriodLabel(String period) {
    switch (period) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      default:
        return 'Today';
    }
  }
}

class _WelcomeCard extends StatelessWidget {
  const _WelcomeCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: AppTheme.borderColor,
          width: 1,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              colorScheme.primary.withOpacity(0.1),
              colorScheme.primary.withOpacity(0.05),
            ],
          ),
        ),
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: colorScheme.primary,
                borderRadius: BorderRadius.circular(28),
              ),
              child: Icon(
                Icons.person,
                color: colorScheme.onPrimary,
                size: 28,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Welcome back,',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Sales Rep',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuCard extends StatelessWidget {
  const _MenuCard({
    required this.icon,
    required this.title,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: AppTheme.borderColor,
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color.withOpacity(0.1),
                color.withOpacity(0.05),
              ],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 48,
                color: color,
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
