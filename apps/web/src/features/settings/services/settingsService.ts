import apiClient from "@/lib/api-client";
import type {
  GetSettingsResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
} from "../types";

export const settingsService = {
  async getSettings(): Promise<GetSettingsResponse> {
    const response = await apiClient.get<GetSettingsResponse>("/settings");
    return response.data;
  },

  async updateSettings(
    data: UpdateSettingsRequest
  ): Promise<UpdateSettingsResponse> {
    const response = await apiClient.put<UpdateSettingsResponse>(
      "/settings",
      data
    );
    return response.data;
  },
};


