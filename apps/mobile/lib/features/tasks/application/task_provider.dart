import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/models/task.dart';
import '../data/task_repository.dart';
import 'task_state.dart';

final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  return TaskRepository(ApiClient.dio);
});

final taskListProvider =
    StateNotifierProvider<TaskListNotifier, TaskListState>((ref) {
  final repository = ref.read(taskRepositoryProvider);
  return TaskListNotifier(repository);
});

final taskDetailProvider =
    FutureProvider.family<Task, String>((ref, id) async {
  final repository = ref.read(taskRepositoryProvider);
  return repository.getTaskById(id);
});

final taskFormProvider =
    StateNotifierProvider<TaskFormNotifier, TaskFormState>((ref) {
  final repository = ref.read(taskRepositoryProvider);
  return TaskFormNotifier(repository, ref);
});

class TaskListNotifier extends StateNotifier<TaskListState> {
  TaskListNotifier(this._repository) : super(const TaskListState());

  final TaskRepository _repository;

  Future<void> loadTasks({
    int page = 1,
    bool refresh = false,
    String? search,
    String? status,
    String? priority,
  }) async {
    if (refresh || page == 1) {
      state = state.copyWith(isLoading: true, errorMessage: null);
    } else {
      state = state.copyWith(isLoading: true);
    }

    try {
      final searchQuery = search ?? state.searchQuery;
      final statusFilter = status ?? state.selectedStatus;
      final priorityFilter = priority ?? state.selectedPriority;

      final response = await _repository.getTasks(
        page: page,
        perPage: 20,
        search: searchQuery.isNotEmpty ? searchQuery : null,
        status: statusFilter,
        priority: priorityFilter,
      );

      if (refresh || page == 1) {
        state = state.copyWith(
          tasks: response.items,
          pagination: response.pagination,
          searchQuery: searchQuery,
          selectedStatus: statusFilter,
          selectedPriority: priorityFilter,
          isLoading: false,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          tasks: [...state.tasks, ...response.items],
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
    await loadTasks(page: 1, refresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoading) return;
    final pagination = state.pagination;
    if (pagination == null || !pagination.hasNextPage) return;

    await loadTasks(page: pagination.page + 1);
  }

  void updateSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void updateStatusFilter(String? status) {
    state = state.copyWith(selectedStatus: status);
    loadTasks(page: 1, refresh: true, status: status);
  }

  void updatePriorityFilter(String? priority) {
    state = state.copyWith(selectedPriority: priority);
    loadTasks(page: 1, refresh: true, priority: priority);
  }

  void clearFilters() {
    state = state.copyWith(
      selectedStatus: null,
      selectedPriority: null,
      searchQuery: '',
    );
    loadTasks(page: 1, refresh: true);
  }
}

class TaskFormNotifier extends StateNotifier<TaskFormState> {
  TaskFormNotifier(this._repository, this._ref) : super(const TaskFormState());

  final TaskRepository _repository;
  final Ref _ref;

  Future<Task?> createTask({
    required String title,
    String? description,
    required String type,
    required String priority,
    DateTime? dueDate,
    String? accountId,
    String? contactId,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final task = await _repository.createTask(
        title: title,
        description: description,
        type: type,
        priority: priority,
        dueDate: dueDate,
        accountId: accountId,
        contactId: contactId,
      );

      // Invalidate task list to refresh
      _ref.invalidate(taskListProvider);

      state = state.copyWith(isLoading: false);
      return task;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<Task?> updateTask({
    required String id,
    String? title,
    String? description,
    String? type,
    String? priority,
    String? status,
    DateTime? dueDate,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final task = await _repository.updateTask(
        id: id,
        title: title,
        description: description,
        type: type,
        priority: priority,
        status: status,
        dueDate: dueDate,
      );

      // Invalidate providers to refresh
      _ref.invalidate(taskDetailProvider(id));
      _ref.invalidate(taskListProvider);

      state = state.copyWith(isLoading: false);
      return task;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<bool> completeTask(String id) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      await _repository.completeTask(id);

      // Invalidate providers to refresh
      _ref.invalidate(taskDetailProvider(id));
      _ref.invalidate(taskListProvider);

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

  Future<bool> deleteTask(String id) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      await _repository.deleteTask(id);

      // Invalidate task list to refresh
      _ref.invalidate(taskListProvider);
      
      // Also invalidate task detail if it exists
      _ref.invalidate(taskDetailProvider(id));

      state = state.copyWith(isLoading: false);
      return true;
    } catch (e) {
      String errorMessage = 'Failed to delete task';
      if (e is Exception) {
        errorMessage = e.toString().replaceFirst('Exception: ', '');
      } else {
        errorMessage = e.toString();
      }
      state = state.copyWith(
        isLoading: false,
        errorMessage: errorMessage,
      );
      return false;
    }
  }

  Future<Reminder?> createReminder({
    required String taskId,
    required DateTime remindAt,
    String reminderType = 'in_app',
    String? message,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final reminder = await _repository.createReminder(
        taskId: taskId,
        remindAt: remindAt,
        reminderType: reminderType,
        message: message,
      );

      // Invalidate task detail to refresh
      _ref.invalidate(taskDetailProvider(taskId));

      state = state.copyWith(isLoading: false);
      return reminder;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<bool> deleteReminder(String id, String taskId) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      await _repository.deleteReminder(id);

      // Invalidate task detail to refresh
      _ref.invalidate(taskDetailProvider(taskId));

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

