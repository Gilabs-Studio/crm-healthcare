import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/cache/list_cache.dart';
import '../../../core/network/api_client.dart';
import '../../../core/network/connectivity_service.dart';
import '../data/account_repository.dart';
import '../data/category_repository.dart';
import '../data/models/account.dart';
import 'account_state.dart';

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  final connectivity = ref.watch(connectivityServiceProvider);
  return AccountRepository(ApiClient.dio, connectivity);
});

final categoryRepositoryProvider = Provider<CategoryRepository>((ref) {
  return CategoryRepository(ApiClient.dio);
});

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  final repository = ref.read(categoryRepositoryProvider);
  return repository.getCategories();
});

final accountListProvider =
    StateNotifierProvider<AccountListNotifier, AccountListState>((ref) {
  final repository = ref.read(accountRepositoryProvider);
  final connectivity = ref.watch(connectivityServiceProvider);
  return AccountListNotifier(repository, connectivity);
});

final accountDetailProvider =
    FutureProvider.family<Account, String>((ref, id) async {
  final repository = ref.read(accountRepositoryProvider);
  return repository.getAccountById(id);
});

class AccountListNotifier extends StateNotifier<AccountListState> {
  AccountListNotifier(this._repository, this._connectivity)
      : super(const AccountListState());

  final AccountRepository _repository;
  final ConnectivityService _connectivity;
  final ListCache _cache = ListCache();

  Future<void> loadAccounts({
    int page = 1,
    bool refresh = false,
    String? search,
    bool forceRefresh = false,
  }) async {
    final searchQuery = search ?? state.searchQuery;
    final cacheKey = ListCache.cacheKey(
      'accounts',
      page: page,
      search: searchQuery.isNotEmpty ? searchQuery : null,
    );

    // Try to load from cache first (optimistic UI) - only for first page
    if (!forceRefresh && !refresh && page == 1) {
      final cachedAccounts = _cache.get<Account>(
        cacheKey,
        ttl: const Duration(seconds: 60),
        expectedMetadata: searchQuery.isNotEmpty
            ? {'search': searchQuery}
            : null,
      );

      if (cachedAccounts != null && cachedAccounts.isNotEmpty) {
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
          accounts: cachedAccounts,
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
      final response = await _repository.getAccounts(
        page: page,
        perPage: 20,
        search: searchQuery.isNotEmpty ? searchQuery : null,
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
        },
      );

      if (refresh || page == 1) {
        state = state.copyWith(
          accounts: response.items,
          pagination: response.pagination,
          searchQuery: searchQuery,
          isLoading: false,
          isLoadingMore: false,
          errorMessage: null,
          isOffline: !_connectivity.isOnline,
        );
      } else {
        state = state.copyWith(
          accounts: [...state.accounts, ...response.items],
          pagination: response.pagination,
          isLoadingMore: false,
          errorMessage: null,
          isOffline: !_connectivity.isOnline,
        );
      }
    } catch (e) {
      // On error, try to use cached data as fallback
      if (page == 1) {
        final cachedAccounts = _cache.get<Account>(cacheKey);
        if (cachedAccounts != null && cachedAccounts.isNotEmpty) {
          state = state.copyWith(
            accounts: cachedAccounts,
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
    // Clear cache for accounts
    _cache.clearPrefix('list:accounts');
    await loadAccounts(page: 1, refresh: true, forceRefresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoading || state.isLoadingMore) return;
    final pagination = state.pagination;
    if (pagination == null || !pagination.hasNextPage) return;

    await loadAccounts(page: pagination.page + 1);
  }

  void updateSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  Future<Account?> createAccount({
    required String name,
    required String categoryId,
    String? address,
    String? city,
    String? province,
    String? phone,
    String? email,
    String? status,
    String? assignedTo,
  }) async {
    try {
      state = state.copyWith(isLoading: true, errorMessage: null);
      final account = await _repository.createAccount(
        name: name,
        categoryId: categoryId,
        address: address,
        city: city,
        province: province,
        phone: phone,
        email: email,
        status: status ?? 'active',
        assignedTo: assignedTo,
      );
      state = state.copyWith(isLoading: false);
      // Clear cache and refresh list
      _cache.clearPrefix('list:accounts');
      await loadAccounts(page: 1, refresh: true, forceRefresh: true);
      return account;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<Account?> updateAccount({
    required String id,
    String? name,
    String? categoryId,
    String? address,
    String? city,
    String? province,
    String? phone,
    String? email,
    String? status,
    String? assignedTo,
  }) async {
    try {
      state = state.copyWith(isLoading: true, errorMessage: null);
      final account = await _repository.updateAccount(
        id: id,
        name: name,
        categoryId: categoryId,
        address: address,
        city: city,
        province: province,
        phone: phone,
        email: email,
        status: status,
        assignedTo: assignedTo,
      );
      state = state.copyWith(isLoading: false);
      // Clear cache and refresh list
      _cache.clearPrefix('list:accounts');
      await loadAccounts(page: 1, refresh: true, forceRefresh: true);
      return account;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<bool> deleteAccount(String id) async {
    try {
      state = state.copyWith(isLoading: true, errorMessage: null);
      await _repository.deleteAccount(id);
      state = state.copyWith(isLoading: false);
      // Clear cache and refresh list
      _cache.clearPrefix('list:accounts');
      await loadAccounts(page: 1, refresh: true, forceRefresh: true);
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

