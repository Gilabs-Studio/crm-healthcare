class Task {
  final String id;
  final String title;
  final String? description;
  final String type;
  final String priority;
  final String status;
  final DateTime? dueDate;
  final String? assignedTo;
  final String? accountId;
  final String? contactId;
  final String? dealId;
  final AccountInfo? account;
  final ContactInfo? contact;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Reminder> reminders;

  Task({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    required this.priority,
    required this.status,
    this.dueDate,
    this.assignedTo,
    this.accountId,
    this.contactId,
    this.dealId,
    this.account,
    this.contact,
    required this.createdAt,
    required this.updatedAt,
    this.reminders = const [],
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      type: json['type'] as String? ?? 'general',
      priority: json['priority'] as String? ?? 'medium',
      status: json['status'] as String? ?? 'pending',
      dueDate: json['due_date'] != null
          ? DateTime.parse(json['due_date'] as String)
          : null,
      assignedTo: json['assigned_to'] as String?,
      accountId: json['account_id'] as String?,
      contactId: json['contact_id'] as String?,
      dealId: json['deal_id'] as String?,
      account: json['account'] != null
          ? AccountInfo.fromJson(json['account'] as Map<String, dynamic>)
          : null,
      contact: json['contact'] != null
          ? ContactInfo.fromJson(json['contact'] as Map<String, dynamic>)
          : null,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      reminders: json['reminders'] != null
          ? (json['reminders'] as List<dynamic>)
              .map((e) => Reminder.fromJson(e as Map<String, dynamic>))
              .toList()
          : [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'priority': priority,
      'status': status,
      'due_date': dueDate?.toIso8601String(),
      'assigned_to': assignedTo,
      'account_id': accountId,
      'contact_id': contactId,
      'deal_id': dealId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  bool get isOverdue {
    if (dueDate == null || status == 'completed' || status == 'cancelled') {
      return false;
    }
    return dueDate!.isBefore(DateTime.now());
  }

  bool get isDueToday {
    if (dueDate == null) return false;
    final now = DateTime.now();
    return dueDate!.year == now.year &&
        dueDate!.month == now.month &&
        dueDate!.day == now.day;
  }
}

class AccountInfo {
  final String id;
  final String name;

  AccountInfo({required this.id, required this.name});

  factory AccountInfo.fromJson(Map<String, dynamic> json) {
    return AccountInfo(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

class ContactInfo {
  final String id;
  final String name;

  ContactInfo({required this.id, required this.name});

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      id: json['id'] as String,
      name: json['name'] as String,
    );
  }
}

class Reminder {
  final String id;
  final String taskId;
  final DateTime remindAt;
  final String reminderType;
  final String? message;
  final bool isSent;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Reminder({
    required this.id,
    required this.taskId,
    required this.remindAt,
    required this.reminderType,
    this.message,
    this.isSent = false,
    this.createdAt,
    this.updatedAt,
  });

  factory Reminder.fromJson(Map<String, dynamic> json) {
    return Reminder(
      id: json['id'] as String,
      taskId: json['task_id'] as String,
      remindAt: DateTime.parse(json['remind_at'] as String),
      reminderType: json['reminder_type'] as String? ?? 'in_app',
      message: json['message'] as String?,
      isSent: json['is_sent'] as bool? ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'task_id': taskId,
      'remind_at': remindAt.toIso8601String(),
      'reminder_type': reminderType,
      'message': message,
    };
  }
}

class TaskListResponse {
  final List<Task> items;
  final Pagination pagination;

  TaskListResponse({
    required this.items,
    required this.pagination,
  });

  factory TaskListResponse.fromJson(Map<String, dynamic> json) {
    final dynamic rawData = json['data'];

    List<Task> items;
    Pagination pagination;

    if (rawData is List) {
      items = rawData
          .map((item) => Task.fromJson(item as Map<String, dynamic>))
          .toList();
      pagination = Pagination(
        page: 1,
        perPage: items.length,
        total: items.length,
        totalPages: 1,
      );
    } else if (rawData is Map<String, dynamic>) {
      items = (rawData['items'] as List<dynamic>?)
              ?.map((item) => Task.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [];
      pagination = Pagination.fromJson(
        rawData['pagination'] as Map<String, dynamic>,
      );
    } else {
      throw Exception('Invalid data format for TaskListResponse');
    }

    return TaskListResponse(
      items: items,
      pagination: pagination,
    );
  }
}

class Pagination {
  final int page;
  final int perPage;
  final int total;
  final int totalPages;

  Pagination({
    required this.page,
    required this.perPage,
    required this.total,
    required this.totalPages,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) {
    return Pagination(
      page: json['page'] as int? ?? 1,
      perPage: json['per_page'] as int? ?? 20,
      total: json['total'] as int? ?? 0,
      totalPages: json['total_pages'] as int? ?? 1,
    );
  }

  bool get hasNextPage => page < totalPages;
}

