import apiClient from "@/lib/api-client";
import type { ProfileResponse } from "../types";
import type { UpdateProfileFormData, ChangePasswordFormData } from "../schemas/profile.schema";

export const profileService = {
  async getProfile(userId: string): Promise<ProfileResponse> {
    const response = await apiClient.get<ProfileResponse>(`/users/${userId}`);
    return response.data;
  },

  async updateProfile(userId: string, data: UpdateProfileFormData): Promise<ProfileResponse> {
    const response = await apiClient.put<ProfileResponse>(`/users/${userId}`, data);
    return response.data;
  },

  async changePassword(userId: string, data: ChangePasswordFormData): Promise<ProfileResponse> {
    const response = await apiClient.put<ProfileResponse>(`/users/${userId}/password`, {
      current_password: data.current_password,
      password: data.password,
    });
    return response.data;
  },
};

