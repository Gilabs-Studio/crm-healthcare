# Sprint Planning - Developer 2 (Fullstack Developer)
## CRM Healthcare/Pharmaceutical Platform - Sales CRM

**Developer**: Fullstack Developer (Go Backend + Next.js Frontend)  
**Role**: Develop modul-modul Sales CRM secara fullstack (backend + frontend)  
**Versi**: 2.0  
**Status**: Active  
**Last Updated**: 2025-01-15

> **📊 Visualisasi Project**: Lihat [**PROJECT_DIAGRAMS.md**](../PROJECT_DIAGRAMS.md) untuk memahami scope, fitur, dan user flow secara visual.

---

## 📋 Overview

Developer 2 bertanggung jawab untuk:
- **Fullstack Development**: Develop modul-modul yang ditugaskan secara lengkap (backend API + frontend)
- **Backend**: Go (Gin) APIs untuk modul yang ditugaskan
- **Frontend**: Next.js 16 frontend untuk modul yang ditugaskan
- **Database**: Design dan implement database schema untuk modul yang ditugaskan
- **Postman Collection**: Update Postman collection untuk modul yang ditugaskan

**Modul yang ditugaskan ke Dev2**:
1. ✅ Sales Pipeline Management (Fullstack)
2. ✅ Task & Reminder Management (Fullstack)
3. ✅ Product Management (Fullstack)

**Parallel Development Strategy**:
- ✅ **TIDAK bergantung ke Dev1** - bisa dikerjakan paralel
- ✅ Setiap modul dikerjakan fullstack sampai selesai
- ✅ **Hackathon mode** - tidak ada unit test
- ✅ Manual testing saja

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

### Sprint 2: Sales Pipeline Management (Fullstack) (Week 7-8)

**Goal**: Implement Sales Pipeline Management secara fullstack (backend + frontend)

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

**Frontend Tasks**:
- [ ] Create pipeline types (`types/pipeline.d.ts`)
- [ ] Create deal types (`types/deal.d.ts`)
- [ ] Create pipeline service (`pipelineService`)
- [ ] Create deal service (`dealService`)
- [ ] Create pipeline kanban page (`/pipeline`)
- [ ] Create kanban board component (`KanbanBoard`)
- [ ] Create deal card component (`DealCard`)
- [ ] Create deal form component (`DealForm`)
- [ ] Create deal detail page (`/deals/[id]`)
- [ ] Add drag-and-drop untuk move deal
- [ ] Create pipeline summary component
- [ ] Create forecast component

**Postman Collection**:
- [ ] Add pipeline APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Pipeline APIs bekerja dengan baik
- ✅ Deal CRUD APIs bekerja dengan baik
- ✅ Move deal API bekerja
- ✅ Pipeline summary dan forecast bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ User dapat melihat pipeline dalam kanban view
- ✅ User dapat create dan edit deal
- ✅ User dapat move deal antar stages (drag-and-drop)
- ✅ Pipeline summary dan forecast ditampilkan
- ✅ UI/UX modern dan intuitive
- ✅ Postman collection updated

**Testing** (Manual testing):
- Test pipeline APIs (backend)
- Test deal CRUD (backend + frontend)
- Test move deal (backend + frontend)
- Test forecast calculation
- Test kanban view
- Test drag-and-drop

**Estimated Time**: 6-7 days

---

### Sprint 3: Task & Reminder Management (Fullstack) (Week 9)

**Goal**: Implement Task & Reminder Management secara fullstack (backend + frontend)

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

**Frontend Tasks**:
- [ ] Create task types (`types/task.d.ts`)
- [ ] Create task service (`taskService`)
- [ ] Create task list page (`/tasks`)
- [ ] Create task form component (`TaskForm`)
- [ ] Create task card component (`TaskCard`)
- [ ] Create task detail page (`/tasks/[id]`)
- [ ] Add task filter (status, assignee, due date)
- [ ] Create reminder settings component
- [ ] Add task linked ke account/contact

**Postman Collection**:
- [ ] Add task APIs ke Postman collection (Web section)
- [ ] Add task APIs ke Postman collection (Mobile section)

**Acceptance Criteria**:
- ✅ Task CRUD APIs bekerja dengan baik
- ✅ Task assignment bekerja
- ✅ Reminder APIs bekerja
- ✅ Notification service bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ User dapat create dan manage tasks
- ✅ Task dapat di-assign ke sales rep
- ✅ Task dapat di-link ke account/contact
- ✅ Filter dan search bekerja optimal
- ✅ Postman collection updated (Web + Mobile)

**Testing** (Manual testing):
- Test task CRUD (backend + frontend)
- Test task assignment
- Test reminder
- Test notification
- Test task filtering

**Estimated Time**: 4-5 days

---

### Sprint 4: Product Management (Fullstack) (Week 10)

**Goal**: Implement Product Management secara fullstack (backend + frontend)

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

**Frontend Tasks**:
- [ ] Create product types (`types/product.d.ts`)
- [ ] Create product service (`productService`)
- [ ] Create product list page (`/products`)
- [ ] Create product form component (`ProductForm`)
- [ ] Create product detail page (`/products/[id]`)
- [ ] Create product selector component (untuk deal form)
- [ ] Add product search and filter

**Postman Collection**:
- [ ] Add product APIs ke Postman collection (Web section)

**Acceptance Criteria**:
- ✅ Product CRUD APIs bekerja dengan baik
- ✅ Product search bekerja
- ✅ Frontend terintegrasi dengan backend APIs
- ✅ Admin dapat manage products (CRUD)
- ✅ Product selector dapat digunakan di deal form
- ✅ Search dan filter bekerja optimal
- ✅ Postman collection updated

**Testing** (Manual testing):
- Test product CRUD (backend + frontend)
- Test product search
- Test product selector

**Estimated Time**: 3-4 days

---

### Sprint 5: Integration & Final Testing (Week 14)

**Goal**: Integration dengan modul Dev1 dan final testing

**Tasks**:
- [ ] Coordinate dengan Developer 1 untuk integration
- [ ] Test integration antara modul Dev2 dan Dev1
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
| Sprint 0 | Foundation Review | 2-3 days | ⏳ Pending |
| Sprint 1 | User Management Review | 2-3 days | ⏳ Pending |
| Sprint 2 | Sales Pipeline (Fullstack) | 6-7 days | ⏳ Pending |
| Sprint 3 | Task & Reminder (Fullstack) | 4-5 days | ⏳ Pending |
| Sprint 4 | Product Management (Fullstack) | 3-4 days | ⏳ Pending |
| Sprint 5 | Integration & Testing | 3-4 days | ⏳ Pending |

**Total Estimated Time**: 20-26 days (2.9-3.7 weeks)

---

## 🔗 Coordination dengan Dev1

### Modul yang dikerjakan Dev1 (untuk referensi):
- Account & Contact Management (Fullstack)
- Visit Report & Activity Tracking (Fullstack)
- Dashboard & Reports (Fullstack)
- Settings (Fullstack)

### Integration Points:
- Dashboard & Reports (Dev1) perlu data dari Pipeline (Dev2)
- Visit Report (Dev1) bisa link ke Task (Dev2)
- Deal (Dev2) bisa link ke Product (Dev2)
- Deal (Dev2) perlu link ke Account (Dev1)

### Coordination:
- [ ] Week 3: Coordinate API contract untuk integration points
- [ ] Week 7: Mid-sprint review - check integration points
- [ ] Week 11: Pre-integration review
- [ ] Week 14: Final integration testing

---

## 📝 Notes

1. **Fullstack Development**: Setiap modul dikerjakan fullstack sampai selesai
2. **No Dependencies**: Tidak bergantung ke Dev1, bisa dikerjakan paralel
3. **Hackathon Mode**: Tidak ada unit test, manual testing saja
4. **Code Review**: Lakukan code review sebelum merge
5. **Documentation**: Update documentation setelah setiap sprint
6. **Postman Collection**: Update Postman collection untuk setiap modul

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
