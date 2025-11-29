import { useState, useEffect } from "react";
import type { AISettings } from "../types";

const STORAGE_KEY = "ai_settings";

const defaultSettings: AISettings = {
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
};

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load AI settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to save AI settings:", error);
    }
  };

  const updateDataPrivacy = (
    key: keyof AISettings["data_privacy"],
    value: boolean
  ) => {
    updateSettings({
      data_privacy: {
        ...settings.data_privacy,
        [key]: value,
      },
    });
  };

  return {
    settings,
    isLoading,
    updateSettings,
    updateDataPrivacy,
    toggleEnabled: () => updateSettings({ enabled: !settings.enabled }),
  };
}

