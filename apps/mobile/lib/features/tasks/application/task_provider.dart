import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/cache/list_cache.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/connectivity_service.dart';
import '../data/models/task.dart';
import '../data/task_repository.dart';
import 'task_state.dart';

final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  final connectivity = ref.watch(connectivityServiceProvider);
  return TaskRepository(ApiClient.dio, connectivity);
});

final taskListProvider =
    StateNotifierProvider<TaskListNotifier, TaskListState>((ref) {
  final repository = ref.read(taskRepositoryProvider);
  final connectivity = ref.watch(connectivityServiceProvider);
  return TaskListNotifier(repository, connectivity);
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
  TaskListNotifier(this._repository, this._connectivity)
      : super(const TaskListState());

  final TaskRepository _repository;
  final ConnectivityService _connectivity;
  final ListCache _cache = ListCache();

  Future<void> loadTasks({
    int page = 1,
    bool refresh = false,
    String? search,
    String? status,
    String? priority,
    bool forceRefresh = false,
  }) async {
    final searchQuery = search ?? state.searchQuery;
    final statusFilter = status ?? state.selectedStatus;
    final priorityFilter = priority ?? state.selectedPriority;

    final cacheKey = ListCache.cacheKey(
      'tasks',
      page: page,
      search: searchQuery.isNotEmpty ? searchQuery : null,
      filters: {
        if (statusFilter != null) 'status': statusFilter,
        if (priorityFilter != null) 'priority': priorityFilter,
      },
    );

    // Try to load from cache first (optimistic UI) - only for first page
    if (!forceRefresh && !refresh && page == 1) {
      final cachedTasks = _cache.get<Task>(
        cacheKey,
        ttl: const Duration(seconds: 60),
        expectedMetadata: {
          if (searchQuery.isNotEmpty) 'search': searchQuery,
          if (statusFilter != null) 'status': statusFilter,
          if (priorityFilter != null) 'priority': priorityFilter,
        },
      );

      if (cachedTasks != null && cachedTasks.isNotEmpty) {
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
          tasks: cachedTasks,
          searchQuery: searchQuery,
          selectedStatus: statusFilter,
          selectedPriority: priorityFilter,
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
      final response = await _repository.getTasks(
        page: page,
        perPage: 20,
        search: searchQuery.isNotEmpty ? searchQuery : null,
        status: statusFilter,
        priority: priorityFilter,
        forceRefresh: forceRefresh,
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
          if (statusFilter != null) 'status': statusFilter,
          if (priorityFilter != null) 'priority': priorityFilter,
        },
      );

      if (refresh || page == 1) {
        state = state.copyWith(
          tasks: response.items,
          pagination: response.pagination,
          searchQuery: searchQuery,
          selectedStatus: statusFilter,
          selectedPriority: priorityFilter,
          isLoading: false,
          isLoadingMore: false,
          errorMessage: null,
          isOffline: !_connectivity.isOnline,
        );
      } else {
        state = state.copyWith(
          tasks: [...state.tasks, ...response.items],
          pagination: response.pagination,
          isLoadingMore: false,
          errorMessage: null,
          isOffline: !_connectivity.isOnline,
        );
      }
    } catch (e) {
      // On error, try to use cached data as fallback
      if (page == 1) {
        final cachedTasks = _cache.get<Task>(cacheKey);
        if (cachedTasks != null && cachedTasks.isNotEmpty) {
          state = state.copyWith(
            tasks: cachedTasks,
            isLoading: false,
            isLoadingMore: false,
            errorMessage: null,
            isOffline: !_connectivity.isOnline,
          );
          return;
        }
      }

      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
        isOffline: !_connectivity.isOnline,
      );
    }
  }

  Future<void> refresh() async {
    // Clear cache for tasks
    _cache.clearPrefix('list:tasks');
    await loadTasks(page: 1, refresh: true, forceRefresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoading || state.isLoadingMore) return;
    final pagination = state.pagination;
    if (pagination == null || !pagination.hasNextPage) return;

    await loadTasks(page: pagination.page + 1);
  }

  void updateSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void updateStatusFilter(String? status) {
    state = state.copyWith(selectedStatus: status);
    _cache.clearPrefix('list:tasks');
    loadTasks(page: 1, refresh: true, status: status, forceRefresh: true);
  }

  void updatePriorityFilter(String? priority) {
    state = state.copyWith(selectedPriority: priority);
    _cache.clearPrefix('list:tasks');
    loadTasks(page: 1, refresh: true, priority: priority, forceRefresh: true);
  }

  void clearFilters() {
    state = state.copyWith(
      selectedStatus: null,
      selectedPriority: null,
      searchQuery: '',
    );
    _cache.clearPrefix('list:tasks');
    loadTasks(page: 1, refresh: true, forceRefresh: true);
  }

  /// Clear cache - exposed for TaskFormNotifier
  void clearCache() {
    _cache.clearPrefix('list:tasks');
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

      // Clear cache and invalidate task list to refresh
      _ref.read(taskListProvider.notifier).clearCache();
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

      // Clear cache and invalidate providers to refresh
      _ref.read(taskListProvider.notifier).clearCache();
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

      // Clear cache and invalidate providers to refresh
      _ref.read(taskListProvider.notifier).clearCache();
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

      // Clear cache and invalidate task list to refresh
      _ref.read(taskListProvider.notifier).clearCache();
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

