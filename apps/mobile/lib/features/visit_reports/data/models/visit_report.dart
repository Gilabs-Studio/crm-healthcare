class VisitReport {
  final String id;
  final String accountId;
  final AccountInfo? account;
  final String? contactId;
  final ContactInfo? contact;
  final String? salesRepId;
  final String visitDate;
  final String? purpose;
  final String? notes;
  final String status;
  final Location? checkInLocation;
  final DateTime? checkInTime;
  final Location? checkOutLocation;
  final DateTime? checkOutTime;
  final List<String>? photoUrls;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  VisitReport({
    required this.id,
    required this.accountId,
    this.account,
    this.contactId,
    this.contact,
    this.salesRepId,
    required this.visitDate,
    this.purpose,
    this.notes,
    required this.status,
    this.checkInLocation,
    this.checkInTime,
    this.checkOutLocation,
    this.checkOutTime,
    this.photoUrls,
    this.createdAt,
    this.updatedAt,
  });

  factory VisitReport.fromJson(Map<String, dynamic> json) {
    return VisitReport(
      id: json['id'] as String,
      accountId: json['account_id'] as String,
      account: json['account'] != null
          ? AccountInfo.fromJson(json['account'] as Map<String, dynamic>)
          : null,
      contactId: json['contact_id'] as String?,
      contact: json['contact'] != null
          ? ContactInfo.fromJson(json['contact'] as Map<String, dynamic>)
          : null,
      salesRepId: json['sales_rep_id'] as String?,
      visitDate: json['visit_date'] as String,
      purpose: json['purpose'] as String?,
      notes: json['notes'] as String?,
      status: json['status'] as String? ?? 'draft',
      checkInLocation: json['check_in_location'] != null
          ? Location.fromJson(
              json['check_in_location'] as Map<String, dynamic>,
            )
          : null,
      checkInTime: json['check_in_time'] != null
          ? DateTime.parse(json['check_in_time'] as String)
          : null,
      checkOutLocation: json['check_out_location'] != null
          ? Location.fromJson(
              json['check_out_location'] as Map<String, dynamic>,
            )
          : null,
      checkOutTime: json['check_out_time'] != null
          ? DateTime.parse(json['check_out_time'] as String)
          : null,
      photoUrls: json['photo_urls'] != null
          ? (json['photo_urls'] as List<dynamic>)
              .map((e) => e as String)
              .toList()
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'account_id': accountId,
      'account': account?.toJson(),
      'contact_id': contactId,
      'contact': contact?.toJson(),
      'sales_rep_id': salesRepId,
      'visit_date': visitDate,
      'purpose': purpose,
      'notes': notes,
      'status': status,
      'check_in_location': checkInLocation?.toJson(),
      'check_in_time': checkInTime?.toIso8601String(),
      'check_out_location': checkOutLocation?.toJson(),
      'check_out_time': checkOutTime?.toIso8601String(),
      'photo_urls': photoUrls,
      'created_at': createdAt?.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }
}

class AccountInfo {
  final String id;
  final String name;
  final String? city;

  AccountInfo({
    required this.id,
    required this.name,
    this.city,
  });

  factory AccountInfo.fromJson(Map<String, dynamic> json) {
    return AccountInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      city: json['city'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'city': city,
    };
  }
}

class ContactInfo {
  final String id;
  final String name;
  final String? position;

  ContactInfo({
    required this.id,
    required this.name,
    this.position,
  });

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      position: json['position'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'position': position,
    };
  }
}

class Location {
  final double latitude;
  final double longitude;
  final String? address;

  Location({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }
}

class VisitReportListResponse {
  final List<VisitReport> items;
  final Pagination pagination;

  VisitReportListResponse({
    required this.items,
    required this.pagination,
  });

  factory VisitReportListResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    
    // Handle different response formats
    List<VisitReport> items;
    Pagination pagination;

    if (data is List) {
      // Format: { success: true, data: [...] }
      items = data
          .map((item) => VisitReport.fromJson(item as Map<String, dynamic>))
          .toList();
      // Create default pagination if data is a list
      pagination = Pagination(
        page: json['page'] as int? ?? 1,
        perPage: json['per_page'] as int? ?? data.length,
        total: json['total'] as int? ?? data.length,
        totalPages: json['total_pages'] as int? ?? 1,
      );
    } else if (data is Map<String, dynamic>) {
      // Format: { success: true, data: { items: [...], pagination: {...} } }
      items = (data['items'] as List<dynamic>?)
              ?.map((item) => VisitReport.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [];
      pagination = data['pagination'] != null
          ? Pagination.fromJson(data['pagination'] as Map<String, dynamic>)
          : Pagination(
              page: json['page'] as int? ?? 1,
              perPage: json['per_page'] as int? ?? 20,
              total: json['total'] as int? ?? items.length,
              totalPages: json['total_pages'] as int? ?? 1,
            );
    } else {
      items = [];
      pagination = Pagination(
        page: 1,
        perPage: 20,
        total: 0,
        totalPages: 0,
      );
    }

    return VisitReportListResponse(
      items: items,
      pagination: pagination,
    );
  }
}

class Pagination {
  final int page;
  final int perPage;
  final int total;
  final int totalPages;

  Pagination({
    required this.page,
    required this.perPage,
    required this.total,
    required this.totalPages,
  });

  factory Pagination.fromJson(Map<String, dynamic> json) {
    return Pagination(
      page: json['page'] as int? ?? 1,
      perPage: json['per_page'] as int? ?? 20,
      total: json['total'] as int? ?? 0,
      totalPages: json['total_pages'] as int? ?? 0,
    );
  }

  bool get hasNextPage => page < totalPages;
  bool get hasPreviousPage => page > 1;
}

