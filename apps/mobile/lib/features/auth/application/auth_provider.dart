import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/auth_repository.dart';
import 'auth_state.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ApiClient.dio);
});

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.read(authRepositoryProvider);
  return AuthNotifier(repository);
});

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._repository) : super(AuthState.unauthenticated());

  final AuthRepository _repository;

  Future<void> login(String email, String password) async {
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
      await _repository.login(email: email, password: password);
      state = AuthState.authenticated();
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        status: AuthStatus.unauthenticated,
        errorMessage: 'Gagal login. Coba lagi.',
      );
    }
  }

  void logout() {
    state = AuthState.unauthenticated();
  }
}


