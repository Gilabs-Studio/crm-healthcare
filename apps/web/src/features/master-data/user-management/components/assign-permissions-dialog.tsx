"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePermissions } from "../hooks/usePermissions";
import { useRole, useAssignPermissionsToRole } from "../hooks/useRoles";
import { Checkbox } from "@/components/ui/checkbox";
import type { Permission } from "../types";

interface AssignPermissionsDialogProps {
  readonly roleId: string;
  readonly onClose: () => void;
}

export function AssignPermissionsDialog({ roleId, onClose }: AssignPermissionsDialogProps) {
  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions();
  const { data: roleData, isLoading: isLoadingRole } = useRole(roleId);
  const assignPermissions = useAssignPermissionsToRole();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const t = useTranslations("userManagement.assignPermissions");

  const permissions = permissionsData?.data || [];
  const role = roleData;

  // Initialize selected permissions from role
  useEffect(() => {
    if (role?.permissions?.length) {
      setSelectedPermissions(role.permissions.map((p) => p.id));
    } else {
      setSelectedPermissions([]);
    }
  }, [role]);

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async () => {
    try {
      await assignPermissions.mutateAsync({
        roleId,
        permissionIds: selectedPermissions,
      });
      toast.success(t("save"));
      onClose();
    } catch (error) {
      // Error already handled in api-client interceptor
    }
  };

  // Group permissions by menu/action
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const key = perm.menu?.name || t("otherGroup");
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Dialog open={!!roleId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("title", { roleName: role?.name ?? "" })}
          </DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {isLoadingPermissions || isLoadingRole ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([menuName, menuPermissions]) => (
              <Card key={`menu-${menuName}`}>
                <CardHeader>
                  <CardTitle className="text-sm">{menuName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {menuPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted"
                      >
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                        />
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={assignPermissions.isPending}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={assignPermissions.isPending}>
            {assignPermissions.isPending ? t("saving") : t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
