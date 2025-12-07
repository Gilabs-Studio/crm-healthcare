import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onFocus, onKeyDown, ...props }, ref) => {
    // Auto-select all text on focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Only select all if it's not a date, time, color, or file input
      if (type !== "date" && type !== "time" && type !== "color" && type !== "file") {
        e.target.select();
      }
      onFocus?.(e);
    };

    // Prevent non-numeric input for number type
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type === "number") {
        // Allow: backspace, delete, tab, escape, enter, decimal point, and navigation keys
        const allowedKeys = [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          ".",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ];
        
        // Allow Ctrl/Cmd + A, C, V, X, Z
        if (e.ctrlKey || e.metaKey) {
          const allowedCtrlKeys = ["a", "c", "v", "x", "z"];
          if (allowedCtrlKeys.includes(e.key.toLowerCase())) {
            onKeyDown?.(e);
            return;
          }
        }

        // Allow minus sign only if it's at the start (for negative numbers)
        if (e.key === "-" && (e.currentTarget.selectionStart === 0 || e.currentTarget.value === "")) {
          onKeyDown?.(e);
          return;
        }

        // Allow numbers and decimal point
        if (allowedKeys.includes(e.key) || /^[0-9]$/.test(e.key)) {
          onKeyDown?.(e);
          return;
        }

        // Prevent all other keys
        e.preventDefault();
        return;
      }
      onKeyDown?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
