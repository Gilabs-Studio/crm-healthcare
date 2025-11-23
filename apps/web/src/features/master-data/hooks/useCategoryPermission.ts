"use client";

import { useMemo } from "react";
import { useUserPermissions } from "@/features/user/hooks/useUserPermissions";

export function useCategoryPermission(type: "diagnosis" | "procedure") {
  const { data: permissionsData } = useUserPermissions();

  const hasCategoryPermission = useMemo(() => {
    if (!permissionsData?.data?.menus) return false;

    const permissionCode = type === "diagnosis" ? "CATEGORY_DIAGNOSIS" : "CATEGORY_PROCEDURE";

    // Find the menu and check if user has CATEGORY permission
    const findPermission = (menus: typeof permissionsData.data.menus): boolean => {
      for (const menu of menus) {
        // Check actions in current menu
        if (menu.actions?.some((action) => action.code === permissionCode && action.access)) {
          return true;
        }
        // Recursively check children
        if (menu.children && findPermission(menu.children)) {
          return true;
        }
      }
      return false;
    };

    return findPermission(permissionsData.data.menus);
  }, [permissionsData, type]);

  return { hasCategoryPermission };
}

