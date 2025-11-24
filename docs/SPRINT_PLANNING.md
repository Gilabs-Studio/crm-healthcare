# Sprint Planning - Master
## CRM Healthcare/Pharmaceutical Platform - Sales CRM

**Versi**: 2.0  
**Status**: Active  
**Last Updated**: 2025-01-15  
**Product Type**: Sales CRM untuk Perusahaan Farmasi

---

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Team Structure](#team-structure)
3. [Sprint Overview](#sprint-overview)
4. [Developer Sprint Plans](#developer-sprint-plans)
5. [Coordination & Dependencies](#coordination--dependencies)
6. [Timeline](#timeline)
7. [Sprint Checklist](#sprint-checklist)
8. [Dependencies](#dependencies)

---

## Overview

Dokumen ini adalah **master planning** untuk development Sales CRM dengan **3 developers**:
- **Developer 1**: Web Developer (Full-stack, fokus Web)
- **Developer 2**: Backend Developer (Fokus BE, sedikit FE)
- **Developer 3**: Mobile Developer (Flutter)

Setiap developer memiliki sprint planning terpisah yang detail.

### Product Scope

**Sales CRM untuk Perusahaan Farmasi** dengan fitur:
- Account & Contact Management
- Visit Report & Activity Tracking
- Sales Pipeline Management
- Task & Reminder
- Product Management
- Dashboard & Reports
- Mobile App (Flutter)

### Technology Stack

- **Backend**: Go (Gin framework)
- **Web Frontend**: Next.js 16 (App Router, Server Components)
- **Mobile App**: Flutter
- **Database**: PostgreSQL
- **State Management (Web)**: Zustand
- **Styling (Web)**: Tailwind CSS v4
- **UI Components (Web)**: shadcn/ui v4

---

## Team Structure

### Developer 1: Web Developer
- **Focus**: Web application (Next.js 16)
- **Responsibilities**:
  - Perbaiki sprint 0-2 yang sudah ada
  - Develop web frontend untuk Sales CRM
  - Integrate dengan backend APIs
- **Sprint Planning**: [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md)

### Developer 2: Backend Developer
- **Focus**: Backend APIs (Go + Gin)
- **Responsibilities**:
  - Develop semua backend APIs
  - Database design dan migration
  - Minimal frontend untuk testing
  - Update Postman collection
- **Sprint Planning**: [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md)

### Developer 3: Mobile Developer
- **Focus**: Mobile app (Flutter)
- **Responsibilities**:
  - Develop Flutter mobile app
  - Integrate dengan backend APIs
  - Mobile-specific features (GPS, camera, push notifications)
- **Sprint Planning**: [`SPRINT_PLANNING_DEV3.md`](./SPRINT_PLANNING_DEV3.md)

---

## Sprint Overview

### Master Timeline (100 Hari / ~14 Minggu)

| Week | Developer 1 (Web) | Developer 2 (Backend) | Developer 3 (Mobile) |
|------|-------------------|----------------------|---------------------|
| 1-2 | Foundation Review, User Management Review, Master Data Cleanup | Foundation Review, User Management Review | Flutter Setup |
| 3-4 | Account & Contact Management | Account & Contact APIs | Account & Contact Mobile |
| 5-6 | Visit Report & Activity Tracking | Visit Report APIs | Visit Report Mobile |
| 7-8 | Sales Pipeline | Pipeline APIs | Task & Reminder Mobile |
| 9 | Task & Reminder | Task APIs | Dashboard Mobile |
| 10 | Product Management | Product APIs | Mobile Polish |
| 11-12 | Dashboard & Reports | Dashboard & Reports APIs | Mobile Integration |
| 13 | Settings & Polish | Settings APIs | Final Testing |
| 14 | Integration & Testing | API Optimization & Docs | Final Testing |

---

## Developer Sprint Plans

### Developer 1: Web Developer
📄 **Detail Sprint Planning**: [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md)

**Sprint Summary**:
- Sprint 0: Foundation Review (3-4 days)
- Sprint 1: User Management Review (3-4 days)
- Sprint 2: Master Data Cleanup (1-2 days)
- Sprint 3: Account & Contact Management (5-6 days)
- Sprint 4: Visit Report & Activity Tracking (5-6 days)
- Sprint 5: Sales Pipeline (5-6 days)
- Sprint 6: Task & Reminder (3-4 days)
- Sprint 7: Product Management (2-3 days)
- Sprint 8: Dashboard & Reports (6-7 days)
- Sprint 9: Settings & Polish (4-5 days)
- Sprint 10: Integration & Testing (5-7 days)

**Total**: 42-52 days (6-7.5 weeks)

### Developer 2: Backend Developer
📄 **Detail Sprint Planning**: [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md)

**Sprint Summary**:
- Sprint 0: Foundation Review (2-3 days)
- Sprint 1: User Management Review (2-3 days)
- Sprint 2: Account & Contact APIs (6-7 days)
- Sprint 3: Visit Report APIs (7-8 days)
- Sprint 4: Pipeline APIs (6-7 days)
- Sprint 5: Task APIs (4-5 days)
- Sprint 6: Product APIs (3-4 days)
- Sprint 7: Dashboard & Reports APIs (6-7 days)
- Sprint 8: Settings APIs (2-3 days)
- Sprint 9: Optimization & Docs (4-5 days)

**Total**: 38-50 days (5.5-7 weeks)

### Developer 3: Mobile Developer
📄 **Detail Sprint Planning**: [`SPRINT_PLANNING_DEV3.md`](./SPRINT_PLANNING_DEV3.md)

**Sprint Summary**:
- Sprint 0: Flutter Setup (4-5 days)
- Sprint 1: Account & Contact Mobile (5-6 days)
- Sprint 2: Visit Report Mobile (7-8 days)
- Sprint 3: Task & Reminder Mobile (5-6 days)
- Sprint 4: Dashboard Mobile (3-4 days)
- Sprint 5: Polish & Optimization (5-6 days)
- Sprint 6: Integration & Testing (4-5 days)

**Total**: 33-42 days (4.5-6 weeks)

---

## Coordination & Dependencies

### Critical Dependencies

1. **Developer 2 → Developer 1**: Backend APIs harus ready sebelum frontend development
2. **Developer 2 → Developer 3**: Backend APIs harus ready sebelum mobile development
3. **Developer 1 ↔ Developer 3**: Coordinate untuk UI/UX consistency

### Coordination Points

1. **Week 1**: Kickoff meeting - align scope dan timeline
2. **Week 3**: API design review - Developer 2 present API design ke Developer 1 & 3
3. **Week 5**: Mid-sprint review - check progress dan blockers
4. **Week 8**: Integration planning - plan integration antara web, mobile, dan backend
5. **Week 11**: Pre-demo review - prepare untuk demo
6. **Week 14**: Final review - final testing dan delivery

### API Design Coordination

- **Developer 2** harus design APIs dengan mempertimbangkan kebutuhan Web dan Mobile
- **Developer 1** dan **Developer 3** harus review API design sebelum development
- Semua APIs harus mengikuti API response standards
- Postman collection harus terpisah untuk Web dan Mobile

---

## Timeline

### Overall Timeline (100 Hari)

**Week 1-2**: Foundation & Setup
- Developer 1: Review dan perbaiki sprint 0-2
- Developer 2: Review foundation dan API standards
- Developer 3: Flutter project setup

**Week 3-4**: Account & Contact
- Developer 1: Account & Contact Management (Web)
- Developer 2: Account & Contact APIs
- Developer 3: Account & Contact Mobile

**Week 5-6**: Visit Report
- Developer 1: Visit Report & Activity Tracking (Web)
- Developer 2: Visit Report APIs
- Developer 3: Visit Report Mobile

**Week 7-8**: Pipeline & Task
- Developer 1: Sales Pipeline (Web)
- Developer 2: Pipeline APIs
- Developer 3: Task & Reminder Mobile

**Week 9-10**: Task, Product, Dashboard
- Developer 1: Task & Reminder, Product Management (Web)
- Developer 2: Task APIs, Product APIs
- Developer 3: Dashboard Mobile, Mobile Polish

**Week 11-12**: Dashboard & Reports
- Developer 1: Dashboard & Reports (Web)
- Developer 2: Dashboard & Reports APIs
- Developer 3: Mobile Integration

**Week 13**: Settings & Polish
- Developer 1: Settings & Polish (Web)
- Developer 2: Settings APIs, API Optimization
- Developer 3: Final Testing

**Week 14**: Integration & Delivery
- All Developers: Integration, Testing, Final Delivery

---

## Sprint Details

> **Note**: Detail sprint untuk setiap developer ada di file terpisah:
> - [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md) - Web Developer (10 sprints)
> - [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md) - Backend Developer (9 sprints)
> - [`SPRINT_PLANNING_DEV3.md`](./SPRINT_PLANNING_DEV3.md) - Mobile Developer (6 sprints)

### Completed Sprints (Legacy)

**Sprint 0**: Project Setup & Foundation ✅ (COMPLETED)  
**Sprint 1**: User Management Module ✅ (COMPLETED)  
**Sprint 2**: Master Data - Diagnosis & Procedures ✅ (COMPLETED - ARCHIVED)

> **Note**: Sprint 2 (Diagnosis & Procedures) di-archive karena tidak relevan untuk Sales CRM.  
> Dapat digunakan sebagai optional module di future jika diperlukan.

---

## Sprint Checklist

### Before Starting Sprint
- [ ] Review sprint goal dan tasks
- [ ] Check dependencies dari previous sprints
- [ ] Coordinate dengan developers lain
- [ ] Setup development environment
- [ ] Create feature branch

### During Sprint
- [ ] Follow coding standards
- [ ] Write tests untuk new features
- [ ] Update documentation
- [ ] Commit frequently dengan clear messages
- [ ] Coordinate dengan developers lain jika ada blockers

### After Sprint
- [ ] Test all acceptance criteria
- [ ] Code review
- [ ] Update sprint status
- [ ] Deploy to staging (jika applicable)
- [ ] Demo ke stakeholders

---

## Dependencies

### Sprint Dependency Graph (Sales CRM)

```
Sprint 0 (Foundation) ✅
    ↓
Sprint 1 (User Management) ✅
    ↓
Sprint 2 (Master Data Cleanup) → Archive Diagnosis/Procedures
    ↓
Sprint 3 (Account & Contact) → Parallel dengan Mobile Setup
    ↓
Sprint 4 (Visit Report) → Requires: Account & Contact
    ↓
Sprint 5 (Sales Pipeline) → Requires: Account & Contact
    ↓
Sprint 6 (Task & Reminder) → Can be parallel dengan Pipeline
    ↓
Sprint 7 (Product Management) → Can be parallel
    ↓
Sprint 8 (Dashboard & Reports) → Requires: All modules
    ↓
Sprint 9 (Settings) → Can be parallel
    ↓
Sprint 10 (Integration & Testing) → Requires: All sprints
```

---

## Estimated Timeline

- **Total Duration**: 100 hari (~14 minggu)
- **Team Size**: 3 developers
  - Developer 1 (Web): 42-52 days (6-7.5 weeks)
  - Developer 2 (Backend): 38-50 days (5.5-7 weeks)
  - Developer 3 (Mobile): 33-42 days (4.5-6 weeks)

---

## Notes

1. **Flexibility**: Sprint dapat di-adjust sesuai kebutuhan
2. **Parallel Work**: Beberapa sprints dapat dikerjakan parallel jika tidak ada dependency
3. **Testing**: Setiap sprint harus include testing
4. **Documentation**: Update documentation setelah setiap sprint
5. **Code Review**: Lakukan code review sebelum merge
6. **Coordination**: Coordinate dengan developers lain untuk dependencies

---

**Dokumen ini adalah master planning. Untuk detail sprint, lihat:**
- [`SPRINT_PLANNING_DEV1.md`](./SPRINT_PLANNING_DEV1.md) - Web Developer
- [`SPRINT_PLANNING_DEV2.md`](./SPRINT_PLANNING_DEV2.md) - Backend Developer
- [`SPRINT_PLANNING_DEV3.md`](./SPRINT_PLANNING_DEV3.md) - Mobile Developer

---

**Dokumen ini akan diupdate sesuai dengan progress development.**
