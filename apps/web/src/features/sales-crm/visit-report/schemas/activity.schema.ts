import { z } from "zod";

export const createActivitySchema = z.object({
  type: z.enum(["visit", "call", "email", "task", "deal"], {
    errorMap: () => ({ message: "Invalid activity type" }),
  }),
  account_id: z.string().uuid("Invalid account ID").optional(),
  contact_id: z.string().uuid("Invalid contact ID").optional(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  timestamp: z.string().refine(
    (val) => {
      // Validate ISO 8601 datetime format (RFC3339)
      const date = new Date(val);
      return !isNaN(date.getTime()) && val.includes("T");
    },
    { message: "Invalid timestamp format (must be ISO 8601 datetime)" }
  ),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateActivityFormData = z.infer<typeof createActivitySchema>;

