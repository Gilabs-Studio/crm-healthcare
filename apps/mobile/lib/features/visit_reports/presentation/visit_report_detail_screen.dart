import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';

import '../application/visit_report_provider.dart';
import '../../../core/theme/app_theme.dart';

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
      if (result != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Check-in successful'),
            backgroundColor: Colors.green,
          ),
        );
        // Refresh detail
        ref.invalidate(visitReportDetailProvider(widget.visitReportId));
      } else {
        final error = ref.read(visitReportFormProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Failed to check in'),
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
      if (result != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Check-out successful'),
            backgroundColor: Colors.green,
          ),
        );
        // Refresh detail
        ref.invalidate(visitReportDetailProvider(widget.visitReportId));
      } else {
        final error = ref.read(visitReportFormProvider).errorMessage;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error ?? 'Failed to check out'),
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
        if (success) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Photo uploaded successfully'),
              backgroundColor: Colors.green,
            ),
          );
          // Refresh detail
          ref.invalidate(visitReportDetailProvider(widget.visitReportId));
        } else {
          final error = ref.read(visitReportFormProvider).errorMessage;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(error ?? 'Failed to upload photo'),
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Visit Report Details'),
        elevation: 0,
      ),
      body: visitReportAsync.when(
        data: (visitReport) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Card(
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: AppTheme.borderColor,
                    width: 1,
                  ),
                ),
                child: Padding(
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
                                      color: colorScheme.primary,
                                    ),
                                  ),
                                if (visitReport.contact != null) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    visitReport.contact!.name,
                                    style: theme.textTheme.bodyMedium?.copyWith(
                                      color: AppTheme.textSecondary,
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                          _StatusBadge(status: visitReport.status),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Visit Information
              _SectionTitle(title: 'Visit Information'),
              const SizedBox(height: 8),
              _InfoCard(
                children: [
                  _InfoRow(
                    icon: Icons.calendar_today_outlined,
                    label: 'Visit Date',
                    value: visitReport.visitDate,
                  ),
                  if (visitReport.purpose != null)
                    _InfoRow(
                      icon: Icons.description_outlined,
                      label: 'Purpose',
                      value: visitReport.purpose!,
                    ),
                  if (visitReport.notes != null && visitReport.notes!.isNotEmpty)
                    _InfoRow(
                      icon: Icons.note_outlined,
                      label: 'Notes',
                      value: visitReport.notes!,
                    ),
                ],
              ),
              const SizedBox(height: 16),
              // Check-in/out Information
              _SectionTitle(title: 'Check-in/out Status'),
              const SizedBox(height: 8),
              _InfoCard(
                children: [
                  if (visitReport.checkInTime != null) ...[
                    _InfoRow(
                      icon: Icons.login,
                      label: 'Check-in Time',
                      value: visitReport.checkInTime!
                          .toString()
                          .substring(0, 16),
                    ),
                    if (visitReport.checkInLocation != null)
                      _InfoRow(
                        icon: Icons.location_on_outlined,
                        label: 'Check-in Location',
                        value:
                            '${visitReport.checkInLocation!.latitude.toStringAsFixed(6)}, ${visitReport.checkInLocation!.longitude.toStringAsFixed(6)}',
                      ),
                  ] else
                    _InfoRow(
                      icon: Icons.login,
                      label: 'Check-in',
                      value: 'Not checked in',
                    ),
                  if (visitReport.checkOutTime != null) ...[
                    _InfoRow(
                      icon: Icons.logout,
                      label: 'Check-out Time',
                      value: visitReport.checkOutTime!
                          .toString()
                          .substring(0, 16),
                    ),
                    if (visitReport.checkOutLocation != null)
                      _InfoRow(
                        icon: Icons.location_on_outlined,
                        label: 'Check-out Location',
                        value:
                            '${visitReport.checkOutLocation!.latitude.toStringAsFixed(6)}, ${visitReport.checkOutLocation!.longitude.toStringAsFixed(6)}',
                      ),
                  ] else if (visitReport.checkInTime != null)
                    _InfoRow(
                      icon: Icons.logout,
                      label: 'Check-out',
                      value: 'Not checked out',
                    ),
                ],
              ),
              const SizedBox(height: 16),
              // Photos
              if (visitReport.photoUrls != null &&
                  visitReport.photoUrls!.isNotEmpty) ...[
                _SectionTitle(title: 'Photos'),
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
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: AppTheme.borderColor,
                          ),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            visitReport.photoUrls![index],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Center(
                                child: Icon(Icons.broken_image),
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
                        ? const SizedBox(
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
                    label: const Text('Check In'),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      backgroundColor: Colors.green,
                    ),
                  ),
                if (visitReport.checkInTime != null &&
                    visitReport.checkOutTime == null) ...[
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: formState.isLoading ? null : _handleCheckOut,
                    icon: formState.isLoading
                        ? const SizedBox(
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
                    label: const Text('Check Out'),
                    style: FilledButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                      backgroundColor: Colors.blue,
                    ),
                  ),
                ],
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: formState.isLoading ? null : _handleUploadPhoto,
                  icon: const Icon(Icons.camera_alt_outlined),
                  label: const Text('Upload Photo'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 48),
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
                child: const Text('Retry'),
              ),
            ],
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
        backgroundColor = AppTheme.textSecondary.withOpacity(0.1);
        textColor = AppTheme.textSecondary;
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
        backgroundColor = Colors.red.withOpacity(0.1);
        textColor = Colors.red;
        displayText = 'REJECTED';
        break;
      default:
        backgroundColor = AppTheme.textSecondary.withOpacity(0.1);
        textColor = AppTheme.textSecondary;
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
  const _SectionTitle({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Text(
      title,
      style: theme.textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.w600,
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppTheme.borderColor,
          width: 1,
        ),
      ),
      child: Padding(
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
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: AppTheme.textSecondary,
        ),
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
              const SizedBox(height: 4),
              Text(
                value,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

