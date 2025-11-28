# Sprint Planning - Developer 3 (Mobile Developer)
## CRM Healthcare/Pharmaceutical Platform - Sales CRM

**Developer**: Mobile Developer (Flutter)  
**Role**: Develop mobile app (Flutter) untuk sales rep  
**Versi**: 1.0  
**Status**: Active  
**Last Updated**: 2025-01-15

> **📊 Visualisasi Project**: Lihat [**PROJECT_DIAGRAMS.md**](../PROJECT_DIAGRAMS.md) untuk memahami scope, fitur, dan user flow secara visual.

---

## 📋 Overview

Developer 3 bertanggung jawab untuk:
- **Mobile App Development**: Develop Flutter mobile app untuk sales rep
- **API Integration**: Integrate dengan backend APIs yang dibuat Developer 2
- **Mobile-Specific Features**: GPS tracking, photo upload, push notifications
- **UI/UX**: Modern dan intuitive mobile UI/UX

---

## 🎯 Sprint Details

### Sprint 0: Flutter Project Setup (Week 1-2)

**Goal**: Setup Flutter project dan foundation

**Tasks**:
- [x] Setup Flutter project structure
- [x] Setup state management (Provider / Riverpod)
- [x] Setup HTTP client (Dio)
- [x] Setup local storage (Hive / SharedPreferences)
- [x] Setup dependency injection
- [x] Create API client dengan interceptors
- [x] Setup authentication flow
- [x] Create login screen
- [x] Create auth guard / route protection
- [x] Setup error handling
- [x] Setup loading states
- [x] Setup theme (light/dark)
- [x] Setup navigation

**Acceptance Criteria**:
- ✅ Flutter project structure ready
- ✅ Authentication flow bekerja
- ✅ API client setup dengan interceptors
- ✅ Error handling comprehensive
- ✅ Navigation structure ready

**Estimated Time**: 4-5 days

---

### Sprint 1: Account & Contact Mobile (Week 3-4)

**Goal**: Implement Account & Contact di mobile app

**Backend Dependencies** (Coordinate dengan Developer 2):
- Account APIs ready
- Contact APIs ready

**Mobile Tasks**:
- [ ] Create account service (`account_service.dart`)
- [ ] Create contact service (`contact_service.dart`)
- [ ] Create account models (`models/account.dart`)
- [ ] Create contact models (`models/contact.dart`)
- [ ] Create account list screen (`screens/accounts/account_list.dart`)
- [ ] Create account detail screen (`screens/accounts/account_detail.dart`)
- [ ] Create contact list screen (`screens/contacts/contact_list.dart`)
- [ ] Create contact detail screen (`screens/contacts/contact_detail.dart`)
- [ ] Add account search functionality
- [ ] Add contact search functionality
- [ ] Add pull-to-refresh
- [ ] Add pagination
- [ ] Create account card widget
- [ ] Create contact card widget

**Acceptance Criteria**:
- ✅ Sales rep dapat melihat list accounts
- ✅ Sales rep dapat melihat account detail
- ✅ Sales rep dapat melihat list contacts
- ✅ Sales rep dapat melihat contact detail
- ✅ Search dan pagination bekerja
- ✅ UI/UX modern dan intuitive

**Testing**:
- Test account list dan detail
- Test contact list dan detail
- Test search functionality
- Test pagination

**Estimated Time**: 5-6 days

---

### Sprint 2: Visit Report Mobile (Week 5-6)

**Goal**: Implement Visit Report di mobile app dengan GPS dan photo

**Backend Dependencies** (Coordinate dengan Developer 2):
- Visit report APIs ready
- Check-in/out APIs ready
- Photo upload API ready

**Mobile Tasks**:
- [ ] Create visit report service (`visit_report_service.dart`)
- [ ] Create visit report models (`models/visit_report.dart`)
- [ ] Create visit report list screen (`screens/visit_reports/visit_report_list.dart`)
- [ ] Create visit report detail screen (`screens/visit_reports/visit_report_detail.dart`)
- [ ] Create visit report form screen (`screens/visit_reports/visit_report_form.dart`)
- [ ] Integrate GPS location (geolocator package)
- [ ] Implement check-in dengan GPS
- [ ] Implement check-out dengan GPS
- [ ] Integrate camera untuk photo upload (image_picker package)
- [ ] Implement photo upload functionality
- [ ] Add visit report status badge
- [ ] Add pull-to-refresh
- [ ] Add pagination
- [ ] Create visit report card widget

**Acceptance Criteria**:
- ✅ Sales rep dapat melihat list visit reports
- ✅ Sales rep dapat create visit report
- ✅ Check-in/out dengan GPS bekerja
- ✅ Photo upload bekerja
- ✅ UI/UX modern dan intuitive

**Testing**:
- Test visit report creation
- Test check-in/out dengan GPS
- Test photo upload
- Test visit report list

**Estimated Time**: 7-8 days

---

### Sprint 3: Task & Reminder Mobile (Week 7-8)

**Goal**: Implement Task & Reminder di mobile app dengan push notifications

**Backend Dependencies** (Coordinate dengan Developer 2):
- Task APIs ready
- Reminder APIs ready
- Push notification service ready

**Mobile Tasks**:
- [ ] Create task service (`task_service.dart`)
- [ ] Create task models (`models/task.dart`)
- [ ] Create task list screen (`screens/tasks/task_list.dart`)
- [ ] Create task detail screen (`screens/tasks/task_detail.dart`)
- [ ] Create task form screen (`screens/tasks/task_form.dart`)
- [ ] Integrate push notifications (firebase_messaging package)
- [ ] Implement task reminder notifications
- [ ] Add task filter (status, due date)
- [ ] Add pull-to-refresh
- [ ] Add pagination
- [ ] Create task card widget
- [ ] Add task completion functionality

**Acceptance Criteria**:
- ✅ Sales rep dapat melihat list tasks
- ✅ Sales rep dapat create task
- ✅ Sales rep dapat complete task
- ✅ Push notifications untuk task reminder bekerja
- ✅ UI/UX modern dan intuitive

**Testing**:
- Test task list dan detail
- Test task creation
- Test task completion
- Test push notifications

**Estimated Time**: 5-6 days

---

### Sprint 4: Dashboard Mobile (Week 9)

**Goal**: Implement Dashboard di mobile app

**Backend Dependencies** (Coordinate dengan Developer 2):
- Dashboard APIs ready

**Mobile Tasks**:
- [ ] Create dashboard service (`dashboard_service.dart`)
- [ ] Create dashboard models (`models/dashboard.dart`)
- [ ] Create dashboard screen (`screens/dashboard/dashboard.dart`)
- [ ] Create visit statistics widget
- [ ] Create pipeline summary widget
- [ ] Create recent activities widget
- [ ] Add pull-to-refresh
- [ ] Add date range picker (optional)

**Acceptance Criteria**:
- ✅ Sales rep dapat melihat dashboard
- ✅ Key metrics ditampilkan
- ✅ Recent activities ditampilkan
- ✅ UI/UX modern dan intuitive

**Testing**:
- Test dashboard data loading
- Test dashboard widgets

**Estimated Time**: 3-4 days

---

### Sprint 5: Mobile App Polish & Optimization (Week 10-11)

**Goal**: Polish mobile app dan optimize performance

**Tasks**:
- [ ] Improve UI/UX consistency
- [ ] Add loading states di semua screens
- [ ] Add error handling di semua screens
- [ ] Optimize app performance
- [ ] Add offline support (optional untuk MVP)
- [ ] Add app icon dan splash screen
- [ ] Add app versioning
- [ ] Test di multiple devices (Android & iOS)
- [ ] Fix bugs
- [ ] Performance optimization

**Acceptance Criteria**:
- ✅ UI/UX konsisten
- ✅ Performance optimal
- ✅ Tidak ada critical bugs
- ✅ App ready untuk testing

**Testing**:
- Test di multiple devices
- Performance testing
- Bug testing

**Estimated Time**: 5-6 days

---

### Sprint 6: Integration & Final Testing (Week 12-13)

**Goal**: Integration dengan backend dan final testing

**Tasks**:
- [ ] Coordinate dengan Developer 2 untuk API integration
- [ ] Integration testing
- [ ] Fix integration issues
- [ ] End-to-end testing
- [ ] Test semua features
- [ ] Final bug fixes
- [ ] Prepare APK untuk demo
- [ ] Prepare iOS build (jika diperlukan)

**Acceptance Criteria**:
- ✅ Semua features terintegrasi dengan baik
- ✅ Tidak ada critical bugs
- ✅ APK ready untuk demo
- ✅ App ready untuk production

**Testing**:
- Integration testing
- End-to-end testing
- User acceptance testing

**Estimated Time**: 4-5 days

---

## 📊 Sprint Summary

| Sprint | Goal | Duration | Status |
|--------|------|----------|--------|
| Sprint 0 | Flutter Setup | 4-5 days | ✅ Completed |
| Sprint 1 | Account & Contact | 5-6 days | ⏳ Pending |
| Sprint 2 | Visit Report | 7-8 days | ⏳ Pending |
| Sprint 3 | Task & Reminder | 5-6 days | ⏳ Pending |
| Sprint 4 | Dashboard | 3-4 days | ⏳ Pending |
| Sprint 5 | Polish & Optimization | 5-6 days | ⏳ Pending |
| Sprint 6 | Integration & Testing | 4-5 days | ⏳ Pending |

**Total Estimated Time**: 33-42 days (4.5-6 weeks)

---

## 🔗 Dependencies

### Dependencies dari Developer 2 (Backend)
- Account & Contact APIs (Sprint 1)
- Visit Report APIs (Sprint 2)
- Task APIs (Sprint 3)
- Dashboard APIs (Sprint 4)
- Push notification service (Sprint 3)

### Dependencies dari Developer 1 (Web)
- Coordinate untuk UI/UX consistency
- Coordinate untuk feature requirements

---

## 📱 Mobile App Features

### Core Features (MVP)
1. **Authentication**
   - Login
   - Logout
   - Token refresh

2. **Account & Contact**
   - List accounts
   - Account detail
   - List contacts
   - Contact detail
   - Search

3. **Visit Report**
   - List visit reports
   - Create visit report
   - Check-in/out dengan GPS
   - Photo upload
   - Visit report detail

4. **Task & Reminder**
   - List tasks
   - Create task
   - Complete task
   - Push notifications

5. **Dashboard**
   - Basic dashboard
   - Visit statistics
   - Recent activities

### Optional Features (Future)
- Offline support
- Advanced dashboard
- Sales pipeline view
- Advanced search

---

## 📝 Notes

1. **API Integration**: Coordinate dengan Developer 2 untuk API design
2. **UI/UX**: Coordinate dengan Developer 1 untuk consistency
3. **Testing**: Test di multiple devices (Android & iOS)
4. **Performance**: Optimize untuk mobile performance
5. **Push Notifications**: Setup Firebase Cloud Messaging

---

**Dokumen ini akan diupdate sesuai dengan progress development.**

