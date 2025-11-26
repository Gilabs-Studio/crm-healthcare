"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { notificationSettingsSchema, type NotificationSettingsFormData } from "../schemas/settings.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import { useEffect } from "react";

export function NotificationSettingsForm() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      email_notifications: "true",
      sms_notifications: "false",
      push_notifications: "true",
      visit_report_notifications: "true",
      task_reminder_notifications: "true",
      pipeline_update_notifications: "true",
    },
  });

  useEffect(() => {
    if (data?.data?.notifications) {
      reset({
        email_notifications: data.data.notifications.email_notifications || "true",
        sms_notifications: data.data.notifications.sms_notifications || "false",
        push_notifications: data.data.notifications.push_notifications || "true",
        visit_report_notifications: data.data.notifications.visit_report_notifications || "true",
        task_reminder_notifications: data.data.notifications.task_reminder_notifications || "true",
        pipeline_update_notifications: data.data.notifications.pipeline_update_notifications || "true",
      });
    }
  }, [data, reset]);

  const emailNotifications = watch("email_notifications") === "true";
  const smsNotifications = watch("sms_notifications") === "true";
  const pushNotifications = watch("push_notifications") === "true";
  const visitReportNotifications = watch("visit_report_notifications") === "true";
  const taskReminderNotifications = watch("task_reminder_notifications") === "true";
  const pipelineUpdateNotifications = watch("pipeline_update_notifications") === "true";

  const onSubmit = async (formData: NotificationSettingsFormData) => {
    try {
      await updateSettings.mutateAsync({
        notifications: formData as Record<string, string>,
      });
      toast.success("Notification settings updated successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FieldLabel>Email Notifications</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={(checked) => setValue("email_notifications", checked ? "true" : "false")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FieldLabel>SMS Notifications</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              checked={smsNotifications}
              onCheckedChange={(checked) => setValue("sms_notifications", checked ? "true" : "false")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FieldLabel>Push Notifications</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in browser
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={(checked) => setValue("push_notifications", checked ? "true" : "false")}
            />
          </div>

          <div className="border-t pt-4" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FieldLabel>Visit Report Notifications</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Get notified about visit report updates
              </p>
            </div>
            <Switch
              checked={visitReportNotifications}
              onCheckedChange={(checked) => setValue("visit_report_notifications", checked ? "true" : "false")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FieldLabel>Task Reminder Notifications</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming tasks
              </p>
            </div>
            <Switch
              checked={taskReminderNotifications}
              onCheckedChange={(checked) => setValue("task_reminder_notifications", checked ? "true" : "false")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FieldLabel>Pipeline Update Notifications</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Get notified about pipeline changes
              </p>
            </div>
            <Switch
              checked={pipelineUpdateNotifications}
              onCheckedChange={(checked) => setValue("pipeline_update_notifications", checked ? "true" : "false")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="submit"
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


