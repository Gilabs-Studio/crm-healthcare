import '../data/models/contact.dart';

class ContactListState {
  const ContactListState({
    this.contacts = const [],
    this.isLoading = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.pagination,
    this.searchQuery = '',
    this.accountId,
  });

  final List<Contact> contacts;
  final bool isLoading;
  final bool isLoadingMore;
  final String? errorMessage;
  final Pagination? pagination;
  final String searchQuery;
  final String? accountId;

  ContactListState copyWith({
    List<Contact>? contacts,
    bool? isLoading,
    bool? isLoadingMore,
    String? errorMessage,
    Pagination? pagination,
    String? searchQuery,
    String? accountId,
    bool clearContacts = false,
  }) {
    return ContactListState(
      contacts: clearContacts ? const [] : (contacts ?? this.contacts),
      isLoading: isLoading ?? this.isLoading,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: errorMessage,
      pagination: pagination ?? this.pagination,
      searchQuery: searchQuery ?? this.searchQuery,
      accountId: accountId ?? this.accountId,
    );
  }
}

