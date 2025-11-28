import 'package:flutter/material.dart';

import '../../features/accounts/presentation/account_detail_screen.dart';
import '../../features/accounts/presentation/account_list_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/contacts/presentation/contact_detail_screen.dart';
import '../../features/contacts/presentation/contact_list_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/tasks/presentation/task_list_screen.dart';
import '../../features/visit_reports/presentation/visit_report_detail_screen.dart';
import '../../features/visit_reports/presentation/visit_report_form_screen.dart';
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
        AppRoutes.contacts: (context) {
          final args = ModalRoute.of(context)!.settings.arguments;
          final accountId = args is Map ? args['accountId'] as String? : null;
          return AuthGate(child: ContactListScreen(accountId: accountId));
        },
        AppRoutes.visitReports: (_) =>
            const AuthGate(child: VisitReportListScreen()),
        AppRoutes.tasks: (_) =>
            const AuthGate(child: TaskListScreen()),
      };

  static Route<dynamic>? onGenerateRoute(RouteSettings settings) {
    final uri = Uri.parse(settings.name ?? '');
    final pathSegments = uri.pathSegments;

    // Account Detail: /accounts/:id
    if (pathSegments.length == 2 &&
        pathSegments[0] == 'accounts' &&
        pathSegments[1].isNotEmpty) {
      return MaterialPageRoute(
        settings: settings,
        builder: (_) => AuthGate(
          child: AccountDetailScreen(accountId: pathSegments[1]),
        ),
      );
    }

    // Contact Detail: /contacts/:id
    if (pathSegments.length == 2 &&
        pathSegments[0] == 'contacts' &&
        pathSegments[1].isNotEmpty) {
      return MaterialPageRoute(
        settings: settings,
        builder: (_) => AuthGate(
          child: ContactDetailScreen(contactId: pathSegments[1]),
        ),
      );
    }

    // Visit Report Detail: /visit-reports/:id
    if (pathSegments.length == 2 &&
        pathSegments[0] == 'visit-reports' &&
        pathSegments[1].isNotEmpty &&
        pathSegments[1] != 'create') {
      return MaterialPageRoute(
        settings: settings,
        builder: (_) => AuthGate(
          child: VisitReportDetailScreen(visitReportId: pathSegments[1]),
        ),
      );
    }

    // Visit Report Form: /visit-reports/create
    if (pathSegments.length == 2 &&
        pathSegments[0] == 'visit-reports' &&
        pathSegments[1] == 'create') {
      return MaterialPageRoute(
        settings: settings,
        builder: (_) => AuthGate(
          child: const VisitReportFormScreen(),
        ),
      );
    }

    return null;
  }
}
