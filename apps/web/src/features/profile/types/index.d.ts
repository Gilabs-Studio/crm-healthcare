export interface ProfileUpdateRequest {
  name?: string;
  password?: string;
  current_password?: string;
  avatar_url?: string;
}

export interface ProfileStats {
  visits: number;
  deals: number;
  tasks: number;
}

export interface ProfileActivity {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  download_url?: string;
}

export interface ProfileTransaction {
  id: string;
  product: string;
  status: "pending" | "paid" | "failed";
  date: string;
  amount: number;
}

export interface ProfileData {
  user: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role_id: string;
    role?: {
      id: string;
      name: string;
      code: string;
    };
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
  };
  stats: ProfileStats;
  activities: ProfileActivity[];
  transactions: ProfileTransaction[];
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
  timestamp: string;
  request_id: string;
}

export interface UserResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    role_id: string;
    role?: {
      id: string;
      name: string;
      code: string;
    };
    status: "active" | "inactive";
    created_at: string;
    updated_at: string;
  };
  timestamp: string;
  request_id: string;
}

