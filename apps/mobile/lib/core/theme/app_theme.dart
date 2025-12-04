import 'package:flutter/material.dart';

class AppTheme {
  const AppTheme._();

  // Colors from web app (converted from OKLCH to Material colors)
  // Primary: oklch(0.5234 0.1347 144.1672) - Green/Teal
  static const Color primaryColor = Color(0xFF22C55E); // Approximate green
  static const Color primaryColorDark = Color(0xFF16A34A);
  static const Color backgroundColor = Color(0xFFFFFFFF); // White background
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color formCardBackground = Color(0xFFF5F5F5); // Light grey for form card
  static const Color textPrimary = Color(0xFF1F2937); // Dark grey/black
  static const Color textSecondary = Color(0xFF6B7280); // Medium grey
  static const Color borderColor = Color(0xFFE5E7EB); // Light border

  // Dark theme static colors (for use in widgets)
  static const Color darkTextPrimary = Color(0xFFF0F0F0); // Light text for dark mode
  static const Color darkTextSecondary = Color(0xFFA1A1AA); // Muted text for dark mode
  static const Color darkBorderColor = Color(0xFF4A5D57); // Border for dark mode

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.light(
          primary: primaryColor,
          onPrimary: Colors.white,
          secondary: const Color(0xFFF3F4F6),
          onSecondary: primaryColorDark,
          surface: cardBackground,
          onSurface: textPrimary,
          error: const Color(0xFFEF4444),
          onError: Colors.white,
          outline: borderColor,
        ),
        scaffoldBackgroundColor: Colors.white,
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

  // Dark theme colors from web app (converted from OKLCH)
  // Background: oklch(0.2683 0.0120 144.1672) ≈ #2A3A35 (dark green/teal)
  // Foreground: oklch(0.9423 0.0097 72.6595) ≈ #F0F0F0 (light text)
  // Card: oklch(0.3327 0.0120 144.1672) ≈ #3A4D47 (slightly lighter)
  // Primary: oklch(0.6731 0.1624 144.2083) ≈ #4ADE80 (lighter green)
  // Border: oklch(0.3942 0.0120 144.1672) ≈ #4A5D57 (border color)
  static const Color darkBackground = Color(0xFF2A3A35); // Dark green/teal background
  static const Color darkCard = Color(0xFF3A4D47); // Slightly lighter card
  static const Color darkForeground = Color(0xFFF0F0F0); // Light text
  static const Color darkPrimary = Color(0xFF4ADE80); // Lighter green primary
  static const Color darkPrimaryForeground = Color(0xFF064E3B); // Dark green for text on primary
  static const Color darkBorder = Color(0xFF4A5D57); // Border color
  static const Color darkMuted = Color(0xFF2F3F39); // Muted background
  static const Color darkMutedForeground = Color(0xFFA1A1AA); // Muted text

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.dark(
          primary: darkPrimary,
          onPrimary: darkPrimaryForeground,
          secondary: darkCard,
          onSecondary: darkForeground,
          surface: darkCard,
          onSurface: darkForeground,
          background: darkBackground,
          onBackground: darkForeground,
          error: const Color(0xFFEF4444),
          onError: Colors.white,
          outline: darkBorder,
        ),
        scaffoldBackgroundColor: darkBackground,
        cardColor: darkCard,
        textTheme: TextTheme(
          headlineMedium: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: darkForeground,
          ),
          bodyMedium: const TextStyle(
            fontSize: 14,
            color: darkForeground,
          ),
          bodySmall: const TextStyle(
            fontSize: 12,
            color: darkMutedForeground,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: darkCard,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: darkBorder),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: darkBorder),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: darkPrimary, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 14,
          ),
        ),
        filledButtonTheme: FilledButtonThemeData(
          style: FilledButton.styleFrom(
            backgroundColor: darkPrimary,
            foregroundColor: darkPrimaryForeground,
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
}
