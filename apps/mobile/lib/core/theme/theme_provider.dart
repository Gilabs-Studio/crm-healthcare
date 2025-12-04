import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/local_storage.dart';

final localStorageProvider = FutureProvider<LocalStorage>((ref) async {
  return LocalStorage.create();
});

final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  final localStorage = ref.watch(localStorageProvider);
  return ThemeModeNotifier(localStorage);
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier(this._localStorageAsync) : super(ThemeMode.light) {
    _loadThemeMode();
  }

  final AsyncValue<LocalStorage> _localStorageAsync;

  Future<void> _loadThemeMode() async {
    _localStorageAsync.whenData((localStorage) {
      final themeModeString = localStorage.getThemeMode();
      state = _parseThemeMode(themeModeString);
    });
  }

  ThemeMode _parseThemeMode(String themeModeString) {
    switch (themeModeString) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
        return ThemeMode.system;
      default:
        return ThemeMode.light; // Default to light mode
    }
  }

  String _themeModeToString(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.light:
        return 'light';
      case ThemeMode.dark:
        return 'dark';
      case ThemeMode.system:
        return 'system';
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    await _localStorageAsync.when(
      data: (localStorage) async {
        await localStorage.setThemeMode(_themeModeToString(mode));
        state = mode;
      },
      loading: () {},
      error: (_, __) {},
    );
  }

  Future<void> toggleTheme() async {
    ThemeMode newMode;
    if (state == ThemeMode.light) {
      newMode = ThemeMode.dark;
    } else if (state == ThemeMode.dark) {
      newMode = ThemeMode.light;
    } else {
      // If system, check current system theme and toggle to opposite
      // For simplicity, toggle to dark if system
      newMode = ThemeMode.dark;
    }
    await setThemeMode(newMode);
  }
}

