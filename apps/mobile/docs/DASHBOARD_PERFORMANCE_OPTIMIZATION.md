# Dashboard Performance Optimization Plan

## Masalah Saat Ini

### 1. Sequential API Calls
- **Masalah**: Semua API calls dilakukan secara sequential (satu per satu)
- **Dampak**: Total loading time = jumlah API calls × rata-rata waktu per call
- **Contoh**: Jika ada 6 API calls dengan rata-rata 500ms, total = 3000ms (3 detik)

### 2. Blocking UI Rendering
- **Masalah**: UI tidak ditampilkan sampai semua data selesai di-load
- **Dampak**: User melihat loading screen yang lama tanpa feedback

### 3. Tidak Ada Caching
- **Masalah**: Setiap kali load dashboard, semua API calls dilakukan lagi
- **Dampak**: Waktu loading sama setiap kali, bahkan untuk data yang tidak berubah

### 4. Tidak Ada Data Prioritization
- **Masalah**: Semua data di-load dengan prioritas yang sama
- **Dampak**: Data penting (overview) harus menunggu data sekunder

## Rencana Optimasi (Industry Best Practices)

### 1. Parallel API Calls ⚡
**Strategi**: Load semua API calls secara parallel menggunakan `Future.wait()`

**Manfaat**:
- Mengurangi total loading time dari sequential ke waktu terpanjang
- Contoh: 6 API calls × 500ms = 3000ms → max(500ms) = 500ms
- **Improvement: ~83% faster**

**Implementasi**:
```dart
final results = await Future.wait([
  _repository.getOverview(period: selectedPeriod),
  _repository.getRecentActivities(limit: 10),
  _repository.getTopAccounts(period: selectedPeriod, limit: 5),
  _repository.getTopSalesRep(period: selectedPeriod, limit: 5),
  _repository.getVisitStatistics(period: selectedPeriod),
  _repository.getActivityTrends(period: selectedPeriod),
], eagerError: false);
```

### 2. Progressive Loading 🎯
**Strategi**: Tampilkan data yang sudah tersedia, load data sekunder di background

**Manfaat**:
- User melihat UI lebih cepat (Time to First Byte / TTFB)
- Perceived performance lebih baik
- Data penting (overview) ditampilkan terlebih dahulu

**Implementasi**:
1. Load overview first (critical data)
2. Tampilkan overview + skeleton untuk data lain
3. Load secondary data di background
4. Update UI secara incremental

### 3. Caching dengan TTL 📦
**Strategi**: Cache dashboard data dengan Time-To-Live (TTL)

**Manfaat**:
- Mengurangi API calls yang tidak perlu
- Instant loading untuk data yang masih fresh
- Background refresh untuk data yang expired

**TTL Strategy**:
- Overview: 30 detik (data penting, sering berubah)
- Secondary data: 60 detik (data kurang kritis)
- Cache key berdasarkan period untuk isolasi data

**Implementasi**:
```dart
class DashboardCache {
  final Map<String, CachedData> _cache = {};
  
  T? get<T>(String key, {Duration? ttl}) {
    final cached = _cache[key];
    if (cached != null && !cached.isExpired(ttl)) {
      return cached.data as T;
    }
    return null;
  }
  
  void set(String key, dynamic data) {
    _cache[key] = CachedData(data, DateTime.now());
  }
}
```

### 4. Optimistic UI Updates 🚀
**Strategi**: Tampilkan cached data sambil refresh di background

**Manfaat**:
- User melihat data instant (dari cache)
- Data di-refresh di background tanpa blocking UI
- Smooth user experience

**Flow**:
1. Tampilkan cached data (jika ada)
2. Trigger background refresh
3. Update UI dengan data baru (jika berbeda)

### 5. Skeleton Screens 💀
**Strategi**: Tampilkan skeleton screens untuk data yang sedang loading

**Manfaat**:
- User tahu bahwa data sedang di-load
- Perceived performance lebih baik
- Professional UI/UX

### 6. Lazy Loading Widgets 📜
**Strategi**: Render widgets hanya ketika terlihat di viewport

**Manfaat**:
- Mengurangi initial render time
- Menghemat memory
- Smooth scrolling

## Expected Performance Improvements

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Load Time | ~3000ms | ~500ms | **83% faster** |
| Time to First Content | ~3000ms | ~200ms | **93% faster** |
| Cache Hit Load Time | ~3000ms | ~50ms | **98% faster** |
| Perceived Performance | Poor | Excellent | **Significant** |

## Implementation Priority

1. **Phase 1 (Critical)**: Parallel API calls + Progressive loading
   - Impact: High
   - Effort: Medium
   - Expected improvement: 80%+

2. **Phase 2 (High)**: Caching dengan TTL
   - Impact: High
   - Effort: Medium
   - Expected improvement: 90%+ (cache hits)

3. **Phase 3 (Medium)**: Optimistic UI updates
   - Impact: Medium
   - Effort: Low
   - Expected improvement: Better UX

4. **Phase 4 (Nice to have)**: Skeleton screens + Lazy loading
   - Impact: Medium
   - Effort: Medium
   - Expected improvement: Better perceived performance

## Monitoring & Metrics

Setelah implementasi, monitor:
- Average load time
- Cache hit rate
- Time to first content
- User engagement metrics

