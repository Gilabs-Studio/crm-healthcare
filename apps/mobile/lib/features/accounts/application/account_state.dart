import '../data/models/account.dart';

class AccountListState {
  const AccountListState({
    this.accounts = const [],
    this.isLoading = false,
    this.errorMessage,
    this.pagination,
    this.searchQuery = '',
  });

  final List<Account> accounts;
  final bool isLoading;
  final String? errorMessage;
  final Pagination? pagination;
  final String searchQuery;

  AccountListState copyWith({
    List<Account>? accounts,
    bool? isLoading,
    String? errorMessage,
    Pagination? pagination,
    String? searchQuery,
  }) {
    return AccountListState(
      accounts: accounts ?? this.accounts,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      pagination: pagination ?? this.pagination,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

