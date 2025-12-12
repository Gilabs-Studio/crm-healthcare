import '../data/models/dashboard.dart';

class DashboardState {
  final DashboardOverview? overview;
  final List<RecentActivity>? recentActivities;
  final List<TopAccount>? topAccounts;
  final List<TopSalesRep>? topSalesReps;
  final VisitStatistics? visitStatistics;
  final ActivityTrends? activityTrends;
  final bool isLoading;
  final bool isLoadingOverview;
  final bool isLoadingSecondary;
  final bool isLoadingRecentActivities;
  final String? errorMessage;
  final String selectedPeriod;
  final bool isOffline;

  DashboardState({
    this.overview,
    this.recentActivities,
    this.topAccounts,
    this.topSalesReps,
    this.visitStatistics,
    this.activityTrends,
    this.isLoading = false,
    this.isLoadingOverview = false,
    this.isLoadingSecondary = false,
    this.isLoadingRecentActivities = false,
    this.errorMessage,
    this.selectedPeriod = 'today',
    this.isOffline = false,
  });

  DashboardState copyWith({
    DashboardOverview? overview,
    List<RecentActivity>? recentActivities,
    List<TopAccount>? topAccounts,
    List<TopSalesRep>? topSalesReps,
    VisitStatistics? visitStatistics,
    ActivityTrends? activityTrends,
    bool? isLoading,
    bool? isLoadingOverview,
    bool? isLoadingSecondary,
    bool? isLoadingRecentActivities,
    String? errorMessage,
    String? selectedPeriod,
    bool? isOffline,
    bool clearOverview = false,
    bool clearRecentActivities = false,
    bool clearTopAccounts = false,
    bool clearTopSalesReps = false,
    bool clearVisitStatistics = false,
    bool clearActivityTrends = false,
  }) {
    return DashboardState(
      overview: clearOverview ? null : (overview ?? this.overview),
      recentActivities: clearRecentActivities
          ? null
          : (recentActivities ?? this.recentActivities),
      topAccounts: clearTopAccounts ? null : (topAccounts ?? this.topAccounts),
      topSalesReps:
          clearTopSalesReps ? null : (topSalesReps ?? this.topSalesReps),
      visitStatistics: clearVisitStatistics
          ? null
          : (visitStatistics ?? this.visitStatistics),
      activityTrends: clearActivityTrends
          ? null
          : (activityTrends ?? this.activityTrends),
      isLoading: isLoading ?? this.isLoading,
      isLoadingOverview: isLoadingOverview ?? this.isLoadingOverview,
      isLoadingSecondary: isLoadingSecondary ?? this.isLoadingSecondary,
      isLoadingRecentActivities: isLoadingRecentActivities ?? this.isLoadingRecentActivities,
      errorMessage: errorMessage ?? this.errorMessage,
      selectedPeriod: selectedPeriod ?? this.selectedPeriod,
      isOffline: isOffline ?? this.isOffline,
    );
  }
}

