import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/account_repository.dart';
import '../data/models/account.dart';
import 'account_state.dart';

final accountRepositoryProvider = Provider<AccountRepository>((ref) {
  return AccountRepository(ApiClient.dio);
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
}

