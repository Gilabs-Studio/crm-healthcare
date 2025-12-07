import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/dashboard_repository.dart';
import '../data/models/dashboard.dart';
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
      // Load overview first as it's the most critical
      final overview = await _repository.getOverview(period: selectedPeriod);
      
      // Load other data, handle errors individually so one failure doesn't break everything
      List<RecentActivity>? recentActivities;
      List<TopAccount>? topAccounts;
      List<TopSalesRep>? topSalesReps;
      VisitStatistics? visitStatistics;
      ActivityTrends? activityTrends;

      try {
        recentActivities = await _repository.getRecentActivities(limit: 10);
      } catch (e) {
        print('Error loading recent activities: $e');
        recentActivities = [];
      }

      try {
        topAccounts = await _repository.getTopAccounts(period: selectedPeriod, limit: 5);
      } catch (e) {
        print('Error loading top accounts: $e');
        topAccounts = [];
      }

      try {
        topSalesReps = await _repository.getTopSalesRep(period: selectedPeriod, limit: 5);
      } catch (e) {
        print('Error loading top sales rep: $e');
        topSalesReps = [];
      }

      try {
        visitStatistics = await _repository.getVisitStatistics(period: selectedPeriod);
      } catch (e) {
        print('Error loading visit statistics: $e');
      }

      try {
        activityTrends = await _repository.getActivityTrends(period: selectedPeriod);
      } catch (e) {
        print('Error loading activity trends: $e');
      }

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
    } catch (e, stackTrace) {
      print('Dashboard load error: $e');
      print('Stack trace: $stackTrace');
      final errorMessage = _extractErrorMessage(e);
      print('Extracted error message: $errorMessage');
      state = state.copyWith(
        isLoading: false,
        errorMessage: errorMessage,
      );
    }
  }

  String _extractErrorMessage(dynamic error) {
    if (error is DioException) {
      // Handle timeout errors
      if (error.type == DioExceptionType.receiveTimeout ||
          error.type == DioExceptionType.sendTimeout ||
          error.type == DioExceptionType.connectionTimeout) {
        return 'Connection timeout. Please check your internet connection and try again.';
      }
      
      // Handle connection errors
      if (error.type == DioExceptionType.connectionError) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
      
      if (error.response != null) {
        final responseData = error.response!.data;
        if (responseData is Map<String, dynamic> && responseData['error'] != null) {
          final errorObj = responseData['error'] as Map<String, dynamic>;
          final message = errorObj['message'] as String?;
          if (message != null && message.isNotEmpty) {
            return message;
          }
        }
        // Check for status code specific messages
        if (error.response!.statusCode == 401) {
          return 'Unauthorized. Please login again.';
        }
        if (error.response!.statusCode == 403) {
          return 'Access forbidden.';
        }
        if (error.response!.statusCode == 404) {
          return 'Resource not found.';
        }
        if (error.response!.statusCode == 500) {
          return 'Server error. Please try again later.';
        }
      }
      
      // Handle error message from DioException
      final errorMessage = error.message ?? '';
      if (errorMessage.contains('timeout') || errorMessage.contains('Timeout')) {
        return 'Connection timeout. Please check your internet connection and try again.';
      }
      if (errorMessage.contains('Failed host lookup') || 
          errorMessage.contains('SocketException')) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
      
      return errorMessage.isNotEmpty 
          ? errorMessage 
          : 'Network error occurred. Please try again.';
    }
    final errorString = error.toString();
    if (errorString.startsWith('Exception: ')) {
      return errorString.substring(11);
    }
    return errorString;
  }

  Future<void> refresh() async {
    await loadDashboard();
  }

  Future<void> changePeriod(String period) async {
    await loadDashboard(period: period);
  }
}

