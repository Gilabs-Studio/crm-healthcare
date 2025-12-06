import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../application/task_provider.dart';
import '../data/models/task.dart';
import '../../../core/l10n/app_localizations.dart';
import '../presentation/task_form_screen.dart';

class TaskDetailScreen extends ConsumerStatefulWidget {
  const TaskDetailScreen({
    super.key,
    required this.taskId,
  });

  final String taskId;

  @override
  ConsumerState<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends ConsumerState<TaskDetailScreen> {
  bool _isDeleting = false;

  @override
  Widget build(BuildContext context) {
    final taskAsync = ref.watch(taskDetailProvider(widget.taskId));
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.taskDetails),
        elevation: 0,
      ),
      body: taskAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                color: colorScheme.error,
                size: 48,
              ),
              const SizedBox(height: 16),
              Text(
                error.toString().replaceFirst('Exception: ', ''),
                style: theme.textTheme.titleMedium?.copyWith(
                  color: colorScheme.error,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => ref.invalidate(taskDetailProvider(widget.taskId)),
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
        data: (task) => _buildTaskDetail(context, task, theme, colorScheme, l10n),
      ),
    );
  }

  Widget _buildTaskDetail(
    BuildContext context,
    Task task,
    ThemeData theme,
    ColorScheme colorScheme,
    AppLocalizations l10n,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
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
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        task.title,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: colorScheme.onSurface,
                        ),
                      ),
                    ),
                    _StatusBadge(
                      status: task.status,
                      theme: theme,
                      colorScheme: colorScheme,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Task Information
          _SectionTitle(
            title: l10n.taskInformation,
            theme: theme,
            colorScheme: colorScheme,
          ),
          const SizedBox(height: 8),
          _InfoCard(
            theme: theme,
            colorScheme: colorScheme,
            children: [
              _InfoRow(
                icon: Icons.check_box_outlined,
                label: l10n.title,
                value: task.title,
                theme: theme,
                colorScheme: colorScheme,
              ),
              if (task.description != null && task.description!.isNotEmpty)
                _InfoRow(
                  icon: Icons.description_outlined,
                  label: l10n.description,
                  value: task.description!,
                  theme: theme,
                  colorScheme: colorScheme,
                ),
              _InfoRow(
                icon: Icons.info_outlined,
                label: l10n.status,
                value: task.status.toUpperCase().replaceAll('_', ' '),
                theme: theme,
                colorScheme: colorScheme,
              ),
              _InfoRow(
                icon: Icons.flag_outlined,
                label: l10n.priority,
                value: task.priority.toUpperCase(),
                theme: theme,
                colorScheme: colorScheme,
              ),
              _InfoRow(
                icon: Icons.label_outlined,
                label: l10n.type,
                value: task.type.toUpperCase().replaceAll('_', ' '),
                theme: theme,
                colorScheme: colorScheme,
              ),
              if (task.dueDate != null)
                _InfoRow(
                  icon: Icons.calendar_today_outlined,
                  label: l10n.dueDate,
                  value: _formatDueDate(task.dueDate!),
                  theme: theme,
                  colorScheme: colorScheme,
                  textColor: task.isOverdue
                      ? colorScheme.error
                      : (task.isDueToday ? Colors.orange : null),
                ),
            ],
          ),
          const SizedBox(height: 16),
          // Related Information
          if (task.account != null || task.contact != null) ...[
            _SectionTitle(
              title: l10n.relatedInformation,
              theme: theme,
              colorScheme: colorScheme,
            ),
            const SizedBox(height: 8),
            _InfoCard(
              theme: theme,
              colorScheme: colorScheme,
              children: [
                if (task.account != null)
                  _InfoRow(
                    icon: Icons.business_outlined,
                    label: l10n.accounts,
                    value: task.account!.name,
                    theme: theme,
                    colorScheme: colorScheme,
                  ),
                if (task.contact != null)
                  _InfoRow(
                    icon: Icons.person_outline,
                    label: l10n.contacts,
                    value: task.contact!.name,
                    theme: theme,
                    colorScheme: colorScheme,
                  ),
              ],
            ),
            const SizedBox(height: 16),
          ],
          // Reminders Section
          if (task.reminders.isNotEmpty) ...[
            _SectionTitle(
              title: l10n.reminders,
              theme: theme,
              colorScheme: colorScheme,
            ),
            const SizedBox(height: 8),
            _InfoCard(
              theme: theme,
              colorScheme: colorScheme,
              children: task.reminders.map((reminder) {
                return _ReminderRow(
                  reminder: reminder,
                  theme: theme,
                  colorScheme: colorScheme,
                  l10n: l10n,
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => _handleEdit(task),
                  icon: const Icon(Icons.edit_outlined),
                  label: Text(l10n.edit),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (task.status != 'completed' && task.status != 'cancelled') ...[
            FilledButton.icon(
              onPressed: () => _showCompleteDialog(context, task, l10n, colorScheme),
              icon: const Icon(Icons.check),
              label: Text(l10n.completeTask),
              style: FilledButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                backgroundColor: Colors.green,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          OutlinedButton.icon(
            onPressed: () => _showAddReminderDialog(context, task, l10n, colorScheme),
            icon: const Icon(Icons.notifications_outlined),
            label: Text(l10n.addReminder),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: _isDeleting ? null : () => _showDeleteDialog(context, task, l10n, colorScheme),
            icon: _isDeleting
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.delete_outline),
            label: Text(l10n.delete),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
              foregroundColor: colorScheme.error,
              side: BorderSide(color: colorScheme.error),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleEdit(Task task) async {
    final result = await Navigator.push<Task>(
      context,
      MaterialPageRoute(
        builder: (context) => TaskFormScreen(taskId: task.id),
      ),
    );

    if (result != null && mounted) {
      // Refresh detail
      ref.invalidate(taskDetailProvider(widget.taskId));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!.taskUpdatedSuccessfully),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  String _formatDueDate(DateTime date) {
    return DateFormat('MMM dd, yyyy • HH:mm').format(date);
  }

  void _showCompleteDialog(
    BuildContext context,
    Task task,
    AppLocalizations l10n,
    ColorScheme colorScheme,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.completeTask),
        content: Text(l10n.completeTaskConfirmation),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await ref
                  .read(taskFormProvider.notifier)
                  .completeTask(task.id);
              if (mounted) {
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(l10n.taskCompletedSuccessfully),
                      backgroundColor: Colors.green,
                    ),
                  );
                  // Refresh detail
                  ref.invalidate(taskDetailProvider(widget.taskId));
                  // Return result to trigger refresh in list screen
                  Navigator.pop(context, true);
                } else {
                  final error = ref.read(taskFormProvider).errorMessage;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(error ?? l10n.failedToCompleteTask),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: Text(l10n.completeTask),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(
    BuildContext context,
    Task task,
    AppLocalizations l10n,
    ColorScheme colorScheme,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.deleteTask),
        content: Text(l10n.deleteTaskConfirmation),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              setState(() => _isDeleting = true);
              final success = await ref
                  .read(taskFormProvider.notifier)
                  .deleteTask(task.id);
              setState(() => _isDeleting = false);
              if (mounted) {
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(l10n.taskDeletedSuccessfully),
                      backgroundColor: Colors.green,
                    ),
                  );
                  Navigator.pop(context); // Go back to list
                } else {
                  final error = ref.read(taskFormProvider).errorMessage;
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(error ?? l10n.failedToDeleteTask),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: FilledButton.styleFrom(
              backgroundColor: colorScheme.error,
            ),
            child: Text(l10n.delete),
          ),
        ],
      ),
    );
  }

  void _showAddReminderDialog(
    BuildContext context,
    Task task,
    AppLocalizations l10n,
    ColorScheme colorScheme,
  ) async {
    DateTime? selectedDate;
    final messageController = TextEditingController();

    final result = await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text(l10n.addReminder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: selectedDate ?? DateTime.now().add(const Duration(days: 1)),
                      firstDate: DateTime.now(),
                      lastDate: DateTime(2100),
                    );
                    if (date != null) {
                      final time = await showTimePicker(
                        context: context,
                        initialTime: selectedDate != null
                            ? TimeOfDay.fromDateTime(selectedDate!)
                            : TimeOfDay.now(),
                      );
                      if (time != null) {
                        setDialogState(() {
                          selectedDate = DateTime(
                            date.year,
                            date.month,
                            date.day,
                            time.hour,
                            time.minute,
                          );
                        });
                      } else {
                        // If time picker is cancelled, still set the date with current time
                        final now = DateTime.now();
                        setDialogState(() {
                          selectedDate = DateTime(
                            date.year,
                            date.month,
                            date.day,
                            now.hour,
                            now.minute,
                          );
                        });
                      }
                    }
                  },
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: l10n.selectReminderDate,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                      fillColor: colorScheme.surfaceContainerHighest,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 16,
                      ),
                      suffixIcon: Icon(
                        Icons.calendar_today_outlined,
                        color: colorScheme.onSurface.withOpacity(0.7),
                      ),
                    ),
                    child: Text(
                      selectedDate != null
                          ? DateFormat('MMM dd, yyyy • HH:mm').format(selectedDate!)
                          : l10n.selectReminderDate,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: selectedDate != null
                                ? colorScheme.onSurface
                                : colorScheme.onSurface.withOpacity(0.5),
                          ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: messageController,
                  decoration: InputDecoration(
                    labelText: l10n.reminderMessage,
                    hintText: l10n.enterReminderMessage,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: colorScheme.surfaceContainerHighest,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context, null);
              },
              child: Text(l10n.cancel),
            ),
            FilledButton(
              onPressed: selectedDate != null
                  ? () {
                      // Get message text before closing dialog
                      final message = messageController.text.trim();
                      Navigator.pop(context, {
                        'date': selectedDate,
                        'message': message.isEmpty ? null : message,
                      });
                    }
                  : null,
              child: Text(l10n.save),
            ),
          ],
        ),
      ),
    );

    // Always dispose controller after dialog is closed
    try {
      if (result != null && result['date'] != null && mounted) {
        final remindAt = result['date'] as DateTime;
        final message = result['message'] as String?;
        
        final reminder = await ref.read(taskFormProvider.notifier).createReminder(
              taskId: task.id,
              remindAt: remindAt,
              message: message,
            );
        
        if (mounted) {
          if (reminder != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(l10n.reminderCreatedSuccessfully),
                backgroundColor: Colors.green,
              ),
            );
            // Refresh detail to show new reminder
            ref.invalidate(taskDetailProvider(widget.taskId));
          } else {
            final error = ref.read(taskFormProvider).errorMessage;
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(error ?? l10n.failedToCreateReminder),
                backgroundColor: Colors.red,
                duration: const Duration(seconds: 4),
              ),
            );
          }
        }
      }
    } finally {
      // Always dispose controller in finally block to ensure it's disposed
      messageController.dispose();
    }
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.title,
    required this.theme,
    required this.colorScheme,
  });

  final String title;
  final ThemeData theme;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: theme.textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w600,
        color: colorScheme.onSurface,
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.children,
    required this.theme,
    required this.colorScheme,
  });

  final List<Widget> children;
  final ThemeData theme;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    return Container(
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
      padding: const EdgeInsets.all(16),
      child: Column(
        children: children.asMap().entries.map((entry) {
          final index = entry.key;
          final child = entry.value;
          if (index == children.length - 1) {
            return child;
          }
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: child,
          );
        }).toList(),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
    required this.theme,
    required this.colorScheme,
    this.textColor,
  });

  final IconData icon;
  final String label;
  final String value;
  final ThemeData theme;
  final ColorScheme colorScheme;
  final Color? textColor;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: colorScheme.onSurface.withOpacity(0.7),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurface.withOpacity(0.7),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                  color: textColor ?? colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ReminderRow extends StatelessWidget {
  const _ReminderRow({
    required this.reminder,
    required this.theme,
    required this.colorScheme,
    required this.l10n,
  });

  final Reminder reminder;
  final ThemeData theme;
  final ColorScheme colorScheme;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          Icons.notifications_outlined,
          size: 20,
          color: reminder.isSent
              ? colorScheme.onSurface.withOpacity(0.3)
              : colorScheme.primary,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                DateFormat('MMM dd, yyyy • HH:mm').format(reminder.remindAt),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurface,
                  fontWeight: FontWeight.w500,
                ),
              ),
              if (reminder.message != null) ...[
                const SizedBox(height: 4),
                Text(
                  reminder.message!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: colorScheme.onSurface.withOpacity(0.7),
                  ),
                ),
              ],
            ],
          ),
        ),
        if (reminder.isSent)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: colorScheme.onSurface.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              l10n.sent,
              style: theme.textTheme.bodySmall?.copyWith(
                color: colorScheme.onSurface.withOpacity(0.7),
                fontSize: 10,
              ),
            ),
          ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({
    required this.status,
    required this.theme,
    required this.colorScheme,
  });

  final String status;
  final ThemeData theme;
  final ColorScheme colorScheme;

  @override
  Widget build(BuildContext context) {
    Color backgroundColor;
    Color textColor;
    String displayText;

    switch (status.toLowerCase()) {
      case 'completed':
        backgroundColor = Colors.green.withOpacity(0.1);
        textColor = Colors.green;
        displayText = 'COMPLETED';
        break;
      case 'in_progress':
        backgroundColor = colorScheme.primary.withOpacity(0.1);
        textColor = colorScheme.primary;
        displayText = 'IN PROGRESS';
        break;
      case 'pending':
        backgroundColor = Colors.orange.withOpacity(0.1);
        textColor = Colors.orange;
        displayText = 'PENDING';
        break;
      case 'cancelled':
        backgroundColor = colorScheme.onSurface.withOpacity(0.1);
        textColor = colorScheme.onSurface.withOpacity(0.7);
        displayText = 'CANCELLED';
        break;
      default:
        backgroundColor = colorScheme.onSurface.withOpacity(0.1);
        textColor = colorScheme.onSurface.withOpacity(0.7);
        displayText = status.toUpperCase();
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        displayText,
        style: theme.textTheme.bodySmall?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}

