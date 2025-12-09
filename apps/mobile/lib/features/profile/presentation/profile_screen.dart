import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/l10n/locale_provider.dart';
import '../../../core/theme/theme_provider.dart';
import '../../../core/utils/app_info.dart';
import '../../../core/widgets/main_scaffold.dart';
import '../../auth/application/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  String _getThemeLabel(ThemeMode themeMode, AppLocalizations l10n) {
    switch (themeMode) {
      case ThemeMode.light:
        return l10n.lightTheme;
      case ThemeMode.dark:
        return l10n.darkTheme;
      case ThemeMode.system:
        return l10n.systemTheme;
    }
  }

  String _getLanguageLabel(Locale locale, AppLocalizations l10n) {
    switch (locale.languageCode) {
      case 'id':
        return l10n.indonesian;
      case 'en':
      default:
        return l10n.english;
    }
  }

  IconData _getThemeIcon(ThemeMode themeMode) {
    switch (themeMode) {
      case ThemeMode.light:
        return Icons.light_mode_outlined;
      case ThemeMode.dark:
        return Icons.dark_mode_outlined;
      case ThemeMode.system:
        return Icons.brightness_auto_outlined;
    }
  }

  void _showThemeModal(
    BuildContext context,
    WidgetRef ref,
    ThemeMode currentThemeMode,
    ThemeModeNotifier themeNotifier,
    AppLocalizations l10n,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _ThemeSelectorModal(
        currentThemeMode: currentThemeMode,
        onThemeSelected: (mode) async {
          await themeNotifier.setThemeMode(mode);
          if (context.mounted) {
            Navigator.pop(context);
          }
        },
        l10n: l10n,
      ),
    );
  }

  void _showLanguageModal(
    BuildContext context,
    WidgetRef ref,
    Locale currentLocale,
    LocaleNotifier localeNotifier,
    AppLocalizations l10n,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => _LanguageSelectorModal(
        currentLocale: currentLocale,
        onLanguageSelected: (locale) async {
          await localeNotifier.setLocale(locale);
          if (context.mounted) {
            Navigator.pop(context);
          }
        },
        l10n: l10n,
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    final authState = ref.watch(authProvider);
    final user = authState.user;
    final themeMode = ref.watch(themeModeProvider);
    final themeNotifier = ref.read(themeModeProvider.notifier);
    final locale = ref.watch(localeProvider);
    final localeNotifier = ref.read(localeProvider.notifier);

    // Use user data from auth state, fallback to placeholder if not available
    final userName = user?.name.isNotEmpty == true ? user!.name : 'User';
    final userEmail = user?.email.isNotEmpty == true ? user!.email : 'user@example.com';
    final userRole = user?.role.isNotEmpty == true ? user!.role : 'Sales Rep';

    // Get current theme mode label
    final themeLabel = _getThemeLabel(themeMode, l10n);
    final themeIcon = _getThemeIcon(themeMode);
    final languageLabel = _getLanguageLabel(locale, l10n);

    return MainScaffold(
      currentIndex: 3,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Header - Modern & Minimalistic
              SizedBox(
                width: double.infinity,
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Avatar
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: theme.colorScheme.primary.withOpacity(0.3),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: user?.avatarUrl != null &&
                                  user!.avatarUrl!.isNotEmpty
                              ? _buildAvatarImage(
                                  user.avatarUrl!,
                                  userName,
                                  theme,
                                )
                              : Container(
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                      colors: [
                                        theme.colorScheme.primary,
                                        theme.colorScheme.primary
                                            .withOpacity(0.8),
                                      ],
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      userName.substring(0, 1).toUpperCase(),
                                      style: theme.textTheme.headlineLarge
                                          ?.copyWith(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 32,
                                      ),
                                    ),
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(width: 20),
                      // User Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Name
                            Text(
                              userName,
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.onSurface,
                                fontSize: 20,
                              ),
                            ),
                            const SizedBox(height: 6),
                            // Email
                            Text(
                              userEmail,
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onSurface.withOpacity(0.7),
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 8),
                            // Role Badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: theme.colorScheme.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Text(
                                userRole,
                                style: theme.textTheme.bodySmall?.copyWith(
                                  color: theme.colorScheme.primary,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              // Settings Section
              _SectionTitle(title: l10n.settings),
              const SizedBox(height: 16),
              // Notifications
              _SettingsCard(
                child: _SettingsTile(
                  icon: Icons.notifications_outlined,
                  title: l10n.notifications,
                  subtitle: l10n.manageNotificationSettings,
                  onTap: () {
                    // TODO: Navigate to notifications
                  },
                ),
              ),
              const SizedBox(height: 16),
              // Language
              _SettingsCard(
                child: _SettingsTile(
                  icon: Icons.language_outlined,
                  title: l10n.language,
                  subtitle: languageLabel,
                  onTap: () {
                    _showLanguageModal(context, ref, locale, localeNotifier, l10n);
                  },
                ),
              ),
              const SizedBox(height: 16),
              // Theme
              _SettingsCard(
                child: _SettingsTile(
                  icon: themeIcon,
                  title: l10n.theme,
                  subtitle: themeLabel,
                  onTap: () {
                    _showThemeModal(context, ref, themeMode, themeNotifier, l10n);
                  },
                ),
              ),
              const SizedBox(height: 32),
              // About Section
              _SectionTitle(title: l10n.about),
              const SizedBox(height: 16),
              // App Version
              _SettingsCard(
                child: _SettingsTile(
                  icon: Icons.info_outline,
                  title: l10n.appVersion,
                  subtitle: AppInfo.versionString,
                  onTap: null,
                ),
              ),
              const SizedBox(height: 16),
              // Privacy Policy
              _SettingsCard(
                child: _SettingsTile(
                  icon: Icons.privacy_tip_outlined,
                  title: l10n.privacyPolicy,
                  subtitle: l10n.viewPrivacyPolicy,
                  onTap: () {
                    // TODO: Navigate to privacy policy
                  },
                ),
              ),
              const SizedBox(height: 16),
              // Terms of Service
              _SettingsCard(
                child: _SettingsTile(
                  icon: Icons.description_outlined,
                  title: l10n.termsOfService,
                  subtitle: l10n.viewTermsOfService,
                  onTap: () {
                    // TODO: Navigate to terms of service
                  },
                ),
              ),
              const SizedBox(height: 32),
              // Logout Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () async {
                    final confirmed = await showDialog<bool>(
                      context: context,
                      builder: (context) => AlertDialog(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        title: Text(l10n.logout),
                        content: Text(l10n.logoutConfirmation),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context, false),
                            child: Text(l10n.cancel),
                          ),
                          FilledButton(
                            onPressed: () => Navigator.pop(context, true),
                            child: Text(l10n.logout),
                          ),
                        ],
                      ),
                    );

                    if (confirmed == true) {
                      await ref.read(authProvider.notifier).logout();
                    }
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: BorderSide(
                      color: Colors.red.withOpacity(0.3),
                      width: 1.5,
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    l10n.logout,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

Widget _buildAvatarImage(
  String avatarUrl,
  String userName,
  ThemeData theme,
) {
  // Check if URL is SVG - dicebear URLs contain .svg in the path
  final isSvg = avatarUrl.toLowerCase().contains('.svg') ||
      avatarUrl.toLowerCase().contains('dicebear');

  final fallbackWidget = Container(
    decoration: BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          theme.colorScheme.primary,
          theme.colorScheme.primary.withOpacity(0.8),
        ],
      ),
    ),
    child: Center(
      child: Text(
        userName.substring(0, 1).toUpperCase(),
        style: theme.textTheme.headlineLarge?.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.bold,
          fontSize: 32,
        ),
      ),
    ),
  );

  if (isSvg) {
    return SvgPicture.network(
      avatarUrl,
      width: 80,
      height: 80,
      fit: BoxFit.cover,
      placeholderBuilder: (context) => Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              theme.colorScheme.primary,
              theme.colorScheme.primary.withOpacity(0.8),
            ],
          ),
        ),
        child: Center(
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
          ),
        ),
      ),
    );
  } else {
    return Image.network(
      avatarUrl,
      width: 80,
      height: 80,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return fallbackWidget;
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                theme.colorScheme.primary,
                theme.colorScheme.primary.withOpacity(0.8),
              ],
            ),
          ),
          child: Center(
            child: CircularProgressIndicator(
              value: loadingProgress.expectedTotalBytes != null
                  ? loadingProgress.cumulativeBytesLoaded /
                      loadingProgress.expectedTotalBytes!
                  : null,
              strokeWidth: 2,
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
            ),
          ),
        );
      },
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Text(
      title,
      style: theme.textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w600,
        color: theme.colorScheme.onSurface,
        fontSize: 16,
        letterSpacing: 0.2,
      ),
    );
  }
}

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                color: theme.colorScheme.onSurface.withOpacity(0.7),
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.w500,
                      color: theme.colorScheme.onSurface,
                      fontSize: 15,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            if (onTap != null)
              Icon(
                Icons.chevron_right,
                color: theme.colorScheme.onSurface.withOpacity(0.5),
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}

class _ThemeSelectorModal extends StatelessWidget {
  const _ThemeSelectorModal({
    required this.currentThemeMode,
    required this.onThemeSelected,
    required this.l10n,
  });

  final ThemeMode currentThemeMode;
  final ValueChanged<ThemeMode> onThemeSelected;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurface.withOpacity(0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              l10n.selectTheme,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Theme Options
          _ThemeOption(
            icon: Icons.light_mode_outlined,
            title: l10n.lightTheme,
            subtitle: l10n.lightTheme,
            isSelected: currentThemeMode == ThemeMode.light,
            onTap: () => onThemeSelected(ThemeMode.light),
          ),
          const Divider(height: 1),
          _ThemeOption(
            icon: Icons.dark_mode_outlined,
            title: l10n.darkTheme,
            subtitle: l10n.darkTheme,
            isSelected: currentThemeMode == ThemeMode.dark,
            onTap: () => onThemeSelected(ThemeMode.dark),
          ),
          const Divider(height: 1),
          _ThemeOption(
            icon: Icons.brightness_auto_outlined,
            title: l10n.systemTheme,
            subtitle: l10n.systemTheme,
            isSelected: currentThemeMode == ThemeMode.system,
            onTap: () => onThemeSelected(ThemeMode.system),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _ThemeOption extends StatelessWidget {
  const _ThemeOption({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurface.withOpacity(0.7),
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurface,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: theme.colorScheme.primary,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
}

class _LanguageSelectorModal extends StatelessWidget {
  const _LanguageSelectorModal({
    required this.currentLocale,
    required this.onLanguageSelected,
    required this.l10n,
  });

  final Locale currentLocale;
  final ValueChanged<Locale> onLanguageSelected;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 20),
            decoration: BoxDecoration(
              color: theme.colorScheme.onSurface.withOpacity(0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          // Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Text(
              l10n.selectLanguage,
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
          ),
          const SizedBox(height: 24),
          // Language Options
          _LanguageOption(
            locale: const Locale('en', ''),
            title: l10n.english,
            subtitle: l10n.english,
            isSelected: currentLocale.languageCode == 'en',
            onTap: () => onLanguageSelected(const Locale('en', '')),
          ),
          const Divider(height: 1),
          _LanguageOption(
            locale: const Locale('id', ''),
            title: l10n.indonesian,
            subtitle: l10n.indonesian,
            isSelected: currentLocale.languageCode == 'id',
            onTap: () => onLanguageSelected(const Locale('id', '')),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _LanguageOption extends StatelessWidget {
  const _LanguageOption({
    required this.locale,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  final Locale locale;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Get flag emoji for locale
    final flagEmoji = locale.languageCode == 'id' ? '🇮🇩' : '🇬🇧';

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Row(
          children: [
            // Flag emoji
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: theme.colorScheme.onSurface.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  flagEmoji,
                  style: const TextStyle(fontSize: 24),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.bodyLarge?.copyWith(
                      fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                      color: isSelected
                          ? theme.colorScheme.primary
                          : theme.colorScheme.onSurface,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.7),
                      fontSize: 13,
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              Icon(
                Icons.check_circle,
                color: theme.colorScheme.primary,
                size: 24,
              ),
          ],
        ),
      ),
    );
  }
}

