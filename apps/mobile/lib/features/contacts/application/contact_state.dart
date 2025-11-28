import '../data/models/contact.dart';

class ContactListState {
  const ContactListState({
    this.contacts = const [],
    this.isLoading = false,
    this.errorMessage,
    this.pagination,
    this.searchQuery = '',
    this.accountId,
  });

  final List<Contact> contacts;
  final bool isLoading;
  final String? errorMessage;
  final Pagination? pagination;
  final String searchQuery;
  final String? accountId;

  ContactListState copyWith({
    List<Contact>? contacts,
    bool? isLoading,
    String? errorMessage,
    Pagination? pagination,
    String? searchQuery,
    String? accountId,
  }) {
    return ContactListState(
      contacts: contacts ?? this.contacts,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
      pagination: pagination ?? this.pagination,
      searchQuery: searchQuery ?? this.searchQuery,
      accountId: accountId ?? this.accountId,
    );
  }
}

