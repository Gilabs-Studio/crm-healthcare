export interface Category {
  id: string;
  type: "diagnosis" | "procedure";
  name: string;
  description?: string;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface ListCategoriesResponse {
  success: boolean;
  data: Category[];
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

export interface SingleCategoryResponse {
  success: boolean;
  data: Category;
  timestamp: string;
  request_id: string;
}

export interface CreateCategoryFormData {
  type: "diagnosis" | "procedure";
  name: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface UpdateCategoryFormData {
  name?: string;
  description?: string;
  status?: "active" | "inactive";
}

