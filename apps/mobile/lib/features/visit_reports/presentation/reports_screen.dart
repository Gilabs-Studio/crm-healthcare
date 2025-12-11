import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/l10n/app_localizations.dart';
import '../../../core/widgets/main_scaffold.dart';
import '../../permissions/hooks/use_has_permission.dart';
import '../application/visit_report_provider.dart';
import 'visit_report_form_screen.dart';
import 'visit_report_list_screen.dart';

class ReportsScreen extends ConsumerStatefulWidget {
  const ReportsScreen({super.key});

  @override
  ConsumerState<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends ConsumerState<ReportsScreen> {

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    
    // Check CREATE permission
    final hasCreatePermission = useHasCreatePermission(ref, '/visit-reports');
    
    return MainScaffold(
      currentIndex: 2,
      title: l10n.reports,
      floatingActionButton: hasCreatePermission
          ? FloatingActionButton(
              onPressed: () {
                // Create Visit Report
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => const VisitReportFormScreen(),
                  ),
                ).then((result) {
                  // Refresh list after creating visit report
                  if (result != null) {
                    ref.read(visitReportListProvider.notifier).refresh();
                  }
                });
              },
              child: const Icon(Icons.add),
            )
          : null,
      body: const VisitReportListScreen(hideAppBar: true),
    );
  }
}

