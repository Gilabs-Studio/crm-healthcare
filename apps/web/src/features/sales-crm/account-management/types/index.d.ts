export interface Account {
  id: string;
  name: string;
  category: "hospital" | "clinic" | "pharmacy";
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  status: "active" | "inactive";
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  account_id: string;
  name: string;
  role: "doctor" | "pic" | "manager" | "other";
  phone?: string;
  email?: string;
  position?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ListAccountsResponse {
  success: boolean;
  data: Account[];
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

export interface AccountResponse {
  success: boolean;
  data: Account;
  timestamp: string;
  request_id: string;
}

export interface ListContactsResponse {
  success: boolean;
  data: Contact[];
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

export interface ContactResponse {
  success: boolean;
  data: Contact;
  timestamp: string;
  request_id: string;
}

