import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

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

  Future<void> loadVisitReports({
    int page = 1,
    bool refresh = false,
    String? search,
  }) async {
    if (refresh) {
      state = state.copyWith(isLoading: true, errorMessage: null);
    } else {
      state = state.copyWith(isLoading: true);
    }

    try {
      final searchQuery = search ?? state.searchQuery;
      final response = await _repository.getVisitReports(
        page: page,
        perPage: 20,
        search: searchQuery.isNotEmpty ? searchQuery : null,
      );

      if (refresh || page == 1) {
        state = state.copyWith(
          visitReports: response.items,
          pagination: response.pagination,
          searchQuery: searchQuery,
          isLoading: false,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          visitReports: [...state.visitReports, ...response.items],
          pagination: response.pagination,
          isLoading: false,
          errorMessage: null,
        );
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> refresh() async {
    await loadVisitReports(page: 1, refresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoading) return;
    final pagination = state.pagination;
    if (pagination == null || !pagination.hasNextPage) return;

    await loadVisitReports(page: pagination.page + 1);
  }

  void updateSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
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

