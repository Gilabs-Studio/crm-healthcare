"use client";

import { Settings as SettingsIcon } from "lucide-react";
import { SettingsNav } from "./settings-nav";

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your system settings and preferences
        </p>
      </div>
      <SettingsNav />
    </div>
  );
}


