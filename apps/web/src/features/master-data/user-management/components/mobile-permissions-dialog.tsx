"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Smartphone } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useRole, useAssignPermissionsToRole } from "../hooks/useRoles";
import { usePermissions } from "../hooks/usePermissions";

interface MobilePermissionsDialogProps {
  readonly roleId: string;
  readonly onClose: () => void;
}

// Mobile menu configuration
const MOBILE_MENUS = [
  { code: "dashboard", name: "Dashboard", actions: ["VIEW"] },
  { code: "task", name: "Task", actions: ["VIEW", "CREATE", "EDIT", "DELETE"] },
  { code: "accounts", name: "Accounts", actions: ["VIEW", "CREATE", "EDIT", "DELETE"] },
  { code: "contacts", name: "Contacts", actions: ["VIEW", "CREATE", "EDIT", "DELETE"] },
  { code: "visit_reports", name: "Visit Reports", actions: ["VIEW", "CREATE", "EDIT", "DELETE"] },
];

// Map mobile menu code to permission code patterns
const MOBILE_MENU_TO_PERMISSION_PATTERNS: Record<string, string[]> = {
  dashboard: ["VIEW_DASHBOARD"],
  task: ["VIEW_TASKS", "CREATE_TASKS", "EDIT_TASKS", "DELETE_TASKS"],
  accounts: ["VIEW_ACCOUNTS", "CREATE_ACCOUNTS", "EDIT_ACCOUNTS", "DELETE_ACCOUNTS"],
  contacts: ["VIEW_ACCOUNTS", "CREATE_ACCOUNTS", "EDIT_ACCOUNTS", "DELETE_ACCOUNTS"], // Contacts use accounts permissions
  visit_reports: ["VIEW_VISIT_REPORTS", "CREATE_VISIT_REPORTS", "EDIT_VISIT_REPORTS", "DELETE_VISIT_REPORTS"],
};

export function MobilePermissionsDialog({ roleId, onClose }: MobilePermissionsDialogProps) {
  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermissions();
  const { data: roleData, isLoading: isLoadingRole } = useRole(roleId);
  const assignPermissions = useAssignPermissionsToRole();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializedRoleId, setInitializedRoleId] = useState<string | null>(null);
  const t = useTranslations("userManagement.mobilePermissions");

  const permissions = permissionsData?.data || [];
  const role = roleData;

  // Memoize role permission IDs string to prevent unnecessary re-renders
  const rolePermissionIdsStr = useMemo(() => {
    if (!role?.permissions?.length) return "";
    return role.permissions.map((p) => p.id).sort((a, b) => a.localeCompare(b)).join(",");
  }, [role]);

  // Reset initialization when roleId changes (including when it becomes null or changes to a new value)
  useEffect(() => {
    if (!roleId || roleId !== initializedRoleId) {
      // Dialog closed or opened with new/different roleId, reset everything
      // This ensures fresh initialization every time dialog is opened
      setIsInitialized(false);
      setSelectedPermissions([]);
      setInitializedRoleId(null);
    }
  }, [roleId, initializedRoleId]);

  // Initialize selected permissions from role
  // This effect runs when roleId, role data, or permissions change
  useEffect(() => {
    // Don't initialize if dialog is closed or data not ready
    if (!roleId || !role || !permissions.length) {
      return;
    }
    
    // Double-check: ensure we're initializing for the correct role
    if (role.id !== roleId) {
      console.warn(`[DEBUG] Role ID mismatch: expected ${roleId}, got ${role.id}`);
      return;
    }
    
    // Only initialize if this roleId hasn't been initialized yet
    // This ensures initialization happens every time dialog is opened, even with same roleId
    if (initializedRoleId === roleId && isInitialized) {
      return;
    }
    
    // Re-initialize when rolePermissionIdsStr changes or when not yet initialized
    // This ensures fresh data when dialog is reopened
    const rolePermissionIds = role.permissions?.map((p) => p.id) || [];
    
    console.log(`[DEBUG] Initializing selected permissions for role ${role.name}:`, {
      roleId: role.id,
      roleName: role.name,
      permissionIds: rolePermissionIds,
      permissionCodes: role.permissions?.map((p) => p.code) || [],
      wasInitialized: isInitialized,
      initializedRoleId,
      rolePermissionIdsStr,
    });
    setSelectedPermissions(rolePermissionIds);
    setIsInitialized(true);
    setInitializedRoleId(roleId);
  }, [roleId, role, rolePermissionIdsStr, permissions.length, initializedRoleId, isInitialized]);

  // Memoize permission lookup map for performance
  const permissionMap = useMemo(() => {
    const map = new Map<string, string>(); // permission code -> permission id
    permissions.forEach((perm) => {
      map.set(perm.code, perm.id);
    });
    console.log(`[DEBUG] Permission map initialized with ${map.size} permissions:`, Array.from(map.keys()));
    return map;
  }, [permissions]);

  const toggleMobilePermission = useCallback((menuCode: string, action: string) => {
    const patterns = MOBILE_MENU_TO_PERMISSION_PATTERNS[menuCode] || [];
    // Permission format is {ACTION}_{RESOURCE} (e.g., CREATE_TASKS, EDIT_TASKS)
    // So we need to find pattern that STARTS with {ACTION}_
    const actionPattern = patterns.find((p) => p.startsWith(`${action}_`));
    
    if (!actionPattern) {
      console.warn(`[DEBUG] No permission pattern found for ${menuCode} - ${action}`, {
        menuCode,
        action,
        availablePatterns: patterns,
        allPermissions: Array.from(permissionMap.keys()),
      });
      return;
    }

    const permissionId = permissionMap.get(actionPattern);
    if (!permissionId) {
      console.warn(`[DEBUG] Permission not found: ${actionPattern}`, {
        actionPattern,
        menuCode,
        action,
        availablePermissions: Array.from(permissionMap.keys()),
      });
      return;
    }

    console.log(`[DEBUG] Toggling permission: ${actionPattern} (${permissionId}) for ${menuCode} - ${action}`);

    // Toggle permission using functional update
    setSelectedPermissions((prev) => {
      const isSelected = prev.includes(permissionId);
      console.log(`[DEBUG] Current state: isSelected=${isSelected}, prevCount=${prev.length}`);
      if (isSelected) {
        const newState = prev.filter((id) => id !== permissionId);
        console.log(`[DEBUG] Removing permission, new count: ${newState.length}`);
        return newState;
      } else {
        const newState = [...prev, permissionId];
        console.log(`[DEBUG] Adding permission, new count: ${newState.length}`);
        return newState;
      }
    });
  }, [permissionMap]);

  const handleSubmit = async () => {
    try {
      await assignPermissions.mutateAsync({
        roleId,
        permissionIds: selectedPermissions,
      });
      toast.success(t("saved") || "Mobile permissions saved successfully");
      onClose();
    } catch {
      // Error already handled in api-client interceptor
    }
  };

  const isActionEnabled = useCallback((menuCode: string, action: string): boolean => {
    // Check if the permission is in selectedPermissions by finding the permission code
    const patterns = MOBILE_MENU_TO_PERMISSION_PATTERNS[menuCode] || [];
    // Permission format is {ACTION}_{RESOURCE} (e.g., CREATE_TASKS, EDIT_TASKS)
    // So we need to find pattern that STARTS with {ACTION}_
    const actionPattern = patterns.find((p) => p.startsWith(`${action}_`));
    
    if (!actionPattern) {
      console.warn(`[DEBUG] isActionEnabled: No pattern found for ${menuCode} - ${action}`);
      return false;
    }
    
    const permissionId = permissionMap.get(actionPattern);
    if (!permissionId) {
      console.warn(`[DEBUG] isActionEnabled: Permission ID not found for ${actionPattern}`);
      return false;
    }
    
    // Check if this permission ID is in selectedPermissions
    const isEnabled = selectedPermissions.includes(permissionId);
    console.log(`[DEBUG] isActionEnabled: ${menuCode} - ${action} = ${isEnabled} (pattern: ${actionPattern}, id: ${permissionId})`);
    return isEnabled;
  }, [permissionMap, selectedPermissions]);

  return (
    <Dialog open={!!roleId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            {t("title") || "Configure Mobile Permissions"}
            {role?.name && ` - ${role.name}`}
          </DialogTitle>
          <DialogDescription>
            {t("description") || "Configure which permissions are available for mobile app access. These permissions control what actions users with this role can perform in the mobile application."}
          </DialogDescription>
        </DialogHeader>

        {isLoadingPermissions || isLoadingRole ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {MOBILE_MENUS.map((menu) => (
              <Card key={menu.code}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{menu.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {menu.actions.map((action) => {
                      const isEnabled = isActionEnabled(menu.code, action);
                      const checkboxId = `${menu.code}-${action}-${roleId}`;
                      const checkboxKey = `${menu.code}-${action}-${isEnabled}`;
                      return (
                        <div key={`${menu.code}-${action}`} className="flex items-center space-x-2">
                          <Checkbox
                            key={checkboxKey}
                            id={checkboxId}
                            checked={isEnabled}
                            onCheckedChange={() => {
                              toggleMobilePermission(menu.code, action);
                            }}
                          />
                          <label
                            htmlFor={checkboxId}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                          >
                            {action}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={assignPermissions.isPending}>
            {t("cancel") || "Cancel"}
          </Button>
          <Button onClick={handleSubmit} disabled={assignPermissions.isPending}>
            {assignPermissions.isPending
              ? (t("saving") || "Saving...")
              : (t("save") || "Save Permissions")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
