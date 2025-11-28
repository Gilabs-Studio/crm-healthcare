import '../data/models/task.dart';

class TaskListState {
  const TaskListState({
    this.tasks = const [],
    this.isLoading = false,
    this.errorMessage,
    this.pagination,
    this.searchQuery = '',
    this.selectedStatus,
    this.selectedPriority,
  });

  final List<Task> tasks;
  final bool isLoading;
  final String? errorMessage;
  final Pagination? pagination;
  final String searchQuery;
  final String? selectedStatus;
  final String? selectedPriority;

  TaskListState copyWith({
    List<Task>? tasks,
    bool? isLoading,
    String? errorMessage,
    Pagination? pagination,
    String? searchQuery,
    String? selectedStatus,
    String? selectedPriority,
  }) {
    return TaskListState(
      tasks: tasks ?? this.tasks,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      pagination: pagination ?? this.pagination,
      searchQuery: searchQuery ?? this.searchQuery,
      selectedStatus: selectedStatus,
      selectedPriority: selectedPriority,
    );
  }
}

class TaskFormState {
  const TaskFormState({
    this.isLoading = false,
    this.errorMessage,
  });

  final bool isLoading;
  final String? errorMessage;

  TaskFormState copyWith({
    bool? isLoading,
    String? errorMessage,
  }) {
    return TaskFormState(
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}

