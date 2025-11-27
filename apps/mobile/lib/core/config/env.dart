class Env {
  const Env._();

  /// Base URL untuk backend API.
  /// Sesuaikan dengan environment (dev/staging/prod).
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080',
  );
}




