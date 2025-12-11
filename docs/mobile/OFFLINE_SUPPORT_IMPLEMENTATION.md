# Offline Support Implementation Guide
## CRM Healthcare Mobile App - Flutter

**Version**: 1.0  
**Last Updated**: 2025-01-15  
**Status**: Phase 1 (Basic Offline) - ✅ **Completed**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Phase 1: Basic Offline (Read-Only)](#phase-1-basic-offline-read-only)
4. [Phase 2: Create Operations Offline](#phase-2-create-operations-offline)
5. [Phase 3: Full Offline with Sync](#phase-3-full-offline-with-sync)
6. [Implementation Details](#implementation-details)
7. [Testing Strategy](#testing-strategy)
8. [Troubleshooting](#troubleshooting)

---

## Overview

### Goals
- Enable app functionality without internet connection
- Provide seamless user experience in offline mode
- Automatic data synchronization when connection is restored
- Maintain data consistency across online/offline states

### Implementation Phases

| Phase | Description | Status | Estimated Time |
|-------|-------------|--------|----------------|
| **Phase 1** | Basic Offline (Read-Only) | ✅ **Completed** | 3-5 days |
| **Phase 2** | Create Operations Offline | ⏳ Pending | 5-7 days |
| **Phase 3** | Full Offline with Sync | ⏳ Pending | 10-15 days |

---

## Architecture

### Technology Stack

#### Local Database
- **Hive**: Lightweight, fast NoSQL database for Flutter
  - Type-safe with code generation
  - Fast read/write operations
  - Suitable for structured data (accounts, contacts, tasks, etc.)

#### Network Detection
- **connectivity_plus**: Monitor network connectivity status
  - Detect online/offline state
  - Listen to connectivity changes
  - Trigger sync when connection restored

#### Data Sync
- **Custom Sync Service**: Background sync queue
  - Queue pending operations
  - Auto-retry on connection restore
  - Conflict resolution

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (Flutter)                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐      ┌──────────────┐                 │
│  │   UI Layer   │◄─────►│  State Mgmt  │                 │
│  │  (Widgets)   │      │  (Riverpod)  │                 │
│  └──────────────┘      └──────────────┘                 │
│         │                      │                          │
│         │                      ▼                          │
│         │            ┌──────────────────┐                 │
│         │            │  Repository      │                 │
│         │            │  (Offline-First) │                 │
│         │            └──────────────────┘                 │
│         │                      │                          │
│         │         ┌────────────┴────────────┐            │
│         │         │                         │            │
│         ▼         ▼                         ▼            │
│  ┌──────────┐ ┌──────────┐        ┌──────────────┐    │
│  │   Hive   │ │  Cache    │        │  API Client  │    │
│  │  (Local  │ │  (Memory)  │        │  (Dio)       │    │
│  │   DB)   │ │            │        │              │    │
│  └──────────┘ └──────────┘        └──────────────┘    │
│         │                                    │            │
│         │                                    ▼            │
│         │                            ┌──────────────┐    │
│         │                            │   Backend    │    │
│         │                            │    API       │    │
│         │                            └──────────────┘    │
│         │                                                 │
│         └─────────────────────────────────────────────────┘
│                            │
│                            ▼
│                   ┌──────────────────┐
│                   │  Sync Service    │
│                   │  (Background)    │
│                   └──────────────────┘
│
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Basic Offline (Read-Only)

### Scope
- ✅ View accounts (list & detail)
- ✅ View contacts (list & detail)
- ✅ View tasks (list & detail)
- ✅ View visit reports (list & detail)
- ✅ View dashboard (cached data)

### Implementation Strategy

#### 1. Local Database Setup (Hive)

**Step 1: Add Dependencies**

```yaml
# pubspec.yaml
dependencies:
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  connectivity_plus: ^6.0.5

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.13
```

**Step 2: Initialize Hive**

```dart
// lib/core/storage/hive_storage.dart
import 'package:hive_flutter/hive_flutter.dart';

class HiveStorage {
  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Register adapters
    Hive.registerAdapter(AccountAdapter());
    Hive.registerAdapter(ContactAdapter());
    Hive.registerAdapter(TaskAdapter());
    Hive.registerAdapter(VisitReportAdapter());
    Hive.registerAdapter(DashboardOverviewAdapter());
    
    // Open boxes
    await Hive.openBox<Account>('accounts');
    await Hive.openBox<Contact>('contacts');
    await Hive.openBox<Task>('tasks');
    await Hive.openBox<VisitReport>('visit_reports');
    await Hive.openBox<DashboardOverview>('dashboard');
  }
}
```

**Step 3: Generate Hive Adapters**

```dart
// lib/features/accounts/data/models/account.dart
import 'package:hive/hive.dart';

part 'account.g.dart';

@HiveType(typeId: 0)
class Account extends HiveObject {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String name;
  
  @HiveField(2)
  final String? email;
  
  // ... other fields
  
  Account({
    required this.id,
    required this.name,
    this.email,
  });
}
```

Run code generation:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

#### 2. Network Detection Service

```dart
// lib/core/network/connectivity_service.dart
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';

class ConnectivityService {
  final Connectivity _connectivity = Connectivity();
  StreamSubscription<List<ConnectivityResult>>? _subscription;
  
  // Current connectivity status
  bool _isOnline = true;
  bool get isOnline => _isOnline;
  
  // Stream of connectivity changes
  Stream<bool> get onConnectivityChanged => _connectivity.onConnectivityChanged
      .map((results) => results.any((r) => r != ConnectivityResult.none))
      .distinct();
  
  Future<void> init() async {
    // Check initial status
    final results = await _connectivity.checkConnectivity();
    _isOnline = results.any((r) => r != ConnectivityResult.none);
    
    // Listen to changes
    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      _isOnline = results.any((r) => r != ConnectivityResult.none);
    });
  }
  
  void dispose() {
    _subscription?.cancel();
  }
}
```

#### 3. Offline-First Repository Pattern

```dart
// lib/features/accounts/data/account_repository.dart
class AccountRepository {
  final ApiClient _apiClient;
  final Box<Account> _localBox;
  final ConnectivityService _connectivity;
  
  AccountRepository(
    this._apiClient,
    this._localBox,
    this._connectivity,
  );
  
  /// Get accounts with offline-first strategy
  Future<List<Account>> getAccounts({
    int page = 1,
    int limit = 20,
    String? search,
    bool forceRefresh = false,
  }) async {
    // 1. Load from local DB first (instant)
    final localAccounts = _localBox.values.toList();
    
    // 2. If online and (forceRefresh or no local data), fetch from API
    if (_connectivity.isOnline && (forceRefresh || localAccounts.isEmpty)) {
      try {
        final apiAccounts = await _apiClient.getAccounts(
          page: page,
          limit: limit,
          search: search,
        );
        
        // 3. Save to local DB
        await _saveAccountsToLocal(apiAccounts);
        
        return apiAccounts;
      } catch (e) {
        // If API fails, return cached data if available
        if (localAccounts.isNotEmpty) {
          return localAccounts;
        }
        rethrow;
      }
    }
    
    // 4. Offline or no API call needed: return cached data
    return localAccounts;
  }
  
  /// Get account detail with offline-first strategy
  Future<Account?> getAccountById(String id) async {
    // 1. Try local DB first
    final localAccount = _localBox.get(id);
    
    // 2. If online, fetch from API and update local
    if (_connectivity.isOnline) {
      try {
        final apiAccount = await _apiClient.getAccountById(id);
        if (apiAccount != null) {
          await _localBox.put(id, apiAccount);
          return apiAccount;
        }
      } catch (e) {
        // If API fails, return cached data if available
        if (localAccount != null) {
          return localAccount;
        }
      }
    }
    
    // 3. Return cached data
    return localAccount;
  }
  
  /// Save accounts to local DB
  Future<void> _saveAccountsToLocal(List<Account> accounts) async {
    for (final account in accounts) {
      await _localBox.put(account.id, account);
    }
  }
  
  /// Clear local cache
  Future<void> clearCache() async {
    await _localBox.clear();
  }
}
```

#### 4. Update Providers to Use Offline-First Repository

```dart
// lib/features/accounts/application/account_provider.dart
class AccountNotifier extends StateNotifier<AccountListState> {
  final AccountRepository _repository;
  final ConnectivityService _connectivity;
  
  AccountNotifier(this._repository, this._connectivity)
      : super(AccountListState()) {
    loadAccounts();
  }
  
  Future<void> loadAccounts({bool forceRefresh = false}) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    
    try {
      final accounts = await _repository.getAccounts(
        forceRefresh: forceRefresh,
      );
      
      state = state.copyWith(
        accounts: accounts,
        isLoading: false,
        isOffline: !_connectivity.isOnline,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString(),
        isOffline: !_connectivity.isOnline,
      );
    }
  }
}
```

#### 5. UI Indicators for Offline Mode

```dart
// lib/core/widgets/offline_indicator.dart
class OfflineIndicator extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final connectivityService = ref.watch(connectivityServiceProvider);
    
    return StreamBuilder<bool>(
      stream: connectivityService.onConnectivityChanged,
      initialData: connectivityService.isOnline,
      builder: (context, snapshot) {
        final isOnline = snapshot.data ?? true;
        
        if (!isOnline) {
          return Container(
            color: Colors.orange,
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Icon(Icons.wifi_off, color: Colors.white),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Offline Mode - Showing cached data',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ],
            ),
          );
        }
        
        return SizedBox.shrink();
      },
    );
  }
}
```

### Implementation Checklist

- [x] Add Hive dependencies to `pubspec.yaml` ✅ **Completed**
- [x] Initialize Hive in `main.dart` ✅ **Completed**
- [x] Create offline storage helper (JSON-based, no Hive adapters needed) ✅ **Completed**
  - Using `OfflineStorage` class with JSON serialization for simplicity
  - Hive adapters can be added later if needed for Phase 2/3
- [x] Implement ConnectivityService ✅ **Completed**
- [x] Update repositories to use offline-first pattern ✅ **Completed**
  - [x] AccountRepository ✅
  - [x] ContactRepository ✅
  - [x] TaskRepository ✅
  - [x] VisitReportRepository ✅
  - [x] DashboardRepository (already has cache, extended for offline) ✅
- [x] Update providers to handle offline state ✅ **Completed**
  - [x] AccountProvider ✅
  - [x] ContactProvider ✅
  - [x] TaskProvider ✅
  - [x] VisitReportProvider ✅
  - [x] DashboardProvider ✅
- [x] Update state classes to include `isOffline` field ✅ **Completed**
  - [x] AccountListState ✅
  - [x] ContactListState ✅
  - [x] TaskListState ✅
  - [x] VisitReportListState ✅
  - [x] DashboardState ✅
- [x] Add offline indicator to UI ✅ **Completed**
- [ ] Test offline scenarios ⏳ **Pending - Manual Testing Required**
- [x] Update error messages for offline mode ✅ **Completed**

---

## Phase 2: Create Operations Offline

### Scope
- ⏳ Create visit report offline (draft mode)
- ⏳ Create task offline (draft mode)
- ⏳ Queue for sync when online
- ⏳ Show pending sync indicator

### Implementation Strategy

#### 1. Sync Queue Service

```dart
// lib/core/sync/sync_queue_service.dart
@HiveType(typeId: 10)
class SyncOperation extends HiveObject {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final SyncType type; // create, update, delete
  
  @HiveField(2)
  final String entity; // 'visit_report', 'task', etc.
  
  @HiveField(3)
  final Map<String, dynamic> data;
  
  @HiveField(4)
  final DateTime createdAt;
  
  @HiveField(5)
  SyncStatus status; // pending, syncing, completed, failed
  
  @HiveField(6)
  String? errorMessage;
  
  SyncOperation({
    required this.id,
    required this.type,
    required this.entity,
    required this.data,
    DateTime? createdAt,
    this.status = SyncStatus.pending,
    this.errorMessage,
  }) : createdAt = createdAt ?? DateTime.now();
}

enum SyncType { create, update, delete }
enum SyncStatus { pending, syncing, completed, failed }
```

#### 2. Draft Management

```dart
// lib/features/visit_reports/data/visit_report_repository.dart
class VisitReportRepository {
  final Box<VisitReport> _localBox;
  final Box<SyncOperation> _syncQueue;
  
  /// Create visit report (offline-first)
  Future<VisitReport> createVisitReport(VisitReport report) async {
    // 1. Save as draft in local DB
    report.status = 'draft';
    report.isPendingSync = true;
    await _localBox.put(report.id, report);
    
    // 2. Add to sync queue
    final syncOp = SyncOperation(
      id: report.id,
      type: SyncType.create,
      entity: 'visit_report',
      data: report.toJson(),
    );
    await _syncQueue.put(syncOp.id, syncOp);
    
    // 3. Try to sync if online
    if (_connectivity.isOnline) {
      _syncService.syncQueue();
    }
    
    return report;
  }
}
```

#### 3. Background Sync Service

```dart
// lib/core/sync/sync_service.dart
class SyncService {
  final Box<SyncOperation> _syncQueue;
  final ConnectivityService _connectivity;
  final ApiClient _apiClient;
  
  StreamSubscription<bool>? _connectivitySubscription;
  
  Future<void> init() async {
    // Listen to connectivity changes
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (isOnline) {
        if (isOnline) {
          syncQueue(); // Auto-sync when online
        }
      },
    );
  }
  
  Future<void> syncQueue() async {
    if (!_connectivity.isOnline) return;
    
    final pendingOps = _syncQueue.values
        .where((op) => op.status == SyncStatus.pending)
        .toList();
    
    for (final op in pendingOps) {
      try {
        op.status = SyncStatus.syncing;
        await _syncQueue.put(op.id, op);
        
        // Sync based on operation type
        switch (op.type) {
          case SyncType.create:
            await _syncCreate(op);
            break;
          case SyncType.update:
            await _syncUpdate(op);
            break;
          case SyncType.delete:
            await _syncDelete(op);
            break;
        }
        
        op.status = SyncStatus.completed;
        await _syncQueue.put(op.id, op);
        
        // Remove from queue after successful sync
        await _syncQueue.delete(op.id);
      } catch (e) {
        op.status = SyncStatus.failed;
        op.errorMessage = e.toString();
        await _syncQueue.put(op.id, op);
      }
    }
  }
  
  Future<void> _syncCreate(SyncOperation op) async {
    switch (op.entity) {
      case 'visit_report':
        final report = VisitReport.fromJson(op.data);
        await _apiClient.createVisitReport(report);
        // Update local record to remove draft status
        // ...
        break;
      // ... other entities
    }
  }
}
```

### Implementation Checklist

- [ ] Create SyncOperation model with Hive adapter
- [ ] Implement SyncQueueService
- [ ] Update repositories to save drafts
- [ ] Implement background sync service
- [ ] Add pending sync indicator to UI
- [ ] Handle sync conflicts
- [ ] Test offline create operations
- [ ] Test sync when connection restored

---

## Phase 3: Full Offline with Sync

### Scope
- ⏳ Full CRUD operations offline
- ⏳ Conflict resolution
- ⏳ Multi-device sync
- ⏳ Data expiration & cleanup
- ⏳ Advanced error handling

### Implementation Strategy

#### 1. Conflict Resolution

```dart
// lib/core/sync/conflict_resolver.dart
class ConflictResolver {
  /// Resolve conflict between local and server data
  Future<T> resolveConflict<T>({
    required T localData,
    required T serverData,
    required ConflictResolutionStrategy strategy,
  }) async {
    switch (strategy) {
      case ConflictResolutionStrategy.serverWins:
        return serverData;
        
      case ConflictResolutionStrategy.localWins:
        return localData;
        
      case ConflictResolutionStrategy.manualMerge:
        // Show dialog to user
        return await _showConflictDialog(localData, serverData);
        
      case ConflictResolutionStrategy.lastWriteWins:
        // Compare timestamps
        final localTime = _getLastModified(localData);
        final serverTime = _getLastModified(serverData);
        return localTime.isAfter(serverTime) ? localData : serverData;
    }
  }
}

enum ConflictResolutionStrategy {
  serverWins,
  localWins,
  manualMerge,
  lastWriteWins,
}
```

#### 2. Data Expiration & Cleanup

```dart
// lib/core/storage/cache_manager.dart
class CacheManager {
  /// Cleanup expired cache
  Future<void> cleanupExpiredCache() async {
    final now = DateTime.now();
    
    // Cleanup old dashboard cache (older than 1 hour)
    final dashboardBox = Hive.box<DashboardOverview>('dashboard');
    final dashboardKeys = dashboardBox.keys.toList();
    for (final key in dashboardKeys) {
      final overview = dashboardBox.get(key);
      if (overview != null) {
        final age = now.difference(overview.cachedAt);
        if (age.inHours > 1) {
          await dashboardBox.delete(key);
        }
      }
    }
    
    // Cleanup old sync operations (older than 7 days)
    final syncBox = Hive.box<SyncOperation>('sync_queue');
    final syncKeys = syncBox.keys.toList();
    for (final key in syncKeys) {
      final op = syncBox.get(key);
      if (op != null) {
        final age = now.difference(op.createdAt);
        if (age.inDays > 7) {
          await syncBox.delete(key);
        }
      }
    }
  }
}
```

#### 3. Advanced Error Handling

```dart
// lib/core/sync/sync_error_handler.dart
class SyncErrorHandler {
  /// Handle sync errors with retry logic
  Future<void> handleSyncError(
    SyncOperation op,
    dynamic error,
  ) async {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
          // Retry after delay
          await _retryAfterDelay(op, Duration(seconds: 5));
          break;
          
        case DioExceptionType.badResponse:
          if (error.response?.statusCode == 409) {
            // Conflict - trigger conflict resolution
            await _resolveConflict(op);
          } else {
            // Mark as failed
            op.status = SyncStatus.failed;
            op.errorMessage = error.message;
          }
          break;
          
        default:
          op.status = SyncStatus.failed;
          op.errorMessage = error.toString();
      }
    }
  }
}
```

### Implementation Checklist

- [ ] Implement conflict resolution strategies
- [ ] Add data expiration logic
- [ ] Implement cache cleanup service
- [ ] Add advanced error handling
- [ ] Implement retry logic for failed syncs
- [ ] Add sync status monitoring
- [ ] Test conflict scenarios
- [ ] Test multi-device sync
- [ ] Performance optimization

---

## Implementation Details

### File Structure

```
lib/
├── core/
│   ├── network/
│   │   ├── connectivity_service.dart
│   │   └── api_client.dart
│   ├── storage/
│   │   ├── hive_storage.dart
│   │   ├── local_storage.dart
│   │   └── cache_manager.dart
│   └── sync/
│       ├── sync_service.dart
│       ├── sync_queue_service.dart
│       ├── conflict_resolver.dart
│       └── sync_error_handler.dart
├── features/
│   ├── accounts/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── account.dart (with Hive adapter)
│   │   │   └── account_repository.dart (offline-first)
│   │   └── application/
│   │       └── account_provider.dart
│   └── ...
└── main.dart
```

### Key Classes

1. **HiveStorage**: Initialize Hive and register adapters
2. **ConnectivityService**: Monitor network connectivity
3. **AccountRepository** (and others): Offline-first data access
4. **SyncService**: Background sync queue processing
5. **ConflictResolver**: Handle data conflicts
6. **CacheManager**: Manage cache expiration and cleanup

---

## Testing Strategy

### Unit Tests

```dart
// test/features/accounts/data/account_repository_test.dart
void main() {
  group('AccountRepository - Offline Mode', () {
    test('should return cached data when offline', () async {
      // Arrange
      final mockBox = MockBox<Account>();
      final mockConnectivity = MockConnectivityService(isOnline: false);
      final repository = AccountRepository(..., mockBox, mockConnectivity);
      
      // Act
      final accounts = await repository.getAccounts();
      
      // Assert
      expect(accounts, isNotEmpty);
      verifyNever(mockApiClient.getAccounts());
    });
  });
}
```

### Integration Tests

```dart
// integration_test/offline_mode_test.dart
void main() {
  testWidgets('App works in offline mode', (tester) async {
    // Enable offline mode
    await tester.binding.setConnectivity(false);
    
    // Navigate to accounts screen
    await tester.pumpWidget(MyApp());
    await tester.tap(find.text('Accounts'));
    await tester.pumpAndSettle();
    
    // Verify cached data is shown
    expect(find.text('Account 1'), findsOneWidget);
    expect(find.byIcon(Icons.wifi_off), findsOneWidget);
  });
}
```

### Manual Testing Checklist

- [ ] Test app startup in offline mode
- [ ] Test viewing accounts/contacts/tasks offline
- [ ] Test creating visit report offline
- [ ] Test sync when connection restored
- [ ] Test conflict resolution
- [ ] Test cache expiration
- [ ] Test error handling in offline mode

---

## Troubleshooting

### Common Issues

#### 1. Hive Adapter Not Found
**Problem**: `HiveError: Cannot read, unknown typeId: 0`

**Solution**:
```dart
// Make sure adapters are registered before opening boxes
await Hive.initFlutter();
Hive.registerAdapter(AccountAdapter());
await Hive.openBox<Account>('accounts');
```

#### 2. Sync Queue Not Processing
**Problem**: Pending operations not syncing when online

**Solution**:
- Check connectivity service is initialized
- Verify sync service is listening to connectivity changes
- Check sync queue for errors

#### 3. Data Not Persisting
**Problem**: Data lost after app restart

**Solution**:
- Ensure Hive boxes are properly opened
- Check write permissions
- Verify data is saved before app closes

#### 4. Conflict Resolution Not Working
**Problem**: Conflicts not resolved properly

**Solution**:
- Verify conflict resolution strategy is set correctly
- Check timestamps for last-write-wins strategy
- Ensure user can manually resolve conflicts

---

## Performance Considerations

### Cache Size Management
- Limit cache size per entity type
- Implement LRU (Least Recently Used) eviction
- Cleanup old data periodically

### Sync Performance
- Batch sync operations
- Limit concurrent sync operations
- Prioritize critical operations

### Memory Usage
- Use lazy loading for large datasets
- Clear unused cache periodically
- Monitor memory usage in production

---

## Security Considerations

### Data Encryption
- Encrypt sensitive data in Hive boxes
- Use secure storage for auth tokens
- Implement data encryption at rest

### Sync Security
- Validate sync operations
- Implement rate limiting
- Secure API endpoints

---

## Future Enhancements

1. **Incremental Sync**: Only sync changed data
2. **Compression**: Compress data before sync
3. **Background Sync**: Sync in background even when app is closed
4. **Multi-Device Sync**: Sync across multiple devices
5. **Offline Analytics**: Track offline usage patterns

---

## References

- [Hive Documentation](https://docs.hivedb.dev/)
- [Connectivity Plus](https://pub.dev/packages/connectivity_plus)
- [Flutter Offline-First Architecture](https://flutter.dev/docs/development/data-and-backend/state-mgmt/options#offline-first)

---

**Document Status**: Active  
**Last Updated**: 2025-01-15  
**Next Review**: After Phase 1 completion


