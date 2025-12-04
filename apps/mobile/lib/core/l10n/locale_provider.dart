import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/local_storage.dart';

final localStorageProvider = FutureProvider<LocalStorage>((ref) async {
  return LocalStorage.create();
});

final localeProvider = StateNotifierProvider<LocaleNotifier, Locale>((ref) {
  final localStorage = ref.watch(localStorageProvider);
  return LocaleNotifier(localStorage);
});

class LocaleNotifier extends StateNotifier<Locale> {
  LocaleNotifier(this._localStorageAsync) : super(const Locale('en', '')) {
    _loadLocale();
  }

  final AsyncValue<LocalStorage> _localStorageAsync;

  Future<void> _loadLocale() async {
    _localStorageAsync.whenData((localStorage) {
      final localeString = localStorage.getLocale();
      state = _parseLocale(localeString);
    });
  }

  Locale _parseLocale(String localeString) {
    switch (localeString) {
      case 'id':
        return const Locale('id', '');
      case 'en':
      default:
        return const Locale('en', ''); // Default to English
    }
  }

  String _localeToString(Locale locale) {
    return locale.languageCode;
  }

  Future<void> setLocale(Locale locale) async {
    await _localStorageAsync.when(
      data: (localStorage) async {
        await localStorage.setLocale(_localeToString(locale));
        state = locale;
      },
      loading: () {},
      error: (_, __) {},
    );
  }
}


