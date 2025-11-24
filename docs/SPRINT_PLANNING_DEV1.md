# Sprint Planning - Developer 1 (Web Developer)
## CRM Healthcare/Pharmaceutical Platform - Sales CRM

**Developer**: Web Developer (Full-stack, fokus Web)  
**Role**: Perbaiki sprint 0-2 dan lanjutkan web development  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-15

> **📊 Visualisasi Project**: Lihat [**PROJECT_DIAGRAMS.md**](../PROJECT_DIAGRAMS.md) untuk memahami scope, fitur, dan user flow secara visual.

---

## 📋 Overview

Developer 1 bertanggung jawab untuk:
- **Perbaikan**: Fix dan improve sprint 0-2 yang sudah ada
- **Web Development**: Lanjutkan development web application (Next.js 16)
- **Integration**: Integrasi dengan backend API yang dibuat Developer 2
- **UI/UX**: Pastikan UI/UX konsisten dan modern

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
- [ ] Review diagnosis & procedures module
- [ ] Archive atau mark sebagai optional module
- [ ] Update sidebar untuk remove/hide diagnosis & procedures menu
- [ ] Cleanup unused components jika ada
- [ ] Update navigation structure

**Acceptance Criteria**:
- ✅ Diagnosis & Procedures tidak muncul di menu utama (atau di archive)
- ✅ Navigation clean dan hanya menampilkan Sales CRM modules
- ✅ Tidak ada broken links

**Estimated Time**: 1-2 days

---

### Sprint 3: Account & Contact Management (Week 3-4)

**Goal**: Implement Account & Contact Management untuk Sales CRM

**Backend Tasks** (Coordinate dengan Developer 2):
- [ ] Review account model dan migration
- [ ] Review contact model dan migration
- [ ] Test account CRUD APIs
- [ ] Test contact CRUD APIs

**Frontend Tasks**:
- [ ] Create account service (`accountService`)
- [ ] Create contact service (`contactService`)
- [ ] Create account types (`types/account.d.ts`)
- [ ] Create contact types (`types/contact.d.ts`)
- [ ] Create account list page (`/accounts`)
- [ ] Create account form component (`AccountForm`)
- [ ] Create account detail page (`/accounts/[id]`)
- [ ] Create contact list page (`/contacts`)
- [ ] Create contact form component (`ContactForm`)
- [ ] Create contact detail page (`/contacts/[id]`)
- [ ] Add account search and filter
- [ ] Add contact search and filter
- [ ] Create account selector component (untuk form lain)
- [ ] Create contact selector component (untuk form lain)
- [ ] Add account-contact relationship UI

**Acceptance Criteria**:
- ✅ Admin dapat manage accounts (CRUD)
- ✅ Admin dapat manage contacts (CRUD)
- ✅ Account dan contact terhubung dengan benar
- ✅ Search dan filter bekerja optimal
- ✅ Form validation comprehensive
- ✅ UI/UX modern dan intuitive

**Testing**:
- Test account CRUD
- Test contact CRUD
- Test account-contact relationship
- Test search and filter

**Estimated Time**: 5-6 days

---

### Sprint 4: Visit Report & Activity Tracking (Week 5-6)

**Goal**: Implement Visit Report & Activity Tracking

**Backend Tasks** (Coordinate dengan Developer 2):
- [ ] Review visit report model dan migration
- [ ] Review activity model dan migration
- [ ] Test visit report CRUD APIs
- [ ] Test check-in/out APIs
- [ ] Test photo upload API

**Frontend Tasks**:
- [ ] Create visit report service (`visitReportService`)
- [ ] Create activity service (`activityService`)
- [ ] Create visit report types (`types/visit-report.d.ts`)
- [ ] Create activity types (`types/activity.d.ts`)
- [ ] Create visit report list page (`/visit-reports`)
- [ ] Create visit report form component (`VisitReportForm`)
- [ ] Create visit report detail page (`/visit-reports/[id]`)
- [ ] Create activity timeline component (`ActivityTimeline`)
- [ ] Create photo upload component
- [ ] Create visit report status badge component
- [ ] Add visit report search and filter
- [ ] Create supervisor review UI (approve/reject)
- [ ] Add activity timeline di account detail page

**Acceptance Criteria**:
- ✅ Sales rep dapat create visit report
- ✅ Supervisor dapat review dan approve/reject
- ✅ Activity timeline menampilkan semua aktivitas
- ✅ Photo upload bekerja
- ✅ Search dan filter bekerja optimal

**Testing**:
- Test visit report creation
- Test supervisor review flow
- Test activity timeline
- Test photo upload

**Estimated Time**: 5-6 days

---

### Sprint 5: Sales Pipeline (Week 7-8)

**Goal**: Implement Sales Pipeline Management

**Backend Tasks** (Coordinate dengan Developer 2):
- [ ] Review pipeline model dan migration
- [ ] Review deal model dan migration
- [ ] Test pipeline APIs
- [ ] Test deal CRUD APIs

**Frontend Tasks**:
- [ ] Create pipeline service (`pipelineService`)
- [ ] Create deal service (`dealService`)
- [ ] Create pipeline types (`types/pipeline.d.ts`)
- [ ] Create deal types (`types/deal.d.ts`)
- [ ] Create pipeline kanban page (`/pipeline`)
- [ ] Create kanban board component (`KanbanBoard`)
- [ ] Create deal card component (`DealCard`)
- [ ] Create deal form component (`DealForm`)
- [ ] Create deal detail page (`/deals/[id]`)
- [ ] Add drag-and-drop untuk move deal
- [ ] Create pipeline summary component
- [ ] Create forecast component

**Acceptance Criteria**:
- ✅ User dapat melihat pipeline dalam kanban view
- ✅ User dapat create dan edit deal
- ✅ User dapat move deal antar stages (drag-and-drop)
- ✅ Pipeline summary dan forecast ditampilkan
- ✅ UI/UX modern dan intuitive

**Testing**:
- Test pipeline kanban view
- Test deal CRUD
- Test drag-and-drop
- Test forecast calculation

**Estimated Time**: 5-6 days

---

### Sprint 6: Task & Reminder (Week 9)

**Goal**: Implement Task & Reminder Management

**Backend Tasks** (Coordinate dengan Developer 2):
- [ ] Review task model dan migration
- [ ] Test task CRUD APIs
- [ ] Test reminder APIs

**Frontend Tasks**:
- [ ] Create task service (`taskService`)
- [ ] Create task types (`types/task.d.ts`)
- [ ] Create task list page (`/tasks`)
- [ ] Create task form component (`TaskForm`)
- [ ] Create task card component (`TaskCard`)
- [ ] Create task detail page (`/tasks/[id]`)
- [ ] Add task filter (status, assignee, due date)
- [ ] Create reminder settings component
- [ ] Add task linked ke account/contact

**Acceptance Criteria**:
- ✅ User dapat create dan manage tasks
- ✅ Task dapat di-assign ke sales rep
- ✅ Task dapat di-link ke account/contact
- ✅ Filter dan search bekerja optimal

**Testing**:
- Test task CRUD
- Test task assignment
- Test task filtering

**Estimated Time**: 3-4 days

---

### Sprint 7: Product Management (Week 10)

**Goal**: Implement Product Management

**Backend Tasks** (Coordinate dengan Developer 2):
- [ ] Review product model dan migration
- [ ] Test product CRUD APIs

**Frontend Tasks**:
- [ ] Create product service (`productService`)
- [ ] Create product types (`types/product.d.ts`)
- [ ] Create product list page (`/products`)
- [ ] Create product form component (`ProductForm`)
- [ ] Create product detail page (`/products/[id]`)
- [ ] Create product selector component (untuk deal form)
- [ ] Add product search and filter

**Acceptance Criteria**:
- ✅ Admin dapat manage products (CRUD)
- ✅ Product selector dapat digunakan di deal form
- ✅ Search dan filter bekerja optimal

**Testing**:
- Test product CRUD
- Test product selector

**Estimated Time**: 2-3 days

---

### Sprint 8: Dashboard & Reports (Week 11-12)

**Goal**: Implement Dashboard & Reports

**Backend Tasks** (Coordinate dengan Developer 2):
- [ ] Review dashboard APIs
- [ ] Review report APIs
- [ ] Test dashboard endpoints
- [ ] Test report endpoints

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

**Acceptance Criteria**:
- ✅ Dashboard menampilkan key metrics
- ✅ Charts dan graphs ditampilkan dengan benar
- ✅ Date range filtering bekerja
- ✅ Reports dapat di-generate dan di-export

**Testing**:
- Test dashboard data loading
- Test date range filtering
- Test chart rendering
- Test report generation
- Test export functionality

**Estimated Time**: 6-7 days

---

### Sprint 9: Settings & Polish (Week 13)

**Goal**: Implement Settings dan final polish

**Backend Tasks** (Coordinate dengan Developer 2):
- [ ] Review settings APIs
- [ ] Test settings endpoints

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

**Acceptance Criteria**:
- ✅ Admin dapat manage settings
- ✅ UI/UX konsisten di semua pages
- ✅ Loading states smooth
- ✅ Error handling comprehensive
- ✅ Performance optimal

**Testing**:
- Test settings update
- Test UI/UX consistency
- Test performance

**Estimated Time**: 4-5 days

---

### Sprint 10: Integration & Final Testing (Week 14)

**Goal**: Integration dengan mobile app dan final testing

**Tasks**:
- [ ] Coordinate dengan Developer 2 untuk API integration
- [ ] Coordinate dengan Developer 3 untuk mobile app integration
- [ ] Integration testing
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

**Estimated Time**: 5-7 days

---

## 📊 Sprint Summary

| Sprint | Goal | Duration | Status |
|--------|------|----------|--------|
| Sprint 0 | Foundation Review | 3-4 days | ✅ Completed |
| Sprint 1 | User Management Review | 3-4 days | ✅ Completed |
| Sprint 2 | Master Data Cleanup | 1-2 days | ⏳ Pending |
| Sprint 3 | Account & Contact | 5-6 days | ⏳ Pending |
| Sprint 4 | Visit Report | 5-6 days | ⏳ Pending |
| Sprint 5 | Sales Pipeline | 5-6 days | ⏳ Pending |
| Sprint 6 | Task & Reminder | 3-4 days | ⏳ Pending |
| Sprint 7 | Product Management | 2-3 days | ⏳ Pending |
| Sprint 8 | Dashboard & Reports | 6-7 days | ⏳ Pending |
| Sprint 9 | Settings & Polish | 4-5 days | ⏳ Pending |
| Sprint 10 | Integration & Testing | 5-7 days | ⏳ Pending |

**Total Estimated Time**: 42-52 days (6-7.5 weeks)

---

## 🔗 Dependencies

### Dependencies dari Developer 2 (Backend)
- Account & Contact APIs (Sprint 3)
- Visit Report APIs (Sprint 4)
- Pipeline APIs (Sprint 5)
- Task APIs (Sprint 6)
- Product APIs (Sprint 7)
- Dashboard APIs (Sprint 8)
- Settings APIs (Sprint 9)

### Dependencies dari Developer 3 (Mobile)
- Mobile app menggunakan same APIs
- Coordinate untuk API design consistency

---

## 📝 Notes

1. **Coordinate dengan Developer 2**: Pastikan API design konsisten dan sesuai kebutuhan frontend
2. **Coordinate dengan Developer 3**: Pastikan mobile app dan web app menggunakan same APIs
3. **Code Review**: Lakukan code review sebelum merge
4. **Testing**: Test setiap feature sebelum move ke sprint berikutnya
5. **Documentation**: Update documentation setelah setiap sprint

---

**Dokumen ini akan diupdate sesuai dengan progress development.**

