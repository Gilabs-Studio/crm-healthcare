import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../application/task_provider.dart';
import '../data/models/task.dart';
import '../../../core/l10n/app_localizations.dart';
import '../../accounts/application/account_provider.dart';
import '../../contacts/application/contact_provider.dart';

class TaskFormScreen extends ConsumerStatefulWidget {
  const TaskFormScreen({super.key, this.taskId});

  final String? taskId;

  @override
  ConsumerState<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends ConsumerState<TaskFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();

  String _selectedType = 'general';
  String _selectedPriority = 'medium';
  DateTime? _selectedDueDate;
  String? _selectedAccountId;
  String? _selectedContactId;

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.taskId != null) {
      _loadTask();
    }
  }

  Future<void> _loadTask() async {
    setState(() => _isLoading = true);
    try {
      final task = await ref.read(taskDetailProvider(widget.taskId!).future);
      _titleController.text = task.title;
      _descriptionController.text = task.description ?? '';
      _selectedType = task.type;
      _selectedPriority = task.priority;
      _selectedDueDate = task.dueDate;
      _selectedAccountId = task.accountId;
      _selectedContactId = task.contactId;
    } catch (e) {
      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${l10n.failedToUpdateTask}: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _selectDueDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDueDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      final time = await showTimePicker(
        context: context,
        initialTime: _selectedDueDate != null
            ? TimeOfDay.fromDateTime(_selectedDueDate!)
            : TimeOfDay.now(),
      );
      if (time != null) {
        setState(() {
          _selectedDueDate = DateTime(
            picked.year,
            picked.month,
            picked.day,
            time.hour,
            time.minute,
          );
        });
      }
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final l10n = AppLocalizations.of(context)!;
    final formNotifier = ref.read(taskFormProvider.notifier);
    Task? task;

    if (widget.taskId != null) {
      // Update task
      task = await formNotifier.updateTask(
        id: widget.taskId!,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
        type: _selectedType,
        priority: _selectedPriority,
        dueDate: _selectedDueDate,
      );
    } else {
      // Create task
      task = await formNotifier.createTask(
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim().isEmpty
            ? null
            : _descriptionController.text.trim(),
        type: _selectedType,
        priority: _selectedPriority,
        dueDate: _selectedDueDate,
        accountId: _selectedAccountId,
        contactId: _selectedContactId,
      );
    }

    if (mounted) {
      if (task != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(widget.taskId != null
                ? l10n.taskUpdatedSuccessfully
                : l10n.taskCreatedSuccessfully),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, task);
      } else {
        final error = ref.read(taskFormProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? (widget.taskId != null
                ? l10n.failedToUpdateTask
                : l10n.failedToCreateTask)),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final formState = ref.watch(taskFormProvider);
    final accountListState = ref.watch(accountListProvider);
    final contactListState = ref.watch(contactListProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    // Load accounts if not loaded
    if (widget.taskId == null &&
        accountListState.accounts.isEmpty &&
        !accountListState.isLoading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(accountListProvider.notifier).loadAccounts();
      });
    }

    // Load contacts when account is selected
    if (widget.taskId == null &&
        _selectedAccountId != null &&
        contactListState.contacts.isEmpty &&
        !contactListState.isLoading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(contactListProvider.notifier).loadContacts(
              accountId: _selectedAccountId,
            );
      });
    }

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text(widget.taskId != null ? l10n.editTask : l10n.createTask),
          elevation: 0,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.taskId != null ? l10n.editTask : l10n.createTask),
        elevation: 0,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Title
              TextFormField(
                controller: _titleController,
                decoration: InputDecoration(
                  labelText: '${l10n.title} *',
                  hintText: l10n.enterTaskTitle,
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
                textInputAction: TextInputAction.next,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return l10n.titleIsRequired;
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              // Description
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: l10n.description,
                  hintText: l10n.enterTaskDescription,
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
                maxLines: 4,
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 20),
              // Type
              DropdownButtonFormField<String>(
                value: _selectedType,
                decoration: InputDecoration(
                  labelText: '${l10n.type} *',
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
                items: const [
                  DropdownMenuItem(value: 'general', child: Text('General')),
                  DropdownMenuItem(value: 'call', child: Text('Call')),
                  DropdownMenuItem(value: 'email', child: Text('Email')),
                  DropdownMenuItem(value: 'meeting', child: Text('Meeting')),
                  DropdownMenuItem(value: 'follow_up', child: Text('Follow Up')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedType = value);
                  }
                },
              ),
              const SizedBox(height: 20),
              // Priority
              DropdownButtonFormField<String>(
                value: _selectedPriority,
                decoration: InputDecoration(
                  labelText: '${l10n.priority} *',
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
                items: const [
                  DropdownMenuItem(value: 'low', child: Text('Low')),
                  DropdownMenuItem(value: 'medium', child: Text('Medium')),
                  DropdownMenuItem(value: 'high', child: Text('High')),
                  DropdownMenuItem(value: 'urgent', child: Text('Urgent')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedPriority = value);
                  }
                },
              ),
              const SizedBox(height: 20),
              // Due Date
              InkWell(
                onTap: _selectDueDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: l10n.dueDate,
                    hintText: l10n.selectDueDate,
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
                    _selectedDueDate != null
                        ? DateFormat('MMM dd, yyyy • HH:mm').format(_selectedDueDate!)
                        : l10n.selectDueDate,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: _selectedDueDate != null
                          ? colorScheme.onSurface
                          : colorScheme.onSurface.withOpacity(0.5),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Account (only for create)
              if (widget.taskId == null) ...[
                DropdownButtonFormField<String>(
                  value: _selectedAccountId,
                  decoration: InputDecoration(
                    labelText: '${l10n.selectAccount} (${l10n.optional.toLowerCase()})',
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
                  items: [
                    DropdownMenuItem<String>(
                      value: null,
                      child: Text(l10n.all),
                    ),
                    ...accountListState.accounts.map((account) {
                      return DropdownMenuItem<String>(
                        value: account.id,
                        child: Text(account.name),
                      );
                    }),
                  ],
                  onChanged: (value) {
                    setState(() {
                      _selectedAccountId = value;
                      if (value == null) {
                        _selectedContactId = null;
                      } else {
                        // Load contacts for selected account
                        ref.read(contactListProvider.notifier).loadContacts(
                              accountId: value,
                              refresh: true,
                            );
                      }
                    });
                  },
                ),
                const SizedBox(height: 20),
                // Contact (only for create, filtered by account)
                DropdownButtonFormField<String>(
                  value: _selectedContactId,
                  decoration: InputDecoration(
                    labelText: '${l10n.selectContact} (${l10n.optional.toLowerCase()})',
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
                  items: [
                    DropdownMenuItem<String>(
                      value: null,
                      child: Text(l10n.all),
                    ),
                    ...contactListState.contacts
                        .where((contact) =>
                            _selectedAccountId == null ||
                            contact.accountId == _selectedAccountId)
                        .map((contact) {
                      return DropdownMenuItem<String>(
                        value: contact.id,
                        child: Text(contact.name),
                      );
                    }),
                  ],
                  onChanged: _selectedAccountId != null
                      ? (value) {
                          setState(() => _selectedContactId = value);
                        }
                      : null,
                ),
                const SizedBox(height: 20),
              ],
              // Submit Button
              FilledButton(
                onPressed: formState.isLoading ? null : _handleSubmit,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: formState.isLoading
                    ? SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(widget.taskId != null ? l10n.updateTask : l10n.createTask),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

