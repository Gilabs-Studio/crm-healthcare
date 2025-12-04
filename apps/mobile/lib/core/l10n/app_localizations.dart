import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  static final List<Locale> supportedLocales = [
    const Locale('en', ''), // English
    const Locale('id', ''), // Indonesian
  ];

  // Profile Screen
  String get profile => _localizedValues[locale.languageCode]?['profile'] ?? 'Profile';
  String get settings => _localizedValues[locale.languageCode]?['settings'] ?? 'Settings';
  String get notifications => _localizedValues[locale.languageCode]?['notifications'] ?? 'Notifications';
  String get manageNotificationSettings => _localizedValues[locale.languageCode]?['manageNotificationSettings'] ?? 'Manage notification settings';
  String get language => _localizedValues[locale.languageCode]?['language'] ?? 'Language';
  String get theme => _localizedValues[locale.languageCode]?['theme'] ?? 'Theme';
  String get lightTheme => _localizedValues[locale.languageCode]?['lightTheme'] ?? 'Light theme';
  String get darkTheme => _localizedValues[locale.languageCode]?['darkTheme'] ?? 'Dark theme';
  String get systemTheme => _localizedValues[locale.languageCode]?['systemTheme'] ?? 'Follow system setting';
  String get about => _localizedValues[locale.languageCode]?['about'] ?? 'About';
  String get appVersion => _localizedValues[locale.languageCode]?['appVersion'] ?? 'App Version';
  String get privacyPolicy => _localizedValues[locale.languageCode]?['privacyPolicy'] ?? 'Privacy Policy';
  String get viewPrivacyPolicy => _localizedValues[locale.languageCode]?['viewPrivacyPolicy'] ?? 'View privacy policy';
  String get termsOfService => _localizedValues[locale.languageCode]?['termsOfService'] ?? 'Terms of Service';
  String get viewTermsOfService => _localizedValues[locale.languageCode]?['viewTermsOfService'] ?? 'View terms of service';
  String get logout => _localizedValues[locale.languageCode]?['logout'] ?? 'Logout';
  String get logoutConfirmation => _localizedValues[locale.languageCode]?['logoutConfirmation'] ?? 'Are you sure you want to logout?';
  String get cancel => _localizedValues[locale.languageCode]?['cancel'] ?? 'Cancel';
  String get selectTheme => _localizedValues[locale.languageCode]?['selectTheme'] ?? 'Select Theme';
  String get selectLanguage => _localizedValues[locale.languageCode]?['selectLanguage'] ?? 'Select Language';
  String get english => _localizedValues[locale.languageCode]?['english'] ?? 'English';
  String get indonesian => _localizedValues[locale.languageCode]?['indonesian'] ?? 'Indonesian';

  // Login Screen
  String get signInToYourAccount => _localizedValues[locale.languageCode]?['signInToYourAccount'] ?? 'Sign in to your Account';
  String get enterEmailPassword => _localizedValues[locale.languageCode]?['enterEmailPassword'] ?? 'Enter your email and password to log in';
  String get email => _localizedValues[locale.languageCode]?['email'] ?? 'Email';
  String get password => _localizedValues[locale.languageCode]?['password'] ?? 'Password';
  String get enterPassword => _localizedValues[locale.languageCode]?['enterPassword'] ?? 'Enter your password';
  String get rememberMe => _localizedValues[locale.languageCode]?['rememberMe'] ?? 'Remember me';
  String get logIn => _localizedValues[locale.languageCode]?['logIn'] ?? 'Log In';

  // Bottom Navigation
  String get home => _localizedValues[locale.languageCode]?['home'] ?? 'Home';
  String get accounts => _localizedValues[locale.languageCode]?['accounts'] ?? 'Accounts';
  String get contacts => _localizedValues[locale.languageCode]?['contacts'] ?? 'Contacts';
  String get accountsAndContacts => _localizedValues[locale.languageCode]?['accountsAndContacts'] ?? 'Accounts';
  String get reports => _localizedValues[locale.languageCode]?['reports'] ?? 'Reports';
  String get tasks => _localizedValues[locale.languageCode]?['tasks'] ?? 'Tasks';
  String get reportsAndTasks => _localizedValues[locale.languageCode]?['reportsAndTasks'] ?? 'Reports';

  static final Map<String, Map<String, String>> _localizedValues = {
    'en': {
      'profile': 'Profile',
      'settings': 'Settings',
      'notifications': 'Notifications',
      'manageNotificationSettings': 'Manage notification settings',
      'language': 'Language',
      'theme': 'Theme',
      'lightTheme': 'Light theme',
      'darkTheme': 'Dark theme',
      'systemTheme': 'Follow system setting',
      'about': 'About',
      'appVersion': 'App Version',
      'privacyPolicy': 'Privacy Policy',
      'viewPrivacyPolicy': 'View privacy policy',
      'termsOfService': 'Terms of Service',
      'viewTermsOfService': 'View terms of service',
      'logout': 'Logout',
      'logoutConfirmation': 'Are you sure you want to logout?',
      'cancel': 'Cancel',
      'selectTheme': 'Select Theme',
      'selectLanguage': 'Select Language',
      'english': 'English',
      'indonesian': 'Indonesian',
      'signInToYourAccount': 'Sign in to your Account',
      'enterEmailPassword': 'Enter your email and password to log in',
      'email': 'Email',
      'password': 'Password',
      'enterPassword': 'Enter your password',
      'rememberMe': 'Remember me',
      'logIn': 'Log In',
      'home': 'Home',
      'accounts': 'Accounts',
      'contacts': 'Contacts',
      'accountsAndContacts': 'Accounts',
      'reports': 'Reports',
      'tasks': 'Tasks',
      'reportsAndTasks': 'Reports',
    },
    'id': {
      'profile': 'Profil',
      'settings': 'Pengaturan',
      'notifications': 'Notifikasi',
      'manageNotificationSettings': 'Kelola pengaturan notifikasi',
      'language': 'Bahasa',
      'theme': 'Tema',
      'lightTheme': 'Tema terang',
      'darkTheme': 'Tema gelap',
      'systemTheme': 'Ikuti pengaturan sistem',
      'about': 'Tentang',
      'appVersion': 'Versi Aplikasi',
      'privacyPolicy': 'Kebijakan Privasi',
      'viewPrivacyPolicy': 'Lihat kebijakan privasi',
      'termsOfService': 'Syarat Layanan',
      'viewTermsOfService': 'Lihat syarat layanan',
      'logout': 'Keluar',
      'logoutConfirmation': 'Apakah Anda yakin ingin keluar?',
      'cancel': 'Batal',
      'selectTheme': 'Pilih Tema',
      'selectLanguage': 'Pilih Bahasa',
      'english': 'Bahasa Inggris',
      'indonesian': 'Bahasa Indonesia',
      'signInToYourAccount': 'Masuk ke Akun Anda',
      'enterEmailPassword': 'Masukkan email dan kata sandi Anda untuk masuk',
      'email': 'Email',
      'password': 'Kata Sandi',
      'enterPassword': 'Masukkan kata sandi Anda',
      'rememberMe': 'Ingat saya',
      'logIn': 'Masuk',
      'home': 'Beranda',
      'accounts': 'Akun',
      'contacts': 'Kontak',
      'accountsAndContacts': 'Akun',
      'reports': 'Laporan',
      'tasks': 'Tugas',
      'reportsAndTasks': 'Laporan',
    },
  };
}

class _AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return AppLocalizations.supportedLocales
        .any((supportedLocale) => supportedLocale.languageCode == locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}


