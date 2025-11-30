"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAISettings } from "../hooks/useAISettings";
import { Loader2, Shield, Database, Key, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AISettings() {
  const {
    settings,
    isLoading,
    usageStats,
    updateDataPrivacy,
    toggleEnabled,
    updateProvider,
    updateModel,
    updateAPIKey,
    updateUsageLimit,
    isUpdating,
  } = useAISettings();
  
  const [apiKey, setAPIKey] = useState("");
  const [showAPIKey, setShowAPIKey] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure AI assistant and data privacy settings
        </p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          These settings control which data can be sent to the external AI service (Cerebras).
          Disable data types you don't want to share with the AI.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            AI Configuration
          </CardTitle>
          <CardDescription>
            Configure AI provider, model, and API settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="ai-enabled">Enable AI Assistant</Label>
              <p className="text-sm text-muted-foreground">
                Turn on AI assistant to get insights and chat support
              </p>
            </div>
            <Switch
              id="ai-enabled"
              checked={settings.enabled}
              onCheckedChange={toggleEnabled}
              disabled={isUpdating}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={settings.provider || "cerebras"}
              onValueChange={updateProvider}
              disabled={isUpdating || !settings.enabled}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cerebras">Cerebras</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the AI provider to use. Default API key from environment will be used if not set below.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={settings.model || "llama-3.1-8b"}
              onValueChange={updateModel}
              disabled={isUpdating || !settings.enabled}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama-3.1-8b">Llama 3.1 8B</SelectItem>
                <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
                <SelectItem value="llama-3-8b">Llama 3 8B</SelectItem>
                <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the AI model to use for chat and analysis.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key (Optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type={showAPIKey ? "text" : "password"}
                placeholder="Leave empty to use default from environment"
                value={apiKey}
                onChange={(e) => setAPIKey(e.target.value)}
                disabled={isUpdating || !settings.enabled}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAPIKey(!showAPIKey)}
                disabled={isUpdating || !settings.enabled}
              >
                {showAPIKey ? "Hide" : "Show"}
              </Button>
              {apiKey && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    updateAPIKey(apiKey);
                    setAPIKey("");
                  }}
                  disabled={isUpdating || !settings.enabled}
                >
                  Save
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Override the default API key from environment. Leave empty to use default.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage-limit">Monthly Usage Limit (Optional)</Label>
            <Input
              id="usage-limit"
              type="number"
              placeholder="e.g., 1000000"
              value={settings.usage_limit || ""}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                updateUsageLimit(value);
              }}
              disabled={isUpdating || !settings.enabled}
            />
            <p className="text-xs text-muted-foreground">
              Set a monthly token usage limit. Leave empty for unlimited usage.
            </p>
          </div>

          {usageStats && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Current Usage</Label>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {usageStats.current_usage.toLocaleString()} tokens used
                    </span>
                    {usageStats.usage_limit && (
                      <span className="text-muted-foreground">
                        {usageStats.percentage.toFixed(1)}% of {usageStats.usage_limit.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {usageStats.usage_limit && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(usageStats.percentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Privacy
          </CardTitle>
          <CardDescription>
            Control which data types can be sent to the AI service for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="visit-reports">Visit Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to analyze visit reports
                </p>
              </div>
              <Switch
                id="visit-reports"
                checked={settings.data_privacy.allow_visit_reports}
                onCheckedChange={(checked) =>
                  updateDataPrivacy("allow_visit_reports", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="accounts">Accounts</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to access account information
                </p>
              </div>
              <Switch
                id="accounts"
                checked={settings.data_privacy.allow_accounts}
                onCheckedChange={(checked) =>
                  updateDataPrivacy("allow_accounts", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="contacts">Contacts</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to access contact information
                </p>
              </div>
              <Switch
                id="contacts"
                checked={settings.data_privacy.allow_contacts}
                onCheckedChange={(checked) =>
                  updateDataPrivacy("allow_contacts", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deals">Deals</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to analyze deals and opportunities
                </p>
              </div>
              <Switch
                id="deals"
                checked={settings.data_privacy.allow_deals}
                onCheckedChange={(checked) =>
                  updateDataPrivacy("allow_deals", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="activities">Activities</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to access activity history
                </p>
              </div>
              <Switch
                id="activities"
                checked={settings.data_privacy.allow_activities}
                onCheckedChange={(checked) =>
                  updateDataPrivacy("allow_activities", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tasks">Tasks</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to access task information
                </p>
              </div>
              <Switch
                id="tasks"
                checked={settings.data_privacy.allow_tasks}
                onCheckedChange={(checked) =>
                  updateDataPrivacy("allow_tasks", checked)
                }
                disabled={!settings.enabled}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="products">Products</Label>
                <p className="text-sm text-muted-foreground">
                  Allow AI to access product information
                </p>
              </div>
              <Switch
                id="products"
                checked={settings.data_privacy.allow_products}
                onCheckedChange={(checked) =>
                  updateDataPrivacy("allow_products", checked)
                }
                disabled={!settings.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

