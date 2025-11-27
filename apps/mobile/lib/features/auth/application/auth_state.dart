enum AuthStatus {
  unknown,
  authenticated,
  unauthenticated,
}

class AuthState {
  const AuthState({
    required this.status,
    this.isLoading = false,
    this.errorMessage,
  });

  final AuthStatus status;
  final bool isLoading;
  final String? errorMessage;

  factory AuthState.unauthenticated() {
    return const AuthState(status: AuthStatus.unauthenticated);
  }

  factory AuthState.authenticated() {
    return const AuthState(status: AuthStatus.authenticated);
  }

  AuthState copyWith({
    AuthStatus? status,
    bool? isLoading,
    String? errorMessage,
  }) {
    return AuthState(
      status: status ?? this.status,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: errorMessage,
    );
  }
}


