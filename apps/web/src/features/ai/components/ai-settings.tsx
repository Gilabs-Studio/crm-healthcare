"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAISettings } from "../hooks/useAISettings";
import { Loader2, Shield, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AISettings() {
  const {
    settings,
    isLoading,
    updateDataPrivacy,
    toggleEnabled,
  } = useAISettings();

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
          <CardTitle>AI Assistant</CardTitle>
          <CardDescription>
            Enable or disable the AI assistant feature
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            />
          </div>
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

