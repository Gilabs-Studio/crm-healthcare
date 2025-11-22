# Modules Documentation
## CRM Healthcare/Pharmaceutical Platform - MVP Modules

**Versi**: 1.0  
**Status**: Draft  
**Last Updated**: 2025-01-15

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Module Architecture](#module-architecture)
3. [Core Modules](#core-modules)
4. [Module Relationships](#module-relationships)
5. [Pages & Routes](#pages--routes)
6. [Data Models](#data-models)
7. [API Endpoints](#api-endpoints)

---

## Overview

Dokumen ini menjelaskan semua modules yang akan diimplementasikan dalam MVP CRM Healthcare/Pharmaceutical Platform. Setiap module memiliki pages, components, services, dan relasi dengan modules lainnya.

### Module Structure

Setiap module mengikuti struktur folder berikut:

```
apps/web/src/features/<moduleName>/
├── types/           # Type definitions
├── stores/          # Zustand state management
├── hooks/           # Custom React hooks
├── services/        # API services
├── components/      # UI components
│   ├── ui/          # Pure UI components
│   └── containers/ # Container components with state
└── messages/        # i18n translations (en, id)
```

---

## Module Architecture

### Module Categories

1. **Core Modules**: Authentication, User Management, Settings
2. **Patient Management**: Patient registration, profiles, search
3. **Healthcare Operations**: Appointments, Medical Records, Prescriptions
4. **Pharmacy Operations**: Inventory, Stock Management, Purchase
5. **Financial**: Billing, Invoicing, Payments
6. **Analytics**: Dashboard, Reports

---

## Core Modules

### 1. Authentication Module (`auth`)

**Purpose**: Handle user authentication and session management

**Pages**:
- `/login` - Login page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/verify-email` - Email verification

**Components**:
- `LoginForm` - Login form component
- `PasswordResetForm` - Password reset form
- `AuthGuard` - Route protection component

**Services**:
- `authService.login()`
- `authService.logout()`
- `authService.refreshToken()`
- `authService.requestPasswordReset()`
- `authService.resetPassword()`

**Store**:
- `useAuthStore` - Current user, token, session state

**Relationships**:
- → User Module (user profile)
- → All modules (authentication required)

---

### 2. User Management Module (`users`)

**Purpose**: Manage system users, roles, and permissions

**Pages**:
- `/users` - User list
- `/users/new` - Create new user
- `/users/[id]` - User detail/edit
- `/users/[id]/permissions` - Manage user permissions

**Components**:
- `UserList` - User list table
- `UserForm` - Create/edit user form
- `UserRoleSelector` - Role assignment component
- `PermissionMatrix` - Permission management

**Services**:
- `userService.list()`
- `userService.getById()`
- `userService.create()`
- `userService.update()`
- `userService.delete()`
- `userService.updatePermissions()`

**Store**:
- `useUserStore` - User list, current user, permissions

**Relationships**:
- ← Authentication Module
- → All modules (user context)

---

### 3. Settings Module (`settings`)

**Purpose**: System configuration and settings

**Pages**:
- `/settings` - Settings dashboard
- `/settings/general` - General settings (clinic info, business hours)
- `/settings/notifications` - Notification preferences
- `/settings/payments` - Payment method configuration
- `/settings/taxes` - Tax configuration

**Components**:
- `SettingsNav` - Settings navigation
- `GeneralSettingsForm` - General settings form
- `NotificationSettingsForm` - Notification settings
- `PaymentMethodConfig` - Payment method configuration

**Services**:
- `settingsService.getSettings()`
- `settingsService.updateSettings()`

**Store**:
- `useSettingsStore` - System settings

**Relationships**:
- → All modules (settings affect all operations)

---

## Patient Management Modules

### 4. Patient Module (`patients`)

**Purpose**: Manage patient registration, profiles, and data

**Pages**:
- `/patients` - Patient list
- `/patients/new` - Register new patient
- `/patients/[id]` - Patient detail/profile
- `/patients/[id]/medical-history` - Medical history
- `/patients/[id]/appointments` - Patient appointments
- `/patients/[id]/prescriptions` - Patient prescriptions
- `/patients/[id]/billing` - Patient billing history

**Components**:
- `PatientList` - Patient list with search/filter
- `PatientForm` - Patient registration/edit form
- `PatientProfile` - Patient profile view
- `PatientMedicalHistory` - Medical history timeline
- `PatientSearch` - Quick patient search

**Services**:
- `patientService.list()`
- `patientService.getById()`
- `patientService.create()`
- `patientService.update()`
- `patientService.search()`
- `patientService.getMedicalHistory()`
- `patientService.getAppointments()`
- `patientService.getPrescriptions()`

**Store**:
- `usePatientStore` - Patient list, current patient, search state

**Data Model**:
```typescript
interface Patient {
  id: string;
  nik?: string; // Nomor Induk Kependudukan
  bpjsNumber?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  phone: string;
  email?: string;
  address: Address;
  emergencyContact: EmergencyContact;
  bloodType?: string;
  allergies?: string[];
  chronicConditions?: string[];
  insuranceProviders?: InsuranceProvider[];
  photoUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}
```

**Relationships**:
- → Appointment Module (has many appointments)
- → Medical Record Module (has many medical records)
- → Prescription Module (has many prescriptions)
- → Billing Module (has many invoices)
- ← User Module (created by, updated by)

---

## Healthcare Operations Modules

### 5. Doctor Module (`doctors`)

**Purpose**: Manage doctor/physician profiles and information

**Pages**:
- `/doctors` - Doctor list
- `/doctors/new` - Register new doctor
- `/doctors/[id]` - Doctor detail/profile
- `/doctors/[id]/schedule` - Doctor schedule management
- `/doctors/[id]/appointments` - Doctor appointments

**Components**:
- `DoctorList` - Doctor list
- `DoctorForm` - Doctor registration/edit form
- `DoctorProfile` - Doctor profile view
- `DoctorSchedule` - Schedule management
- `DoctorAvailability` - Availability calendar

**Services**:
- `doctorService.list()`
- `doctorService.getById()`
- `doctorService.create()`
- `doctorService.update()`
- `doctorService.getSchedule()`
- `doctorService.updateSchedule()`
- `doctorService.getAvailability()`

**Store**:
- `useDoctorStore` - Doctor list, current doctor, schedules

**Data Model**:
```typescript
interface Doctor {
  id: string;
  strNumber: string; // Surat Tanda Registrasi
  firstName: string;
  lastName: string;
  specialization: string[];
  phone: string;
  email: string;
  schedule: Schedule[];
  status: 'active' | 'inactive';
  userId?: string; // Link to user account
  createdAt: string;
  updatedAt: string;
}
```

**Relationships**:
- → Appointment Module (has many appointments)
- → Medical Record Module (creates medical records)
- → Prescription Module (creates prescriptions)
- ← User Module (linked to user account)

---

### 6. Appointment Module (`appointments`)

**Purpose**: Manage appointment scheduling and booking

**Pages**:
- `/appointments` - Appointment list/calendar
- `/appointments/new` - Book new appointment
- `/appointments/[id]` - Appointment detail
- `/appointments/calendar` - Calendar view
- `/appointments/today` - Today's appointments

**Components**:
- `AppointmentList` - Appointment list
- `AppointmentCalendar` - Calendar view
- `AppointmentForm` - Book/edit appointment form
- `AppointmentCard` - Appointment card component
- `AppointmentStatusBadge` - Status indicator
- `TimeSlotSelector` - Time slot picker

**Services**:
- `appointmentService.list()`
- `appointmentService.getById()`
- `appointmentService.create()`
- `appointmentService.update()`
- `appointmentService.cancel()`
- `appointmentService.reschedule()`
- `appointmentService.getAvailableSlots()`
- `appointmentService.sendReminder()`

**Store**:
- `useAppointmentStore` - Appointment list, calendar state, filters

**Data Model**:
```typescript
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // minutes
  type: 'consultation' | 'follow-up' | 'emergency' | 'check-up';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  doctor: Doctor;
}
```

**Relationships**:
- ← Patient Module (belongs to patient)
- ← Doctor Module (belongs to doctor)
- → Medical Record Module (creates medical record)
- ← User Module (created by receptionist)

---

### 7. Medical Record Module (`medical-records`)

**Purpose**: Manage patient medical records and history

**Pages**:
- `/medical-records` - Medical records list
- `/medical-records/new` - Create new medical record
- `/medical-records/[id]` - Medical record detail
- `/patients/[patientId]/medical-records` - Patient's medical records

**Components**:
- `MedicalRecordList` - Medical records list
- `MedicalRecordForm` - Create/edit medical record form
- `MedicalRecordDetail` - Medical record detail view
- `MedicalRecordTimeline` - Timeline view
- `ChiefComplaintInput` - Chief complaint input
- `PhysicalExamForm` - Physical examination form
- `DiagnosisSelector` - Diagnosis selection
- `TreatmentPlanEditor` - Treatment plan editor
- `FileUploader` - Upload lab results, X-ray, etc.

**Services**:
- `medicalRecordService.list()`
- `medicalRecordService.getById()`
- `medicalRecordService.create()`
- `medicalRecordService.update()`
- `medicalRecordService.getByPatient()`
- `medicalRecordService.uploadFile()`

**Store**:
- `useMedicalRecordStore` - Medical records list, current record

**Data Model**:
```typescript
interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  chiefComplaint: string;
  physicalExamination: PhysicalExamination;
  diagnosis: Diagnosis[];
  treatmentPlan: TreatmentPlan;
  notes?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  doctor: Doctor;
  appointment?: Appointment;
}

interface PhysicalExamination {
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  generalAppearance?: string;
  examinationNotes?: string;
}

interface Diagnosis {
  code: string; // ICD-10 code
  description: string;
  type: 'primary' | 'secondary';
}

interface TreatmentPlan {
  medications?: string[];
  procedures?: string[];
  followUpDate?: string;
  instructions?: string;
}
```

**Relationships**:
- ← Patient Module (belongs to patient)
- ← Doctor Module (created by doctor)
- ← Appointment Module (linked to appointment)
- → Prescription Module (may create prescription)
- ← User Module (created by doctor)

---

### 8. Prescription Module (`prescriptions`)

**Purpose**: Manage prescription creation and processing

**Pages**:
- `/prescriptions` - Prescription list
- `/prescriptions/new` - Create new prescription
- `/prescriptions/[id]` - Prescription detail
- `/prescriptions/pending` - Pending prescriptions (pharmacist view)
- `/patients/[patientId]/prescriptions` - Patient's prescriptions

**Components**:
- `PrescriptionList` - Prescription list
- `PrescriptionForm` - Create prescription form
- `PrescriptionDetail` - Prescription detail view
- `MedicationSelector` - Medication selection with search
- `DosageInput` - Dosage, frequency, duration input
- `DrugInteractionChecker` - Drug interaction validation
- `PrescriptionProcessor` - Pharmacist processing view
- `PrescriptionLabel` - Printable prescription label

**Services**:
- `prescriptionService.list()`
- `prescriptionService.getById()`
- `prescriptionService.create()`
- `prescriptionService.update()`
- `prescriptionService.process()` // Pharmacist processing
- `prescriptionService.fulfill()`
- `prescriptionService.cancel()`
- `prescriptionService.checkDrugInteractions()`
- `prescriptionService.checkStockAvailability()`

**Store**:
- `usePrescriptionStore` - Prescription list, current prescription

**Data Model**:
```typescript
interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicalRecordId?: string;
  medications: PrescriptionMedication[];
  notes?: string;
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled' | 'partial';
  processedBy?: string; // Pharmacist user ID
  processedAt?: string;
  fulfilledAt?: string;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  doctor: Doctor;
  medicalRecord?: MedicalRecord;
}

interface PrescriptionMedication {
  medicationId: string;
  medicationName: string;
  dosage: string; // e.g., "500mg"
  frequency: string; // e.g., "2x daily"
  duration: string; // e.g., "7 days"
  quantity: number;
  instructions?: string;
  stockAvailable: boolean;
  drugInteractions?: DrugInteraction[];
}
```

**Relationships**:
- ← Patient Module (belongs to patient)
- ← Doctor Module (created by doctor)
- ← Medical Record Module (linked to medical record)
- → Inventory Module (checks stock, reduces stock on fulfillment)
- ← User Module (created by doctor, processed by pharmacist)

---

## Pharmacy Operations Modules

### 9. Medication Module (`medications`)

**Purpose**: Manage medication/medicine master data

**Pages**:
- `/medications` - Medication list
- `/medications/new` - Add new medication
- `/medications/[id]` - Medication detail
- `/medications/[id]/stock` - Medication stock by location

**Components**:
- `MedicationList` - Medication list with search
- `MedicationForm` - Add/edit medication form
- `MedicationDetail` - Medication detail view
- `BarcodeScanner` - Barcode scanning component
- `BPOMValidator` - BPOM registration validator

**Services**:
- `medicationService.list()`
- `medicationService.getById()`
- `medicationService.create()`
- `medicationService.update()`
- `medicationService.search()`
- `medicationService.scanBarcode()`
- `medicationService.validateBPOM()`

**Store**:
- `useMedicationStore` - Medication list, current medication

**Data Model**:
```typescript
interface Medication {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  bpomNumber: string; // BPOM registration number
  barcode?: string;
  category: string;
  unit: string; // e.g., "tablet", "bottle", "box"
  purchasePrice: number;
  sellingPrice: number;
  stock: StockInfo[];
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

interface StockInfo {
  locationId: string;
  locationName: string;
  quantity: number;
  reservedQuantity: number; // For pending prescriptions
  availableQuantity: number; // quantity - reservedQuantity
  minStockLevel: number;
  maxStockLevel: number;
  expiryDate?: string;
  batchNumber?: string;
}
```

**Relationships**:
- → Inventory Module (has stock)
- → Prescription Module (used in prescriptions)
- → Purchase Module (purchased from suppliers)

---

### 10. Inventory Module (`inventory`)

**Purpose**: Manage stock movements and inventory operations

**Pages**:
- `/inventory` - Inventory dashboard
- `/inventory/stock` - Stock list by location
- `/inventory/movements` - Stock movement history
- `/inventory/adjustments` - Stock adjustments
- `/inventory/transfers` - Stock transfers between locations
- `/inventory/alerts` - Low stock & expiry alerts

**Components**:
- `InventoryDashboard` - Inventory overview
- `StockList` - Stock list with filters
- `StockMovementList` - Movement history
- `StockAdjustmentForm` - Stock adjustment form
- `StockTransferForm` - Transfer form
- `StockAlertList` - Alerts list
- `StockLevelIndicator` - Visual stock level indicator

**Services**:
- `inventoryService.getStock()`
- `inventoryService.getStockByLocation()`
- `inventoryService.getMovements()`
- `inventoryService.adjustStock()`
- `inventoryService.transferStock()`
- `inventoryService.getAlerts()`
- `inventoryService.checkStockAvailability()`

**Store**:
- `useInventoryStore` - Stock data, movements, alerts

**Data Model**:
```typescript
interface StockMovement {
  id: string;
  medicationId: string;
  locationId: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'sale' | 'purchase';
  quantity: number; // Positive for 'in', negative for 'out'
  balanceBefore: number;
  balanceAfter: number;
  referenceType?: 'prescription' | 'purchase' | 'adjustment' | 'transfer';
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  medication: Medication;
  location: Location;
}
```

**Relationships**:
- ← Medication Module (tracks stock for medications)
- → Prescription Module (reduces stock on fulfillment)
- → Purchase Module (increases stock on purchase)
- ← Location Module (stock per location)

---

### 11. Purchase Module (`purchases`)

**Purpose**: Manage purchase orders and supplier management

**Pages**:
- `/purchases` - Purchase order list
- `/purchases/new` - Create purchase order
- `/purchases/[id]` - Purchase order detail
- `/purchases/receipts` - Goods receipt processing
- `/suppliers` - Supplier list
- `/suppliers/new` - Add supplier

**Components**:
- `PurchaseOrderList` - PO list
- `PurchaseOrderForm` - Create/edit PO form
- `GoodsReceiptForm` - Goods receipt form
- `SupplierList` - Supplier list
- `SupplierForm` - Supplier form

**Services**:
- `purchaseService.list()`
- `purchaseService.getById()`
- `purchaseService.create()`
- `purchaseService.update()`
- `purchaseService.receiveGoods()`
- `supplierService.list()`
- `supplierService.create()`
- `supplierService.update()`

**Store**:
- `usePurchaseStore` - Purchase orders, suppliers

**Data Model**:
```typescript
interface PurchaseOrder {
  id: string;
  supplierId: string;
  orderNumber: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  expectedDeliveryDate?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
}

interface PurchaseOrderItem {
  medicationId: string;
  medicationName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}
```

**Relationships**:
- → Supplier Module (purchased from supplier)
- → Medication Module (purchases medications)
- → Inventory Module (increases stock on receipt)
- ← User Module (created by admin/pharmacist)

---

## Financial Modules

### 12. Billing Module (`billing`)

**Purpose**: Manage invoicing and payment processing

**Pages**:
- `/billing` - Invoice list
- `/billing/new` - Create new invoice
- `/billing/[id]` - Invoice detail
- `/billing/payments` - Payment processing
- `/billing/receipts` - Receipt printing

**Components**:
- `InvoiceList` - Invoice list
- `InvoiceForm` - Create invoice form
- `InvoiceDetail` - Invoice detail view
- `PaymentProcessor` - Payment processing component
- `PaymentMethodSelector` - Payment method selection
- `ReceiptPrinter` - Receipt printing component
- `BPJSVerifier` - BPJS verification component

**Services**:
- `billingService.list()`
- `billingService.getById()`
- `billingService.create()`
- `billingService.update()`
- `billingService.processPayment()`
- `billingService.refund()`
- `billingService.verifyBPJS()`
- `billingService.printReceipt()`

**Store**:
- `useBillingStore` - Invoices, payments, receipts

**Data Model**:
```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  appointmentId?: string;
  prescriptionId?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment: Payment;
  status: 'draft' | 'pending' | 'paid' | 'partial' | 'cancelled' | 'refunded';
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  appointment?: Appointment;
  prescription?: Prescription;
}

interface InvoiceItem {
  type: 'service' | 'medication' | 'procedure';
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  medicationId?: string;
}

interface Payment {
  method: 'cash' | 'transfer' | 'credit_card' | 'debit_card' | 'bpjs' | 'insurance';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paidAt?: string;
  referenceNumber?: string;
  bpjsData?: BPJSData;
}
```

**Relationships**:
- ← Patient Module (invoice for patient)
- ← Appointment Module (invoice for appointment)
- ← Prescription Module (invoice for prescription)
- ← User Module (created by cashier)

---

## Analytics Modules

### 13. Dashboard Module (`dashboard`)

**Purpose**: Provide overview and key metrics

**Pages**:
- `/dashboard` - Main dashboard
- `/dashboard/appointments` - Appointment analytics
- `/dashboard/revenue` - Revenue analytics
- `/dashboard/inventory` - Inventory analytics

**Components**:
- `DashboardOverview` - Main dashboard view
- `AppointmentStats` - Appointment statistics
- `RevenueChart` - Revenue charts
- `TopDoctors` - Top performing doctors
- `TopMedications` - Top selling medications
- `InventoryAlerts` - Inventory alerts summary
- `QuickActions` - Quick action buttons

**Services**:
- `dashboardService.getOverview()`
- `dashboardService.getAppointmentStats()`
- `dashboardService.getRevenueStats()`
- `dashboardService.getInventoryStats()`
- `dashboardService.getTopDoctors()`
- `dashboardService.getTopMedications()`

**Store**:
- `useDashboardStore` - Dashboard data, filters, date range

**Relationships**:
- Aggregates data from all modules

---

### 14. Reports Module (`reports`)

**Purpose**: Generate and export reports

**Pages**:
- `/reports` - Reports list
- `/reports/patients` - Patient reports
- `/reports/appointments` - Appointment reports
- `/reports/sales` - Sales reports
- `/reports/inventory` - Inventory reports
- `/reports/financial` - Financial reports

**Components**:
- `ReportList` - Available reports list
- `ReportGenerator` - Report generation form
- `ReportViewer` - Report viewer
- `ReportExporter` - Export to PDF/Excel
- `DateRangePicker` - Date range selection
- `ReportFilters` - Report filters

**Services**:
- `reportService.list()`
- `reportService.generate()`
- `reportService.export()`
- `reportService.getPatientReport()`
- `reportService.getAppointmentReport()`
- `reportService.getSalesReport()`
- `reportService.getInventoryReport()`
- `reportService.getFinancialReport()`

**Store**:
- `useReportStore` - Report data, filters, export state

**Relationships**:
- Aggregates data from all modules

---

## Module Relationships Diagram

```
┌─────────────┐
│   Auth      │
│  Module     │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
┌──────▼──────┐                   ┌──────▼──────┐
│    User     │                   │  Settings  │
│  Module     │                   │  Module    │
└──────┬──────┘                   └────────────┘
       │
       │
┌──────▼──────────────────────────────────────────┐
│            Patient Module                        │
└──────┬──────────────────────────────────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
│ Appointment │ │   Medical   │ │Prescription │ │   Billing   │
│   Module    │ │   Record    │ │   Module    │ │   Module    │
└──────┬──────┘ │   Module    │ └──────┬──────┘ └─────────────┘
       │        └──────────────┘        │
       │                                │
       │                        ┌───────▼───────┐
       │                        │  Medication  │
       │                        │   Module     │
       │                        └──────┬───────┘
       │                                │
       │                        ┌───────▼───────┐
       │                        │  Inventory    │
       │                        │   Module      │
       │                        └──────┬───────┘
       │                                │
       │                        ┌───────▼───────┐
       │                        │   Purchase   │
       │                        │   Module     │
       │                        └──────────────┘
       │
┌──────▼──────┐
│   Doctor    │
│  Module     │
└─────────────┘
```

---

## Pages & Routes

### Route Structure

```
/                          → Dashboard
/login                     → Login
/forgot-password           → Password Reset
/reset-password            → Reset Password Form

/users                     → User List
/users/new                 → Create User
/users/[id]                → User Detail
/users/[id]/permissions    → User Permissions

/patients                  → Patient List
/patients/new              → Register Patient
/patients/[id]             → Patient Profile
/patients/[id]/medical-history → Medical History
/patients/[id]/appointments → Patient Appointments
/patients/[id]/prescriptions → Patient Prescriptions
/patients/[id]/billing     → Patient Billing

/doctors                   → Doctor List
/doctors/new               → Register Doctor
/doctors/[id]              → Doctor Profile
/doctors/[id]/schedule     → Doctor Schedule
/doctors/[id]/appointments → Doctor Appointments

/appointments              → Appointment List
/appointments/new          → Book Appointment
/appointments/[id]         → Appointment Detail
/appointments/calendar     → Calendar View
/appointments/today        → Today's Appointments

/medical-records           → Medical Records List
/medical-records/new       → Create Medical Record
/medical-records/[id]      → Medical Record Detail

/prescriptions             → Prescription List
/prescriptions/new         → Create Prescription
/prescriptions/[id]        → Prescription Detail
/prescriptions/pending     → Pending Prescriptions

/medications               → Medication List
/medications/new          → Add Medication
/medications/[id]         → Medication Detail
/medications/[id]/stock    → Medication Stock

/inventory                 → Inventory Dashboard
/inventory/stock           → Stock List
/inventory/movements       → Stock Movements
/inventory/adjustments     → Stock Adjustments
/inventory/transfers       → Stock Transfers
/inventory/alerts          → Stock Alerts

/purchases                 → Purchase Order List
/purchases/new             → Create Purchase Order
/purchases/[id]            → Purchase Order Detail
/purchases/receipts        → Goods Receipts
/suppliers                 → Supplier List
/suppliers/new             → Add Supplier

/billing                   → Invoice List
/billing/new               → Create Invoice
/billing/[id]              → Invoice Detail
/billing/payments          → Payment Processing
/billing/receipts          → Receipt Printing

/dashboard                 → Main Dashboard
/dashboard/appointments     → Appointment Analytics
/dashboard/revenue          → Revenue Analytics
/dashboard/inventory        → Inventory Analytics

/reports                   → Reports List
/reports/patients          → Patient Reports
/reports/appointments       → Appointment Reports
/reports/sales             → Sales Reports
/reports/inventory         → Inventory Reports
/reports/financial         → Financial Reports

/settings                  → Settings Dashboard
/settings/general          → General Settings
/settings/notifications    → Notification Settings
/settings/payments         → Payment Settings
/settings/taxes            → Tax Settings
```

---

## Data Models Summary

### Core Entities

1. **User** - System users (admin, doctor, pharmacist, receptionist, cashier)
2. **Patient** - Patients/patients
3. **Doctor** - Doctors/physicians
4. **Appointment** - Scheduled appointments
5. **MedicalRecord** - Patient medical records
6. **Prescription** - Prescriptions
7. **Medication** - Medicine master data
8. **StockMovement** - Inventory movements
9. **PurchaseOrder** - Purchase orders
10. **Invoice** - Billing invoices
11. **Payment** - Payment transactions
12. **Supplier** - Suppliers/vendors
13. **Location** - Physical locations (pharmacy, warehouse)

### Key Relationships

- **Patient** has many **Appointments**
- **Patient** has many **MedicalRecords**
- **Patient** has many **Prescriptions**
- **Patient** has many **Invoices**
- **Doctor** has many **Appointments**
- **Doctor** creates **MedicalRecords**
- **Doctor** creates **Prescriptions**
- **Appointment** may create **MedicalRecord**
- **MedicalRecord** may create **Prescription**
- **Prescription** uses **Medications**
- **Prescription** reduces **Stock**
- **PurchaseOrder** increases **Stock**
- **Invoice** is for **Patient**
- **Invoice** may be for **Appointment** or **Prescription**

---

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

### Users
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PUT /api/v1/users/:id`
- `DELETE /api/v1/users/:id`
- `PUT /api/v1/users/:id/permissions`

### Patients
- `GET /api/v1/patients`
- `GET /api/v1/patients/:id`
- `POST /api/v1/patients`
- `PUT /api/v1/patients/:id`
- `GET /api/v1/patients/:id/medical-history`
- `GET /api/v1/patients/:id/appointments`
- `GET /api/v1/patients/:id/prescriptions`

### Doctors
- `GET /api/v1/doctors`
- `GET /api/v1/doctors/:id`
- `POST /api/v1/doctors`
- `PUT /api/v1/doctors/:id`
- `GET /api/v1/doctors/:id/schedule`
- `PUT /api/v1/doctors/:id/schedule`
- `GET /api/v1/doctors/:id/availability`

### Appointments
- `GET /api/v1/appointments`
- `GET /api/v1/appointments/:id`
- `POST /api/v1/appointments`
- `PUT /api/v1/appointments/:id`
- `POST /api/v1/appointments/:id/cancel`
- `POST /api/v1/appointments/:id/reschedule`
- `GET /api/v1/appointments/available-slots`

### Medical Records
- `GET /api/v1/medical-records`
- `GET /api/v1/medical-records/:id`
- `POST /api/v1/medical-records`
- `PUT /api/v1/medical-records/:id`
- `GET /api/v1/medical-records/patient/:patientId`

### Prescriptions
- `GET /api/v1/prescriptions`
- `GET /api/v1/prescriptions/:id`
- `POST /api/v1/prescriptions`
- `PUT /api/v1/prescriptions/:id`
- `POST /api/v1/prescriptions/:id/process`
- `POST /api/v1/prescriptions/:id/fulfill`
- `POST /api/v1/prescriptions/check-interactions`

### Medications
- `GET /api/v1/medications`
- `GET /api/v1/medications/:id`
- `POST /api/v1/medications`
- `PUT /api/v1/medications/:id`
- `GET /api/v1/medications/:id/stock`

### Inventory
- `GET /api/v1/inventory/stock`
- `GET /api/v1/inventory/movements`
- `POST /api/v1/inventory/adjustments`
- `POST /api/v1/inventory/transfers`
- `GET /api/v1/inventory/alerts`

### Purchases
- `GET /api/v1/purchases`
- `GET /api/v1/purchases/:id`
- `POST /api/v1/purchases`
- `PUT /api/v1/purchases/:id`
- `POST /api/v1/purchases/:id/receive`

### Billing
- `GET /api/v1/invoices`
- `GET /api/v1/invoices/:id`
- `POST /api/v1/invoices`
- `PUT /api/v1/invoices/:id`
- `POST /api/v1/invoices/:id/payment`
- `POST /api/v1/invoices/:id/refund`

### Dashboard
- `GET /api/v1/dashboard/overview`
- `GET /api/v1/dashboard/appointments`
- `GET /api/v1/dashboard/revenue`
- `GET /api/v1/dashboard/inventory`

### Reports
- `GET /api/v1/reports/patients`
- `GET /api/v1/reports/appointments`
- `GET /api/v1/reports/sales`
- `GET /api/v1/reports/inventory`
- `GET /api/v1/reports/financial`
- `GET /api/v1/reports/export`

---

## Implementation Priority

### Phase 1: MVP Core (Months 1-2)
1. Authentication Module
2. User Management Module
3. Patient Module
4. Doctor Module
5. Appointment Module
6. Settings Module

### Phase 2: Healthcare Operations (Month 2-3)
7. Medical Record Module
8. Prescription Module
9. Dashboard Module

### Phase 3: Pharmacy & Financial (Month 3)
10. Medication Module
11. Inventory Module
12. Billing Module
13. Reports Module

### Phase 4: Enhancement (Month 4+)
14. Purchase Module
15. Advanced Reports
16. Integrations (BPJS, Payment Gateway)

---

**Dokumen ini akan diupdate sesuai dengan perkembangan development dan perubahan requirements.**

