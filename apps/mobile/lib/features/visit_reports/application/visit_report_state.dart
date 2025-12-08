import '../data/models/visit_report.dart';

class VisitReportListState {
  const VisitReportListState({
    this.visitReports = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.pagination,
    this.searchQuery = '',
  });

  final List<VisitReport> visitReports;
  final bool isLoading;
  final bool isLoadingMore;
  final String? errorMessage;
  final Pagination? pagination;
  final String searchQuery;

  VisitReportListState copyWith({
    List<VisitReport>? visitReports,
    bool? isLoading,
    bool? isLoadingMore,
    String? errorMessage,
    Pagination? pagination,
    String? searchQuery,
    bool clearVisitReports = false,
  }) {
    return VisitReportListState(
      visitReports: clearVisitReports
          ? const []
          : (visitReports ?? this.visitReports),
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: errorMessage,
      pagination: pagination ?? this.pagination,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class VisitReportFormState {
  const VisitReportFormState({
    this.isLoading = false,
    this.errorMessage,
    this.isSubmitting = false,
  });

  final bool isLoading;
  final String? errorMessage;
  final bool isSubmitting;

  VisitReportFormState copyWith({
    bool? isLoading,
    String? errorMessage,
    bool? isSubmitting,
  }) {
    return VisitReportFormState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}

