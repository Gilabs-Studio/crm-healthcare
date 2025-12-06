import 'package:flutter/material.dart';

import '../../data/models/visit_report.dart';

class VisitReportCard extends StatelessWidget {
  const VisitReportCard({
    super.key,
    required this.visitReport,
    required this.onTap,
  });

  final VisitReport visitReport;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Account Name & Status
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (visitReport.account != null)
                          Text(
                            visitReport.account!.name,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: colorScheme.primary,
                            ),
                          ),
                        if (visitReport.contact != null) ...[
                          const SizedBox(height: 4),
                          Text(
                            visitReport.contact!.name,
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: colorScheme.onSurface.withOpacity(0.7),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  _StatusBadge(status: visitReport.status),
                ],
              ),
              const SizedBox(height: 12),
              // Visit Date
              _DetailRow(
                icon: Icons.calendar_today_outlined,
                label: visitReport.visitDate,
                theme: theme,
                colorScheme: colorScheme,
              ),
              if (visitReport.purpose != null) ...[
                const SizedBox(height: 8),
                _DetailRow(
                  icon: Icons.description_outlined,
                  label: visitReport.purpose!,
                  theme: theme,
                  colorScheme: colorScheme,
                ),
              ],
              // Check-in/out status
              if (visitReport.checkInTime != null ||
                  visitReport.checkOutTime != null) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    if (visitReport.checkInTime != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.login,
                              size: 14,
                              color: Colors.green,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Checked In',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: Colors.green,
                                fontWeight: FontWeight.w500,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                    if (visitReport.checkInTime != null &&
                        visitReport.checkOutTime != null)
                      const SizedBox(width: 8),
                    if (visitReport.checkOutTime != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.blue.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.logout,
                              size: 14,
                              color: Colors.blue,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Checked Out',
                              style: theme.textTheme.bodySmall?.copyWith(
                                color: Colors.blue,
                                fontWeight: FontWeight.w500,
                                fontSize: 10,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
              // Photos count
              if (visitReport.photoUrls != null &&
                  visitReport.photoUrls!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      Icons.photo_outlined,
                      size: 16,
                      color: colorScheme.onSurface.withOpacity(0.7),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${visitReport.photoUrls!.length} photo(s)',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    Color backgroundColor;
    Color textColor;
    String displayText;

    switch (status.toLowerCase()) {
      case 'draft':
        backgroundColor = colorScheme.onSurface.withOpacity(0.1);
        textColor = colorScheme.onSurface.withOpacity(0.7);
        displayText = 'DRAFT';
        break;
      case 'in_progress':
        backgroundColor = Colors.orange.withOpacity(0.1);
        textColor = Colors.orange;
        displayText = 'IN PROGRESS';
        break;
      case 'completed':
        backgroundColor = colorScheme.primary.withOpacity(0.1);
        textColor = colorScheme.primary;
        displayText = 'COMPLETED';
        break;
      case 'approved':
        backgroundColor = Colors.green.withOpacity(0.1);
        textColor = Colors.green;
        displayText = 'APPROVED';
        break;
      case 'rejected':
        backgroundColor = colorScheme.error.withOpacity(0.1);
        textColor = colorScheme.error;
        displayText = 'REJECTED';
        break;
      default:
        backgroundColor = colorScheme.onSurface.withOpacity(0.1);
        textColor = colorScheme.onSurface.withOpacity(0.7);
        displayText = status.toUpperCase();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        displayText,
        style: theme.textTheme.bodySmall?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w600,
          fontSize: 10,
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({
    required this.icon,
    required this.label,
    required this.theme,
    required this.colorScheme,
  });

  final IconData icon;
  final String label;
  final ThemeData theme;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: colorScheme.onSurface.withOpacity(0.7),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurface.withOpacity(0.7),
            ),
          ),
        ),
      ],
    );
  }
}

