class DashboardOverview {
  final DashboardPeriod period;
  final VisitStats visitStats;
  final AccountStats accountStats;
  final ActivityStats activityStats;
  final TargetStats target;
  final DealsStats deals;
  final RevenueStats revenue;
  final LeadsBySource leadsBySource;
  final List<DashboardTaskSummary> upcomingTasks;
  final List<DashboardPipelineStageSummary> pipelineStages;

  DashboardOverview({
    required this.period,
    required this.visitStats,
    required this.accountStats,
    required this.activityStats,
    required this.target,
    required this.deals,
    required this.revenue,
    required this.leadsBySource,
    required this.upcomingTasks,
    required this.pipelineStages,
  });

  factory DashboardOverview.fromJson(Map<String, dynamic> json) {
    return DashboardOverview(
      period: json['period'] != null
          ? DashboardPeriod.fromJson(json['period'] as Map<String, dynamic>)
          : DashboardPeriod(
              type: 'today',
              start: DateTime.now(),
              end: DateTime.now(),
            ),
      visitStats: json['visit_stats'] != null
          ? VisitStats.fromJson(json['visit_stats'] as Map<String, dynamic>)
          : VisitStats(
              total: 0,
              completed: 0,
              pending: 0,
              approved: 0,
              rejected: 0,
              changePercent: 0.0,
            ),
      accountStats: json['account_stats'] != null
          ? AccountStats.fromJson(json['account_stats'] as Map<String, dynamic>)
          : AccountStats(
              total: 0,
              active: 0,
              inactive: 0,
              changePercent: 0.0,
            ),
      activityStats: json['activity_stats'] != null
          ? ActivityStats.fromJson(json['activity_stats'] as Map<String, dynamic>)
          : ActivityStats(
              total: 0,
              visits: 0,
              calls: 0,
              emails: 0,
              changePercent: 0.0,
            ),
      target: json['target'] != null
          ? TargetStats.fromJson(json['target'] as Map<String, dynamic>)
          : TargetStats(
              targetAmount: 0,
              targetAmountFormatted: 'Rp 0',
              achievedAmount: 0,
              achievedAmountFormatted: 'Rp 0',
              progressPercent: 0.0,
              changePercent: 0.0,
            ),
      deals: json['deals'] != null
          ? DealsStats.fromJson(json['deals'] as Map<String, dynamic>)
          : DealsStats(
              totalDeals: 0,
              openDeals: 0,
              wonDeals: 0,
              lostDeals: 0,
              totalValue: 0,
              totalValueFormatted: 'Rp 0',
              changePercent: 0.0,
            ),
      revenue: json['revenue'] != null
          ? RevenueStats.fromJson(json['revenue'] as Map<String, dynamic>)
          : RevenueStats(
              totalRevenue: 0,
              totalRevenueFormatted: 'Rp 0',
              changePercent: 0.0,
            ),
      leadsBySource: json['leads_by_source'] != null
          ? LeadsBySource.fromJson(json['leads_by_source'] as Map<String, dynamic>)
          : LeadsBySource(
              total: 0,
              bySource: [],
            ),
      upcomingTasks: (json['upcoming_tasks'] as List<dynamic>?)
              ?.map((e) => DashboardTaskSummary.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      pipelineStages: (json['pipeline_stages'] as List<dynamic>?)
              ?.map((e) => DashboardPipelineStageSummary.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class DashboardPeriod {
  final String type;
  final DateTime start;
  final DateTime end;

  DashboardPeriod({
    required this.type,
    required this.start,
    required this.end,
  });

  factory DashboardPeriod.fromJson(Map<String, dynamic> json) {
    return DashboardPeriod(
      type: json['type'] as String? ?? 'today',
      start: json['start'] != null
          ? (json['start'] is String
              ? DateTime.parse(json['start'] as String)
              : DateTime.fromMillisecondsSinceEpoch(
                  (json['start'] as num).toInt() * 1000,
                ))
          : DateTime.now(),
      end: json['end'] != null
          ? (json['end'] is String
              ? DateTime.parse(json['end'] as String)
              : DateTime.fromMillisecondsSinceEpoch(
                  (json['end'] as num).toInt() * 1000,
                ))
          : DateTime.now(),
    );
  }
}

class VisitStats {
  final int total;
  final int completed;
  final int pending;
  final int approved;
  final int rejected;
  final double changePercent;

  VisitStats({
    required this.total,
    required this.completed,
    required this.pending,
    required this.approved,
    required this.rejected,
    required this.changePercent,
  });

  factory VisitStats.fromJson(Map<String, dynamic> json) {
    return VisitStats(
      total: json['total'] as int? ?? 0,
      completed: json['completed'] as int? ?? 0,
      pending: json['pending'] as int? ?? 0,
      approved: json['approved'] as int? ?? 0,
      rejected: json['rejected'] as int? ?? 0,
      changePercent: (json['change_percent'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class AccountStats {
  final int total;
  final int active;
  final int inactive;
  final double changePercent;

  AccountStats({
    required this.total,
    required this.active,
    required this.inactive,
    required this.changePercent,
  });

  factory AccountStats.fromJson(Map<String, dynamic> json) {
    return AccountStats(
      total: json['total'] as int? ?? 0,
      active: json['active'] as int? ?? 0,
      inactive: json['inactive'] as int? ?? 0,
      changePercent: (json['change_percent'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class ActivityStats {
  final int total;
  final int visits;
  final int calls;
  final int emails;
  final double changePercent;

  ActivityStats({
    required this.total,
    required this.visits,
    required this.calls,
    required this.emails,
    required this.changePercent,
  });

  factory ActivityStats.fromJson(Map<String, dynamic> json) {
    return ActivityStats(
      total: json['total'] as int? ?? 0,
      visits: json['visits'] as int? ?? 0,
      calls: json['calls'] as int? ?? 0,
      emails: json['emails'] as int? ?? 0,
      changePercent: (json['change_percent'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class TargetStats {
  final int targetAmount;
  final String targetAmountFormatted;
  final int achievedAmount;
  final String achievedAmountFormatted;
  final double progressPercent;
  final double changePercent;

  TargetStats({
    required this.targetAmount,
    required this.targetAmountFormatted,
    required this.achievedAmount,
    required this.achievedAmountFormatted,
    required this.progressPercent,
    required this.changePercent,
  });

  factory TargetStats.fromJson(Map<String, dynamic> json) {
    return TargetStats(
      targetAmount: (json['target_amount'] as num?)?.toInt() ?? 0,
      targetAmountFormatted: json['target_amount_formatted'] as String? ?? 'Rp 0',
      achievedAmount: (json['achieved_amount'] as num?)?.toInt() ?? 0,
      achievedAmountFormatted: json['achieved_amount_formatted'] as String? ?? 'Rp 0',
      progressPercent: (json['progress_percent'] as num?)?.toDouble() ?? 0.0,
      changePercent: (json['change_percent'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class DealsStats {
  final int totalDeals;
  final int openDeals;
  final int wonDeals;
  final int lostDeals;
  final int totalValue;
  final String totalValueFormatted;
  final double changePercent;

  DealsStats({
    required this.totalDeals,
    required this.openDeals,
    required this.wonDeals,
    required this.lostDeals,
    required this.totalValue,
    required this.totalValueFormatted,
    required this.changePercent,
  });

  factory DealsStats.fromJson(Map<String, dynamic> json) {
    return DealsStats(
      totalDeals: (json['total_deals'] as num?)?.toInt() ?? 0,
      openDeals: (json['open_deals'] as num?)?.toInt() ?? 0,
      wonDeals: (json['won_deals'] as num?)?.toInt() ?? 0,
      lostDeals: (json['lost_deals'] as num?)?.toInt() ?? 0,
      totalValue: (json['total_value'] as num?)?.toInt() ?? 0,
      totalValueFormatted: json['total_value_formatted'] as String? ?? 'Rp 0',
      changePercent: (json['change_percent'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class RevenueStats {
  final int totalRevenue;
  final String totalRevenueFormatted;
  final double changePercent;

  RevenueStats({
    required this.totalRevenue,
    required this.totalRevenueFormatted,
    required this.changePercent,
  });

  factory RevenueStats.fromJson(Map<String, dynamic> json) {
    return RevenueStats(
      totalRevenue: (json['total_revenue'] as num?)?.toInt() ?? 0,
      totalRevenueFormatted: json['total_revenue_formatted'] as String? ?? 'Rp 0',
      changePercent: (json['change_percent'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class LeadsBySource {
  final int total;
  final List<LeadsBySourceEntry> bySource;

  LeadsBySource({
    required this.total,
    required this.bySource,
  });

  factory LeadsBySource.fromJson(Map<String, dynamic> json) {
    return LeadsBySource(
      total: (json['total'] as num?)?.toInt() ?? 0,
      bySource: (json['by_source'] as List<dynamic>?)
              ?.map((e) => LeadsBySourceEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class LeadsBySourceEntry {
  final String source;
  final int count;

  LeadsBySourceEntry({
    required this.source,
    required this.count,
  });

  factory LeadsBySourceEntry.fromJson(Map<String, dynamic> json) {
    return LeadsBySourceEntry(
      source: json['source'] as String? ?? 'other',
      count: (json['count'] as num?)?.toInt() ?? 0,
    );
  }
}

class DashboardTaskSummary {
  final String id;
  final String title;
  final String priority;
  final String status;
  final DateTime? dueDate;

  DashboardTaskSummary({
    required this.id,
    required this.title,
    required this.priority,
    required this.status,
    this.dueDate,
  });

  factory DashboardTaskSummary.fromJson(Map<String, dynamic> json) {
    return DashboardTaskSummary(
      id: json['id'] as String,
      title: json['title'] as String,
      priority: json['priority'] as String,
      status: json['status'] as String,
      dueDate: json['due_date'] != null
          ? DateTime.parse(json['due_date'] as String)
          : null,
    );
  }
}

class DashboardPipelineStageSummary {
  final String stageId;
  final String stageName;
  final String stageCode;
  final int dealCount;
  final double percentage;

  DashboardPipelineStageSummary({
    required this.stageId,
    required this.stageName,
    required this.stageCode,
    required this.dealCount,
    required this.percentage,
  });

  factory DashboardPipelineStageSummary.fromJson(Map<String, dynamic> json) {
    return DashboardPipelineStageSummary(
      stageId: json['stage_id'] as String,
      stageName: json['stage_name'] as String,
      stageCode: json['stage_code'] as String,
      dealCount: (json['deal_count'] as num?)?.toInt() ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class RecentActivity {
  final String id;
  final String type;
  final String description;
  final ActivityAccount? account;
  final ActivityContact? contact;
  final ActivityUser user;
  final DateTime timestamp;

  RecentActivity({
    required this.id,
    required this.type,
    required this.description,
    this.account,
    this.contact,
    required this.user,
    required this.timestamp,
  });

  factory RecentActivity.fromJson(Map<String, dynamic> json) {
    return RecentActivity(
      id: json['id'] as String,
      type: json['type'] as String,
      description: json['description'] as String,
      account: json['account'] != null
          ? ActivityAccount.fromJson(json['account'] as Map<String, dynamic>)
          : null,
      contact: json['contact'] != null
          ? ActivityContact.fromJson(json['contact'] as Map<String, dynamic>)
          : null,
      user: ActivityUser.fromJson(json['user'] as Map<String, dynamic>),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

class ActivityAccount {
  final String id;
  final String name;

  ActivityAccount({
    required this.id,
    required this.name,
  });

  factory ActivityAccount.fromJson(Map<String, dynamic> json) {
    return ActivityAccount(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

class ActivityContact {
  final String id;
  final String name;

  ActivityContact({
    required this.id,
    required this.name,
  });

  factory ActivityContact.fromJson(Map<String, dynamic> json) {
    return ActivityContact(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

class ActivityUser {
  final String id;
  final String name;

  ActivityUser({
    required this.id,
    required this.name,
  });

  factory ActivityUser.fromJson(Map<String, dynamic> json) {
    return ActivityUser(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

