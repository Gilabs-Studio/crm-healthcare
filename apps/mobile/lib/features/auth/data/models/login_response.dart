class LoginResponse {
  const LoginResponse({
    required this.user,
    required this.token,
    required this.refreshToken,
    required this.expiresIn,
  });

  final UserResponse user;
  final String token;
  final String refreshToken;
  final int expiresIn;

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      user: UserResponse.fromJson(json['user'] as Map<String, dynamic>),
      token: json['token'] as String,
      refreshToken: json['refresh_token'] as String,
      expiresIn: json['expires_in'] as int,
    );
  }
}

class UserResponse {
  const UserResponse({
    required this.id,
    required this.email,
    required this.name,
    this.avatarUrl,
    required this.role,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  final String id;
  final String email;
  final String name;
  final String? avatarUrl;
  final String role;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  factory UserResponse.fromJson(Map<String, dynamic> json) {
    return UserResponse(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String,
      avatarUrl: json['avatar_url'] as String?,
      role: json['role'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }
}


