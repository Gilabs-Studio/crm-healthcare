import 'dart:convert';

import 'hive_storage.dart';

/// Offline storage helper using Hive with JSON serialization
/// 
/// This provides a simple way to cache data for offline access
/// without requiring Hive adapters for each model
class OfflineStorage {
  static const String _accountsBox = 'offline_accounts';
  static const String _contactsBox = 'offline_contacts';
  static const String _tasksBox = 'offline_tasks';
  static const String _visitReportsBox = 'offline_visit_reports';
  
  /// Initialize offline storage boxes
  static Future<void> init() async {
    await HiveStorage.openBox(_accountsBox);
    await HiveStorage.openBox(_contactsBox);
    await HiveStorage.openBox(_tasksBox);
    await HiveStorage.openBox(_visitReportsBox);
  }
  
  /// Save accounts to offline storage
  static Future<void> saveAccounts(List<Map<String, dynamic>> accounts) async {
    final box = await HiveStorage.openBox(_accountsBox);
    await box.put('list', jsonEncode(accounts));
    await box.put('cached_at', DateTime.now().toIso8601String());
  }
  
  /// Get cached accounts from offline storage
  static Future<List<Map<String, dynamic>>?> getAccounts() async {
    final box = await HiveStorage.openBox(_accountsBox);
    final cachedData = box.get('list');
    if (cachedData != null) {
      return List<Map<String, dynamic>>.from(
        jsonDecode(cachedData as String),
      );
    }
    return null;
  }
  
  /// Save account detail to offline storage
  static Future<void> saveAccountDetail(
    String id,
    Map<String, dynamic> account,
  ) async {
    final box = await HiveStorage.openBox(_accountsBox);
    await box.put('detail_$id', jsonEncode(account));
  }
  
  /// Get cached account detail from offline storage
  static Future<Map<String, dynamic>?> getAccountDetail(String id) async {
    final box = await HiveStorage.openBox(_accountsBox);
    final cachedData = box.get('detail_$id');
    if (cachedData != null) {
      return Map<String, dynamic>.from(jsonDecode(cachedData as String));
    }
    return null;
  }
  
  /// Save contacts to offline storage
  static Future<void> saveContacts(List<Map<String, dynamic>> contacts) async {
    final box = await HiveStorage.openBox(_contactsBox);
    await box.put('list', jsonEncode(contacts));
    await box.put('cached_at', DateTime.now().toIso8601String());
  }
  
  /// Get cached contacts from offline storage
  static Future<List<Map<String, dynamic>>?> getContacts() async {
    final box = await HiveStorage.openBox(_contactsBox);
    final cachedData = box.get('list');
    if (cachedData != null) {
      return List<Map<String, dynamic>>.from(
        jsonDecode(cachedData as String),
      );
    }
    return null;
  }
  
  /// Save contact detail to offline storage
  static Future<void> saveContactDetail(
    String id,
    Map<String, dynamic> contact,
  ) async {
    final box = await HiveStorage.openBox(_contactsBox);
    await box.put('detail_$id', jsonEncode(contact));
  }
  
  /// Get cached contact detail from offline storage
  static Future<Map<String, dynamic>?> getContactDetail(String id) async {
    final box = await HiveStorage.openBox(_contactsBox);
    final cachedData = box.get('detail_$id');
    if (cachedData != null) {
      return Map<String, dynamic>.from(jsonDecode(cachedData as String));
    }
    return null;
  }
  
  /// Save tasks to offline storage
  static Future<void> saveTasks(List<Map<String, dynamic>> tasks) async {
    final box = await HiveStorage.openBox(_tasksBox);
    await box.put('list', jsonEncode(tasks));
    await box.put('cached_at', DateTime.now().toIso8601String());
  }
  
  /// Get cached tasks from offline storage
  static Future<List<Map<String, dynamic>>?> getTasks() async {
    final box = await HiveStorage.openBox(_tasksBox);
    final cachedData = box.get('list');
    if (cachedData != null) {
      return List<Map<String, dynamic>>.from(
        jsonDecode(cachedData as String),
      );
    }
    return null;
  }
  
  /// Save task detail to offline storage
  static Future<void> saveTaskDetail(
    String id,
    Map<String, dynamic> task,
  ) async {
    final box = await HiveStorage.openBox(_tasksBox);
    await box.put('detail_$id', jsonEncode(task));
  }
  
  /// Get cached task detail from offline storage
  static Future<Map<String, dynamic>?> getTaskDetail(String id) async {
    final box = await HiveStorage.openBox(_tasksBox);
    final cachedData = box.get('detail_$id');
    if (cachedData != null) {
      return Map<String, dynamic>.from(jsonDecode(cachedData as String));
    }
    return null;
  }
  
  /// Save visit reports to offline storage
  static Future<void> saveVisitReports(
    List<Map<String, dynamic>> visitReports,
  ) async {
    final box = await HiveStorage.openBox(_visitReportsBox);
    await box.put('list', jsonEncode(visitReports));
    await box.put('cached_at', DateTime.now().toIso8601String());
  }
  
  /// Get cached visit reports from offline storage
  static Future<List<Map<String, dynamic>>?> getVisitReports() async {
    final box = await HiveStorage.openBox(_visitReportsBox);
    final cachedData = box.get('list');
    if (cachedData != null) {
      return List<Map<String, dynamic>>.from(
        jsonDecode(cachedData as String),
      );
    }
    return null;
  }
  
  /// Save visit report detail to offline storage
  static Future<void> saveVisitReportDetail(
    String id,
    Map<String, dynamic> visitReport,
  ) async {
    final box = await HiveStorage.openBox(_visitReportsBox);
    await box.put('detail_$id', jsonEncode(visitReport));
  }
  
  /// Get cached visit report detail from offline storage
  static Future<Map<String, dynamic>?> getVisitReportDetail(String id) async {
    final box = await HiveStorage.openBox(_visitReportsBox);
    final cachedData = box.get('detail_$id');
    if (cachedData != null) {
      return Map<String, dynamic>.from(jsonDecode(cachedData as String));
    }
    return null;
  }
  
  /// Clear all offline cache
  static Future<void> clearAll() async {
    await HiveStorage.clearBox(_accountsBox);
    await HiveStorage.clearBox(_contactsBox);
    await HiveStorage.clearBox(_tasksBox);
    await HiveStorage.clearBox(_visitReportsBox);
  }
  
  /// Clear specific entity cache
  static Future<void> clearEntity(String entity) async {
    switch (entity) {
      case 'accounts':
        await HiveStorage.clearBox(_accountsBox);
        break;
      case 'contacts':
        await HiveStorage.clearBox(_contactsBox);
        break;
      case 'tasks':
        await HiveStorage.clearBox(_tasksBox);
        break;
      case 'visit_reports':
        await HiveStorage.clearBox(_visitReportsBox);
        break;
    }
  }
}

