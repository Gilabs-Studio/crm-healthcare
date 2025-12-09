import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/dashboard_cache.dart';
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
  final DashboardCache _cache = DashboardCache();

  DashboardNotifier(this._repository) : super(DashboardState()) {
    loadDashboard();
  }

  /// Load dashboard with optimizations:
  /// 1. Check cache first (optimistic UI)
  /// 2. Load overview first (progressive loading)
  /// 3. Load secondary data in parallel
  Future<void> loadDashboard({String? period, bool forceRefresh = false}) async {
    final selectedPeriod = period ?? state.selectedPeriod;
    
    // Clear cache if period changed
    if (state.selectedPeriod != selectedPeriod) {
      _cache.clearPeriod(state.selectedPeriod);
    }

    // Try to load from cache first (optimistic UI)
    if (!forceRefresh) {
      final cachedOverview = _cache.get<DashboardOverview>(
        DashboardCache.cacheKey('overview', selectedPeriod),
        ttl: const Duration(seconds: 30),
      );
      final cachedRecentActivities = _cache.get<List<RecentActivity>>(
        DashboardCache.cacheKey('recent-activities', selectedPeriod),
        ttl: const Duration(seconds: 60),
      );
      final cachedVisitStatistics = _cache.get<VisitStatistics>(
        DashboardCache.cacheKey('visit-statistics', selectedPeriod),
        ttl: const Duration(seconds: 60),
      );
      final cachedActivityTrends = _cache.get<ActivityTrends>(
        DashboardCache.cacheKey('activity-trends', selectedPeriod),
        ttl: const Duration(seconds: 60),
      );

      // If we have cached data, show it immediately
      if (cachedOverview != null) {
        state = state.copyWith(
          overview: cachedOverview,
          recentActivities: cachedRecentActivities,
          visitStatistics: cachedVisitStatistics,
          activityTrends: cachedActivityTrends,
          selectedPeriod: selectedPeriod,
          isLoading: false,
          isLoadingOverview: false,
          isLoadingSecondary: false,
        );
      }
    }

    // Set loading state
    state = state.copyWith(
      isLoading: true,
      isLoadingOverview: true,
      isLoadingSecondary: true,
      errorMessage: null,
      selectedPeriod: selectedPeriod,
    );

    try {
      // Phase 1: Load overview first (critical data) - Progressive Loading
      DashboardOverview? overview;
      try {
        overview = await _repository.getOverview(period: selectedPeriod);
        _cache.set(
          DashboardCache.cacheKey('overview', selectedPeriod),
          overview,
        );
        
        // Update state with overview immediately
        state = state.copyWith(
          overview: overview,
          isLoadingOverview: false,
        );
      } catch (e) {
        print('Error loading overview: $e');
        // If overview fails, try to use cached data
        final cachedOverview = _cache.get<DashboardOverview>(
          DashboardCache.cacheKey('overview', selectedPeriod),
        );
        if (cachedOverview != null) {
          overview = cachedOverview;
          state = state.copyWith(
            overview: cachedOverview,
            isLoadingOverview: false,
          );
        } else {
          throw e;
        }
      }

      // Phase 2: Load secondary data in parallel - Parallel Loading
      // Only load data that's still used in the dashboard
      final secondaryDataResults = await Future.wait([
        _loadRecentActivities(selectedPeriod),
        _loadVisitStatistics(selectedPeriod),
        _loadActivityTrends(selectedPeriod),
      ], eagerError: false);

      // Update state with all secondary data
      state = state.copyWith(
        recentActivities: secondaryDataResults[0] as List<RecentActivity>?,
        visitStatistics: secondaryDataResults[1] as VisitStatistics?,
        activityTrends: secondaryDataResults[2] as ActivityTrends?,
        isLoading: false,
        isLoadingSecondary: false,
        errorMessage: null,
      );
    } catch (e, stackTrace) {
      print('Dashboard load error: $e');
      print('Stack trace: $stackTrace');
      final errorMessage = _extractErrorMessage(e);
      print('Extracted error message: $errorMessage');
      state = state.copyWith(
        isLoading: false,
        isLoadingOverview: false,
        isLoadingSecondary: false,
        errorMessage: errorMessage,
      );
    }
  }

  Future<List<RecentActivity>?> _loadRecentActivities(String period) async {
    try {
      final data = await _repository.getRecentActivities(limit: 10);
      _cache.set(
        DashboardCache.cacheKey('recent-activities', period),
        data,
      );
      return data;
    } catch (e) {
      print('Error loading recent activities: $e');
      // Try cache as fallback
      return _cache.get<List<RecentActivity>>(
        DashboardCache.cacheKey('recent-activities', period),
      );
    }
  }

  Future<VisitStatistics?> _loadVisitStatistics(String period) async {
    try {
      final data = await _repository.getVisitStatistics(period: period);
      _cache.set(
        DashboardCache.cacheKey('visit-statistics', period),
        data,
      );
      return data;
    } catch (e) {
      print('Error loading visit statistics: $e');
      return _cache.get<VisitStatistics>(
        DashboardCache.cacheKey('visit-statistics', period),
      );
    }
  }

  Future<ActivityTrends?> _loadActivityTrends(String period) async {
    try {
      final data = await _repository.getActivityTrends(period: period);
      _cache.set(
        DashboardCache.cacheKey('activity-trends', period),
        data,
      );
      return data;
    } catch (e) {
      print('Error loading activity trends: $e');
      return _cache.get<ActivityTrends>(
        DashboardCache.cacheKey('activity-trends', period),
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
    await loadDashboard(forceRefresh: true);
  }

  Future<void> changePeriod(String period) async {
    await loadDashboard(period: period, forceRefresh: true);
  }
}

