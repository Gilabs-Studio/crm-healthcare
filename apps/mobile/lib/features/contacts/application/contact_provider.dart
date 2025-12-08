import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/cache/list_cache.dart';
import '../../../core/network/api_client.dart';
import '../data/contact_repository.dart';
import '../data/role_repository.dart';
import '../data/models/contact.dart';
import 'contact_state.dart';

final contactRepositoryProvider = Provider<ContactRepository>((ref) {
  return ContactRepository(ApiClient.dio);
});

final roleRepositoryProvider = Provider<RoleRepository>((ref) {
  return RoleRepository(ApiClient.dio);
});

final rolesProvider = FutureProvider<List<Role>>((ref) async {
  final repository = ref.read(roleRepositoryProvider);
  return repository.getRoles();
});

final contactListProvider =
    StateNotifierProvider<ContactListNotifier, ContactListState>((ref) {
  final repository = ref.read(contactRepositoryProvider);
  return ContactListNotifier(repository);
});

final contactDetailProvider =
    FutureProvider.family<Contact, String>((ref, id) async {
  final repository = ref.read(contactRepositoryProvider);
  return repository.getContactById(id);
});

class ContactListNotifier extends StateNotifier<ContactListState> {
  ContactListNotifier(this._repository) : super(const ContactListState());

  final ContactRepository _repository;
  final ListCache _cache = ListCache();

  Future<void> loadContacts({
    int page = 1,
    bool refresh = false,
    String? search,
    String? accountId,
    bool forceRefresh = false,
  }) async {
    final searchQuery = search ?? state.searchQuery;
    final filterAccountId = accountId ?? state.accountId;
    final cacheKey = ListCache.cacheKey(
      'contacts',
      page: page,
      search: searchQuery.isNotEmpty ? searchQuery : null,
      filters: filterAccountId != null
          ? {'account_id': filterAccountId}
          : null,
    );

    // Try to load from cache first (optimistic UI) - only for first page
    if (!forceRefresh && !refresh && page == 1) {
      final cachedContacts = _cache.get<Contact>(
        cacheKey,
        ttl: const Duration(seconds: 60),
        expectedMetadata: {
          if (searchQuery.isNotEmpty) 'search': searchQuery,
          if (filterAccountId != null) 'account_id': filterAccountId,
        },
      );

      if (cachedContacts != null && cachedContacts.isNotEmpty) {
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
          contacts: cachedContacts,
          searchQuery: searchQuery,
          accountId: filterAccountId,
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
      final response = await _repository.getContacts(
        page: page,
        perPage: 20,
        search: searchQuery.isNotEmpty ? searchQuery : null,
        accountId: filterAccountId,
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
          if (filterAccountId != null) 'account_id': filterAccountId,
        },
      );

      if (refresh || page == 1) {
        state = state.copyWith(
          contacts: response.items,
          pagination: response.pagination,
          searchQuery: searchQuery,
          accountId: filterAccountId,
          isLoading: false,
          isLoadingMore: false,
          errorMessage: null,
        );
      } else {
        state = state.copyWith(
          contacts: [...state.contacts, ...response.items],
          pagination: response.pagination,
          isLoadingMore: false,
          errorMessage: null,
        );
      }
    } catch (e) {
      // On error, try to use cached data as fallback
      if (page == 1) {
        final cachedContacts = _cache.get<Contact>(cacheKey);
        if (cachedContacts != null && cachedContacts.isNotEmpty) {
          state = state.copyWith(
            contacts: cachedContacts,
            isLoading: false,
            isLoadingMore: false,
            errorMessage: null,
          );
          return;
        }
      }

      state = state.copyWith(
        isLoading: false,
        isLoadingMore: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<void> refresh() async {
    // Clear cache for contacts
    _cache.clearPrefix('list:contacts');
    await loadContacts(page: 1, refresh: true, forceRefresh: true);
  }

  Future<void> loadMore() async {
    if (state.isLoading || state.isLoadingMore) return;
    final pagination = state.pagination;
    if (pagination == null || !pagination.hasNextPage) return;

    await loadContacts(page: pagination.page + 1);
  }

  void updateSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  void setAccountFilter(String? accountId) {
    state = state.copyWith(accountId: accountId);
  }

  Future<Contact?> createContact({
    required String accountId,
    required String name,
    required String roleId,
    String? phone,
    String? email,
    String? position,
    String? notes,
  }) async {
    try {
      state = state.copyWith(isLoading: true, errorMessage: null);
      final contact = await _repository.createContact(
        accountId: accountId,
        name: name,
        roleId: roleId,
        phone: phone,
        email: email,
        position: position,
        notes: notes,
      );
      state = state.copyWith(isLoading: false);
      // Refresh list
      await loadContacts(page: 1, refresh: true);
      return contact;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<Contact?> updateContact({
    required String id,
    String? accountId,
    String? name,
    String? roleId,
    String? phone,
    String? email,
    String? position,
    String? notes,
  }) async {
    try {
      state = state.copyWith(isLoading: true, errorMessage: null);
      final contact = await _repository.updateContact(
        id: id,
        accountId: accountId,
        name: name,
        roleId: roleId,
        phone: phone,
        email: email,
        position: position,
        notes: notes,
      );
      state = state.copyWith(isLoading: false);
      // Refresh list
      await loadContacts(page: 1, refresh: true);
      return contact;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return null;
    }
  }

  Future<bool> deleteContact(String id) async {
    try {
      state = state.copyWith(isLoading: true, errorMessage: null);
      await _repository.deleteContact(id);
      state = state.copyWith(isLoading: false);
      // Clear cache and refresh list
      _cache.clearPrefix('list:contacts');
      await loadContacts(page: 1, refresh: true, forceRefresh: true);
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

