import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../application/visit_report_provider.dart';
import '../../../core/l10n/app_localizations.dart';

class VisitReportDetailScreen extends ConsumerStatefulWidget {
  const VisitReportDetailScreen({
    super.key,
    required this.visitReportId,
  });

  final String visitReportId;

  @override
  ConsumerState<VisitReportDetailScreen> createState() =>
      _VisitReportDetailScreenState();
}

class _VisitReportDetailScreenState
    extends ConsumerState<VisitReportDetailScreen> {
  final ImagePicker _imagePicker = ImagePicker();

  Future<void> _requestLocationPermission() async {
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      await Geolocator.requestPermission();
    }
  }

  Future<Position?> _getCurrentLocation() async {
    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Location services are disabled. Please enable location services.'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        return null;
      }

      await _requestLocationPermission();
      final permission = await Geolocator.checkPermission();
      
      if (permission == LocationPermission.denied) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Location permission is required for check-in/out. Please grant permission in settings.'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        return null;
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Location permission is permanently denied. Please enable it in app settings.'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return null;
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
      return position;
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Failed to get location';
        if (e.toString().contains('MissingPluginException')) {
          errorMessage = 'Location plugin not initialized. Please stop and restart the app.';
        } else {
          errorMessage = 'Failed to get location: ${e.toString().replaceFirst('Exception: ', '')}';
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
      return null;
    }
  }

  Future<void> _handleCheckIn() async {
    final position = await _getCurrentLocation();
    if (position == null) return;

    final formNotifier = ref.read(visitReportFormProvider.notifier);
    final result = await formNotifier.checkIn(
      visitReportId: widget.visitReportId,
      latitude: position.latitude,
      longitude: position.longitude,
    );

    if (mounted) {
      final l10n = AppLocalizations.of(context)!;
      if (result != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.checkInSuccessful),
            backgroundColor: Colors.green,
          ),
        );
        // Refresh detail
        ref.invalidate(visitReportDetailProvider(widget.visitReportId));
      } else {
        final error = ref.read(visitReportFormProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? l10n.failedToCheckIn),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleCheckOut() async {
    final position = await _getCurrentLocation();
    if (position == null) return;

    final formNotifier = ref.read(visitReportFormProvider.notifier);
    final result = await formNotifier.checkOut(
      visitReportId: widget.visitReportId,
      latitude: position.latitude,
      longitude: position.longitude,
    );

    if (mounted) {
      final l10n = AppLocalizations.of(context)!;
      if (result != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(l10n.checkOutSuccessful),
            backgroundColor: Colors.green,
          ),
        );
        // Refresh detail
        ref.invalidate(visitReportDetailProvider(widget.visitReportId));
      } else {
        final error = ref.read(visitReportFormProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? l10n.failedToCheckOut),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleUploadPhoto() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
      );

      if (image == null) return;

      final file = File(image.path);
      final formNotifier = ref.read(visitReportFormProvider.notifier);
      final success = await formNotifier.uploadPhoto(
        visitReportId: widget.visitReportId,
        photoFile: file,
      );

      if (mounted) {
        final l10n = AppLocalizations.of(context)!;
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(l10n.photoUploadedSuccessfully),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh detail
          ref.invalidate(visitReportDetailProvider(widget.visitReportId));
        } else {
          final error = ref.read(visitReportFormProvider).errorMessage;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error ?? l10n.failedToUploadPhoto),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to pick image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final visitReportAsync =
        ref.watch(visitReportDetailProvider(widget.visitReportId));
    final formState = ref.watch(visitReportFormProvider);
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.visitReportDetails),
        elevation: 0,
      ),
      body: visitReportAsync.when(
        data: (visitReport) => SingleChildScrollView(
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
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (visitReport.account != null)
                                Text(
                                  visitReport.account!.name,
                                  style: theme.textTheme.headlineSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: colorScheme.onSurface,
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
                        _StatusBadge(
                          status: visitReport.status,
                          theme: theme,
                          colorScheme: colorScheme,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Visit Information
              _SectionTitle(
                title: l10n.visitInformation,
                theme: theme,
                colorScheme: colorScheme,
              ),
              const SizedBox(height: 8),
              _InfoCard(
                theme: theme,
                colorScheme: colorScheme,
                children: [
                  _InfoRow(
                    icon: Icons.calendar_today_outlined,
                    label: l10n.visitDate,
                    value: visitReport.visitDate,
                    theme: theme,
                    colorScheme: colorScheme,
                  ),
                  if (visitReport.purpose != null)
                    _InfoRow(
                      icon: Icons.description_outlined,
                      label: l10n.purpose,
                      value: visitReport.purpose!,
                      theme: theme,
                      colorScheme: colorScheme,
                    ),
                  if (visitReport.notes != null && visitReport.notes!.isNotEmpty)
                    _InfoRow(
                      icon: Icons.note_outlined,
                      label: l10n.notes,
                      value: visitReport.notes!,
                      theme: theme,
                      colorScheme: colorScheme,
                    ),
                ],
              ),
              const SizedBox(height: 16),
              // Check-in/out Information
              _SectionTitle(
                title: l10n.checkInOutStatus,
                theme: theme,
                colorScheme: colorScheme,
              ),
              const SizedBox(height: 8),
              _InfoCard(
                theme: theme,
                colorScheme: colorScheme,
                children: [
                  if (visitReport.checkInTime != null) ...[
                    _InfoRow(
                      icon: Icons.login,
                      label: l10n.checkInTime,
                      value: visitReport.checkInTime!
                          .toString()
                          .substring(0, 16),
                      theme: theme,
                      colorScheme: colorScheme,
                    ),
                    if (visitReport.checkInLocation != null)
                      _InfoRow(
                        icon: Icons.location_on_outlined,
                        label: l10n.checkInLocation,
                        value:
                            '${visitReport.checkInLocation!.latitude.toStringAsFixed(6)}, ${visitReport.checkInLocation!.longitude.toStringAsFixed(6)}',
                        theme: theme,
                        colorScheme: colorScheme,
                      ),
                  ] else
                    _InfoRow(
                      icon: Icons.login,
                      label: l10n.checkIn,
                      value: l10n.notCheckedIn,
                      theme: theme,
                      colorScheme: colorScheme,
                    ),
                  if (visitReport.checkOutTime != null) ...[
                    _InfoRow(
                      icon: Icons.logout,
                      label: l10n.checkOutTime,
                      value: visitReport.checkOutTime!
                          .toString()
                          .substring(0, 16),
                      theme: theme,
                      colorScheme: colorScheme,
                    ),
                    if (visitReport.checkOutLocation != null)
                      _InfoRow(
                        icon: Icons.location_on_outlined,
                        label: l10n.checkOutLocation,
                        value:
                            '${visitReport.checkOutLocation!.latitude.toStringAsFixed(6)}, ${visitReport.checkOutLocation!.longitude.toStringAsFixed(6)}',
                        theme: theme,
                        colorScheme: colorScheme,
                      ),
                  ] else if (visitReport.checkInTime != null)
                    _InfoRow(
                      icon: Icons.logout,
                      label: l10n.checkOut,
                      value: l10n.notCheckedOut,
                      theme: theme,
                      colorScheme: colorScheme,
                    ),
                ],
              ),
              const SizedBox(height: 16),
              // Photos
              if (visitReport.photoUrls != null &&
                  visitReport.photoUrls!.isNotEmpty) ...[
                _SectionTitle(
                  title: l10n.photos,
                  theme: theme,
                  colorScheme: colorScheme,
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 120,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: visitReport.photoUrls!.length,
                    itemBuilder: (context, index) {
                      return Container(
                        margin: const EdgeInsets.only(right: 8),
                        width: 120,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: colorScheme.outline.withOpacity(0.2),
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            visitReport.photoUrls![index],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Center(
                                child: Icon(
                                  Icons.broken_image,
                                  color: colorScheme.onSurface.withOpacity(0.3),
                                ),
                              );
                            },
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
              ],
              // Action Buttons
              if (visitReport.status.toLowerCase() != 'completed' &&
                  visitReport.status.toLowerCase() != 'approved') ...[
                if (visitReport.checkInTime == null)
                  FilledButton.icon(
                    onPressed: formState.isLoading ? null : _handleCheckIn,
                    icon: formState.isLoading
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : const Icon(Icons.login),
                    label: Text(l10n.checkIn),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      backgroundColor: Colors.green,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                if (visitReport.checkInTime != null &&
                    visitReport.checkOutTime == null) ...[
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: formState.isLoading ? null : _handleCheckOut,
                    icon: formState.isLoading
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : const Icon(Icons.logout),
                    label: Text(l10n.checkOut),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      backgroundColor: Colors.blue,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: formState.isLoading ? null : _handleUploadPhoto,
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: Text(l10n.uploadPhoto),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 48,
                color: theme.colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                error.toString().replaceFirst('Exception: ', ''),
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.error,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () {
                  ref.invalidate(visitReportDetailProvider(widget.visitReportId));
                },
                child: Text(l10n.retry),
              ),
            ],
          ),
        ),
      ),
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
  });

  final IconData icon;
  final String label;
  final String value;
  final ThemeData theme;
  final ColorScheme colorScheme;

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
                  color: colorScheme.onSurface,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

