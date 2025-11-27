export type ProductCategoryStatus = "active" | "inactive";

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: ProductCategoryStatus;
  created_at: string;
  updated_at: string;
}

export interface ListProductCategoriesResponse {
  success: boolean;
  data: ProductCategory[];
  timestamp: string;
  request_id: string;
}

export interface ProductCategoryResponse {
  success: boolean;
  data: ProductCategory;
  timestamp: string;
  request_id: string;
}


