import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../application/visit_report_provider.dart';
import '../../../core/l10n/app_localizations.dart';
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
    final l10n = AppLocalizations.of(context)!;
    if (_selectedAccountId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.pleaseSelectAccount),
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
          SnackBar(
            content: Text(l10n.visitReportCreatedSuccessfully),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, visitReport);
      } else {
        final error = ref.read(visitReportFormProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? l10n.failedToCreateVisitReport),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final formState = ref.watch(visitReportFormProvider);
    final accountListState = ref.watch(accountListProvider);
    final contactListState = ref.watch(contactListProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

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
        title: Text(l10n.createVisitReport),
        elevation: 0,
      ),
      body: SafeArea(
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Account Selection
              DropdownButtonFormField<String>(
                value: _selectedAccountId,
                decoration: InputDecoration(
                  labelText: '${l10n.selectAccount} *',
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
                    return '${l10n.selectAccount} ${l10n.required.toLowerCase()}';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),
              // Contact Selection (Optional)
              DropdownButtonFormField<String>(
                value: _selectedContactId,
                decoration: InputDecoration(
                  labelText: l10n.selectContactOptional,
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
              const SizedBox(height: 20),
              // Visit Date
              InkWell(
                onTap: _selectDate,
                child: InputDecorator(
                  decoration: InputDecoration(
                    labelText: '${l10n.visitDate} *',
                    hintText: l10n.selectVisitDate,
                    filled: true,
                    fillColor: colorScheme.surfaceContainerHighest,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
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
                    '${_selectedDate.year}-${_selectedDate.month.toString().padLeft(2, '0')}-${_selectedDate.day.toString().padLeft(2, '0')}',
                    style: theme.textTheme.bodyMedium,
                  ),
                ),
              ),
              const SizedBox(height: 20),
              // Purpose
              TextFormField(
                controller: _purposeController,
                decoration: InputDecoration(
                  labelText: l10n.purpose,
                  hintText: l10n.enterVisitPurpose,
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
                textInputAction: TextInputAction.next,
              ),
              const SizedBox(height: 20),
              // Notes
              TextFormField(
                controller: _notesController,
                decoration: InputDecoration(
                  labelText: l10n.notes,
                  hintText: l10n.enterAdditionalNotes,
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
                maxLines: 5,
                textInputAction: TextInputAction.done,
              ),
              const SizedBox(height: 24),
              // Submit Button
              FilledButton(
                onPressed: formState.isSubmitting ? null : _handleSubmit,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: formState.isSubmitting
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(l10n.createVisitReport),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

