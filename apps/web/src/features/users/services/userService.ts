import apiClient from "@/lib/api-client";
import type {
  User,
  Role,
  Permission,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserPermissionsRequest,
  ListUsersRequest,
  ListUsersResponse,
  UserResponse,
  RolesResponse,
  PermissionsResponse,
} from "../types";

export const userService = {
  async list(params?: ListUsersRequest): Promise<ListUsersResponse> {
    const response = await apiClient.get<ListUsersResponse>("/users", { params });
    return response.data;
  },

  async getById(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  async create(data: CreateUserRequest): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>("/users", data);
    return response.data;
  },

  async update(id: string, data: UpdateUserRequest): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async updatePermissions(
    id: string,
    data: UpdateUserPermissionsRequest
  ): Promise<UserResponse> {
    const response = await apiClient.put<UserResponse>(
      `/users/${id}/permissions`,
      data
    );
    return response.data;
  },

  async listRoles(): Promise<RolesResponse> {
    const response = await apiClient.get<RolesResponse>("/users/roles");
    return response.data;
  },

  async listPermissions(): Promise<PermissionsResponse> {
    const response = await apiClient.get<PermissionsResponse>("/users/permissions");
    return response.data;
  },
};

