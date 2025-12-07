import 'package:dio/dio.dart';
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
      final errorMessage = _extractErrorMessage(error);
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

  String _extractErrorMessage(dynamic error) {
    if (error is DioException) {
      // Handle timeout errors
      if (error.type == DioExceptionType.receiveTimeout ||
          error.type == DioExceptionType.sendTimeout ||
          error.type == DioExceptionType.connectionTimeout) {
        return 'Connection timeout. Please check your internet connection and try again.';
      }
      
      // Handle connection errors
      if (error.type == DioExceptionType.connectionError) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
      
      if (error.response != null) {
        final responseData = error.response!.data;
        if (responseData is Map<String, dynamic> && responseData['error'] != null) {
          final errorObj = responseData['error'] as Map<String, dynamic>;
          final message = errorObj['message'] as String?;
          if (message != null && message.isNotEmpty) {
            return message;
          }
        }
        // Check for status code specific messages
        if (error.response!.statusCode == 401) {
          return 'Invalid email or password. Please try again.';
        }
        if (error.response!.statusCode == 403) {
          return 'Access forbidden.';
        }
        if (error.response!.statusCode == 404) {
          return 'Login endpoint not found.';
        }
        if (error.response!.statusCode == 500) {
          return 'Server error. Please try again later.';
        }
      }
      
      // Handle error message from DioException
      final errorMessage = error.message ?? '';
      if (errorMessage.contains('timeout') || errorMessage.contains('Timeout')) {
        return 'Connection timeout. Please check your internet connection and try again.';
      }
      if (errorMessage.contains('Failed host lookup') || 
          errorMessage.contains('SocketException')) {
        return 'Unable to connect to server. Please check your internet connection.';
      }
      
      return errorMessage.isNotEmpty 
          ? errorMessage 
          : 'Login failed. Please check your credentials and try again.';
    }
    
    // Handle other exceptions
    final errorString = error.toString();
    if (errorString.startsWith('Exception: ')) {
      final message = errorString.substring(11);
      // Check if it's a timeout error
      if (message.contains('timeout') || message.contains('Timeout')) {
        return 'Connection timeout. Please check your internet connection and try again.';
      }
      return message;
    }
    
    return 'Login failed. Please try again.';
  }
}


