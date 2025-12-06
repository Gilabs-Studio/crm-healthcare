import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/account_repository.dart';
import '../data/category_repository.dart';
import '../data/models/account.dart';
import 'account_state.dart';

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  return AccountRepository(ApiClient.dio);
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
  return AccountListNotifier(repository);
});

final accountDetailProvider =
    FutureProvider.family<Account, String>((ref, id) async {
  final repository = ref.read(accountRepositoryProvider);
  return repository.getAccountById(id);
});

class AccountListNotifier extends StateNotifier<AccountListState> {
  AccountListNotifier(this._repository) : super(const AccountListState());

  final AccountRepository _repository;

  Future<void> loadAccounts({
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
      final response = await _repository.getAccounts(
        page: page,
        perPage: 20,
        search: searchQuery.isNotEmpty ? searchQuery : null,
      );

      if (refresh || page == 1) {
        state = state.copyWith(
          accounts: response.items,
          pagination: response.pagination,
          searchQuery: searchQuery,
          isLoading: false,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          accounts: [...state.accounts, ...response.items],
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
    await loadAccounts(page: 1, refresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoading) return;
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
      // Refresh list
      await loadAccounts(page: 1, refresh: true);
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
      // Refresh list and detail
      await loadAccounts(page: 1, refresh: true);
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
      // Refresh list
      await loadAccounts(page: 1, refresh: true);
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

