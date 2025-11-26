"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { pipelineSettingsSchema, type PipelineSettingsFormData } from "../schemas/settings.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSettings, useUpdateSettings } from "../hooks/useSettings";
import { useEffect } from "react";

export function PipelineSettingsForm() {
  const { data, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<PipelineSettingsFormData>({
    resolver: zodResolver(pipelineSettingsSchema),
    defaultValues: {
      stages: JSON.stringify([
        { id: "1", name: "Lead", order: 1 },
        { id: "2", name: "Qualified", order: 2 },
        { id: "3", name: "Proposal", order: 3 },
        { id: "4", name: "Negotiation", order: 4 },
        { id: "5", name: "Won", order: 5 },
        { id: "6", name: "Lost", order: 6 },
      ]),
      default_stage: "1",
      auto_advance: "false",
    },
  });

  useEffect(() => {
    if (data?.data?.pipeline) {
      reset({
        stages: data.data.pipeline.stages || JSON.stringify([
          { id: "1", name: "Lead", order: 1 },
          { id: "2", name: "Qualified", order: 2 },
          { id: "3", name: "Proposal", order: 3 },
          { id: "4", name: "Negotiation", order: 4 },
          { id: "5", name: "Won", order: 5 },
          { id: "6", name: "Lost", order: 6 },
        ]),
        default_stage: data.data.pipeline.default_stage || "1",
        auto_advance: data.data.pipeline.auto_advance || "false",
      });
    }
  }, [data, reset]);

  const autoAdvance = watch("auto_advance") === "true";

  const onSubmit = async (formData: PipelineSettingsFormData) => {
    try {
      await updateSettings.mutateAsync({
        pipeline: formData as Record<string, string>,
      });
      toast.success("Pipeline settings updated successfully");
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Settings</CardTitle>
          <CardDescription>Configure your sales pipeline stages and behavior</CardDescription>
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
        <CardTitle>Pipeline Settings</CardTitle>
        <CardDescription>Configure your sales pipeline stages and behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field orientation="vertical">
            <FieldLabel>Pipeline Stages (JSON)</FieldLabel>
            <Textarea
              {...register("stages")}
              placeholder='[{"id":"1","name":"Lead","order":1},...]'
              rows={8}
              className="font-mono text-sm"
            />
            {errors.stages && (
              <FieldError>{errors.stages.message}</FieldError>
            )}
            <p className="text-sm text-muted-foreground">
              Define pipeline stages as JSON array. Each stage should have id, name, and order.
            </p>
          </Field>

          <Field orientation="vertical">
            <FieldLabel>Default Stage</FieldLabel>
            <Input
              {...register("default_stage")}
              placeholder="1"
            />
            {errors.default_stage && (
              <FieldError>{errors.default_stage.message}</FieldError>
            )}
            <p className="text-sm text-muted-foreground">
              The default stage ID for new deals
            </p>
          </Field>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <FieldLabel>Auto Advance</FieldLabel>
              <p className="text-sm text-muted-foreground">
                Automatically advance deals to next stage when criteria are met
              </p>
            </div>
            <Switch
              checked={autoAdvance}
              onCheckedChange={(checked) => setValue("auto_advance", checked ? "true" : "false")}
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


