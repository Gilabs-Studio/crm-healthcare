"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { User, Lock, Settings, Mail, Phone, MapPin, Globe, FileText, Download, ArrowRight } from "lucide-react";
import { useProfile, useUpdateProfile, useChangePassword } from "../hooks/useProfile";
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormData, type ChangePasswordFormData } from "../schemas/profile.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

  const profile = profileData?.data || user;

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
          <TabsTrigger value="projects">{t("tabs.projects")}</TabsTrigger>
          <TabsTrigger value="activities">{t("tabs.activities")}</TabsTrigger>
          <TabsTrigger value="members">{t("tabs.members")}</TabsTrigger>
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
                        {profile?.role?.name || "User"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">184</div>
                    <div className="text-xs text-muted-foreground mt-1">Post</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">32</div>
                    <div className="text-xs text-muted-foreground mt-1">Projects</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl font-bold">4.5K</div>
                    <div className="text-xs text-muted-foreground mt-1">Members</div>
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
                    <a href="#" className="text-primary hover:underline text-sm">-</a>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("completion.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("completion.label")}</span>
                    <span className="font-medium">66%</span>
                  </div>
                  <Progress value={66} />
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("skills.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {["Photoshop", "Figma", "HTML", "React", "Tailwind CSS", "CSS", "Laravel", "Node.js"].map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
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
                    <Button variant="ghost" size="sm" className="text-xs">
                      {t("activity.viewAll")} <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Shadcn UI Kit Application UI v2.0.0 Latest</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("activity.description")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">December 2nd, 2025</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        {t("activity.download")}
                      </Button>
                    </div>
                  ))}
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
                        {[
                          { product: "Shadcn UI Kit", status: "pending", date: "2025-12-01", amount: "$99.00" },
                          { product: "Figma Design", status: "paid", date: "2025-11-28", amount: "$49.00" },
                          { product: "React Template", status: "failed", date: "2025-11-25", amount: "$79.00" },
                        ].map((tx, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="py-3">{tx.product}</td>
                            <td className="py-3">
                              <Badge
                                variant={
                                  tx.status === "paid"
                                    ? "success"
                                    : tx.status === "pending"
                                    ? "warning"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {tx.status}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground">{tx.date}</td>
                            <td className="py-3 text-right font-medium">{tx.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Connections */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t("connections.title")}</CardTitle>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={currentAvatarUrl} alt="User" />
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">User {item}</p>
                          <p className="text-xs text-muted-foreground">user{item}@example.com</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {t("connections.connect")}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">{t("tabs.projectsContent")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">{t("tabs.activitiesContent")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">{t("tabs.membersContent")}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settings Modal/Dialog - Profile Information & Password */}
      <Card id="profile-settings" className="mt-6">
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
    </div>
  );
}

