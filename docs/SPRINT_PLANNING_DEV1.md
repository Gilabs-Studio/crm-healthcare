# Sprint Planning - Developer 1 (Fullstack Developer)
## CRM Healthcare/Pharmaceutical Platform - Sales CRM

**Developer**: Fullstack Developer (Go Backend + Next.js Frontend)  
**Role**: Develop modul-modul Sales CRM secara fullstack (backend + frontend)  
**Versi**: 2.0  
**Status**: Active  
**Last Updated**: 2025-01-15

> **📊 Visualisasi Project**: Lihat [**PROJECT_DIAGRAMS.md**](../PROJECT_DIAGRAMS.md) untuk memahami scope, fitur, dan user flow secara visual.

---

## 📋 Overview

Developer 1 bertanggung jawab untuk:
- **Fullstack Development**: Develop modul-modul yang ditugaskan secara lengkap (backend API + frontend)
- **Backend**: Go (Gin) APIs untuk modul yang ditugaskan
- **Frontend**: Next.js 16 frontend untuk modul yang ditugaskan
- **Database**: Design dan implement database schema untuk modul yang ditugaskan
- **Postman Collection**: Update Postman collection untuk modul yang ditugaskan

**Modul yang ditugaskan ke Dev1**:
1. ✅ Account & Contact Management (Fullstack)
2. ✅ Visit Report & Activity Tracking (Fullstack)
3. ✅ Dashboard & Reports (Fullstack)
4. ✅ Settings (Fullstack)

**Parallel Development Strategy**:
- ✅ **TIDAK bergantung ke Dev2** - bisa dikerjakan paralel
- ✅ Setiap modul dikerjakan fullstack sampai selesai
- ✅ **Hackathon mode** - tidak ada unit test
- ✅ Manual testing saja

---

## 🎯 Sprint Details

### Sprint 0: Foundation Review & Improvement (Week 1)

**Goal**: Review dan perbaiki foundation yang sudah ada

**Tasks**:
- [x] Review authentication flow (login, token refresh)
- [x] Fix bugs di sprint 0 jika ada
- [x] Improve error handling di frontend
- [x] Optimize API client interceptors
- [x] Improve loading states dan skeletons
- [x] Review dan fix auth guard component

**Acceptance Criteria**:
- ✅ Login flow bekerja dengan baik
- ✅ Token refresh otomatis bekerja
- ✅ Error handling konsisten
- ✅ Loading states smooth

**Estimated Time**: 3-4 days

---

### Sprint 1: User Management Review & Improvement (Week 1-2)

**Goal**: Review dan perbaiki user management module

**Tasks**:
- [x] Review user list page dan fix bugs
- [x] Improve user form validation
- [x] Optimize user list table (pagination, search, filter)
- [x] Fix sidebar permission integration
- [x] Improve user form UI/UX
- [x] Add user detail page jika belum ada

**Acceptance Criteria**:
- ✅ User CRUD bekerja dengan baik
- ✅ Search dan filter bekerja optimal
- ✅ Form validation comprehensive
- ✅ UI/UX modern dan intuitive

**Estimated Time**: 3-4 days

---

### Sprint 2: Master Data Cleanup (Week 2)

**Goal**: Archive atau adapt master data yang tidak relevan untuk Sales CRM

**Tasks**:
- [x] Review diagnosis & procedures module
- [x] Archive atau mark sebagai optional module
- [x] Update sidebar untuk remove/hide diagnosis & procedures menu
- [x] Cleanup unused components jika ada
- [x] Update navigation structure

**Acceptance Criteria**:
- ✅ Diagnosis & Procedures tidak muncul di menu utama (atau di archive)
- ✅ Navigation clean dan hanya menampilkan Sales CRM modules
- ✅ Tidak ada broken links

**Estimated Time**: 1-2 days

---

### Sprint 3: Account & Contact Management (Fullstack) (Week 3-4)

**Goal**: Implement Account & Contact Management secara fullstack (backend + frontend)

**Backend Tasks**:
- [x] Create account model dan migration
- [x] Create contact model dan migration
- [x] Create account repository interface dan implementation
- [x] Create contact repository interface dan implementation
- [x] Create account service
- [x] Create contact service
- [x] Implement account list API (`GET /api/v1/accounts`)
- [x] Implement account detail API (`GET /api/v1/accounts/:id`)
- [x] Implement create account API (`POST /api/v1/accounts`)
- [x] Implement update account API (`PUT /api/v1/accounts/:id`)
- [x] Implement delete account API (`DELETE /api/v1/accounts/:id`)
- [x] Implement contact list API (`GET /api/v1/contacts`)
- [x] Implement contact detail API (`GET /api/v1/contacts/:id`)
- [x] Implement create contact API (`POST /api/v1/contacts`)
- [x] Implement update contact API (`PUT /api/v1/contacts/:id`)
- [x] Implement delete contact API (`DELETE /api/v1/contacts/:id`)
- [x] Implement account-contact relationship APIs (via foreign key and preload)
- [x] Add account search API (integrated in list API with search param)
- [x] Add contact search API (integrated in list API with search param)
- [x] Add pagination support
- [x] Add validation
- [x] Add account categories seeder (via menu/permission seeder integration)

**Frontend Tasks**:
- [x] Create account types (`types/account.d.ts`)
- [x] Create contact types (`types/contact.d.ts`)
- [x] Create account service (`accountService`)
- [x] Create contact service (`contactService`)
- [x] Create account list page (`/accounts`)
- [x] Create account form component (`AccountForm`)
- [x] Create account detail page (view functionality in list, detail page can be added later)
- [x] Create contact list page (`/contacts`)
- [x] Create contact form component (`ContactForm`)
- [x] Create contact detail page (view functionality in list, detail page can be added later)
- [x] Add account search and filter
- [x] Add contact search and filter
- [x] Create account selector component (integrated in ContactForm)
- [x] Create contact selector component (can be added when needed for other forms)
- [x] Add account-contact relationship UI (contact form shows account selector, contact list shows account name)

**Postman Collection**:
- [x] Add account APIs ke Postman collection (Web section)
- [x] Add contact APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Account CRUD APIs bekerja dengan baik
- ✅ Contact CRUD APIs bekerja dengan baik
- ✅ Account-contact relationship bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Search dan filter bekerja optimal
- ✅ Form validation comprehensive
- ✅ UI/UX modern dan intuitive
- ✅ Postman collection updated

**Testing** (Manual testing):
- Test account CRUD (backend + frontend)
- Test contact CRUD (backend + frontend)
- Test account-contact relationship
- Test search and filter

**Estimated Time**: 6-7 days

---

### Sprint 4: Visit Report & Activity Tracking (Fullstack) (Week 5-6)

**Goal**: Implement Visit Report & Activity Tracking secara fullstack (backend + frontend)

**Backend Tasks**:
- [ ] Create visit report model dan migration
- [ ] Create activity model dan migration
- [ ] Create visit report repository interface dan implementation
- [ ] Create activity repository interface dan implementation
- [ ] Create visit report service
- [ ] Create activity service
- [ ] Implement visit report list API (`GET /api/v1/visit-reports`)
- [ ] Implement visit report detail API (`GET /api/v1/visit-reports/:id`)
- [ ] Implement create visit report API (`POST /api/v1/visit-reports`)
- [ ] Implement update visit report API (`PUT /api/v1/visit-reports/:id`)
- [ ] Implement delete visit report API (`DELETE /api/v1/visit-reports/:id`)
- [ ] Implement check-in API (`POST /api/v1/visit-reports/:id/check-in`)
- [ ] Implement check-out API (`POST /api/v1/visit-reports/:id/check-out`)
- [ ] Implement approve visit report API (`POST /api/v1/visit-reports/:id/approve`)
- [ ] Implement reject visit report API (`POST /api/v1/visit-reports/:id/reject`)
- [ ] Implement photo upload API (`POST /api/v1/visit-reports/:id/photos`)
- [ ] Implement activity list API (`GET /api/v1/activities`)
- [ ] Implement activity timeline API (`GET /api/v1/accounts/:id/activities`)
- [ ] Add GPS location tracking
- [ ] Add pagination support
- [ ] Add validation
- [ ] Add file storage setup

**Frontend Tasks**:
- [ ] Create visit report types (`types/visit-report.d.ts`)
- [ ] Create activity types (`types/activity.d.ts`)
- [ ] Create visit report service (`visitReportService`)
- [ ] Create activity service (`activityService`)
- [ ] Create visit report list page (`/visit-reports`)
- [ ] Create visit report form component (`VisitReportForm`)
- [ ] Create visit report detail page (`/visit-reports/[id]`)
- [ ] Create activity timeline component (`ActivityTimeline`)
- [ ] Create photo upload component
- [ ] Create visit report status badge component
- [ ] Add visit report search and filter
- [ ] Create supervisor review UI (approve/reject)
- [ ] Add activity timeline di account detail page

**Postman Collection**:
- [ ] Add visit report APIs ke Postman collection (Web section)
- [ ] Add visit report APIs ke Postman collection (Mobile section)
- [ ] Add activity APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Visit report CRUD APIs bekerja dengan baik
- ✅ Check-in/out APIs bekerja dengan GPS
- ✅ Photo upload bekerja
- ✅ Activity tracking bekerja
- ✅ Supervisor approve/reject bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Search dan filter bekerja optimal
- ✅ Postman collection updated (Web + Mobile)

**Testing** (Manual testing):
- Test visit report CRUD (backend + frontend)
- Test check-in/out dengan GPS
- Test photo upload
- Test activity tracking
- Test supervisor workflow

**Estimated Time**: 7-8 days

---

### Sprint 5: Dashboard & Reports (Fullstack) (Week 11-12)

**Goal**: Implement Dashboard & Reports secara fullstack (backend + frontend)

**Backend Tasks**:
- [ ] Create dashboard service
- [ ] Create report service
- [ ] Implement dashboard overview API (`GET /api/v1/dashboard/overview`)
- [ ] Implement visit statistics API (`GET /api/v1/dashboard/visits`)
- [ ] Implement pipeline summary API (`GET /api/v1/dashboard/pipeline`)
- [ ] Implement top accounts API (`GET /api/v1/dashboard/top-accounts`)
- [ ] Implement top sales rep API (`GET /api/v1/dashboard/top-sales-rep`)
- [ ] Implement recent activities API (`GET /api/v1/dashboard/recent-activities`)
- [ ] Implement visit report API (`GET /api/v1/reports/visit-reports`)
- [ ] Implement sales pipeline report API (`GET /api/v1/reports/pipeline`)
- [ ] Implement sales performance report API (`GET /api/v1/reports/sales-performance`)
- [ ] Implement account activity report API (`GET /api/v1/reports/account-activity`)
- [ ] Add date range filtering
- [ ] Add export functionality (PDF/Excel) - basic

**Frontend Tasks**:
- [ ] Create dashboard service (`dashboardService`)
- [ ] Create report service (`reportService`)
- [ ] Create dashboard types (`types/dashboard.d.ts`)
- [ ] Create main dashboard page (`/dashboard`)
- [ ] Create dashboard overview component
- [ ] Create visit statistics component
- [ ] Create pipeline summary component
- [ ] Create top accounts component
- [ ] Create top sales rep component
- [ ] Create recent activities component
- [ ] Create charts (using recharts atau similar)
- [ ] Create reports list page (`/reports`)
- [ ] Create report generator component
- [ ] Create report viewer component
- [ ] Add date range picker
- [ ] Add export functionality (PDF/Excel)

**Postman Collection**:
- [ ] Add dashboard APIs ke Postman collection (Web section)
- [ ] Add report APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Dashboard APIs bekerja dengan baik
- ✅ Report APIs bekerja dengan baik
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Dashboard menampilkan key metrics
- ✅ Charts dan graphs ditampilkan dengan benar
- ✅ Date range filtering bekerja
- ✅ Reports dapat di-generate dan di-export
- ✅ Postman collection updated

**Testing** (Manual testing):
- Test dashboard data loading (backend + frontend)
- Test date range filtering
- Test chart rendering
- Test report generation
- Test export functionality

**Estimated Time**: 6-7 days

---

### Sprint 6: Settings (Fullstack) (Week 13)

**Goal**: Implement Settings secara fullstack (backend + frontend)

**Backend Tasks**:
- [ ] Create settings model dan migration
- [ ] Create settings repository interface dan implementation
- [ ] Create settings service
- [ ] Implement get settings API (`GET /api/v1/settings`)
- [ ] Implement update settings API (`PUT /api/v1/settings`)
- [ ] Implement general settings API
- [ ] Implement notification settings API
- [ ] Implement pipeline settings API
- [ ] Add validation

**Frontend Tasks**:
- [ ] Create settings service (`settingsService`)
- [ ] Create settings types (`types/settings.d.ts`)
- [ ] Create settings dashboard (`/settings`)
- [ ] Create general settings page (`/settings/general`)
- [ ] Create notification settings page (`/settings/notifications`)
- [ ] Create pipeline settings page (`/settings/pipeline`)
- [ ] Improve UI/UX consistency
- [ ] Add loading states di semua pages
- [ ] Add error boundaries
- [ ] Optimize bundle size
- [ ] Cross-browser testing

**Postman Collection**:
- [ ] Add settings APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Settings APIs bekerja dengan baik
- ✅ Settings tersimpan dengan benar
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Admin dapat manage settings
- ✅ UI/UX konsisten di semua pages
- ✅ Loading states smooth
- ✅ Error handling comprehensive
- ✅ Performance optimal
- ✅ Postman collection updated

**Testing** (Manual testing):
- Test settings update (backend + frontend)
- Test settings persistence
- Test UI/UX consistency
- Test performance

**Estimated Time**: 3-4 days

---

### Sprint 7: Integration & Final Testing (Week 14)

**Goal**: Integration dengan modul Dev2 dan final testing

**Tasks**:
- [ ] Coordinate dengan Developer 2 untuk integration
- [ ] Test integration antara modul Dev1 dan Dev2
- [ ] Fix integration issues
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Final bug fixes
- [ ] Documentation update

**Acceptance Criteria**:
- ✅ Semua modules terintegrasi dengan baik
- ✅ Tidak ada critical bugs
- ✅ Performance acceptable
- ✅ Security audit passed

**Testing**:
- End-to-end testing
- Performance testing
- Security testing

**Estimated Time**: 3-4 days

---

## 📊 Sprint Summary

| Sprint | Goal | Duration | Status |
|--------|------|----------|--------|
| Sprint 0 | Foundation Review | 3-4 days | ✅ Completed |
| Sprint 1 | User Management Review | 3-4 days | ✅ Completed |
| Sprint 2 | Master Data Cleanup | 1-2 days | ✅ Completed |
| Sprint 3 | Account & Contact (Fullstack) | 6-7 days | ⏳ Pending |
| Sprint 4 | Visit Report (Fullstack) | 7-8 days | ⏳ Pending |
| Sprint 5 | Dashboard & Reports (Fullstack) | 6-7 days | ⏳ Pending |
| Sprint 6 | Settings (Fullstack) | 3-4 days | ⏳ Pending |
| Sprint 7 | Integration & Testing | 3-4 days | ⏳ Pending |

**Total Estimated Time**: 33-40 days (4.7-5.7 weeks)

---

## 🔗 Coordination dengan Dev2

### Modul yang dikerjakan Dev2 (untuk referensi):
- Sales Pipeline (Fullstack)
- Task & Reminder (Fullstack)
- Product Management (Fullstack)

### Integration Points:
- Dashboard & Reports perlu data dari Pipeline (Dev2)
- Visit Report bisa link ke Task (Dev2)
- Deal bisa link ke Product (Dev2)

### Coordination:
- [ ] Week 3: Coordinate API contract untuk integration points
- [ ] Week 7: Mid-sprint review - check integration points
- [ ] Week 11: Pre-integration review
- [ ] Week 14: Final integration testing

---

## 📝 Notes

1. **Fullstack Development**: Setiap modul dikerjakan fullstack sampai selesai
2. **No Dependencies**: Tidak bergantung ke Dev2, bisa dikerjakan paralel
3. **Hackathon Mode**: Tidak ada unit test, manual testing saja
4. **Code Review**: Lakukan code review sebelum merge
5. **Documentation**: Update documentation setelah setiap sprint
6. **Postman Collection**: Update Postman collection untuk setiap modul

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
