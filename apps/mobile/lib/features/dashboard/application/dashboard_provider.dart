import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/dashboard_repository.dart';
import 'dashboard_state.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  return DashboardRepository();
});

final dashboardProvider =
    StateNotifierProvider<DashboardNotifier, DashboardState>((ref) {
  final repository = ref.watch(dashboardRepositoryProvider);
  return DashboardNotifier(repository);
});

class DashboardNotifier extends StateNotifier<DashboardState> {
  final DashboardRepository _repository;

  DashboardNotifier(this._repository) : super(DashboardState()) {
    loadDashboard();
  }

  Future<void> loadDashboard({String? period}) async {
    final selectedPeriod = period ?? state.selectedPeriod;
    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
      selectedPeriod: selectedPeriod,
    );

    try {
      final overview = await _repository.getOverview(period: selectedPeriod);
      final recentActivities = await _repository.getRecentActivities(limit: 10);
      final topAccounts = await _repository.getTopAccounts(period: selectedPeriod, limit: 5);
      final topSalesReps = await _repository.getTopSalesRep(period: selectedPeriod, limit: 5);
      final visitStatistics = await _repository.getVisitStatistics(period: selectedPeriod);
      final activityTrends = await _repository.getActivityTrends(period: selectedPeriod);

      state = state.copyWith(
        overview: overview,
        recentActivities: recentActivities,
        topAccounts: topAccounts,
        topSalesReps: topSalesReps,
        visitStatistics: visitStatistics,
        activityTrends: activityTrends,
        isLoading: false,
        errorMessage: null,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> refresh() async {
    await loadDashboard();
  }

  Future<void> changePeriod(String period) async {
    await loadDashboard(period: period);
  }
}

