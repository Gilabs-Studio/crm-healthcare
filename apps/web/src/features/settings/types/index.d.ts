export interface Settings {
  general: Record<string, string>;
  notifications: Record<string, string>;
  pipeline: Record<string, string>;
}

export interface GetSettingsResponse {
  success: boolean;
  data: Settings;
  meta?: {
    updated_by?: string;
  };
  timestamp: string;
  request_id: string;
}

export interface UpdateSettingsRequest {
  general?: Record<string, string>;
  notifications?: Record<string, string>;
  pipeline?: Record<string, string>;
}

export interface UpdateSettingsResponse {
  success: boolean;
  data: Settings;
  meta?: {
    updated_by?: string;
  };
  timestamp: string;
  request_id: string;
}


