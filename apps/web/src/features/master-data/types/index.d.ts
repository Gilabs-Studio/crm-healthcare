// Diagnosis Types
export interface Diagnosis {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  category?: string;
  description?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface ListDiagnosesResponse {
  success: boolean;
  data: Diagnosis[];
  meta: {
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

export interface DiagnosisResponse {
  success: boolean;
  data: Diagnosis;
  timestamp: string;
  request_id: string;
}

export interface CreateDiagnosisFormData {
  code: string;
  name: string;
  name_en?: string;
  category?: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface UpdateDiagnosisFormData {
  code?: string;
  name?: string;
  name_en?: string;
  category?: string;
  description?: string;
  status?: "active" | "inactive";
}

// Procedure Types
export interface Procedure {
  id: string;
  code: string;
  name: string;
  name_en?: string;
  category?: string;
  description?: string;
  price?: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface ListProceduresResponse {
  success: boolean;
  data: Procedure[];
  meta: {
    pagination: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

export interface ProcedureResponse {
  success: boolean;
  data: Procedure;
  timestamp: string;
  request_id: string;
}

export interface CreateProcedureFormData {
  code: string;
  name: string;
  name_en?: string;
  category?: string;
  description?: string;
  price?: number;
  status?: "active" | "inactive";
}

export interface UpdateProcedureFormData {
  code?: string;
  name?: string;
  name_en?: string;
  category?: string;
  description?: string;
  price?: number;
  status?: "active" | "inactive";
}

