import '../data/models/dashboard.dart';

class DashboardState {
  final DashboardOverview? overview;
  final List<RecentActivity>? recentActivities;
  final List<TopAccount>? topAccounts;
  final List<TopSalesRep>? topSalesReps;
  final VisitStatistics? visitStatistics;
  final ActivityTrends? activityTrends;
  final bool isLoading;
  final String? errorMessage;
  final String selectedPeriod;

  DashboardState({
    this.overview,
    this.recentActivities,
    this.topAccounts,
    this.topSalesReps,
    this.visitStatistics,
    this.activityTrends,
    this.isLoading = false,
    this.errorMessage,
    this.selectedPeriod = 'today',
  });

  DashboardState copyWith({
    DashboardOverview? overview,
    List<RecentActivity>? recentActivities,
    List<TopAccount>? topAccounts,
    List<TopSalesRep>? topSalesReps,
    VisitStatistics? visitStatistics,
    ActivityTrends? activityTrends,
    bool? isLoading,
    String? errorMessage,
    String? selectedPeriod,
  }) {
    return DashboardState(
      overview: overview ?? this.overview,
      recentActivities: recentActivities ?? this.recentActivities,
      topAccounts: topAccounts ?? this.topAccounts,
      topSalesReps: topSalesReps ?? this.topSalesReps,
      visitStatistics: visitStatistics ?? this.visitStatistics,
      activityTrends: activityTrends ?? this.activityTrends,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      selectedPeriod: selectedPeriod ?? this.selectedPeriod,
    );
  }
}

