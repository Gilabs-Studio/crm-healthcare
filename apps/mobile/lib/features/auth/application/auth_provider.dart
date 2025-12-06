import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/storage/local_storage.dart';
import '../data/auth_repository.dart';
import 'auth_state.dart';

final localStorageProvider = FutureProvider<LocalStorage>((ref) async {
  return LocalStorage.create();
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ApiClient.dio);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.read(authRepositoryProvider);
  return AuthNotifier(repository, ref);
});

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository, this._ref) : super(AuthState.unknown()) {
    // Check existing token saat app start (auto-login)
    _checkAuthStatus();
  }

  final AuthRepository _repository;
  final Ref _ref;

  /// Check authentication status saat app start
  /// Jika ada token dan rememberMe = true, set state ke authenticated
  Future<void> _checkAuthStatus() async {
    try {
      final storage = await _ref.read(localStorageProvider.future);
      final token = storage.getAuthToken();
      final rememberMe = storage.getRememberMe();

      if (token != null && rememberMe) {
        // Token ada dan rememberMe = true → auto-login
        state = AuthState.authenticated();
      } else if (token != null && !rememberMe) {
        // Token ada tapi rememberMe = false → hapus token (session only)
        await storage.clearAuthToken();
        state = AuthState.unauthenticated();
      } else {
        // Tidak ada token → unauthenticated
        state = AuthState.unauthenticated();
      }
    } catch (e) {
      // Jika error, anggap unauthenticated
      state = AuthState.unauthenticated();
    }
  }

  Future<void> login(
    String email,
    String password, {
    bool rememberMe = false,
  }) async {
    if (email.isEmpty || password.isEmpty) {
      state = state.copyWith(
        errorMessage: 'Email dan password wajib diisi',
        isLoading: false,
        status: AuthStatus.unauthenticated,
      );
      return;
    }

    state = state.copyWith(
      isLoading: true,
      errorMessage: null,
    );

    try {
      final loginResponse = await _repository.login(
        email: email,
        password: password,
      );

      // Save tokens to local storage
      final storage = await _ref.read(localStorageProvider.future);
      await storage.saveAuthToken(loginResponse.token);
      await storage.saveRefreshToken(loginResponse.refreshToken);
      await storage.setRememberMe(rememberMe);

      // Set authenticated state with user data
      state = AuthState(
        status: AuthStatus.authenticated,
        isLoading: false,
        errorMessage: null,
        user: loginResponse.user,
      );
    } catch (error) {
      final errorMessage = error is Exception
          ? error.toString().replaceFirst('Exception: ', '')
          : 'Gagal login. Coba lagi.';
      state = state.copyWith(
        isLoading: false,
        status: AuthStatus.unauthenticated,
        errorMessage: errorMessage,
      );
    }
  }

  Future<void> logout() async {
    final storage = await _ref.read(localStorageProvider.future);
    await storage.clearAuthToken();
    state = AuthState.unauthenticated();
  }

  Future<bool> refreshToken() async {
    try {
      final storage = await _ref.read(localStorageProvider.future);
      final refreshToken = storage.getRefreshToken();

      if (refreshToken == null) {
        return false;
      }

      final loginResponse = await _repository.refreshToken(refreshToken);

      // Save new tokens to local storage
      await storage.saveAuthToken(loginResponse.token);
      await storage.saveRefreshToken(loginResponse.refreshToken);

      // Update state with new user data
      state = AuthState(
        status: AuthStatus.authenticated,
        isLoading: false,
        errorMessage: null,
        user: loginResponse.user,
      );

      return true;
    } catch (e) {
      // Refresh token failed, logout user
      await logout();
      return false;
    }
  }
}


