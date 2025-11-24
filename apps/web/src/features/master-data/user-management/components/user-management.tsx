"use client";

import { Users, Shield, Key } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserList } from "./user-list";
import { RoleList } from "./role-list";
import { PermissionList } from "./permission-list";
import { useHasPermission } from "../hooks/useHasPermission";

export function UserManagement() {
  const hasRolesPermission = useHasPermission("ROLES");
  const hasPermissionsPermission = useHasPermission("PERMISSIONS");

  // Determine default tab - use first available tab
  const defaultTab = "users";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage users, roles, and permissions in one place
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          {hasRolesPermission && (
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          )}
          {hasPermissionsPermission && (
          <TabsTrigger value="permissions" className="gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserList />
        </TabsContent>

        {hasRolesPermission && (
        <TabsContent value="roles" className="mt-6">
          <RoleList />
        </TabsContent>
        )}

        {hasPermissionsPermission && (
        <TabsContent value="permissions" className="mt-6">
          <PermissionList />
        </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

