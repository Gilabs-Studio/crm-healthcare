export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "inactive";
  roles?: Role[];
  permissions?: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  code: string; // e.g., "users:read", "users:write"
  description?: string;
  resource: string; // e.g., "users", "patients"
  action: string; // e.g., "read", "write", "delete"
  status: "active" | "inactive";
}

// Request DTOs
export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  status?: "active" | "inactive";
  role_ids?: string[];
  permission_ids?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: string;
  status?: "active" | "inactive";
  password?: string;
}

export interface UpdateUserPermissionsRequest {
  role_ids?: string[];
  permission_ids?: string[];
}

export interface ListUsersRequest {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
  status?: "active" | "inactive";
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Response DTOs
export interface ListUsersResponse {
  success: boolean;
  data: User[];
  meta?: {
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
      next_page?: number;
      prev_page?: number;
    };
    filters?: Record<string, unknown>;
  };
  timestamp: string;
  request_id: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  timestamp: string;
  request_id: string;
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
  timestamp: string;
  request_id: string;
}

export interface PermissionsResponse {
  success: boolean;
  data: Permission[];
  timestamp: string;
  request_id: string;
}

