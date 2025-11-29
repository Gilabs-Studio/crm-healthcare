import '../data/models/dashboard.dart';

class DashboardState {
  final DashboardOverview? overview;
  final List<RecentActivity>? recentActivities;
  final bool isLoading;
  final String? errorMessage;
  final String selectedPeriod;

  DashboardState({
    this.overview,
    this.recentActivities,
    this.isLoading = false,
    this.errorMessage,
    this.selectedPeriod = 'today',
  });

  DashboardState copyWith({
    DashboardOverview? overview,
    List<RecentActivity>? recentActivities,
    bool? isLoading,
    String? errorMessage,
    String? selectedPeriod,
  }) {
    return DashboardState(
      overview: overview ?? this.overview,
      recentActivities: recentActivities ?? this.recentActivities,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage ?? this.errorMessage,
      selectedPeriod: selectedPeriod ?? this.selectedPeriod,
    );
  }
}

