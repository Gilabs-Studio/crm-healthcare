import 'package:flutter/material.dart';

import '../../features/accounts/presentation/account_list_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/contacts/presentation/contact_list_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/tasks/presentation/task_list_screen.dart';
import '../../features/visit_reports/presentation/visit_report_list_screen.dart';
import '../widgets/auth_gate.dart';

class AppRoutes {
  const AppRoutes._();

  static const login = '/auth/login';
  static const dashboard = '/dashboard';
  static const accounts = '/accounts';
  static const contacts = '/contacts';
  static const visitReports = '/visit-reports';
  static const tasks = '/tasks';
}

class AppRouter {
  const AppRouter._();

  static String get initialRoute => AppRoutes.login;

  static Map<String, WidgetBuilder> get routes => {
        AppRoutes.login: (_) => const LoginScreen(),
        AppRoutes.dashboard: (_) =>
            const AuthGate(child: DashboardScreen()),
        AppRoutes.accounts: (_) =>
            const AuthGate(child: AccountListScreen()),
        AppRoutes.contacts: (_) =>
            const AuthGate(child: ContactListScreen()),
        AppRoutes.visitReports: (_) =>
            const AuthGate(child: VisitReportListScreen()),
        AppRoutes.tasks: (_) =>
            const AuthGate(child: TaskListScreen()),
      };
}
