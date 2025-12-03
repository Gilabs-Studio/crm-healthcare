"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { Settings, Mail, Phone, MapPin, Globe, FileText, Download, ArrowRight } from "lucide-react";
import { useProfile, useUpdateProfile, useChangePassword } from "../hooks/useProfile";
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormData, type ChangePasswordFormData } from "../schemas/profile.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export function ProfileSettings() {
  const { user } = useAuthStore();
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const t = useTranslations("profile");
  const [activeTab, setActiveTab] = useState("overview");

  const profile = profileData?.data?.user || user;
  const stats = profileData?.data?.stats;
  const activities = profileData?.data?.activities ?? [];
  const transactions = profileData?.data?.transactions ?? [];

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name || "",
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile?.name) {
      resetProfile({ name: profile.name });
    }
  }, [profile?.name, resetProfile]);

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleUpdateProfile = async (data: UpdateProfileFormData) => {
    await updateProfile.mutateAsync(data);
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    await changePassword.mutateAsync(data);
    resetPassword();
  };

  const fallbackAvatarUrl = "/avatar-placeholder.svg";
  const currentAvatarUrl =
    profile?.avatar_url && profile.avatar_url.trim() !== ""
      ? profile.avatar_url
      : fallbackAvatarUrl;

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="password">{t("tabs.password")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - User Profile */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={currentAvatarUrl} alt={profile?.name || "User"} />
                    </Avatar>
                    <div>
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-lg font-semibold">{profile?.name || "User"}</h3>
                        <Badge variant="default" className="text-xs">Pro</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(() => {
                          if (typeof profile?.role === "object" && profile.role?.name) {
                            return profile.role.name;
                          }
                          if (typeof profile?.role === "string") {
                            return profile.role;
                          }
                          return "User";
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{stats?.visits ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("stats.visits")}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{stats?.deals ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("stats.deals")}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">{stats?.tasks ?? 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">{t("stats.tasks")}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("contact.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{profile?.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">-</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">-</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">-</span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column - Activity, Transactions, Connections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Latest Activity */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t("activity.title")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{t("activity.empty")}</p>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className="p-2 rounded-lg bg-muted">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(activity.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        {activity.download_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={activity.download_url} download>
                              <Download className="h-3 w-3 mr-1" />
                              {t("activity.download")}
                            </a>
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("transactions.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 text-muted-foreground font-medium">{t("transactions.product")}</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">{t("transactions.status")}</th>
                          <th className="text-left py-2 text-muted-foreground font-medium">{t("transactions.date")}</th>
                          <th className="text-right py-2 text-muted-foreground font-medium">{t("transactions.amount")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                              {t("transactions.empty")}
                            </td>
                          </tr>
                        ) : (
                          transactions.map((tx) => {
                            let statusVariant: "success" | "warning" | "destructive" = "destructive";
                            if (tx.status === "paid") {
                              statusVariant = "success";
                            } else if (tx.status === "pending") {
                              statusVariant = "warning";
                            }
                            
                            const formattedAmount = new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(tx.amount);
                            
                            return (
                              <tr key={tx.id} className="border-b">
                                <td className="py-3">{tx.product}</td>
                                <td className="py-3">
                                  <Badge
                                    variant={statusVariant}
                                    className="text-xs"
                                  >
                                    {tx.status}
                                  </Badge>
                                </td>
                                <td className="py-3 text-muted-foreground">
                                  {new Date(tx.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="py-3 text-right font-medium">{formattedAmount}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="h-4 w-4" />
                {t("settings.title")}
              </CardTitle>
              <CardDescription>{t("settings.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information Form */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">{t("information.title")}</h4>
                  <form onSubmit={handleSubmitProfile(handleUpdateProfile)} className="space-y-4">
                    <Field orientation="vertical">
                      <FieldLabel className="text-sm">{t("information.emailLabel")}</FieldLabel>
                      <Input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="bg-muted h-9"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("information.emailHint")}
                      </p>
                    </Field>

                    <Field orientation="vertical">
                      <FieldLabel className="text-sm">{t("information.nameLabel")}</FieldLabel>
                      <Input
                        {...registerProfile("name")}
                        placeholder={t("information.namePlaceholder")}
                        disabled={updateProfile.isPending}
                        className="h-9"
                      />
                      {profileErrors.name && (
                        <FieldError className="text-xs">{profileErrors.name.message}</FieldError>
                      )}
                    </Field>

                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                      size="sm"
                    >
                      {updateProfile.isPending ? t("information.saving") : t("information.save")}
                    </Button>
                  </form>
                </div>

                {/* Change Password Form */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">{t("password.title")}</h4>
                  <form onSubmit={handleSubmitPassword(handleChangePassword)} className="space-y-4">
                    <Field orientation="vertical">
                      <FieldLabel className="text-sm">{t("password.currentPasswordLabel")}</FieldLabel>
                      <Input
                        type="password"
                        {...registerPassword("current_password")}
                        placeholder={t("password.currentPasswordPlaceholder")}
                        disabled={changePassword.isPending}
                        className="h-9"
                      />
                      {passwordErrors.current_password && (
                        <FieldError className="text-xs">
                          {passwordErrors.current_password.message}
                        </FieldError>
                      )}
                    </Field>

                    <Field orientation="vertical">
                      <FieldLabel className="text-sm">{t("password.newPasswordLabel")}</FieldLabel>
                      <Input
                        type="password"
                        {...registerPassword("password")}
                        placeholder={t("password.newPasswordPlaceholder")}
                        disabled={changePassword.isPending}
                        className="h-9"
                      />
                      {passwordErrors.password && (
                        <FieldError className="text-xs">{passwordErrors.password.message}</FieldError>
                      )}
                    </Field>

                    <Field orientation="vertical">
                      <FieldLabel className="text-sm">{t("password.confirmPasswordLabel")}</FieldLabel>
                      <Input
                        type="password"
                        {...registerPassword("confirm_password")}
                        placeholder={t("password.confirmPasswordPlaceholder")}
                        disabled={changePassword.isPending}
                        className="h-9"
                      />
                      {passwordErrors.confirm_password && (
                        <FieldError className="text-xs">
                          {passwordErrors.confirm_password.message}
                        </FieldError>
                      )}
                    </Field>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => resetPassword()}
                        disabled={changePassword.isPending}
                        size="sm"
                      >
                        {t("password.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={changePassword.isPending}
                        size="sm"
                      >
                        {changePassword.isPending ? t("password.changing") : t("password.change")}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

