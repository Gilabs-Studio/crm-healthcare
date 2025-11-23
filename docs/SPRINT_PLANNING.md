# Sprint Planning
## CRM Healthcare/Pharmaceutical Platform - Development Sprints

**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-15

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Sprint Structure](#sprint-structure)
3. [Sprint Details](#sprint-details)
4. [Sprint Checklist](#sprint-checklist)
5. [Dependencies](#dependencies)

---

## Overview

Dokumen ini berisi rencana sprint yang detail dan linear untuk development API (Go) dan Frontend (Next.js 16). Setiap sprint dapat di-prompt ke AI secara independen dan berurutan.

### Sprint Principles

- **Linear**: Sprint berurutan tanpa break
- **Complete**: Setiap sprint menghasilkan working feature (API + Frontend)
- **Testable**: Setiap sprint dapat ditest secara independen
- **Incremental**: Sprint berikutnya build on top of previous sprint

### Technology Stack

- **Backend**: Go (Gin framework)
- **Frontend**: Next.js 16 (App Router, Server Components)
- **Database**: PostgreSQL
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui v4

---

## Sprint Structure

Setiap sprint mencakup:

1. **Sprint Goal**: Tujuan sprint
2. **Backend Tasks**: API endpoints, services, models
3. **Frontend Tasks**: Pages, components, stores, services
4. **Acceptance Criteria**: Kriteria selesai sprint
5. **Testing**: Cara test sprint

---

## Sprint Details

### Sprint 0: Project Setup & Foundation

**Goal**: Setup project structure, database, authentication foundation

**Backend Tasks**:
- [x] Setup Go project structure
- [x] Setup database connection (PostgreSQL)
- [x] Setup Gin router and middleware
- [x] Implement authentication middleware (JWT)
- [x] Create base API response helpers
- [x] Setup error handling
- [x] Create user model and migration
- [x] Implement login API (`POST /api/v1/auth/login`)
- [x] Implement refresh token API (`POST /api/v1/auth/refresh`)
- [x] Setup CORS

**Frontend Tasks**:
- [x] Setup Next.js 16 project
- [x] Setup Tailwind CSS v4
- [x] Setup shadcn/ui components
- [x] Setup Zustand stores structure
- [x] Create auth store (`useAuthStore`)
- [x] Create auth service (`authService`)
- [x] Create login page (`/`)
- [x] Create auth guard component
- [x] Setup API client with interceptors
- [x] Setup Zod + React Hook Form
- [x] Setup TanStack Query
- [x] Create Error Boundary
- [x] Add loading states & skeletons

**Acceptance Criteria**:
- ✅ User dapat login dengan email/password
- ✅ JWT token disimpan dan digunakan untuk authenticated requests
- ✅ Protected routes redirect ke login jika tidak authenticated
- ✅ Error handling bekerja dengan format standar

**Testing**:
- Test login dengan valid credentials
- Test login dengan invalid credentials
- Test protected route access
- Test token refresh

**Estimated Time**: 2-3 days

---

### Sprint 1: User Management Module

**Goal**: Complete user management (CRUD + permissions)

**Backend Tasks**:
- [x] Create user model and migration
- [x] Create role and permission models
- [x] Implement user list API (`GET /api/v1/users`)
- [x] Implement user detail API (`GET /api/v1/users/:id`)
- [x] Implement create user API (`POST /api/v1/users`)
- [x] Implement update user API (`PUT /api/v1/users/:id`)
- [x] Implement delete user API (`DELETE /api/v1/users/:id`)
- [x] Implement permission management API (`GET /api/v1/users/:id/permissions`)
- [x] Add user validation
- [x] Add pagination support

**Frontend Tasks**:
- [x] Create user service (`userService`)
- [x] Create user types (`types/user.d.ts`)
- [x] Create user list page (`/users`)
- [x] Create user form component (`UserForm`)
- [x] Create user list table component (`UserList`)
- [x] Add user search and filter
- [x] Update sidebar to use permissions from API

**Acceptance Criteria**:
- ✅ Admin dapat melihat list users dengan pagination
- ✅ Admin dapat create user baru
- ✅ Admin dapat edit user
- ✅ Admin dapat delete user
- ✅ User terhubung ke role (select dropdown, bukan input field)
- ✅ Seeder hanya ada 3 user (admin, doctor, pharmacist)
- ✅ Admin memiliki permission untuk seluruh halaman dan action
- ✅ Form validation bekerja dengan baik
- ✅ Sidebar menggunakan permissions dari API

**Testing**:
- Test CRUD operations
- Test permission assignment
- Test pagination
- Test search and filter

**Estimated Time**: 3-4 days

---

### Sprint 2: Master Data - Diagnosis & Procedures

**Goal**: Master data untuk diagnosis (ICD-10) dan procedures

**Backend Tasks**:
- [x] Create diagnosis model and migration
- [x] Create procedure model and migration
- [x] Implement diagnosis list API (`GET /api/v1/master-data/diagnosis`)
- [x] Implement diagnosis detail API (`GET /api/v1/master-data/diagnosis/:id`)
- [x] Implement create diagnosis API (`POST /api/v1/master-data/diagnosis`)
- [x] Implement update diagnosis API (`PUT /api/v1/master-data/diagnosis/:id`)
- [x] Implement diagnosis search API (`GET /api/v1/master-data/diagnosis/search`)
- [x] Implement procedure list API (`GET /api/v1/master-data/procedures`)
- [x] Implement procedure detail API (`GET /api/v1/master-data/procedures/:id`)
- [x] Implement create procedure API (`POST /api/v1/master-data/procedures`)
- [x] Implement update procedure API (`PUT /api/v1/master-data/procedures/:id`)
- [x] Implement procedure search API (`GET /api/v1/master-data/procedures/search`)
- [x] Add access menu seeder for permission menu sidebar

**Frontend Tasks**:
- [x] Create diagnosis service (`diagnosisService`)
- [x] Create procedure service (`procedureService`)
- [x] Create diagnosis types (`types/index.d.ts`)
- [x] Create procedure types (`types/index.d.ts`)
- [x] Create diagnosis list page (`/master-data/diagnosis`)
- [x] Create diagnosis form component (`DiagnosisForm`)
- [x] Create diagnosis selector component (`DiagnosisSelector`)
- [x] Create procedure list page (`/master-data/procedures`)
- [x] Create procedure form component (`ProcedureForm`)
- [x] Create procedure selector component (`ProcedureSelector`)

**Acceptance Criteria**:
- [x] Admin dapat manage diagnosis (CRUD)
- [x] Admin dapat manage procedures (CRUD)
- [x] Diagnosis selector dapat digunakan di form lain
- [x] Procedure selector dapat digunakan di form lain
- [x] Search functionality bekerja
- [x] Menu sidebar menggunakan permissions dari API
- [x] Backend master data saling berhubungan (dapat digunakan di modul lain)

**Testing**:
- Test diagnosis CRUD
- Test procedure CRUD
- Test diagnosis search
- Test procedure search
- Test selector components

**Estimated Time**: 2-3 days

---

### Sprint 3: Master Data - Insurance, Locations, Categories

**Goal**: Master data untuk insurance providers, locations, dan categories

**Backend Tasks**:
- [ ] Create insurance provider model and migration
- [ ] Create location model and migration
- [ ] Create category model and migration
- [ ] Implement insurance provider APIs (CRUD)
- [ ] Implement location APIs (CRUD)
- [ ] Implement category APIs (CRUD) with hierarchical support
- [ ] Add category tree structure support

**Frontend Tasks**:
- [ ] Create insurance provider service (`insuranceProviderService`)
- [ ] Create location service (`locationService`)
- [ ] Create category service (`categoryService`)
- [ ] Create insurance provider types
- [ ] Create location types
- [ ] Create category types
- [ ] Create insurance provider pages and components
- [ ] Create location pages and components
- [ ] Create category pages and components (with tree view)

**Acceptance Criteria**:
- ✅ Admin dapat manage insurance providers
- ✅ Admin dapat manage locations
- ✅ Admin dapat manage categories (hierarchical)
- ✅ Selector components dapat digunakan di form lain

**Testing**:
- Test insurance provider CRUD
- Test location CRUD
- Test category CRUD (including parent-child relationship)

**Estimated Time**: 2-3 days

---

### Sprint 4: Master Data - Units & Suppliers

**Goal**: Master data untuk units dan suppliers

**Backend Tasks**:
- [ ] Create unit model and migration
- [ ] Create supplier model and migration
- [ ] Implement unit APIs (CRUD)
- [ ] Implement supplier APIs (CRUD)
- [ ] Add unit conversion support

**Frontend Tasks**:
- [ ] Create unit service (`unitService`)
- [ ] Create supplier service (`supplierService`)
- [ ] Create unit types
- [ ] Create supplier types
- [ ] Create unit pages and components
- [ ] Create supplier pages and components

**Acceptance Criteria**:
- ✅ Admin dapat manage units
- ✅ Admin dapat manage suppliers
- ✅ Unit selector dapat digunakan di form lain
- ✅ Supplier selector dapat digunakan di form lain

**Testing**:
- Test unit CRUD
- Test supplier CRUD
- Test unit conversion (if implemented)

**Estimated Time**: 2 days

---

### Sprint 5: Patient Module - Basic CRUD

**Goal**: Patient registration dan basic management

**Backend Tasks**:
- [ ] Create patient model and migration
- [ ] Implement patient list API (`GET /api/v1/patients`)
- [ ] Implement patient detail API (`GET /api/v1/patients/:id`)
- [ ] Implement create patient API (`POST /api/v1/patients`)
- [ ] Implement update patient API (`PUT /api/v1/patients/:id`)
- [ ] Implement patient search API (`GET /api/v1/patients/search`)
- [ ] Add NIK validation
- [ ] Add BPJS number validation
- [ ] Add pagination support

**Frontend Tasks**:
- [ ] Create patient store (`usePatientStore`)
- [ ] Create patient service (`patientService`)
- [ ] Create patient types (`types/patient.d.ts`)
- [ ] Create patient list page (`/patients`)
- [ ] Create patient form component (`PatientForm`)
- [ ] Create patient list table component (`PatientList`)
- [ ] Create patient detail page (`/patients/[id]`)
- [ ] Create patient search component
- [ ] Add patient photo upload

**Acceptance Criteria**:
- ✅ Receptionist dapat register patient baru
- ✅ User dapat melihat list patients dengan pagination
- ✅ User dapat search patients
- ✅ User dapat edit patient data
- ✅ NIK dan BPJS validation bekerja
- ✅ Photo upload bekerja

**Testing**:
- Test patient CRUD
- Test patient search
- Test NIK validation
- Test BPJS validation
- Test photo upload

**Estimated Time**: 3-4 days

---

### Sprint 6: Doctor Module

**Goal**: Doctor management dan schedule

**Backend Tasks**:
- [ ] Create doctor model and migration
- [ ] Create schedule model and migration
- [ ] Implement doctor list API (`GET /api/v1/doctors`)
- [ ] Implement doctor detail API (`GET /api/v1/doctors/:id`)
- [ ] Implement create doctor API (`POST /api/v1/doctors`)
- [ ] Implement update doctor API (`PUT /api/v1/doctors/:id`)
- [ ] Implement doctor schedule API (`GET /api/v1/doctors/:id/schedule`)
- [ ] Implement update schedule API (`PUT /api/v1/doctors/:id/schedule`)
- [ ] Implement availability API (`GET /api/v1/doctors/:id/availability`)
- [ ] Add STR validation

**Frontend Tasks**:
- [ ] Create doctor store (`useDoctorStore`)
- [ ] Create doctor service (`doctorService`)
- [ ] Create doctor types (`types/doctor.d.ts`)
- [ ] Create doctor list page (`/doctors`)
- [ ] Create doctor form component (`DoctorForm`)
- [ ] Create doctor detail page (`/doctors/[id]`)
- [ ] Create doctor schedule page (`/doctors/[id]/schedule`)
- [ ] Create schedule calendar component
- [ ] Create availability calendar component

**Acceptance Criteria**:
- ✅ Admin dapat manage doctors (CRUD)
- ✅ Admin dapat manage doctor schedule
- ✅ System dapat check doctor availability
- ✅ STR validation bekerja

**Testing**:
- Test doctor CRUD
- Test schedule management
- Test availability check

**Estimated Time**: 3-4 days

---

### Sprint 7: Appointment Module - Basic

**Goal**: Appointment booking dan management

**Backend Tasks**:
- [ ] Create appointment model and migration
- [ ] Implement appointment list API (`GET /api/v1/appointments`)
- [ ] Implement appointment detail API (`GET /api/v1/appointments/:id`)
- [ ] Implement create appointment API (`POST /api/v1/appointments`)
- [ ] Implement update appointment API (`PUT /api/v1/appointments/:id`)
- [ ] Implement cancel appointment API (`POST /api/v1/appointments/:id/cancel`)
- [ ] Implement reschedule API (`POST /api/v1/appointments/:id/reschedule`)
- [ ] Implement available slots API (`GET /api/v1/appointments/available-slots`)
- [ ] Add appointment validation (doctor availability, time conflict)

**Frontend Tasks**:
- [ ] Create appointment store (`useAppointmentStore`)
- [ ] Create appointment service (`appointmentService`)
- [ ] Create appointment types (`types/appointment.d.ts`)
- [ ] Create appointment list page (`/appointments`)
- [ ] Create appointment form component (`AppointmentForm`)
- [ ] Create appointment calendar view (`/appointments/calendar`)
- [ ] Create appointment card component
- [ ] Create time slot selector component
- [ ] Create today's appointments page (`/appointments/today`)

**Acceptance Criteria**:
- ✅ Receptionist dapat book appointment
- ✅ System validate doctor availability
- ✅ User dapat melihat calendar view
- ✅ User dapat cancel/reschedule appointment
- ✅ Available slots ditampilkan dengan benar

**Testing**:
- Test appointment booking
- Test availability validation
- Test cancel/reschedule
- Test calendar view

**Estimated Time**: 4-5 days

---

### Sprint 8: Medical Record Module

**Goal**: Medical record creation dan history

**Backend Tasks**:
- [ ] Create medical record model and migration
- [ ] Create attachment model and migration
- [ ] Implement medical record list API (`GET /api/v1/medical-records`)
- [ ] Implement medical record detail API (`GET /api/v1/medical-records/:id`)
- [ ] Implement create medical record API (`POST /api/v1/medical-records`)
- [ ] Implement update medical record API (`PUT /api/v1/medical-records/:id`)
- [ ] Implement patient medical history API (`GET /api/v1/medical-records/patient/:patientId`)
- [ ] Implement file upload API (`POST /api/v1/medical-records/:id/attachments`)
- [ ] Add diagnosis validation (must exist in master data)

**Frontend Tasks**:
- [ ] Create medical record store (`useMedicalRecordStore`)
- [ ] Create medical record service (`medicalRecordService`)
- [ ] Create medical record types (`types/medical-record.d.ts`)
- [ ] Create medical record list page (`/medical-records`)
- [ ] Create medical record form component (`MedicalRecordForm`)
- [ ] Create medical record detail page (`/medical-records/[id]`)
- [ ] Create chief complaint input component
- [ ] Create physical exam form component
- [ ] Create diagnosis selector (using master data)
- [ ] Create treatment plan editor
- [ ] Create file uploader component
- [ ] Create medical history timeline component

**Acceptance Criteria**:
- ✅ Doctor dapat create medical record setelah appointment
- ✅ Doctor dapat input diagnosis (dari master data)
- ✅ Doctor dapat upload attachments (lab results, X-ray)
- ✅ User dapat melihat medical history pasien
- ✅ Timeline view menampilkan history dengan benar

**Testing**:
- Test medical record creation
- Test diagnosis selection
- Test file upload
- Test medical history view

**Estimated Time**: 4-5 days

---

### Sprint 9: Prescription Module - Basic

**Goal**: Prescription creation dan basic processing

**Backend Tasks**:
- [ ] Create prescription model and migration
- [ ] Create prescription medication model and migration
- [ ] Implement prescription list API (`GET /api/v1/prescriptions`)
- [ ] Implement prescription detail API (`GET /api/v1/prescriptions/:id`)
- [ ] Implement create prescription API (`POST /api/v1/prescriptions`)
- [ ] Implement update prescription API (`PUT /api/v1/prescriptions/:id`)
- [ ] Implement patient prescriptions API (`GET /api/v1/prescriptions/patient/:patientId`)
- [ ] Add medication validation (must exist)
- [ ] Add stock availability check

**Frontend Tasks**:
- [ ] Create prescription store (`usePrescriptionStore`)
- [ ] Create prescription service (`prescriptionService`)
- [ ] Create prescription types (`types/prescription.d.ts`)
- [ ] Create prescription list page (`/prescriptions`)
- [ ] Create prescription form component (`PrescriptionForm`)
- [ ] Create prescription detail page (`/prescriptions/[id]`)
- [ ] Create medication selector component
- [ ] Create dosage input component
- [ ] Create prescription label component

**Acceptance Criteria**:
- ✅ Doctor dapat create prescription
- ✅ Doctor dapat add multiple medications
- ✅ System check stock availability
- ✅ Prescription label dapat dicetak

**Testing**:
- Test prescription creation
- Test medication selection
- Test stock availability check

**Estimated Time**: 3-4 days

---

### Sprint 10: Medication Module

**Goal**: Medication master data management

**Backend Tasks**:
- [ ] Create medication model and migration
- [ ] Implement medication list API (`GET /api/v1/medications`)
- [ ] Implement medication detail API (`GET /api/v1/medications/:id`)
- [ ] Implement create medication API (`POST /api/v1/medications`)
- [ ] Implement update medication API (`PUT /api/v1/medications/:id`)
- [ ] Implement medication search API (`GET /api/v1/medications/search`)
- [ ] Implement barcode scan API (`POST /api/v1/medications/scan`)
- [ ] Implement BPOM validation API
- [ ] Add category relationship

**Frontend Tasks**:
- [ ] Create medication store (`useMedicationStore`)
- [ ] Create medication service (`medicationService`)
- [ ] Create medication types (`types/medication.d.ts`)
- [ ] Create medication list page (`/medications`)
- [ ] Create medication form component (`MedicationForm`)
- [ ] Create medication detail page (`/medications/[id]`)
- [ ] Create barcode scanner component
- [ ] Create BPOM validator component

**Acceptance Criteria**:
- ✅ Admin dapat manage medications (CRUD)
- ✅ Barcode scanning bekerja
- ✅ BPOM validation bekerja
- ✅ Category assignment bekerja

**Testing**:
- Test medication CRUD
- Test barcode scanning
- Test BPOM validation

**Estimated Time**: 3-4 days

---

### Sprint 11: Inventory Module - Stock Management

**Goal**: Stock tracking dan movements

**Backend Tasks**:
- [ ] Create stock model and migration
- [ ] Create stock movement model and migration
- [ ] Implement stock list API (`GET /api/v1/inventory/stock`)
- [ ] Implement stock by location API (`GET /api/v1/inventory/stock?location_id=xxx`)
- [ ] Implement stock movement list API (`GET /api/v1/inventory/movements`)
- [ ] Implement stock adjustment API (`POST /api/v1/inventory/adjustments`)
- [ ] Implement stock transfer API (`POST /api/v1/inventory/transfers`)
- [ ] Implement stock alerts API (`GET /api/v1/inventory/alerts`)
- [ ] Add real-time stock calculation

**Frontend Tasks**:
- [ ] Create inventory store (`useInventoryStore`)
- [ ] Create inventory service (`inventoryService`)
- [ ] Create inventory types (`types/inventory.d.ts`)
- [ ] Create inventory dashboard (`/inventory`)
- [ ] Create stock list page (`/inventory/stock`)
- [ ] Create stock movement list page (`/inventory/movements`)
- [ ] Create stock adjustment form
- [ ] Create stock transfer form
- [ ] Create stock alerts page (`/inventory/alerts`)
- [ ] Create stock level indicator component

**Acceptance Criteria**:
- ✅ User dapat melihat stock per location
- ✅ User dapat melihat stock movements
- ✅ User dapat adjust stock
- ✅ User dapat transfer stock antar location
- ✅ Stock alerts ditampilkan (low stock, expiry)

**Testing**:
- Test stock tracking
- Test stock adjustment
- Test stock transfer
- Test stock alerts

**Estimated Time**: 4-5 days

---

### Sprint 12: Prescription Module - Processing

**Goal**: Prescription processing oleh pharmacist

**Backend Tasks**:
- [ ] Implement prescription processing API (`POST /api/v1/prescriptions/:id/process`)
- [ ] Implement prescription fulfillment API (`POST /api/v1/prescriptions/:id/fulfill`)
- [ ] Implement pending prescriptions API (`GET /api/v1/prescriptions/pending`)
- [ ] Implement drug interaction check API (`POST /api/v1/prescriptions/check-interactions`)
- [ ] Add stock deduction on fulfillment
- [ ] Add partial fulfillment support

**Frontend Tasks**:
- [ ] Create prescription processor component
- [ ] Create pending prescriptions page (`/prescriptions/pending`)
- [ ] Create drug interaction checker component
- [ ] Update prescription detail page dengan processing UI
- [ ] Add fulfillment workflow

**Acceptance Criteria**:
- ✅ Pharmacist dapat melihat pending prescriptions
- ✅ Pharmacist dapat process prescription
- ✅ System check drug interactions
- ✅ Stock otomatis berkurang saat fulfillment
- ✅ Partial fulfillment didukung

**Testing**:
- Test prescription processing
- Test drug interaction check
- Test stock deduction
- Test partial fulfillment

**Estimated Time**: 3-4 days

---

### Sprint 13: Purchase Module

**Goal**: Purchase order dan goods receipt

**Backend Tasks**:
- [ ] Create purchase order model and migration
- [ ] Create purchase order item model and migration
- [ ] Implement purchase order list API (`GET /api/v1/purchases`)
- [ ] Implement purchase order detail API (`GET /api/v1/purchases/:id`)
- [ ] Implement create purchase order API (`POST /api/v1/purchases`)
- [ ] Implement update purchase order API (`PUT /api/v1/purchases/:id`)
- [ ] Implement goods receipt API (`POST /api/v1/purchases/:id/receive`)
- [ ] Add stock increase on goods receipt

**Frontend Tasks**:
- [ ] Create purchase store (`usePurchaseStore`)
- [ ] Create purchase service (`purchaseService`)
- [ ] Create purchase types (`types/purchase.d.ts`)
- [ ] Create purchase order list page (`/purchases`)
- [ ] Create purchase order form component
- [ ] Create purchase order detail page (`/purchases/[id]`)
- [ ] Create goods receipt form component
- [ ] Create goods receipt page (`/purchases/receipts`)

**Acceptance Criteria**:
- ✅ Admin dapat create purchase order
- ✅ Admin dapat receive goods
- ✅ Stock otomatis bertambah saat goods receipt
- ✅ Purchase history dapat dilihat

**Testing**:
- Test purchase order creation
- Test goods receipt
- Test stock increase

**Estimated Time**: 3-4 days

---

### Sprint 14: Transaction Module

**Goal**: Simple transaction recording

**Backend Tasks**:
- [ ] Create transaction model and migration
- [ ] Create transaction item model and migration
- [ ] Implement transaction list API (`GET /api/v1/transactions`)
- [ ] Implement transaction detail API (`GET /api/v1/transactions/:id`)
- [ ] Implement create transaction API (`POST /api/v1/transactions`)
- [ ] Implement update transaction API (`PUT /api/v1/transactions/:id`)
- [ ] Implement receipt API (`GET /api/v1/transactions/:id/receipt`)

**Frontend Tasks**:
- [ ] Create transaction store (`useTransactionStore`)
- [ ] Create transaction service (`transactionService`)
- [ ] Create transaction types (`types/transaction.d.ts`)
- [ ] Create transaction list page (`/transactions`)
- [ ] Create transaction form component
- [ ] Create transaction detail page (`/transactions/[id]`)
- [ ] Create receipt component
- [ ] Add patient transaction history page (`/patients/[id]/transactions`)

**Acceptance Criteria**:
- ✅ Cashier dapat record transaction
- ✅ Transaction dapat linked ke appointment/prescription
- ✅ Receipt dapat dicetak
- ✅ Patient transaction history dapat dilihat

**Testing**:
- Test transaction creation
- Test receipt printing
- Test patient transaction history

**Estimated Time**: 3-4 days

---

### Sprint 15: Dashboard Module

**Goal**: Dashboard dengan key metrics

**Backend Tasks**:
- [ ] Implement dashboard overview API (`GET /api/v1/dashboard/overview`)
- [ ] Implement appointment stats API (`GET /api/v1/dashboard/appointments`)
- [ ] Implement revenue stats API (`GET /api/v1/dashboard/revenue`)
- [ ] Implement inventory stats API (`GET /api/v1/dashboard/inventory`)
- [ ] Implement top doctors API (`GET /api/v1/dashboard/top-doctors`)
- [ ] Implement top medications API (`GET /api/v1/dashboard/top-medications`)
- [ ] Add date range filtering

**Frontend Tasks**:
- [ ] Create dashboard store (`useDashboardStore`)
- [ ] Create dashboard service (`dashboardService`)
- [ ] Create dashboard types (`types/dashboard.d.ts`)
- [ ] Create main dashboard page (`/dashboard`)
- [ ] Create dashboard overview component
- [ ] Create appointment stats component
- [ ] Create revenue chart component
- [ ] Create top doctors component
- [ ] Create top medications component
- [ ] Create inventory alerts summary component
- [ ] Create quick actions component

**Acceptance Criteria**:
- ✅ Dashboard menampilkan key metrics
- ✅ Charts dan graphs ditampilkan dengan benar
- ✅ Date range filtering bekerja
- ✅ Data real-time atau near real-time

**Testing**:
- Test dashboard data loading
- Test date range filtering
- Test chart rendering

**Estimated Time**: 4-5 days

---

### Sprint 16: Reports Module - Basic

**Goal**: Basic reports generation

**Backend Tasks**:
- [ ] Implement patient report API (`GET /api/v1/reports/patients`)
- [ ] Implement appointment report API (`GET /api/v1/reports/appointments`)
- [ ] Implement sales report API (`GET /api/v1/reports/sales`)
- [ ] Implement inventory report API (`GET /api/v1/reports/inventory`)
- [ ] Implement report export API (`GET /api/v1/reports/export`)
- [ ] Add date range and filter support

**Frontend Tasks**:
- [ ] Create report store (`useReportStore`)
- [ ] Create report service (`reportService`)
- [ ] Create report types (`types/report.d.ts`)
- [ ] Create reports list page (`/reports`)
- [ ] Create report generator component
- [ ] Create report viewer component
- [ ] Create date range picker component
- [ ] Create report filters component
- [ ] Add PDF/Excel export functionality

**Acceptance Criteria**:
- ✅ User dapat generate reports
- ✅ Reports dapat di-export ke PDF/Excel
- ✅ Date range dan filters bekerja
- ✅ Report data akurat

**Testing**:
- Test report generation
- Test report export
- Test filters

**Estimated Time**: 4-5 days

---

### Sprint 17: Settings Module

**Goal**: System settings management

**Backend Tasks**:
- [ ] Create settings model and migration
- [ ] Implement get settings API (`GET /api/v1/settings`)
- [ ] Implement update settings API (`PUT /api/v1/settings`)
- [ ] Implement general settings API
- [ ] Implement notification settings API
- [ ] Implement payment settings API
- [ ] Implement tax settings API

**Frontend Tasks**:
- [ ] Create settings store (`useSettingsStore`)
- [ ] Create settings service (`settingsService`)
- [ ] Create settings types (`types/settings.d.ts`)
- [ ] Create settings dashboard (`/settings`)
- [ ] Create general settings page (`/settings/general`)
- [ ] Create notification settings page (`/settings/notifications`)
- [ ] Create payment settings page (`/settings/payments`)
- [ ] Create tax settings page (`/settings/taxes`)

**Acceptance Criteria**:
- ✅ Admin dapat manage system settings
- ✅ Settings tersimpan dengan benar
- ✅ Settings affect system behavior

**Testing**:
- Test settings update
- Test settings persistence

**Estimated Time**: 2-3 days

---

### Sprint 18: Integration & Polish

**Goal**: Integrate all modules, fix bugs, optimize

**Backend Tasks**:
- [ ] Fix integration issues between modules
- [ ] Optimize database queries
- [ ] Add missing validations
- [ ] Improve error handling
- [ ] Add logging
- [ ] Performance testing
- [ ] Security audit

**Frontend Tasks**:
- [ ] Fix integration issues
- [ ] Improve UI/UX consistency
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Optimize bundle size
- [ ] Add accessibility features
- [ ] Cross-browser testing

**Acceptance Criteria**:
- ✅ Semua modules terintegrasi dengan baik
- ✅ Tidak ada critical bugs
- ✅ Performance acceptable
- ✅ UI/UX konsisten

**Testing**:
- End-to-end testing
- Performance testing
- Security testing

**Estimated Time**: 5-7 days

---

## Sprint Checklist

### Before Starting Sprint

- [ ] Review sprint goal and tasks
- [ ] Check dependencies from previous sprints
- [ ] Setup development environment
- [ ] Create feature branch

### During Sprint

- [ ] Follow coding standards
- [ ] Write tests for new features
- [ ] Update documentation
- [ ] Commit frequently with clear messages

### After Sprint

- [ ] Test all acceptance criteria
- [ ] Code review
- [ ] Update sprint status
- [ ] Deploy to staging (if applicable)
- [ ] Demo to stakeholders

---

## Dependencies

### Sprint Dependency Graph

```
Sprint 0 (Setup)
    ↓
Sprint 1 (Users)
    ↓
Sprint 2-4 (Master Data) → Parallel
    ↓
Sprint 5 (Patients)
    ↓
Sprint 6 (Doctors)
    ↓
Sprint 7 (Appointments) → Requires: Patients, Doctors
    ↓
Sprint 8 (Medical Records) → Requires: Appointments, Master Data (Diagnosis)
    ↓
Sprint 9 (Prescriptions - Basic) → Requires: Patients, Doctors, Medical Records
    ↓
Sprint 10 (Medications) → Requires: Master Data (Categories, Units)
    ↓
Sprint 11 (Inventory) → Requires: Medications, Master Data (Locations)
    ↓
Sprint 12 (Prescriptions - Processing) → Requires: Prescriptions, Inventory
    ↓
Sprint 13 (Purchases) → Requires: Medications, Suppliers, Inventory
    ↓
Sprint 14 (Transactions) → Requires: Patients, Appointments, Prescriptions
    ↓
Sprint 15 (Dashboard) → Requires: All modules
    ↓
Sprint 16 (Reports) → Requires: All modules
    ↓
Sprint 17 (Settings) → Can be done in parallel
    ↓
Sprint 18 (Integration & Polish) → Requires: All sprints
```

---

## Estimated Timeline

- **Total Sprints**: 18
- **Estimated Duration**: 60-75 working days (12-15 weeks)
- **Team Size**: 2-3 developers (1 backend, 1-2 frontend)

---

## Notes

1. **Flexibility**: Sprint dapat di-adjust sesuai kebutuhan
2. **Parallel Work**: Beberapa sprints dapat dikerjakan parallel jika tidak ada dependency
3. **Testing**: Setiap sprint harus include testing
4. **Documentation**: Update documentation setelah setiap sprint
5. **Code Review**: Lakukan code review sebelum merge

---

**Dokumen ini akan diupdate sesuai dengan progress development.**

