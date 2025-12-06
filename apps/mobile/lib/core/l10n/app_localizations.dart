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
  String get searchVisitReports => _localizedValues[locale.languageCode]?['searchVisitReports'] ?? 'Search visit reports...';
  String get searchTasks => _localizedValues[locale.languageCode]?['searchTasks'] ?? 'Search tasks...';
  String get noVisitReportsFound => _localizedValues[locale.languageCode]?['noVisitReportsFound'] ?? 'No visit reports found';
  String get noTasksFound => _localizedValues[locale.languageCode]?['noTasksFound'] ?? 'No tasks found';
  String get tapToCreateVisitReport => _localizedValues[locale.languageCode]?['tapToCreateVisitReport'] ?? 'Tap + to create a new visit report';
  String get tapToCreateTask => _localizedValues[locale.languageCode]?['tapToCreateTask'] ?? 'Tap + to create a new task';
  String get createVisitReport => _localizedValues[locale.languageCode]?['createVisitReport'] ?? 'Create Visit Report';
  String get visitReports => _localizedValues[locale.languageCode]?['visitReports'] ?? 'Visit Reports';
  String get visitReportDetails => _localizedValues[locale.languageCode]?['visitReportDetails'] ?? 'Visit Report Details';
  String get visitInformation => _localizedValues[locale.languageCode]?['visitInformation'] ?? 'Visit Information';
  String get checkInOutStatus => _localizedValues[locale.languageCode]?['checkInOutStatus'] ?? 'Check-in/out Status';
  String get visitDate => _localizedValues[locale.languageCode]?['visitDate'] ?? 'Visit Date';
  String get purpose => _localizedValues[locale.languageCode]?['purpose'] ?? 'Purpose';
  String get photos => _localizedValues[locale.languageCode]?['photos'] ?? 'Photos';
  String get checkInTime => _localizedValues[locale.languageCode]?['checkInTime'] ?? 'Check-in Time';
  String get checkOutTime => _localizedValues[locale.languageCode]?['checkOutTime'] ?? 'Check-out Time';
  String get checkInLocation => _localizedValues[locale.languageCode]?['checkInLocation'] ?? 'Check-in Location';
  String get checkOutLocation => _localizedValues[locale.languageCode]?['checkOutLocation'] ?? 'Check-out Location';
  String get checkIn => _localizedValues[locale.languageCode]?['checkIn'] ?? 'Check In';
  String get checkOut => _localizedValues[locale.languageCode]?['checkOut'] ?? 'Check Out';
  String get uploadPhoto => _localizedValues[locale.languageCode]?['uploadPhoto'] ?? 'Upload Photo';
  String get notCheckedIn => _localizedValues[locale.languageCode]?['notCheckedIn'] ?? 'Not checked in';
  String get notCheckedOut => _localizedValues[locale.languageCode]?['notCheckedOut'] ?? 'Not checked out';
  String get checkInSuccessful => _localizedValues[locale.languageCode]?['checkInSuccessful'] ?? 'Check-in successful';
  String get checkOutSuccessful => _localizedValues[locale.languageCode]?['checkOutSuccessful'] ?? 'Check-out successful';
  String get photoUploadedSuccessfully => _localizedValues[locale.languageCode]?['photoUploadedSuccessfully'] ?? 'Photo uploaded successfully';
  String get failedToCheckIn => _localizedValues[locale.languageCode]?['failedToCheckIn'] ?? 'Failed to check in';
  String get failedToCheckOut => _localizedValues[locale.languageCode]?['failedToCheckOut'] ?? 'Failed to check out';
  String get failedToUploadPhoto => _localizedValues[locale.languageCode]?['failedToUploadPhoto'] ?? 'Failed to upload photo';
  String get selectContact => _localizedValues[locale.languageCode]?['selectContact'] ?? 'Select Contact';
  String get selectContactOptional => _localizedValues[locale.languageCode]?['selectContactOptional'] ?? 'Select contact (optional)';
  String get selectVisitDate => _localizedValues[locale.languageCode]?['selectVisitDate'] ?? 'Select visit date';
  String get enterVisitPurpose => _localizedValues[locale.languageCode]?['enterVisitPurpose'] ?? 'Enter visit purpose';
  String get enterAdditionalNotes => _localizedValues[locale.languageCode]?['enterAdditionalNotes'] ?? 'Enter additional notes';
  String get pleaseSelectAccount => _localizedValues[locale.languageCode]?['pleaseSelectAccount'] ?? 'Please select an account';
  String get visitReportCreatedSuccessfully => _localizedValues[locale.languageCode]?['visitReportCreatedSuccessfully'] ?? 'Visit report created successfully';
  String get failedToCreateVisitReport => _localizedValues[locale.languageCode]?['failedToCreateVisitReport'] ?? 'Failed to create visit report';
  String get all => _localizedValues[locale.languageCode]?['all'] ?? 'All';

  // Dashboard
  String get dashboard => _localizedValues[locale.languageCode]?['dashboard'] ?? 'Dashboard';
  String get welcomeBack => _localizedValues[locale.languageCode]?['welcomeBack'] ?? 'Welcome back,';
  String get today => _localizedValues[locale.languageCode]?['today'] ?? 'Today';
  String get thisWeek => _localizedValues[locale.languageCode]?['thisWeek'] ?? 'This Week';
  String get thisMonth => _localizedValues[locale.languageCode]?['thisMonth'] ?? 'This Month';
  String get thisYear => _localizedValues[locale.languageCode]?['thisYear'] ?? 'This Year';
  String get totalVisits => _localizedValues[locale.languageCode]?['totalVisits'] ?? 'Total Visits';
  String get totalAccounts => _localizedValues[locale.languageCode]?['totalAccounts'] ?? 'Total Accounts';
  String get totalActivities => _localizedValues[locale.languageCode]?['totalActivities'] ?? 'Total Activities';
  String get revenue => _localizedValues[locale.languageCode]?['revenue'] ?? 'Revenue';
  String get completed => _localizedValues[locale.languageCode]?['completed'] ?? 'completed';
  String get active => _localizedValues[locale.languageCode]?['active'] ?? 'active';
  String get visits => _localizedValues[locale.languageCode]?['visits'] ?? 'visits';
  String get calls => _localizedValues[locale.languageCode]?['calls'] ?? 'calls';
  String get fromWonDeals => _localizedValues[locale.languageCode]?['fromWonDeals'] ?? 'From won deals';
  String get salesTarget => _localizedValues[locale.languageCode]?['salesTarget'] ?? 'Sales Target';
  String get totalDeals => _localizedValues[locale.languageCode]?['totalDeals'] ?? 'Total Deals';
  String get leadsBySource => _localizedValues[locale.languageCode]?['leadsBySource'] ?? 'Leads by Source';
  String get upcomingTasks => _localizedValues[locale.languageCode]?['upcomingTasks'] ?? 'Upcoming Tasks';
  String get pipelineSummary => _localizedValues[locale.languageCode]?['pipelineSummary'] ?? 'Pipeline Summary';
  String get recentActivities => _localizedValues[locale.languageCode]?['recentActivities'] ?? 'Recent Activities';
  String get target => _localizedValues[locale.languageCode]?['target'] ?? 'Target';
  String get achieved => _localizedValues[locale.languageCode]?['achieved'] ?? 'Achieved';
  String get open => _localizedValues[locale.languageCode]?['open'] ?? 'Open';
  String get won => _localizedValues[locale.languageCode]?['won'] ?? 'Won';
  String get lost => _localizedValues[locale.languageCode]?['lost'] ?? 'Lost';
  String get totalValue => _localizedValues[locale.languageCode]?['totalValue'] ?? 'Total Value';
  String get totalLeads => _localizedValues[locale.languageCode]?['totalLeads'] ?? 'total leads';
  String get noLeadsForPeriod => _localizedValues[locale.languageCode]?['noLeadsForPeriod'] ?? 'No leads for this period';
  String get noUpcomingTasks => _localizedValues[locale.languageCode]?['noUpcomingTasks'] ?? 'No upcoming tasks';
  String targetProgressDescription(double progress) => _localizedValues[locale.languageCode]?['targetProgressDescription']?.replaceAll('{progress}', progress.toStringAsFixed(0)) ?? '${progress.toStringAsFixed(0)}% of target achieved';
  String totalAccountsDescription(int active, int inactive) => _localizedValues[locale.languageCode]?['totalAccountsDescription']?.replaceAll('{active}', active.toString()).replaceAll('{inactive}', inactive.toString()) ?? '$active active, $inactive inactive';
  String totalDealsDescription(int open, int won) => _localizedValues[locale.languageCode]?['totalDealsDescription']?.replaceAll('{open}', open.toString()).replaceAll('{won}', won.toString()) ?? '$open open, $won won';
  String get totalRevenueDescription => _localizedValues[locale.languageCode]?['totalRevenueDescription'] ?? 'Based on won deals in this period';
  String get topAccounts => _localizedValues[locale.languageCode]?['topAccounts'] ?? 'Top Accounts';
  String get topSalesReps => _localizedValues[locale.languageCode]?['topSalesReps'] ?? 'Top Sales Reps';
  String get visitStatistics => _localizedValues[locale.languageCode]?['visitStatistics'] ?? 'Visit Statistics';
  String get activityTrends => _localizedValues[locale.languageCode]?['activityTrends'] ?? 'Activity Trends';
  String get noTopAccounts => _localizedValues[locale.languageCode]?['noTopAccounts'] ?? 'No accounts found';
  String get noTopSalesReps => _localizedValues[locale.languageCode]?['noTopSalesReps'] ?? 'No sales reps found';
  String topAccountsVisits(int count) => _localizedValues[locale.languageCode]?['topAccountsVisits']?.replaceAll('{count}', count.toString()) ?? '$count visits';
  String topAccountsActivities(int count) => _localizedValues[locale.languageCode]?['topAccountsActivities']?.replaceAll('{count}', count.toString()) ?? '$count activities';
  String topSalesRepsVisits(int count) => _localizedValues[locale.languageCode]?['topSalesRepsVisits']?.replaceAll('{count}', count.toString()) ?? '$count visits';
  String topSalesRepsAccounts(int count) => _localizedValues[locale.languageCode]?['topSalesRepsAccounts']?.replaceAll('{count}', count.toString()) ?? '$count accounts';
  String get emails => _localizedValues[locale.languageCode]?['emails'] ?? 'emails';
  String get pending => _localizedValues[locale.languageCode]?['pending'] ?? 'pending';
  String get approved => _localizedValues[locale.languageCode]?['approved'] ?? 'approved';
  String get total => _localizedValues[locale.languageCode]?['total'] ?? 'Total';

  // Accounts & Contacts
  String get searchAccounts => _localizedValues[locale.languageCode]?['searchAccounts'] ?? 'Search accounts...';
  String get searchContacts => _localizedValues[locale.languageCode]?['searchContacts'] ?? 'Search contacts...';
  String get noAccountsFound => _localizedValues[locale.languageCode]?['noAccountsFound'] ?? 'No accounts found';
  String get noContactsFound => _localizedValues[locale.languageCode]?['noContactsFound'] ?? 'No contacts found';
  String get createAccount => _localizedValues[locale.languageCode]?['createAccount'] ?? 'Create Account';
  String get createContact => _localizedValues[locale.languageCode]?['createContact'] ?? 'Create Contact';
  String get accountDetails => _localizedValues[locale.languageCode]?['accountDetails'] ?? 'Account Details';
  String get contactDetails => _localizedValues[locale.languageCode]?['contactDetails'] ?? 'Contact Details';
  String get name => _localizedValues[locale.languageCode]?['name'] ?? 'Name';
  String get category => _localizedValues[locale.languageCode]?['category'] ?? 'Category';
  String get address => _localizedValues[locale.languageCode]?['address'] ?? 'Address';
  String get city => _localizedValues[locale.languageCode]?['city'] ?? 'City';
  String get province => _localizedValues[locale.languageCode]?['province'] ?? 'Province';
  String get phone => _localizedValues[locale.languageCode]?['phone'] ?? 'Phone';
  String get status => _localizedValues[locale.languageCode]?['status'] ?? 'Status';
  String get priority => _localizedValues[locale.languageCode]?['priority'] ?? 'Priority';
  String get inactive => _localizedValues[locale.languageCode]?['inactive'] ?? 'inactive';
  String get position => _localizedValues[locale.languageCode]?['position'] ?? 'Position';
  String get role => _localizedValues[locale.languageCode]?['role'] ?? 'Role';
  String get notes => _localizedValues[locale.languageCode]?['notes'] ?? 'Notes';
  String get save => _localizedValues[locale.languageCode]?['save'] ?? 'Save';
  String get retry => _localizedValues[locale.languageCode]?['retry'] ?? 'Retry';
  String get viewContacts => _localizedValues[locale.languageCode]?['viewContacts'] ?? 'View Contacts';
  String get selectCategory => _localizedValues[locale.languageCode]?['selectCategory'] ?? 'Select Category';
  String get selectAccount => _localizedValues[locale.languageCode]?['selectAccount'] ?? 'Select Account';
  String get selectRole => _localizedValues[locale.languageCode]?['selectRole'] ?? 'Select Role';
  String get required => _localizedValues[locale.languageCode]?['required'] ?? 'Required';
  String get optional => _localizedValues[locale.languageCode]?['optional'] ?? 'Optional';
  String get edit => _localizedValues[locale.languageCode]?['edit'] ?? 'Edit';
  String get delete => _localizedValues[locale.languageCode]?['delete'] ?? 'Delete';
  String get editAccount => _localizedValues[locale.languageCode]?['editAccount'] ?? 'Edit Account';
  String get deleteAccount => _localizedValues[locale.languageCode]?['deleteAccount'] ?? 'Delete Account';
  String get deleteConfirmation => _localizedValues[locale.languageCode]?['deleteConfirmation'] ?? 'Are you sure you want to delete this account?';
  String get accountDeleted => _localizedValues[locale.languageCode]?['accountDeleted'] ?? 'Account deleted successfully';
  String get accountUpdated => _localizedValues[locale.languageCode]?['accountUpdated'] ?? 'Account updated successfully';
  String get accountCreatedSuccessfully => _localizedValues[locale.languageCode]?['accountCreatedSuccessfully'] ?? 'Account created successfully';
  String get editContact => _localizedValues[locale.languageCode]?['editContact'] ?? 'Edit Contact';
  String get deleteContact => _localizedValues[locale.languageCode]?['deleteContact'] ?? 'Delete Contact';
  String get deleteContactConfirmation => _localizedValues[locale.languageCode]?['deleteContactConfirmation'] ?? 'Are you sure you want to delete this contact?';
  String get contactDeleted => _localizedValues[locale.languageCode]?['contactDeleted'] ?? 'Contact deleted successfully';
  String get contactUpdatedSuccessfully => _localizedValues[locale.languageCode]?['contactUpdatedSuccessfully'] ?? 'Contact updated successfully';
  String get contactCreatedSuccessfully => _localizedValues[locale.languageCode]?['contactCreatedSuccessfully'] ?? 'Contact created successfully';
  String get confirm => _localizedValues[locale.languageCode]?['confirm'] ?? 'Confirm';

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
      'searchVisitReports': 'Search visit reports...',
      'searchTasks': 'Search tasks...',
      'noVisitReportsFound': 'No visit reports found',
      'noTasksFound': 'No tasks found',
      'tapToCreateVisitReport': 'Tap + to create a new visit report',
      'tapToCreateTask': 'Tap + to create a new task',
      'createVisitReport': 'Create Visit Report',
      'visitReports': 'Visit Reports',
      'visitReportDetails': 'Visit Report Details',
      'visitInformation': 'Visit Information',
      'checkInOutStatus': 'Check-in/out Status',
      'visitDate': 'Visit Date',
      'purpose': 'Purpose',
      'photos': 'Photos',
      'checkInTime': 'Check-in Time',
      'checkOutTime': 'Check-out Time',
      'checkInLocation': 'Check-in Location',
      'checkOutLocation': 'Check-out Location',
      'checkIn': 'Check In',
      'checkOut': 'Check Out',
      'uploadPhoto': 'Upload Photo',
      'notCheckedIn': 'Not checked in',
      'notCheckedOut': 'Not checked out',
      'checkInSuccessful': 'Check-in successful',
      'checkOutSuccessful': 'Check-out successful',
      'photoUploadedSuccessfully': 'Photo uploaded successfully',
      'failedToCheckIn': 'Failed to check in',
      'failedToCheckOut': 'Failed to check out',
      'failedToUploadPhoto': 'Failed to upload photo',
      'selectContact': 'Select Contact',
      'selectContactOptional': 'Select contact (optional)',
      'selectVisitDate': 'Select visit date',
      'enterVisitPurpose': 'Enter visit purpose',
      'enterAdditionalNotes': 'Enter additional notes',
      'pleaseSelectAccount': 'Please select an account',
      'visitReportCreatedSuccessfully': 'Visit report created successfully',
      'failedToCreateVisitReport': 'Failed to create visit report',
      'all': 'All',
      'dashboard': 'Dashboard',
      'welcomeBack': 'Welcome back,',
      'today': 'Today',
      'thisWeek': 'This Week',
      'thisMonth': 'This Month',
      'thisYear': 'This Year',
      'totalVisits': 'Total Visits',
      'totalAccounts': 'Total Accounts',
      'totalActivities': 'Total Activities',
      'revenue': 'Revenue',
      'completed': 'completed',
      'active': 'active',
      'visits': 'visits',
      'calls': 'calls',
      'fromWonDeals': 'From won deals',
      'salesTarget': 'Sales Target',
      'totalDeals': 'Total Deals',
      'leadsBySource': 'Leads by Source',
      'upcomingTasks': 'Upcoming Tasks',
      'pipelineSummary': 'Pipeline Summary',
      'recentActivities': 'Recent Activities',
      'target': 'Target',
      'achieved': 'Achieved',
      'open': 'Open',
      'won': 'Won',
      'lost': 'Lost',
      'totalValue': 'Total Value',
      'totalLeads': 'total leads',
      'noLeadsForPeriod': 'No leads for this period',
      'noUpcomingTasks': 'No upcoming tasks',
      'targetProgressDescription': '{progress}% of target achieved',
      'totalAccountsDescription': '{active} active, {inactive} inactive',
      'totalDealsDescription': '{open} open, {won} won',
      'totalRevenueDescription': 'Based on won deals in this period',
      'topAccounts': 'Top Accounts',
      'topSalesReps': 'Top Sales Reps',
      'visitStatistics': 'Visit Statistics',
      'activityTrends': 'Activity Trends',
      'noTopAccounts': 'No accounts found',
      'noTopSalesReps': 'No sales reps found',
      'topAccountsVisits': '{count} visits',
      'topAccountsActivities': '{count} activities',
      'topSalesRepsVisits': '{count} visits',
      'topSalesRepsAccounts': '{count} accounts',
      'emails': 'emails',
      'pending': 'pending',
      'approved': 'approved',
      'total': 'Total',
      'searchAccounts': 'Search accounts...',
      'searchContacts': 'Search contacts...',
      'noAccountsFound': 'No accounts found',
      'noContactsFound': 'No contacts found',
      'createAccount': 'Create Account',
      'createContact': 'Create Contact',
      'accountDetails': 'Account Details',
      'contactDetails': 'Contact Details',
      'name': 'Name',
      'category': 'Category',
      'address': 'Address',
      'city': 'City',
      'province': 'Province',
      'phone': 'Phone',
      'status': 'Status',
      'inactive': 'inactive',
      'position': 'Position',
      'role': 'Role',
      'notes': 'Notes',
      'save': 'Save',
      'retry': 'Retry',
      'viewContacts': 'View Contacts',
      'selectCategory': 'Select Category',
      'selectAccount': 'Select Account',
      'selectRole': 'Select Role',
      'required': 'Required',
      'optional': 'Optional',
      'edit': 'Edit',
      'delete': 'Delete',
      'editAccount': 'Edit Account',
      'deleteAccount': 'Delete Account',
      'deleteConfirmation': 'Are you sure you want to delete this account?',
      'accountDeleted': 'Account deleted successfully',
      'accountUpdated': 'Account updated successfully',
      'accountCreatedSuccessfully': 'Account created successfully',
      'editContact': 'Edit Contact',
      'deleteContact': 'Delete Contact',
      'deleteContactConfirmation': 'Are you sure you want to delete this contact?',
      'contactDeleted': 'Contact deleted successfully',
      'contactUpdatedSuccessfully': 'Contact updated successfully',
      'contactCreatedSuccessfully': 'Contact created successfully',
      'confirm': 'Confirm',
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
      'dashboard': 'Dashboard',
      'welcomeBack': 'Selamat datang kembali,',
      'today': 'Hari Ini',
      'thisWeek': 'Minggu Ini',
      'thisMonth': 'Bulan Ini',
      'thisYear': 'Tahun Ini',
      'totalVisits': 'Total Kunjungan',
      'totalAccounts': 'Total Akun',
      'totalActivities': 'Total Aktivitas',
      'revenue': 'Pendapatan',
      'completed': 'selesai',
      'active': 'aktif',
      'visits': 'kunjungan',
      'calls': 'panggilan',
      'fromWonDeals': 'Dari deal yang menang',
      'salesTarget': 'Target Penjualan',
      'totalDeals': 'Total Deal',
      'leadsBySource': 'Leads berdasarkan Sumber',
      'upcomingTasks': 'Tugas Mendatang',
      'pipelineSummary': 'Ringkasan Pipeline',
      'recentActivities': 'Aktivitas Terkini',
      'target': 'Target',
      'achieved': 'Tercapai',
      'open': 'Terbuka',
      'won': 'Menang',
      'lost': 'Kalah',
      'totalValue': 'Total Nilai',
      'totalLeads': 'total leads',
      'noLeadsForPeriod': 'Tidak ada leads di periode ini',
      'noUpcomingTasks': 'Tidak ada tugas mendatang',
      'targetProgressDescription': '{progress}% dari target tercapai',
      'totalAccountsDescription': '{active} aktif, {inactive} tidak aktif',
      'totalDealsDescription': '{open} terbuka, {won} menang',
      'totalRevenueDescription': 'Berdasarkan deal menang di periode ini',
      'topAccounts': 'Akun Teratas',
      'topSalesReps': 'Sales Teratas',
      'visitStatistics': 'Statistik Kunjungan',
      'activityTrends': 'Tren Aktivitas',
      'noTopAccounts': 'Belum ada akun',
      'noTopSalesReps': 'Belum ada data sales',
      'topAccountsVisits': '{count} kunjungan',
      'topAccountsActivities': '{count} aktivitas',
      'topSalesRepsVisits': '{count} kunjungan',
      'topSalesRepsAccounts': '{count} akun',
      'emails': 'email',
      'pending': 'tertunda',
      'approved': 'disetujui',
      'total': 'Total',
      'searchAccounts': 'Cari akun...',
      'searchContacts': 'Cari kontak...',
      'noAccountsFound': 'Tidak ada akun ditemukan',
      'noContactsFound': 'Tidak ada kontak ditemukan',
      'createAccount': 'Buat Akun',
      'createContact': 'Buat Kontak',
      'accountDetails': 'Detail Akun',
      'contactDetails': 'Detail Kontak',
      'name': 'Nama',
      'category': 'Kategori',
      'address': 'Alamat',
      'city': 'Kota',
      'province': 'Provinsi',
      'phone': 'Telepon',
      'status': 'Status',
      'priority': 'Prioritas',
      'inactive': 'tidak aktif',
      'position': 'Posisi',
      'role': 'Peran',
      'notes': 'Catatan',
      'save': 'Simpan',
      'retry': 'Coba Lagi',
      'viewContacts': 'Lihat Kontak',
      'selectCategory': 'Pilih Kategori',
      'selectAccount': 'Pilih Akun',
      'selectRole': 'Pilih Peran',
      'required': 'Wajib',
      'optional': 'Opsional',
      'edit': 'Edit',
      'delete': 'Hapus',
      'editAccount': 'Edit Akun',
      'deleteAccount': 'Hapus Akun',
      'deleteConfirmation': 'Apakah Anda yakin ingin menghapus akun ini?',
      'accountDeleted': 'Akun berhasil dihapus',
      'accountUpdated': 'Akun berhasil diperbarui',
      'accountCreatedSuccessfully': 'Akun berhasil dibuat',
      'editContact': 'Edit Kontak',
      'deleteContact': 'Hapus Kontak',
      'deleteContactConfirmation': 'Apakah Anda yakin ingin menghapus kontak ini?',
      'contactDeleted': 'Kontak berhasil dihapus',
      'contactUpdatedSuccessfully': 'Kontak berhasil diperbarui',
      'contactCreatedSuccessfully': 'Kontak berhasil dibuat',
      'confirm': 'Konfirmasi',
      'searchVisitReports': 'Cari laporan kunjungan...',
      'searchTasks': 'Cari tugas...',
      'noVisitReportsFound': 'Tidak ada laporan kunjungan ditemukan',
      'noTasksFound': 'Tidak ada tugas ditemukan',
      'tapToCreateVisitReport': 'Ketuk + untuk membuat laporan kunjungan baru',
      'tapToCreateTask': 'Ketuk + untuk membuat tugas baru',
      'createVisitReport': 'Buat Laporan Kunjungan',
      'visitReports': 'Laporan Kunjungan',
      'visitReportDetails': 'Detail Laporan Kunjungan',
      'visitInformation': 'Informasi Kunjungan',
      'checkInOutStatus': 'Status Check-in/out',
      'visitDate': 'Tanggal Kunjungan',
      'purpose': 'Tujuan',
      'photos': 'Foto',
      'checkInTime': 'Waktu Check-in',
      'checkOutTime': 'Waktu Check-out',
      'checkInLocation': 'Lokasi Check-in',
      'checkOutLocation': 'Lokasi Check-out',
      'checkIn': 'Check In',
      'checkOut': 'Check Out',
      'uploadPhoto': 'Unggah Foto',
      'notCheckedIn': 'Belum check in',
      'notCheckedOut': 'Belum check out',
      'checkInSuccessful': 'Check-in berhasil',
      'checkOutSuccessful': 'Check-out berhasil',
      'photoUploadedSuccessfully': 'Foto berhasil diunggah',
      'failedToCheckIn': 'Gagal check in',
      'failedToCheckOut': 'Gagal check out',
      'failedToUploadPhoto': 'Gagal mengunggah foto',
      'selectContact': 'Pilih Kontak',
      'selectContactOptional': 'Pilih kontak (opsional)',
      'selectVisitDate': 'Pilih tanggal kunjungan',
      'enterVisitPurpose': 'Masukkan tujuan kunjungan',
      'enterAdditionalNotes': 'Masukkan catatan tambahan',
      'pleaseSelectAccount': 'Harap pilih akun',
      'visitReportCreatedSuccessfully': 'Laporan kunjungan berhasil dibuat',
      'failedToCreateVisitReport': 'Gagal membuat laporan kunjungan',
      'all': 'Semua',
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


