import apiClient from "@/lib/api-client";
import type {
  ListTasksResponse,
  TaskResponse,
  TaskListParams,
  ListRemindersResponse,
  ReminderResponse,
  ReminderListParams,
} from "../types";
import type {
  CreateTaskFormData,
  UpdateTaskFormData,
  AssignTaskFormData,
} from "../schemas/task.schema";
import type { CreateReminderFormData, UpdateReminderFormData } from "../schemas/reminder.schema";

export const taskService = {
  async list(params?: TaskListParams): Promise<ListTasksResponse> {
    const response = await apiClient.get<ListTasksResponse>("/tasks", { params });
    return response.data;
  },

  async getById(id: string): Promise<TaskResponse> {
    const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return response.data;
  },

  async create(data: CreateTaskFormData): Promise<TaskResponse> {
    const payload: Record<string, unknown> = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
    };

    if (data.due_date) {
      const dueDate = new Date(data.due_date);
      if (!Number.isNaN(dueDate.getTime())) {
        payload.due_date = dueDate.toISOString();
      }
    }

    if (data.assigned_to) {
      payload.assigned_to = data.assigned_to;
    }

    if (data.account_id) {
      payload.account_id = data.account_id;
    }

    if (data.contact_id) {
      payload.contact_id = data.contact_id;
    }

    if (data.deal_id) {
      payload.deal_id = data.deal_id;
    }

    const response = await apiClient.post<TaskResponse>("/tasks", payload);
    return response.data;
  },

  async update(id: string, data: UpdateTaskFormData): Promise<TaskResponse> {
    const payload: Record<string, unknown> = {};

    if (data.title !== undefined) {
      payload.title = data.title;
    }

    if (data.description !== undefined) {
      payload.description = data.description;
    }

    if (data.type !== undefined) {
      payload.type = data.type;
    }

    if (data.status !== undefined) {
      payload.status = data.status;
    }

    if (data.priority !== undefined) {
      payload.priority = data.priority;
    }

    if (data.due_date !== undefined) {
      if (data.due_date) {
        const dueDate = new Date(data.due_date);
        if (!Number.isNaN(dueDate.getTime())) {
          payload.due_date = dueDate.toISOString();
        }
      } else {
        payload.due_date = null;
      }
    }

    if (data.assigned_to !== undefined) {
      payload.assigned_to = data.assigned_to || null;
    }

    if (data.account_id !== undefined) {
      payload.account_id = data.account_id || null;
    }

    if (data.contact_id !== undefined) {
      payload.contact_id = data.contact_id || null;
    }

    if (data.deal_id !== undefined) {
      payload.deal_id = data.deal_id || null;
    }

    const response = await apiClient.put<TaskResponse>(`/tasks/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async assign(id: string, data: AssignTaskFormData): Promise<TaskResponse> {
    const response = await apiClient.post<TaskResponse>(`/tasks/${id}/assign`, data);
    return response.data;
  },

  async complete(id: string): Promise<TaskResponse> {
    const response = await apiClient.post<TaskResponse>(`/tasks/${id}/complete`);
    return response.data;
  },
};

export const reminderService = {
  async list(params?: ReminderListParams): Promise<ListRemindersResponse> {
    const response = await apiClient.get<ListRemindersResponse>("/tasks/reminders", { params });
    return response.data;
  },

  async getById(id: string): Promise<ReminderResponse> {
    const response = await apiClient.get<ReminderResponse>(`/tasks/reminders/${id}`);
    return response.data;
  },

  async create(data: CreateReminderFormData): Promise<ReminderResponse> {
    const payload: Record<string, unknown> = {
      task_id: data.task_id,
      reminder_type: data.reminder_type,
      message: data.message,
    };

    const remindAt = new Date(data.remind_at);
    if (!Number.isNaN(remindAt.getTime())) {
      payload.remind_at = remindAt.toISOString();
    }

    const response = await apiClient.post<ReminderResponse>("/tasks/reminders", payload);
    return response.data;
  },

  async update(id: string, data: UpdateReminderFormData): Promise<ReminderResponse> {
    const payload: Record<string, unknown> = {};

    if (data.remind_at !== undefined) {
      if (data.remind_at) {
        const remindAt = new Date(data.remind_at);
        if (!Number.isNaN(remindAt.getTime())) {
          payload.remind_at = remindAt.toISOString();
        }
      } else {
        payload.remind_at = null;
      }
    }

    if (data.reminder_type !== undefined) {
      payload.reminder_type = data.reminder_type;
    }

    if (data.message !== undefined) {
      payload.message = data.message;
    }

    const response = await apiClient.put<ReminderResponse>(`/tasks/reminders/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/reminders/${id}`);
  },
};


