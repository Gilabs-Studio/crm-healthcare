export interface ChatTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  description?: string;
}

export const chatTemplates: ChatTemplate[] = [
  // Basic Data Fetching
  {
    id: "template-1",
    name: "Tampilkan semua akun",
    category: "Basic Data Fetching",
    content: "Tampilkan semua akun yang ada di sistem",
    description: "Menampilkan table dengan semua accounts (RS, Klinik, Apotek)"
  },
  {
    id: "template-2",
    name: "Jumlah deals di pipeline",
    category: "Basic Data Fetching",
    content: "Berapa banyak deals yang ada di pipeline?",
    description: "Count dari deals, breakdown per stage"
  },
  {
    id: "template-3",
    name: "Visit reports yang approved",
    category: "Basic Data Fetching",
    content: "Tampilkan semua visit reports yang sudah approved",
    description: "Filter visit reports dengan status approved"
  },
  {
    id: "template-4",
    name: "Kontak RSUD Jakarta",
    category: "Basic Data Fetching",
    content: "Siapa saja kontak yang terhubung dengan RSUD Jakarta?",
    description: "Contacts linked ke account RSUD Jakarta"
  },
  {
    id: "template-5",
    name: "Tasks pending",
    category: "Basic Data Fetching",
    content: "Tampilkan semua tasks yang masih pending",
    description: "Tasks dengan status pending"
  },
  
  // Complex Analysis
  {
    id: "template-6",
    name: "Analisis visit reports dan deals",
    category: "Complex Analysis",
    content: "Analisis hubungan antara visit reports dan deals untuk setiap akun",
    description: "Cross-reference visit reports dengan deals per account"
  },
  {
    id: "template-7",
    name: "Akun paling aktif",
    category: "Complex Analysis",
    content: "Berdasarkan visit reports yang sudah approved, akun mana yang paling aktif?",
    description: "Count visit reports per account, sort by count"
  },
  {
    id: "template-8",
    name: "Deals tanpa visit report",
    category: "Complex Analysis",
    content: "Deals mana yang belum ada visit report dalam 30 hari terakhir?",
    description: "Compare deals dengan visit reports, identify gaps"
  },
  {
    id: "template-9",
    name: "Trend visit reports",
    category: "Complex Analysis",
    content: "Bagaimana trend visit reports dalam 30 hari terakhir? Apakah meningkat atau menurun?",
    description: "Time series analysis, trend identification"
  },
  {
    id: "template-10",
    name: "Rata-rata nilai deal per kategori",
    category: "Complex Analysis",
    content: "Berapa rata-rata nilai deal per kategori akun (RS, Klinik, Apotek)?",
    description: "Join deals dengan accounts, group by category, calculate average"
  },
  
  // Forecasting
  {
    id: "template-11",
    name: "Forecast revenue bulan depan",
    category: "Forecasting",
    content: "Berdasarkan data deals yang ada, berapa forecast revenue untuk bulan depan?",
    description: "Calculate forecast from deals with expected_close_date next month"
  },
  {
    id: "template-12",
    name: "Prediksi deals closed won",
    category: "Forecasting",
    content: "Prediksi berapa deal yang akan closed won dalam 3 bulan ke depan berdasarkan probability",
    description: "Weighted forecast based on probability"
  },
  {
    id: "template-13",
    name: "Forecast revenue per kategori",
    category: "Forecasting",
    content: "Forecast revenue per kategori akun untuk kuartal berikutnya",
    description: "Group forecast by account category"
  },
  
  // Data Management & Insights
  {
    id: "template-14",
    name: "Deals tanpa contact/account",
    category: "Data Management",
    content: "Identifikasi deals yang tidak punya contact atau account",
    description: "Find deals with missing relationships"
  },
  {
    id: "template-15",
    name: "Akun tanpa contact",
    category: "Data Management",
    content: "Akun mana yang belum punya contact sama sekali?",
    description: "Find accounts without contacts"
  },
  {
    id: "template-16",
    name: "Sales rep paling produktif",
    category: "Data Management",
    content: "Sales rep mana yang paling produktif berdasarkan jumlah visit reports?",
    description: "Group visit reports by sales rep, count"
  },
  {
    id: "template-17",
    name: "Conversion rate Lead ke Closed Won",
    category: "Data Management",
    content: "Berapa conversion rate dari Lead ke Closed Won?",
    description: "(Closed Won / Total Leads) * 100"
  },
  
  // Business Intelligence
  {
    id: "template-18",
    name: "Ringkasan lengkap dashboard",
    category: "Business Intelligence",
    content: "Buat ringkasan lengkap: total akun, total deals, total visit reports, total revenue dari closed won",
    description: "Dashboard-style summary"
  },
  {
    id: "template-19",
    name: "Breakdown deals per stage",
    category: "Business Intelligence",
    content: "Berikan breakdown deals per stage dengan total value dan count",
    description: "Pipeline summary dengan value dan count"
  },
  {
    id: "template-20",
    name: "Performance summary",
    category: "Business Intelligence",
    content: "Ringkasan performance: total deals, total value, conversion rate, average deal size",
    description: "KPI summary"
  },
  
  // Sales Strategy
  {
    id: "template-21",
    name: "Prioritas akun untuk kunjungan",
    category: "Sales Strategy",
    content: "Berdasarkan data deals dan visit reports, akun mana yang harus diprioritaskan untuk kunjungan berikutnya?",
    description: "Priority scoring berdasarkan multiple factors"
  },
  {
    id: "template-22",
    name: "Deals perlu follow-up",
    category: "Sales Strategy",
    content: "Deals mana yang perlu segera di-follow up berdasarkan last interaction date?",
    description: "Identify stale deals, recommend follow-up"
  },
  {
    id: "template-23",
    name: "Strategi meningkatkan conversion",
    category: "Sales Strategy",
    content: "Untuk meningkatkan conversion rate, rekomendasikan strategi berdasarkan analisis deals yang won vs lost",
    description: "Win/loss analysis dengan actionable recommendations"
  },
  
  // Context-Aware Queries
  {
    id: "template-24",
    name: "Analisis lengkap akun",
    category: "Context-Aware",
    content: "Untuk akun RSUD Jakarta, tampilkan semua visit reports, deals, dan contacts yang terkait",
    description: "Multi-entity data untuk satu account"
  },
  {
    id: "template-25",
    name: "History interaksi contact",
    category: "Context-Aware",
    content: "Contact Dr. Budi di RSUD Jakarta, apa history interaksi dan deals yang terkait?",
    description: "Contact history dengan activities dan deals"
  }
];

export const templateCategories = [
  "All",
  "Basic Data Fetching",
  "Complex Analysis",
  "Forecasting",
  "Data Management",
  "Business Intelligence",
  "Sales Strategy",
  "Context-Aware"
] as const;

export function getTemplatesByCategory(category: string): ChatTemplate[] {
  if (category === "All") {
    return chatTemplates;
  }
  return chatTemplates.filter(template => template.category === category);
}

