import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../application/visit_report_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../accounts/application/account_provider.dart';
import '../../contacts/application/contact_provider.dart';

class VisitReportFormScreen extends ConsumerStatefulWidget {
  const VisitReportFormScreen({super.key});

  @override
  ConsumerState<VisitReportFormScreen> createState() =>
      _VisitReportFormScreenState();
}

class _VisitReportFormScreenState
    extends ConsumerState<VisitReportFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _purposeController = TextEditingController();
  final _notesController = TextEditingController();

  String? _selectedAccountId;
  String? _selectedContactId;
  DateTime _selectedDate = DateTime.now();

  @override
  void dispose() {
    _purposeController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedAccountId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select an account'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final formNotifier = ref.read(visitReportFormProvider.notifier);
    final visitReport = await formNotifier.createVisitReport(
      accountId: _selectedAccountId!,
      contactId: _selectedContactId,
      visitDate: _selectedDate.toIso8601String().split('T')[0],
      purpose: _purposeController.text.trim().isNotEmpty
          ? _purposeController.text.trim()
          : null,
      notes: _notesController.text.trim().isNotEmpty
          ? _notesController.text.trim()
          : null,
    );

    if (mounted) {
      if (visitReport != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Visit report created successfully'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, visitReport);
      } else {
        final error = ref.read(visitReportFormProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Failed to create visit report'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(visitReportFormProvider);
    final accountListState = ref.watch(accountListProvider);
    final contactListState = ref.watch(contactListProvider);
    final theme = Theme.of(context);

    // Load accounts if not loaded
    if (accountListState.accounts.isEmpty && !accountListState.isLoading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(accountListProvider.notifier).loadAccounts();
      });
    }

    // Load contacts when account is selected
    if (_selectedAccountId != null &&
        contactListState.contacts.isEmpty &&
        !contactListState.isLoading) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(contactListProvider.notifier).loadContacts(
              accountId: _selectedAccountId,
            );
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Visit Report'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Account Selection
              Text(
                'Account *',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedAccountId,
                decoration: InputDecoration(
                  hintText: 'Select account',
                  filled: true,
                  fillColor: AppTheme.cardBackground,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                items: accountListState.accounts.map((account) {
                  return DropdownMenuItem<String>(
                    value: account.id,
                    child: Text(account.name),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedAccountId = value;
                    _selectedContactId = null; // Reset contact when account changes
                  });
                  // Load contacts for selected account
                  if (value != null) {
                    ref.read(contactListProvider.notifier).loadContacts(
                          accountId: value,
                          refresh: true,
                        );
                  }
                },
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please select an account';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              // Contact Selection (Optional)
              Text(
                'Contact',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _selectedContactId,
                decoration: InputDecoration(
                  hintText: 'Select contact (optional)',
                  filled: true,
                  fillColor: AppTheme.cardBackground,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                items: _selectedAccountId != null
                    ? contactListState.contacts.map((contact) {
                        return DropdownMenuItem<String>(
                          value: contact.id,
                          child: Text(contact.name),
                        );
                      }).toList()
                    : null,
                onChanged: _selectedAccountId != null
                    ? (value) {
                        setState(() {
                          _selectedContactId = value;
                        });
                      }
                    : null,
              ),
              const SizedBox(height: 16),
              // Visit Date
              Text(
                'Visit Date *',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: _selectDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    hintText: 'Select visit date',
                    filled: true,
                    fillColor: AppTheme.cardBackground,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    suffixIcon: const Icon(Icons.calendar_today_outlined),
                  ),
                  child: Text(
                    '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                    style: theme.textTheme.bodyMedium,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Purpose
              Text(
                'Purpose',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _purposeController,
                decoration: InputDecoration(
                  hintText: 'Enter visit purpose',
                  filled: true,
                  fillColor: AppTheme.cardBackground,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 16),
              // Notes
              Text(
                'Notes',
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _notesController,
                decoration: InputDecoration(
                  hintText: 'Enter additional notes',
                  filled: true,
                  fillColor: AppTheme.cardBackground,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
                maxLines: 5,
              ),
              const SizedBox(height: 24),
              // Submit Button
              FilledButton(
                onPressed: formState.isSubmitting ? null : _handleSubmit,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                ),
                child: formState.isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : const Text('Create Visit Report'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

