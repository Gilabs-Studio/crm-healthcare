import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../application/task_provider.dart';
import '../data/models/task.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/routing/app_router.dart';

class TaskDetailScreen extends ConsumerWidget {
  const TaskDetailScreen({
    super.key,
    required this.taskId,
  });

  final String taskId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final taskAsync = ref.watch(taskDetailProvider(taskId));
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Details'),
        actions: [
          PopupMenuButton(
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Row(
                  children: [
                    Icon(Icons.edit, size: 20),
                    SizedBox(width: 8),
                    Text('Edit'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Row(
                  children: [
                    Icon(Icons.delete, size: 20, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Delete', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
            onSelected: (value) {
              if (value == 'edit') {
                Navigator.of(context).pushNamed(
                  AppRoutes.tasksEdit,
                  arguments: {'taskId': taskId},
                );
              } else if (value == 'delete') {
                _showDeleteDialog(context, ref);
              }
            },
          ),
        ],
      ),
      body: taskAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                error.toString().replaceFirst('Exception: ', ''),
                style: theme.textTheme.titleMedium?.copyWith(color: Colors.red),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => ref.invalidate(taskDetailProvider(taskId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (task) => _buildTaskDetail(context, ref, task, theme),
      ),
    );
  }

  Widget _buildTaskDetail(
    BuildContext context,
    WidgetRef ref,
    Task task,
    ThemeData theme,
  ) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          _InfoCard(
            title: 'Task Information',
            children: [
              _buildInfoRow(
                theme,
                'Title',
                task.title,
                Icons.check_box,
              ),
              if (task.description != null && task.description!.isNotEmpty)
                _buildInfoRow(
                  theme,
                  'Description',
                  task.description!,
                  Icons.description,
                ),
              _buildInfoRow(
                theme,
                'Status',
                task.status.toUpperCase().replaceAll('_', ' '),
                Icons.info,
              ),
              _buildInfoRow(
                theme,
                'Priority',
                task.priority.toUpperCase(),
                Icons.flag,
              ),
              _buildInfoRow(
                theme,
                'Type',
                task.type.toUpperCase().replaceAll('_', ' '),
                Icons.label,
              ),
              if (task.dueDate != null)
                _buildInfoRow(
                  theme,
                  'Due Date',
                  _formatDueDate(task.dueDate!),
                  Icons.calendar_today,
                  task.isOverdue ? Colors.red : (task.isDueToday ? Colors.orange : null),
                ),
            ],
          ),
          const SizedBox(height: 16),
          // Related Information
          if (task.account != null || task.contact != null) ...[
            _InfoCard(
              title: 'Related Information',
              children: [
                if (task.account != null)
                  _buildInfoRow(
                    theme,
                    'Account',
                    task.account!.name,
                    Icons.business,
                  ),
                if (task.contact != null)
                  _buildInfoRow(
                    theme,
                    'Contact',
                    task.contact!.name,
                    Icons.person,
                  ),
              ],
            ),
            const SizedBox(height: 16),
          ],
          // Reminders Section
          if (task.reminders.isNotEmpty) ...[
            _InfoCard(
              title: 'Reminders',
              children: task.reminders.map((reminder) {
                return _buildReminderRow(theme, reminder);
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],
          // Action Buttons
          if (task.status != 'completed' && task.status != 'cancelled') ...[
            FilledButton.icon(
              onPressed: () => _showCompleteDialog(context, ref, task),
              icon: const Icon(Icons.check),
              label: const Text('Complete Task'),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                backgroundColor: Colors.green,
              ),
            ),
            const SizedBox(height: 12),
          ],
          OutlinedButton.icon(
            onPressed: () => _showAddReminderDialog(context, ref, task),
            icon: const Icon(Icons.notifications),
            label: const Text('Add Reminder'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size.fromHeight(50),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(
    ThemeData theme,
    String label,
    String value,
    IconData icon, [
    Color? textColor,
  ]) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppTheme.textSecondary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: textColor ?? AppTheme.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReminderRow(ThemeData theme, Reminder reminder) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        children: [
          Icon(
            Icons.notifications,
            size: 20,
            color: reminder.isSent ? Colors.grey : AppTheme.primaryColor,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  DateFormat('MMM dd, yyyy • HH:mm').format(reminder.remindAt),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (reminder.message != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    reminder.message!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: AppTheme.textSecondary,
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
                color: Colors.grey.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Sent',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: Colors.grey,
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _formatDueDate(DateTime date) {
    return DateFormat('MMM dd, yyyy • HH:mm').format(date);
  }

  void _showCompleteDialog(BuildContext context, WidgetRef ref, Task task) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Complete Task'),
        content: Text('Are you sure you want to mark "${task.title}" as completed?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await ref
                  .read(taskFormProvider.notifier)
                  .completeTask(task.id);
              if (context.mounted) {
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Task completed successfully'),
                      backgroundColor: Colors.green,
                    ),
                  );
                  // Return result to trigger refresh in list screen
                  Navigator.pop(context); // Go back to list
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        ref.read(taskFormProvider).errorMessage ??
                            'Failed to complete task',
                      ),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Complete'),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Task'),
        content: const Text('Are you sure you want to delete this task? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await ref
                  .read(taskFormProvider.notifier)
                  .deleteTask(taskId);
              if (context.mounted) {
                if (success) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Task deleted successfully'),
                      backgroundColor: Colors.green,
                    ),
                  );
                  Navigator.pop(context); // Go back to list
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        ref.read(taskFormProvider).errorMessage ??
                            'Failed to delete task',
                      ),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showAddReminderDialog(BuildContext context, WidgetRef ref, Task task) {
    // Simple reminder dialog - can be enhanced later
    final remindAtController = TextEditingController();
    final messageController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Reminder'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: remindAtController,
              decoration: const InputDecoration(
                labelText: 'Remind At (ISO format)',
                hintText: '2024-01-20T09:00:00+07:00',
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: messageController,
              decoration: const InputDecoration(
                labelText: 'Message (optional)',
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () async {
              try {
                final remindAt = DateTime.parse(remindAtController.text);
                final reminder = await ref
                    .read(taskFormProvider.notifier)
                    .createReminder(
                      taskId: task.id,
                      remindAt: remindAt,
                      message: messageController.text.isEmpty
                          ? null
                          : messageController.text,
                    );
                if (context.mounted) {
                  Navigator.pop(context);
                  if (reminder != null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Reminder created successfully'),
                        backgroundColor: Colors.green,
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          ref.read(taskFormProvider).errorMessage ??
                              'Failed to create reminder',
                        ),
                        backgroundColor: Colors.red,
                      ),
                    );
                  }
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Invalid date format: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.title,
    required this.children,
  });

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.cardBackground,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const Divider(height: 24),
          ...children,
        ],
      ),
    );
  }
}

