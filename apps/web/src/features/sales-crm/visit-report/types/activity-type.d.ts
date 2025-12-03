export interface ActivityType {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  badge_color: string;
  status: "active" | "inactive";
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityTypeResponse {
  success: boolean;
  data: ActivityType;
}

export interface ListActivityTypesResponse {
  success: boolean;
  data: ActivityType[];
}

