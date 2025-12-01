export interface ProfileUpdateRequest {
  name?: string;
  password?: string;
  current_password?: string;
  avatar_url?: string;
}

export interface ProfileResponse {
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

