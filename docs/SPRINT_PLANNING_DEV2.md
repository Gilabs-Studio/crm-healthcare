# Sprint Planning - Developer 2 (Backend Developer)
## CRM Healthcare/Pharmaceutical Platform - Sales CRM

**Developer**: Backend Developer (Fokus BE, sedikit FE)  
**Role**: Develop backend APIs dan sedikit frontend yang efisien  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-15

> **📊 Visualisasi Project**: Lihat [**PROJECT_DIAGRAMS.md**](../PROJECT_DIAGRAMS.md) untuk memahami scope, fitur, dan user flow secara visual.

---

## 📋 Overview

Developer 2 bertanggung jawab untuk:
- **Backend Development**: Develop semua backend APIs (Go + Gin)
- **Database Design**: Design dan implement database schema
- **API Design**: Design RESTful APIs sesuai API standards
- **Minimal Frontend**: Develop minimal frontend yang efisien (hanya untuk testing/validation)
- **API Documentation**: Update Postman collection

---

## 🎯 Sprint Details

### Sprint 0: Foundation Review & API Standards (Week 1)

**Goal**: Review foundation dan pastikan API standards konsisten

**Tasks**:
- [ ] Review authentication APIs
- [ ] Review API response helpers
- [ ] Review error handling
- [ ] Pastikan semua APIs mengikuti API response standards
- [ ] Update Postman collection untuk authentication
- [ ] Test semua existing APIs

**Acceptance Criteria**:
- ✅ Authentication APIs bekerja dengan baik
- ✅ API response format konsisten
- ✅ Error handling comprehensive
- ✅ Postman collection updated

**Estimated Time**: 2-3 days

---

### Sprint 1: User Management API Review (Week 1-2)

**Goal**: Review dan pastikan user management APIs optimal

**Tasks**:
- [ ] Review user management APIs
- [ ] Optimize user list API (pagination, search, filter)
- [ ] Review permission APIs
- [ ] Test semua user management endpoints
- [ ] Update Postman collection untuk user management
- [ ] Add missing validations jika ada

**Acceptance Criteria**:
- ✅ User management APIs optimal
- ✅ Permission APIs bekerja dengan baik
- ✅ Postman collection updated

**Estimated Time**: 2-3 days

---

### Sprint 2: Account & Contact Management APIs (Week 3-4)

**Goal**: Implement Account & Contact Management APIs

**Backend Tasks**:
- [ ] Create account model dan migration
- [ ] Create contact model dan migration
- [ ] Create account repository interface dan implementation
- [ ] Create contact repository interface dan implementation
- [ ] Create account service
- [ ] Create contact service
- [ ] Implement account list API (`GET /api/v1/accounts`)
- [ ] Implement account detail API (`GET /api/v1/accounts/:id`)
- [ ] Implement create account API (`POST /api/v1/accounts`)
- [ ] Implement update account API (`PUT /api/v1/accounts/:id`)
- [ ] Implement delete account API (`DELETE /api/v1/accounts/:id`)
- [ ] Implement contact list API (`GET /api/v1/contacts`)
- [ ] Implement contact detail API (`GET /api/v1/contacts/:id`)
- [ ] Implement create contact API (`POST /api/v1/contacts`)
- [ ] Implement update contact API (`PUT /api/v1/contacts/:id`)
- [ ] Implement delete contact API (`DELETE /api/v1/contacts/:id`)
- [ ] Implement account-contact relationship APIs
- [ ] Add account search API (`GET /api/v1/accounts/search`)
- [ ] Add contact search API (`GET /api/v1/contacts/search`)
- [ ] Add pagination support
- [ ] Add validation
- [ ] Add account categories seeder

**Minimal Frontend Tasks** (Efisien):
- [ ] Create simple account list page untuk testing (`/test/accounts`)
- [ ] Create simple account form untuk testing
- [ ] Create simple contact list page untuk testing (`/test/contacts`)
- [ ] Create simple contact form untuk testing

**Postman Collection**:
- [ ] Add account APIs ke Postman collection (Web section)
- [ ] Add contact APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Account CRUD APIs bekerja dengan baik
- ✅ Contact CRUD APIs bekerja dengan baik
- ✅ Account-contact relationship bekerja
- ✅ Search dan pagination bekerja
- ✅ Validation comprehensive
- ✅ Postman collection updated

**Testing**:
- Test account CRUD
- Test contact CRUD
- Test account-contact relationship
- Test search dan pagination

**Estimated Time**: 6-7 days

---

### Sprint 3: Visit Report & Activity Tracking APIs (Week 5-6)

**Goal**: Implement Visit Report & Activity Tracking APIs

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

**Minimal Frontend Tasks** (Efisien):
- [ ] Create simple visit report list page untuk testing (`/test/visit-reports`)
- [ ] Create simple visit report form untuk testing
- [ ] Create simple photo upload component untuk testing

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
- ✅ Postman collection updated (Web + Mobile)

**Testing**:
- Test visit report CRUD
- Test check-in/out dengan GPS
- Test photo upload
- Test activity tracking
- Test supervisor workflow

**Estimated Time**: 7-8 days

---

### Sprint 4: Sales Pipeline APIs (Week 7-8)

**Goal**: Implement Sales Pipeline APIs

**Backend Tasks**:
- [ ] Create pipeline stage model dan migration
- [ ] Create deal model dan migration
- [ ] Create pipeline repository interface dan implementation
- [ ] Create deal repository interface dan implementation
- [ ] Create pipeline service
- [ ] Create deal service
- [ ] Implement pipeline list API (`GET /api/v1/pipelines`)
- [ ] Implement pipeline detail API (`GET /api/v1/pipelines/:id`)
- [ ] Implement deal list API (`GET /api/v1/deals`)
- [ ] Implement deal detail API (`GET /api/v1/deals/:id`)
- [ ] Implement create deal API (`POST /api/v1/deals`)
- [ ] Implement update deal API (`PUT /api/v1/deals/:id`)
- [ ] Implement delete deal API (`DELETE /api/v1/deals/:id`)
- [ ] Implement move deal API (`POST /api/v1/deals/:id/move`)
- [ ] Implement pipeline summary API (`GET /api/v1/pipelines/summary`)
- [ ] Implement forecast API (`GET /api/v1/pipelines/forecast`)
- [ ] Add pagination support
- [ ] Add validation
- [ ] Add pipeline stages seeder

**Minimal Frontend Tasks** (Efisien):
- [ ] Create simple deal list page untuk testing (`/test/deals`)
- [ ] Create simple deal form untuk testing

**Postman Collection**:
- [ ] Add pipeline APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Pipeline APIs bekerja dengan baik
- ✅ Deal CRUD APIs bekerja dengan baik
- ✅ Move deal API bekerja
- ✅ Pipeline summary dan forecast bekerja
- ✅ Postman collection updated

**Testing**:
- Test pipeline APIs
- Test deal CRUD
- Test move deal
- Test forecast calculation

**Estimated Time**: 6-7 days

---

### Sprint 5: Task & Reminder APIs (Week 9)

**Goal**: Implement Task & Reminder APIs

**Backend Tasks**:
- [ ] Create task model dan migration
- [ ] Create reminder model dan migration
- [ ] Create task repository interface dan implementation
- [ ] Create task service
- [ ] Implement task list API (`GET /api/v1/tasks`)
- [ ] Implement task detail API (`GET /api/v1/tasks/:id`)
- [ ] Implement create task API (`POST /api/v1/tasks`)
- [ ] Implement update task API (`PUT /api/v1/tasks/:id`)
- [ ] Implement delete task API (`DELETE /api/v1/tasks/:id`)
- [ ] Implement assign task API (`POST /api/v1/tasks/:id/assign`)
- [ ] Implement complete task API (`POST /api/v1/tasks/:id/complete`)
- [ ] Implement reminder APIs
- [ ] Add notification service (in-app, email)
- [ ] Add pagination support
- [ ] Add validation

**Minimal Frontend Tasks** (Efisien):
- [ ] Create simple task list page untuk testing (`/test/tasks`)
- [ ] Create simple task form untuk testing

**Postman Collection**:
- [ ] Add task APIs ke Postman collection (Web section)
- [ ] Add task APIs ke Postman collection (Mobile section)

**Acceptance Criteria**:
- ✅ Task CRUD APIs bekerja dengan baik
- ✅ Task assignment bekerja
- ✅ Reminder APIs bekerja
- ✅ Notification service bekerja
- ✅ Postman collection updated (Web + Mobile)

**Testing**:
- Test task CRUD
- Test task assignment
- Test reminder
- Test notification

**Estimated Time**: 4-5 days

---

### Sprint 6: Product Management APIs (Week 10)

**Goal**: Implement Product Management APIs

**Backend Tasks**:
- [ ] Create product model dan migration
- [ ] Create product category model dan migration
- [ ] Create product repository interface dan implementation
- [ ] Create product service
- [ ] Implement product list API (`GET /api/v1/products`)
- [ ] Implement product detail API (`GET /api/v1/products/:id`)
- [ ] Implement create product API (`POST /api/v1/products`)
- [ ] Implement update product API (`PUT /api/v1/products/:id`)
- [ ] Implement delete product API (`DELETE /api/v1/products/:id`)
- [ ] Implement product search API (`GET /api/v1/products/search`)
- [ ] Add pagination support
- [ ] Add validation
- [ ] Add product categories seeder

**Minimal Frontend Tasks** (Efisien):
- [ ] Create simple product list page untuk testing (`/test/products`)
- [ ] Create simple product form untuk testing

**Postman Collection**:
- [ ] Add product APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Product CRUD APIs bekerja dengan baik
- ✅ Product search bekerja
- ✅ Postman collection updated

**Testing**:
- Test product CRUD
- Test product search

**Estimated Time**: 3-4 days

---

### Sprint 7: Dashboard & Reports APIs (Week 11-12)

**Goal**: Implement Dashboard & Reports APIs

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

**Minimal Frontend Tasks** (Efisien):
- [ ] Create simple dashboard page untuk testing (`/test/dashboard`)
- [ ] Create simple report page untuk testing (`/test/reports`)

**Postman Collection**:
- [ ] Add dashboard APIs ke Postman collection (Web section)
- [ ] Add report APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Dashboard APIs bekerja dengan baik
- ✅ Report APIs bekerja dengan baik
- ✅ Date range filtering bekerja
- ✅ Export functionality bekerja (basic)
- ✅ Postman collection updated

**Testing**:
- Test dashboard APIs
- Test report APIs
- Test date range filtering
- Test export functionality

**Estimated Time**: 6-7 days

---

### Sprint 8: Settings APIs (Week 13)

**Goal**: Implement Settings APIs

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

**Minimal Frontend Tasks** (Efisien):
- [ ] Create simple settings page untuk testing (`/test/settings`)

**Postman Collection**:
- [ ] Add settings APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Settings APIs bekerja dengan baik
- ✅ Settings tersimpan dengan benar
- ✅ Postman collection updated

**Testing**:
- Test settings update
- Test settings persistence

**Estimated Time**: 2-3 days

---

### Sprint 9: API Optimization & Documentation (Week 14)

**Goal**: Optimize APIs dan complete documentation

**Tasks**:
- [ ] Optimize database queries
- [ ] Add missing indexes
- [ ] Add caching jika diperlukan
- [ ] Performance testing
- [ ] Security audit
- [ ] Complete Postman collection (Web + Mobile separation)
- [ ] Update API documentation
- [ ] Add API examples
- [ ] Final bug fixes

**Acceptance Criteria**:
- ✅ APIs optimized
- ✅ Performance acceptable
- ✅ Security audit passed
- ✅ Postman collection complete (Web + Mobile)
- ✅ Documentation complete

**Testing**:
- Performance testing
- Security testing
- API integration testing

**Estimated Time**: 4-5 days

---

## 📊 Sprint Summary

| Sprint | Goal | Duration | Status |
|--------|------|----------|--------|
| Sprint 0 | Foundation Review | 2-3 days | ⏳ Pending |
| Sprint 1 | User Management Review | 2-3 days | ⏳ Pending |
| Sprint 2 | Account & Contact APIs | 6-7 days | ⏳ Pending |
| Sprint 3 | Visit Report APIs | 7-8 days | ⏳ Pending |
| Sprint 4 | Pipeline APIs | 6-7 days | ⏳ Pending |
| Sprint 5 | Task APIs | 4-5 days | ⏳ Pending |
| Sprint 6 | Product APIs | 3-4 days | ⏳ Pending |
| Sprint 7 | Dashboard & Reports APIs | 6-7 days | ⏳ Pending |
| Sprint 8 | Settings APIs | 2-3 days | ⏳ Pending |
| Sprint 9 | Optimization & Docs | 4-5 days | ⏳ Pending |

**Total Estimated Time**: 38-50 days (5.5-7 weeks)

---

## 🔗 Dependencies

### Dependencies untuk Developer 1 (Web)
- Semua APIs harus ready sebelum Developer 1 mulai develop frontend
- Coordinate API design dengan Developer 1

### Dependencies untuk Developer 3 (Mobile)
- Mobile APIs harus ready (same APIs, different endpoints jika diperlukan)
- Coordinate API design dengan Developer 3

---

## 📝 Notes

1. **API Standards**: Pastikan semua APIs mengikuti API response standards
2. **Postman Collection**: Update Postman collection untuk setiap sprint, pisahkan Web dan Mobile
3. **Minimal Frontend**: Frontend hanya untuk testing/validation, bukan production-ready
4. **Coordinate**: Coordinate dengan Developer 1 dan Developer 3 untuk API design
5. **Testing**: Test semua APIs sebelum move ke sprint berikutnya

---

**Dokumen ini akan diupdate sesuai dengan progress development.**

