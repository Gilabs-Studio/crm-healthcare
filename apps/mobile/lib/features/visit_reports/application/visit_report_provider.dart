import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/cache/list_cache.dart';
import '../../../core/network/api_client.dart';
import '../data/visit_report_repository.dart';
import '../data/models/visit_report.dart';
import 'visit_report_state.dart';

final visitReportRepositoryProvider =
    Provider<VisitReportRepository>((ref) {
  return VisitReportRepository(ApiClient.dio);
});

final visitReportListProvider =
    StateNotifierProvider<VisitReportListNotifier, VisitReportListState>(
  (ref) {
    final repository = ref.read(visitReportRepositoryProvider);
    return VisitReportListNotifier(repository);
  },
);

final visitReportDetailProvider =
    FutureProvider.family<VisitReport, String>((ref, id) async {
  final repository = ref.read(visitReportRepositoryProvider);
  return repository.getVisitReportById(id);
});

final visitReportFormProvider =
    StateNotifierProvider<VisitReportFormNotifier, VisitReportFormState>(
  (ref) {
    final repository = ref.read(visitReportRepositoryProvider);
    return VisitReportFormNotifier(repository, ref);
  },
);

class VisitReportListNotifier extends StateNotifier<VisitReportListState> {
  VisitReportListNotifier(this._repository)
      : super(const VisitReportListState());

  final VisitReportRepository _repository;
  final ListCache _cache = ListCache();

  Future<void> loadVisitReports({
    int page = 1,
    bool refresh = false,
    String? search,
    bool forceRefresh = false,
  }) async {
    final searchQuery = search ?? state.searchQuery;
    final cacheKey = ListCache.cacheKey(
      'visit-reports',
      page: page,
      search: searchQuery.isNotEmpty ? searchQuery : null,
    );

    // Try to load from cache first (optimistic UI) - only for first page
    if (!forceRefresh && !refresh && page == 1) {
      final cachedVisitReports = _cache.get<VisitReport>(
        cacheKey,
        ttl: const Duration(seconds: 60),
        expectedMetadata: searchQuery.isNotEmpty
            ? {'search': searchQuery}
            : null,
      );

      if (cachedVisitReports != null && cachedVisitReports.isNotEmpty) {
        // Show cached data immediately
        final cachedMetadata = _cache.getMetadata(cacheKey);
        Pagination? cachedPagination;
        if (cachedMetadata?['pagination'] != null) {
          try {
            cachedPagination = Pagination.fromJson(
              cachedMetadata!['pagination'] as Map<String, dynamic>,
            );
          } catch (e) {
            // Ignore pagination parsing error
          }
        }
        state = state.copyWith(
          visitReports: cachedVisitReports,
          searchQuery: searchQuery,
          isLoading: false,
          isLoadingMore: false,
          errorMessage: null,
          pagination: cachedPagination,
        );
      }
    }

    // Set loading state
    if (refresh || page == 1) {
      state = state.copyWith(
        isLoading: true,
        isLoadingMore: false,
        errorMessage: null,
      );
    } else {
      state = state.copyWith(isLoadingMore: true);
    }

    try {
      final response = await _repository.getVisitReports(
        page: page,
        perPage: 20,
        search: searchQuery.isNotEmpty ? searchQuery : null,
      );

      // Cache the response
      _cache.set(
        cacheKey,
        response.items,
        metadata: {
          'pagination': {
            'page': response.pagination.page,
            'perPage': response.pagination.perPage,
            'total': response.pagination.total,
            'totalPages': response.pagination.totalPages,
          },
          'search': searchQuery,
        },
      );

      if (refresh || page == 1) {
        state = state.copyWith(
          visitReports: response.items,
          pagination: response.pagination,
          searchQuery: searchQuery,
          isLoading: false,
          isLoadingMore: false,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          visitReports: [...state.visitReports, ...response.items],
          pagination: response.pagination,
          isLoadingMore: false,
          errorMessage: null,
        );
      }
    } catch (e) {
      // On error, try to use cached data as fallback
      if (page == 1) {
        final cachedVisitReports = _cache.get<VisitReport>(cacheKey);
        if (cachedVisitReports != null && cachedVisitReports.isNotEmpty) {
          state = state.copyWith(
            visitReports: cachedVisitReports,
            isLoading: false,
            isLoadingMore: false,
            errorMessage: null,
          );
          return;
        }
      }

      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> refresh() async {
    // Clear cache for visit reports
    _cache.clearPrefix('list:visit-reports');
    await loadVisitReports(page: 1, refresh: true, forceRefresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoading || state.isLoadingMore) return;
    final pagination = state.pagination;
    if (pagination == null || !pagination.hasNextPage) return;

    await loadVisitReports(page: pagination.page + 1);
  }

  void updateSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  /// Clear cache - exposed for VisitReportFormNotifier
  void clearCache() {
    _cache.clearPrefix('list:visit-reports');
  }
}

class VisitReportFormNotifier
    extends StateNotifier<VisitReportFormState> {
  VisitReportFormNotifier(this._repository, this._ref)
      : super(const VisitReportFormState());

  final VisitReportRepository _repository;
  final Ref _ref;

  Future<VisitReport?> createVisitReport({
    required String accountId,
    String? contactId,
    required String visitDate,
    String? purpose,
    String? notes,
  }) async {
    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      final visitReport = await _repository.createVisitReport(
        accountId: accountId,
        contactId: contactId,
        visitDate: visitDate,
        purpose: purpose,
        notes: notes,
      );

      state = state.copyWith(isSubmitting: false);
      // Clear cache and refresh list
      _ref.read(visitReportListProvider.notifier).clearCache();
      _ref.read(visitReportListProvider.notifier).refresh();
      return visitReport;
    } catch (e) {
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<VisitReport?> checkIn({
    required String visitReportId,
    required double latitude,
    required double longitude,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final visitReport = await _repository.checkIn(
        visitReportId: visitReportId,
        latitude: latitude,
        longitude: longitude,
      );

      // Invalidate detail provider to refresh
      _ref.invalidate(visitReportDetailProvider(visitReportId));

      state = state.copyWith(isLoading: false);
      return visitReport;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<VisitReport?> checkOut({
    required String visitReportId,
    required double latitude,
    required double longitude,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final visitReport = await _repository.checkOut(
        visitReportId: visitReportId,
        latitude: latitude,
        longitude: longitude,
      );

      // Invalidate detail provider to refresh
      _ref.invalidate(visitReportDetailProvider(visitReportId));

      state = state.copyWith(isLoading: false);
      return visitReport;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<bool> uploadPhoto({
    required String visitReportId,
    required File photoFile,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      await _repository.uploadPhoto(
        visitReportId: visitReportId,
        photoFile: photoFile,
      );

      // Invalidate detail provider to refresh
      _ref.invalidate(visitReportDetailProvider(visitReportId));

      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return false;
    }
  }
}

