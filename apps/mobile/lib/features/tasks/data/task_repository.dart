import 'package:dio/dio.dart';

import '../../../core/network/connectivity_service.dart';
import '../../../core/storage/offline_storage.dart';
import 'models/task.dart';

class TaskRepository {
  TaskRepository(this._dio, this._connectivity);

  final Dio _dio;
  final ConnectivityService _connectivity;

  Future<TaskListResponse> getTasks({
    int page = 1,
    int perPage = 20,
    String? search,
    String? status,
    String? priority,
    String? type,
    String? assignedTo,
    String? accountId,
    String? contactId,
    DateTime? dueDateFrom,
    DateTime? dueDateTo,
    bool forceRefresh = false,
  }) async {
    // 1. Try to load from cache first (offline-first) - only for first page and no filters
    if (!forceRefresh && page == 1 && (search == null || search.isEmpty) && 
        status == null && priority == null && accountId == null && contactId == null) {
      final cachedTasks = await OfflineStorage.getTasks();
      if (cachedTasks != null && cachedTasks.isNotEmpty) {
        try {
          final tasks = cachedTasks
              .map((json) => Task.fromJson(json))
              .toList();
          return TaskListResponse(
            items: tasks,
            pagination: Pagination(
              page: 1,
              perPage: tasks.length,
              total: tasks.length,
              totalPages: 1,
            ),
          );
        } catch (e) {
          // If parsing fails, continue to API call
        }
      }
    }

    // 2. If online, fetch from API
    if (_connectivity.isOnline) {
      try {
        final queryParams = <String, dynamic>{
          'page': page,
          'per_page': perPage,
        };

        if (search != null && search.isNotEmpty) {
          queryParams['search'] = search;
        }
        if (status != null && status.isNotEmpty) {
          queryParams['status'] = status;
        }
        if (priority != null && priority.isNotEmpty) {
          queryParams['priority'] = priority;
        }
        if (type != null && type.isNotEmpty) {
          queryParams['type'] = type;
        }
        if (assignedTo != null && assignedTo.isNotEmpty) {
          queryParams['assigned_to'] = assignedTo;
        }
        if (accountId != null && accountId.isNotEmpty) {
          queryParams['account_id'] = accountId;
        }
        if (contactId != null && contactId.isNotEmpty) {
          queryParams['contact_id'] = contactId;
        }
        if (dueDateFrom != null) {
          queryParams['due_date_from'] = dueDateFrom.toIso8601String();
        }
        if (dueDateTo != null) {
          queryParams['due_date_to'] = dueDateTo.toIso8601String();
        }

        final response = await _dio.get(
          '/api/v1/tasks',
          queryParameters: queryParams,
        );

        if (response.data is Map<String, dynamic>) {
          final responseData = response.data as Map<String, dynamic>;
          if (responseData['success'] == true) {
            final taskListResponse = TaskListResponse.fromJson(responseData);
            
            // 3. Save to cache (only for first page and no filters)
            if (page == 1 && (search == null || search.isEmpty) && 
                status == null && priority == null && accountId == null && contactId == null) {
              final tasksJson = taskListResponse.items
                  .map((task) => task.toJson())
                  .toList();
              await OfflineStorage.saveTasks(tasksJson);
            }
            
            return taskListResponse;
          } else {
            throw Exception(
              responseData['error']?['message'] ?? 'Failed to fetch tasks',
            );
          }
        } else {
          throw Exception('Invalid response format');
        }
      } on DioException catch (e) {
        // If API fails, try to return cached data if available
        if (page == 1 && (search == null || search.isEmpty) && 
            status == null && priority == null && accountId == null && contactId == null) {
          final cachedTasks = await OfflineStorage.getTasks();
          if (cachedTasks != null && cachedTasks.isNotEmpty) {
            try {
              final tasks = cachedTasks
                  .map((json) => Task.fromJson(json))
                  .toList();
              return TaskListResponse(
                items: tasks,
                pagination: Pagination(
                  page: 1,
                  perPage: tasks.length,
                  total: tasks.length,
                  totalPages: 1,
                ),
              );
            } catch (_) {
              // Ignore parsing errors
            }
          }
        }
        
        if (e.response != null) {
          final errorData = e.response!.data;
          throw Exception(
            errorData['error']?['message'] ?? 'Failed to fetch tasks',
          );
        } else {
          throw Exception('Network error: ${e.message}');
        }
      } catch (e) {
        // If other error, try cached data
        if (page == 1 && (search == null || search.isEmpty) && 
            status == null && priority == null && accountId == null && contactId == null) {
          final cachedTasks = await OfflineStorage.getTasks();
          if (cachedTasks != null && cachedTasks.isNotEmpty) {
            try {
              final tasks = cachedTasks
                  .map((json) => Task.fromJson(json))
                  .toList();
              return TaskListResponse(
                items: tasks,
                pagination: Pagination(
                  page: 1,
                  perPage: tasks.length,
                  total: tasks.length,
                  totalPages: 1,
                ),
              );
            } catch (_) {
              // Ignore parsing errors
            }
          }
        }
        throw Exception('Failed to fetch tasks: $e');
      }
    }

    // 4. Offline: return cached data or throw error
    if (page == 1 && (search == null || search.isEmpty) && 
        status == null && priority == null && accountId == null && contactId == null) {
      final cachedTasks = await OfflineStorage.getTasks();
      if (cachedTasks != null && cachedTasks.isNotEmpty) {
        try {
          final tasks = cachedTasks
              .map((json) => Task.fromJson(json))
              .toList();
          return TaskListResponse(
            items: tasks,
            pagination: Pagination(
              page: 1,
              perPage: tasks.length,
              total: tasks.length,
              totalPages: 1,
            ),
          );
        } catch (e) {
          throw Exception('Failed to load cached tasks: $e');
        }
      }
    }
    
    throw Exception('No internet connection and no cached data available');
  }

  Future<Task> getTaskById(String id) async {
    // 1. Try to load from cache first (offline-first)
    final cachedTask = await OfflineStorage.getTaskDetail(id);
    if (cachedTask != null) {
      try {
        final task = Task.fromJson(cachedTask);
        // If online, fetch from API in background to update cache
        if (_connectivity.isOnline) {
          _fetchAndUpdateTaskDetail(id).catchError((_) {
            // Ignore errors, use cached data
          });
        }
        return task;
      } catch (e) {
        // If parsing fails, continue to API call
      }
    }

    // 2. If online, fetch from API
    if (_connectivity.isOnline) {
      try {
        final response = await _dio.get('/api/v1/tasks/$id');

        if (response.data is Map<String, dynamic>) {
          final responseData = response.data as Map<String, dynamic>;
          if (responseData['success'] == true) {
            final task = Task.fromJson(
              responseData['data'] as Map<String, dynamic>,
            );
            
            // 3. Save to cache
            await OfflineStorage.saveTaskDetail(id, task.toJson());
            
            return task;
          } else {
            throw Exception(
              responseData['error']?['message'] ?? 'Failed to fetch task',
            );
          }
        } else {
          throw Exception('Invalid response format');
        }
      } on DioException catch (e) {
        // If API fails, try to return cached data if available
        if (cachedTask != null) {
          try {
            return Task.fromJson(cachedTask);
          } catch (_) {
            // Ignore parsing errors
          }
        }
        
        if (e.response != null) {
          final errorData = e.response!.data;
          throw Exception(
            errorData['error']?['message'] ?? 'Failed to fetch task',
          );
        } else {
          throw Exception('Network error: ${e.message}');
        }
      } catch (e) {
        // If other error, try cached data
        if (cachedTask != null) {
          try {
            return Task.fromJson(cachedTask);
          } catch (_) {
            // Ignore parsing errors
          }
        }
        throw Exception('Failed to fetch task: $e');
      }
    }

    // 4. Offline: return cached data or throw error
    if (cachedTask != null) {
      try {
        return Task.fromJson(cachedTask);
      } catch (e) {
        throw Exception('Failed to load cached task: $e');
      }
    }
    
    throw Exception('No internet connection and no cached data available');
  }

  /// Fetch task detail from API and update cache (background operation)
  Future<void> _fetchAndUpdateTaskDetail(String id) async {
    try {
      final response = await _dio.get('/api/v1/tasks/$id');
      if (response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          final task = Task.fromJson(
            responseData['data'] as Map<String, dynamic>,
          );
          await OfflineStorage.saveTaskDetail(id, task.toJson());
        }
      }
    } catch (_) {
      // Ignore errors in background operation
    }
  }

  Future<Task> createTask({
    required String title,
    String? description,
    required String type,
    required String priority,
    DateTime? dueDate,
    String? accountId,
    String? contactId,
    String? dealId,
  }) async {
    try {
      // Build request data - only include non-null and non-empty values
      final data = <String, dynamic>{
        'title': title.trim(),
        'type': type,
        'priority': priority,
      };

      // Add description only if provided and not empty
      if (description != null && description.trim().isNotEmpty) {
        data['description'] = description.trim();
      }

      // Format due_date in ISO8601 format with timezone offset
      // Example: "2024-01-20T10:00:00+07:00"
      if (dueDate != null) {
        final localDate = dueDate.toLocal();
        final offset = localDate.timeZoneOffset;
        
        // Format: YYYY-MM-DDTHH:mm:ss+HH:mm or -HH:mm
        final year = localDate.year.toString().padLeft(4, '0');
        final month = localDate.month.toString().padLeft(2, '0');
        final day = localDate.day.toString().padLeft(2, '0');
        final hour = localDate.hour.toString().padLeft(2, '0');
        final minute = localDate.minute.toString().padLeft(2, '0');
        final second = localDate.second.toString().padLeft(2, '0');
        
        final offsetHours = offset.inHours.abs().toString().padLeft(2, '0');
        final offsetMinutes = (offset.inMinutes.abs() % 60).toString().padLeft(2, '0');
        final offsetSign = offset.isNegative ? '-' : '+';
        
        data['due_date'] = '$year-$month-${day}T$hour:$minute:$second$offsetSign$offsetHours:$offsetMinutes';
      }

      // Only add optional fields if they have valid values
      if (accountId != null && accountId.trim().isNotEmpty && accountId != 'null') {
        data['account_id'] = accountId.trim();
      }
      if (contactId != null && contactId.trim().isNotEmpty && contactId != 'null') {
        data['contact_id'] = contactId.trim();
      }
      if (dealId != null && dealId.trim().isNotEmpty && dealId != 'null') {
        data['deal_id'] = dealId.trim();
      }

      final response = await _dio.post('/api/v1/tasks', data: data);

      if (response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          return Task.fromJson(responseData['data'] as Map<String, dynamic>);
        } else {
          throw Exception(
            responseData['error']?['message'] ?? 'Failed to create task',
          );
        }
      } else {
        throw Exception('Invalid response format');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        if (errorData is Map<String, dynamic>) {
          final errorMessage = errorData['error']?['message'] ?? 
                               errorData['message'] ?? 
                               'Failed to create task';
          throw Exception(errorMessage);
        } else if (errorData is String) {
          throw Exception(errorData);
        } else {
          throw Exception('Failed to create task: ${e.response?.statusMessage ?? e.message}');
        }
      } else {
        throw Exception('Network error: ${e.message}');
      }
    } catch (e) {
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Failed to create task: $e');
    }
  }

  Future<Task> updateTask({
    required String id,
    String? title,
    String? description,
    String? type,
    String? priority,
    String? status,
    DateTime? dueDate,
  }) async {
    try {
      final data = <String, dynamic>{};

      if (title != null) data['title'] = title;
      if (description != null) data['description'] = description;
      if (type != null) data['type'] = type;
      if (priority != null) data['priority'] = priority;
      if (status != null) data['status'] = status;
      if (dueDate != null) {
        data['due_date'] = dueDate.toIso8601String();
      }

      final response = await _dio.put('/api/v1/tasks/$id', data: data);

      if (response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          return Task.fromJson(responseData['data'] as Map<String, dynamic>);
        } else {
          throw Exception(
            responseData['error']?['message'] ?? 'Failed to update task',
          );
        }
      } else {
        throw Exception('Invalid response format');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        throw Exception(
          errorData['error']?['message'] ?? 'Failed to update task',
        );
      } else {
        throw Exception('Network error: ${e.message}');
      }
    } catch (e) {
      throw Exception('Failed to update task: $e');
    }
  }

  Future<void> deleteTask(String id) async {
    try {
      final response = await _dio.delete('/api/v1/tasks/$id');

      // Handle response - DELETE might return 204 No Content or success response
      if (response.statusCode == 204 || response.statusCode == 200) {
        // Success - no need to check response.data
        return;
      }

      // If response has data, check for success flag
      if (response.data != null) {
        final responseData = response.data;
        if (responseData is Map<String, dynamic>) {
          if (responseData['success'] == false) {
            throw Exception(
              responseData['error']?['message'] ?? 'Failed to delete task',
            );
          }
        }
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        if (errorData is Map<String, dynamic>) {
          throw Exception(
            errorData['error']?['message'] ?? 'Failed to delete task',
          );
        } else {
          throw Exception('Failed to delete task: ${e.response?.statusMessage ?? e.message}');
        }
      } else {
        throw Exception('Network error: ${e.message}');
      }
    } catch (e) {
      // Re-throw if it's already an Exception
      if (e is Exception) {
        rethrow;
      }
      throw Exception('Failed to delete task: $e');
    }
  }

  Future<Task> completeTask(String id) async {
    try {
      final response = await _dio.post('/api/v1/tasks/$id/complete');

      if (response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          return Task.fromJson(responseData['data'] as Map<String, dynamic>);
        } else {
          throw Exception(
            responseData['error']?['message'] ?? 'Failed to complete task',
          );
        }
      } else {
        throw Exception('Invalid response format');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        throw Exception(
          errorData['error']?['message'] ?? 'Failed to complete task',
        );
      } else {
        throw Exception('Network error: ${e.message}');
      }
    } catch (e) {
      throw Exception('Failed to complete task: $e');
    }
  }

  Future<Reminder> createReminder({
    required String taskId,
    required DateTime remindAt,
    String reminderType = 'in_app',
    String? message,
  }) async {
    try {
      // Format remind_at in ISO8601 format with timezone offset
      // Example: "2024-01-20T10:00:00+07:00"
      final localDate = remindAt.toLocal();
      final offset = localDate.timeZoneOffset;
      
      final year = localDate.year.toString().padLeft(4, '0');
      final month = localDate.month.toString().padLeft(2, '0');
      final day = localDate.day.toString().padLeft(2, '0');
      final hour = localDate.hour.toString().padLeft(2, '0');
      final minute = localDate.minute.toString().padLeft(2, '0');
      final second = localDate.second.toString().padLeft(2, '0');
      
      final offsetHours = offset.inHours.abs().toString().padLeft(2, '0');
      final offsetMinutes = (offset.inMinutes.abs() % 60).toString().padLeft(2, '0');
      final offsetSign = offset.isNegative ? '-' : '+';
      
      final remindAtFormatted = '$year-$month-${day}T$hour:$minute:$second$offsetSign$offsetHours:$offsetMinutes';

      final data = <String, dynamic>{
        'task_id': taskId,
        'remind_at': remindAtFormatted,
        'reminder_type': reminderType,
      };

      if (message != null && message.trim().isNotEmpty) {
        data['message'] = message.trim();
      }

      final response = await _dio.post('/api/v1/tasks/reminders', data: data);

      if (response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == true) {
          return Reminder.fromJson(responseData['data'] as Map<String, dynamic>);
        } else {
          throw Exception(
            responseData['error']?['message'] ?? 'Failed to create reminder',
          );
        }
      } else {
        throw Exception('Invalid response format');
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        throw Exception(
          errorData['error']?['message'] ?? 'Failed to create reminder',
        );
      } else {
        throw Exception('Network error: ${e.message}');
      }
    } catch (e) {
      throw Exception('Failed to create reminder: $e');
    }
  }

  Future<void> deleteReminder(String id) async {
    try {
      final response = await _dio.delete('/api/v1/tasks/reminders/$id');

      // Handle response - DELETE might return 204 No Content or success response
      if (response.statusCode == 204 || response.statusCode == 200) {
        // Success - no need to check response.data
        return;
      }

      // If response has data, check for success flag
      if (response.data != null && response.data is Map<String, dynamic>) {
        final responseData = response.data as Map<String, dynamic>;
        if (responseData['success'] == false) {
          throw Exception(
            responseData['error']?['message'] ?? 'Failed to delete reminder',
          );
        }
      }
    } on DioException catch (e) {
      if (e.response != null) {
        final errorData = e.response!.data;
        throw Exception(
          errorData['error']?['message'] ?? 'Failed to delete reminder',
        );
      } else {
        throw Exception('Network error: ${e.message}');
      }
    } catch (e) {
      throw Exception('Failed to delete reminder: $e');
    }
  }
}

