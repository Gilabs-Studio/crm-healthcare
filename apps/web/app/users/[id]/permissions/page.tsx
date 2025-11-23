"use client";

import { use } from "react";
import React, { useState } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { useUser, useRoles, usePermissions, useUpdateUserPermissions } from "@/features/users/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface UserPermissionsPageProps {
  params: Promise<{ id: string }>;
}

export default function UserPermissionsPage({ params }: UserPermissionsPageProps) {
  const { id } = use(params);
  const { data: userData, isLoading: userLoading } = useUser(id);
  const { data: rolesData } = useRoles();
  const { data: permissionsData } = usePermissions();
  const updatePermissions = useUpdateUserPermissions();

  const user = userData?.data;
  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data || [];

  // Initialize selected values from user data
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
    user?.roles?.map((r) => r.id) || []
  );
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    user?.permissions?.map((p) => p.id) || []
  );

  // Update when user data loads
  React.useEffect(() => {
    if (user) {
      setSelectedRoleIds(user.roles?.map((r) => r.id) || []);
      setSelectedPermissionIds(user.permissions?.map((p) => p.id) || []);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updatePermissions.mutateAsync({
        id,
        data: {
          role_ids: selectedRoleIds,
          permission_ids: selectedPermissionIds,
        },
      });
    } catch (error) {
      console.error("Failed to update permissions:", error);
    }
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (userLoading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-8">
            <div className="text-center py-8">Loading...</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  if (!user) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="p-8">
            <div className="text-center py-8 text-destructive">User not found</div>
          </div>
        </DashboardLayout>
      </AuthGuard>
    );
  }

  // Group permissions by resource
  const permissionsByResource = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.resource]) {
        acc[perm.resource] = [];
      }
      acc[perm.resource].push(perm);
      return acc;
    },
    {} as Record<string, typeof permissions>
  );

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Link href={`/users/${id}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Manage Permissions
              </h1>
              <p className="text-muted-foreground mt-1">{user.name}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="rounded border-input"
                    />
                    <div>
                      <div className="font-medium">{role.name}</div>
                      {role.description && (
                        <div className="text-sm text-muted-foreground">
                          {role.description}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(permissionsByResource).map(([resource, perms]) => (
                  <div key={resource}>
                    <div className="font-medium mb-2 capitalize">{resource}</div>
                    <div className="space-y-2">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissionIds.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="rounded border-input"
                          />
                          <div className="text-sm">
                            <div className="font-medium">{perm.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {perm.code}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={updatePermissions.isPending}
            >
              {updatePermissions.isPending ? "Saving..." : "Save Permissions"}
            </Button>
            <Link href={`/users/${id}`}>
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

