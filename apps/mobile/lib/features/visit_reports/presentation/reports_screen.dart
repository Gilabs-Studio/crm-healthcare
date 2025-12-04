import 'package:flutter/material.dart';

import '../../../core/routing/app_router.dart';
import '../../../core/widgets/main_scaffold.dart';
import 'visit_report_list_screen.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return MainScaffold(
      currentIndex: 2,
      title: 'Reports',
      actions: [
        IconButton(
          icon: const Icon(Icons.add),
          onPressed: () {
            Navigator.pushNamed(
              context,
              '${AppRoutes.visitReports}/create',
            );
          },
          tooltip: 'Create Visit Report',
        ),
      ],
      body: const VisitReportListScreen(hideAppBar: true),
    );
  }
}

