import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { aiService } from "../services/aiService";
import type { AISettingsResponse } from "../types";

export function useAISettings() {
  const queryClient = useQueryClient();

  // Fetch settings
  const {
    data: settingsResponse,
    isLoading,
    error,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ["ai-settings"],
    queryFn: async () => {
      const response = await aiService.getSettings();
      return response.data;
    },
    // No auto-refresh - only refresh when explicitly invalidated
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<AISettingsResponse>) => {
      return await aiService.updateSettings(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-settings"] });
      toast.success("AI settings updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to update settings";
      toast.error(message);
    },
  });

  const updateDataPrivacy = (
    key: keyof AISettingsResponse["data_privacy"],
    value: boolean
  ) => {
    if (!settingsResponse) return;
    
    updateMutation.mutate({
      data_privacy: {
        ...settingsResponse.data_privacy,
        [key]: value,
      },
    });
  };

  const toggleEnabled = () => {
    if (!settingsResponse) return;
    updateMutation.mutate({ enabled: !settingsResponse.enabled });
  };

  const updateProvider = (provider: string) => {
    updateMutation.mutate({ provider });
  };

  const updateModel = (model: string) => {
    updateMutation.mutate({ model });
  };

  const updateAPIKey = (apiKey: string) => {
    updateMutation.mutate({ api_key: apiKey });
  };

  const updateUsageLimit = (limit: number | undefined) => {
    updateMutation.mutate({ usage_limit: limit });
  };

  const updateTimezone = (timezone: string) => {
    updateMutation.mutate({ timezone });
  };

  // Convert AISettingsResponse to AISettings format for backward compatibility
  const settings = settingsResponse
    ? {
        enabled: settingsResponse.enabled,
        data_privacy: settingsResponse.data_privacy,
        provider: settingsResponse.provider,
        model: settingsResponse.model,
        base_url: settingsResponse.base_url,
        timezone: settingsResponse.timezone || "Asia/Jakarta",
        usage_limit: settingsResponse.usage_limit,
        current_usage: settingsResponse.current_usage,
      }
    : {
        enabled: true,
        data_privacy: {
          allow_visit_reports: true,
          allow_accounts: true,
          allow_contacts: true,
          allow_deals: true,
          allow_activities: true,
          allow_tasks: true,
          allow_products: true,
        },
        provider: "cerebras",
        model: "llama-3.1-8b",
        base_url: undefined,
        timezone: "Asia/Jakarta",
        usage_limit: undefined,
        current_usage: 0,
      };

  // Calculate usage stats
  const usageStats = settingsResponse
    ? {
        current_usage: settingsResponse.current_usage,
        usage_limit: settingsResponse.usage_limit,
        percentage: settingsResponse.usage_limit
          ? (settingsResponse.current_usage / settingsResponse.usage_limit) * 100
          : 0,
      }
    : undefined;

  return {
    settings,
    isLoading,
    error,
    usageStats,
    updateDataPrivacy,
    toggleEnabled,
    updateProvider,
    updateModel,
    updateAPIKey,
    updateTimezone,
    updateUsageLimit,
    isUpdating: updateMutation.isPending,
    refetch: refetchSettings,
  };
}

