import 'package:flutter/material.dart';

class AppTheme {
  const AppTheme._();

  // Colors from web app (converted from OKLCH to Material colors)
  // Primary: oklch(0.5234 0.1347 144.1672) - Green/Teal
  static const Color primaryColor = Color(0xFF22C55E); // Approximate green
  static const Color primaryColorDark = Color(0xFF16A34A);
  static const Color backgroundColor = Color(0xFFF8F9FA); // Light background
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color formCardBackground = Color(0xFFF5F5F5); // Light grey for form card
  static const Color textPrimary = Color(0xFF1F2937); // Dark grey/black
  static const Color textSecondary = Color(0xFF6B7280); // Medium grey
  static const Color borderColor = Color(0xFFE5E7EB); // Light border

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.light(
          primary: primaryColor,
          onPrimary: Colors.white,
          secondary: const Color(0xFFF3F4F6),
          onSecondary: primaryColorDark,
          surface: cardBackground,
          onSurface: textPrimary,
          background: backgroundColor,
          onBackground: textPrimary,
          error: const Color(0xFFEF4444),
          onError: Colors.white,
          outline: borderColor,
        ),
        scaffoldBackgroundColor: backgroundColor,
        cardColor: cardBackground,
        textTheme: const TextTheme(
          headlineMedium: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: textPrimary,
          ),
          bodyMedium: TextStyle(
            fontSize: 14,
            color: textPrimary,
          ),
          bodySmall: TextStyle(
            fontSize: 12,
            color: textSecondary,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: cardBackground,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: borderColor),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: borderColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: primaryColor, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: primaryColor,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF34D399), // Lighter green for dark mode
          onPrimary: const Color(0xFF065F46),
          secondary: const Color(0xFF374151),
          onSecondary: const Color(0xFFD1D5DB),
          surface: const Color(0xFF1F2937),
          onSurface: const Color(0xFFF9FAFB),
          background: const Color(0xFF111827),
          onBackground: const Color(0xFFF9FAFB),
          error: const Color(0xFFEF4444),
          onError: Colors.white,
          outline: const Color(0xFF374151),
        ),
        scaffoldBackgroundColor: const Color(0xFF111827),
        cardColor: const Color(0xFF1F2937),
      );
}
