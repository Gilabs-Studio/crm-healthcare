import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/widgets/error_widget.dart';
import '../../../core/widgets/loading_widget.dart';
import '../../../core/widgets/main_scaffold.dart';
import '../../../core/widgets/skeleton_widget.dart';
import '../../notifications/application/notification_provider.dart';
import '../../notifications/presentation/notification_list_screen.dart';
import '../application/dashboard_provider.dart';
import 'widgets/activity_trends_widget.dart';
import 'widgets/deals_overview_widget.dart';
import 'widgets/leads_by_source_widget.dart';
import 'widgets/overview_stat_card.dart';
import 'widgets/pipeline_summary_widget.dart';
import 'widgets/recent_activities_widget.dart';
import 'widgets/target_progress_widget.dart';
import 'widgets/top_accounts_widget.dart';
import 'widgets/top_sales_rep_widget.dart';
import 'widgets/upcoming_tasks_widget.dart';
import 'widgets/visit_statistics_widget.dart';

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
      ref.read(notificationCountProvider.notifier).loadUnreadCount();
    });
  }

  Future<void> _onRefresh() async {
    await ref.read(dashboardProvider.notifier).refresh();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final l10n = AppLocalizations.of(context)!;
      final dashboardState = ref.watch(dashboardProvider);

    final notificationCountState = ref.watch(notificationCountProvider);

    return MainScaffold(
      currentIndex: 0,
      title: l10n.dashboard,
      actions: [
        // Notification badge
        Stack(
          children: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const NotificationListScreen(),
                  ),
                ).then((_) {
                  // Refresh unread count when returning
                  ref.read(notificationCountProvider.notifier).refresh();
                });
              },
            ),
            if (!notificationCountState.isLoading &&
                notificationCountState.unreadCount > 0)
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: colorScheme.error,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 16,
                    minHeight: 16,
                  ),
                  child: Text(
                    notificationCountState.unreadCount > 99
                        ? '99+'
                        : '${notificationCountState.unreadCount}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: colorScheme.onError,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
        // Period selector
        PopupMenuButton<String>(
          icon: const Icon(Icons.calendar_today),
          onSelected: (period) {
            ref.read(dashboardProvider.notifier).changePeriod(period);
          },
          itemBuilder: (context) => [
            PopupMenuItem(
              value: 'today',
              child: Text(l10n.today),
            ),
            PopupMenuItem(
              value: 'week',
              child: Text(l10n.thisWeek),
            ),
            PopupMenuItem(
              value: 'month',
              child: Text(l10n.thisMonth),
            ),
            PopupMenuItem(
              value: 'year',
              child: Text(l10n.thisYear),
            ),
          ],
        ),
      ],
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: dashboardState.errorMessage != null &&
                dashboardState.overview == null
            ? ErrorStateWidget(
                message: dashboardState.errorMessage!,
                onRetry: () {
                  ref.read(dashboardProvider.notifier).refresh();
                },
              )
            : SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
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
                                  _getPeriodLabel(dashboardState.selectedPeriod, l10n),
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
                        // Overview Stats - 2 Cards (Accounts, Revenue)
                        // Show loading skeleton if overview is loading and not available
                        if (dashboardState.isLoadingOverview &&
                            dashboardState.overview == null)
                          const LoadingWidget()
                        else if (dashboardState.overview != null) ...[
                          GridView.count(
                            crossAxisCount: 2,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                            childAspectRatio: 1.15,
                            children: [
                              OverviewStatCard(
                                title: l10n.totalAccounts,
                                value: dashboardState.overview!.accountStats.total.toString(),
                                subtitle: l10n.totalAccountsDescription(
                                  dashboardState.overview!.accountStats.active,
                                  dashboardState.overview!.accountStats.inactive,
                                ),
                                icon: Icons.business,
                                color: colorScheme.primary,
                                changePercent: dashboardState.overview!.accountStats.changePercent,
                              ),
                              OverviewStatCard(
                                title: l10n.revenue,
                                value: dashboardState.overview!.revenue.totalRevenueFormatted,
                                subtitle: l10n.totalRevenueDescription,
                                icon: Icons.attach_money,
                                color: Colors.green,
                                changePercent: dashboardState.overview!.revenue.changePercent,
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          // Sales Target - Full Width
                          TargetProgressWidget(
                            target: dashboardState.overview!.target,
                          ),
                          const SizedBox(height: 24),
                          // Total Deals - Full Width
                          DealsOverviewWidget(
                            deals: dashboardState.overview!.deals,
                          ),
                          const SizedBox(height: 24),
                          // Bento Layout - Row 2: Leads by Source & Upcoming Tasks
                          Row(
                            children: [
                              Expanded(
                                child: LeadsBySourceWidget(
                                  leadsBySource: dashboardState.overview!.leadsBySource,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: UpcomingTasksWidget(
                                  tasks: dashboardState.overview!.upcomingTasks,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          // Pipeline Summary - Full Width
                          if (dashboardState.overview!.pipelineStages.isNotEmpty)
                            PipelineSummaryWidget(
                              pipelineStages:
                                  dashboardState.overview!.pipelineStages,
                              dealsStats: dashboardState.overview!.deals,
                            ),
                          if (dashboardState.overview!.pipelineStages.isNotEmpty)
                            const SizedBox(height: 24),
                          // Visit Statistics - Full Width
                          if (dashboardState.visitStatistics != null)
                            VisitStatisticsWidget(
                              statistics: dashboardState.visitStatistics!,
                            ),
                          if (dashboardState.visitStatistics != null)
                            const SizedBox(height: 24),
                          // Activity Trends - Full Width
                          if (dashboardState.activityTrends != null &&
                              dashboardState.overview != null)
                            ActivityTrendsWidget(
                              trends: dashboardState.activityTrends!,
                              activityStats: dashboardState.overview!.activityStats,
                            ),
                          if (dashboardState.activityTrends != null &&
                              dashboardState.overview != null)
                            const SizedBox(height: 24),
                          // Top Accounts - Full Width
                          if (dashboardState.isLoadingSecondary &&
                              dashboardState.topAccounts == null)
                            const SkeletonCard(height: 200)
                          else if (dashboardState.topAccounts != null &&
                              dashboardState.topAccounts!.isNotEmpty)
                            TopAccountsWidget(
                              accounts: dashboardState.topAccounts!,
                            ),
                          if (dashboardState.topAccounts != null &&
                              dashboardState.topAccounts!.isNotEmpty)
                            const SizedBox(height: 24),
                          // Top Sales Rep - Full Width
                          if (dashboardState.isLoadingSecondary &&
                              dashboardState.topSalesReps == null)
                            const SkeletonCard(height: 200)
                          else if (dashboardState.topSalesReps != null &&
                              dashboardState.topSalesReps!.isNotEmpty)
                            TopSalesRepWidget(
                              salesReps: dashboardState.topSalesReps!,
                            ),
                          if (dashboardState.topSalesReps != null &&
                              dashboardState.topSalesReps!.isNotEmpty)
                            const SizedBox(height: 24),
                          // Recent Activities - Full Width
                          if (dashboardState.isLoadingSecondary &&
                              dashboardState.recentActivities == null)
                            const SkeletonCard(height: 200)
                          else if (dashboardState.recentActivities != null &&
                              dashboardState.recentActivities!.isNotEmpty)
                            RecentActivitiesWidget(
                              activities: dashboardState.recentActivities!,
                            ),
                          if (dashboardState.recentActivities != null &&
                              dashboardState.recentActivities!.isNotEmpty)
                            const SizedBox(height: 24),
                        ],
                      ],
                    ),
                  ),
      ),
    );
  }

  String _getPeriodLabel(String period, AppLocalizations l10n) {
    switch (period) {
      case 'week':
        return l10n.thisWeek;
      case 'month':
        return l10n.thisMonth;
      case 'year':
        return l10n.thisYear;
      default:
        return l10n.today;
    }
  }
}
