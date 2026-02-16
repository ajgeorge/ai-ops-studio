import { z } from "zod";

export const APP_MODULES = [
  "dashboard",
  "requirements",
  "operations",
  "rag",
  "ai-control-center",
  "audit-logs"
] as const;

export type AppModule = (typeof APP_MODULES)[number];

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  version: z.string(),
  timestamp: z.string().datetime(),
  modules: z.array(z.enum(APP_MODULES))
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const statusSchema = z.enum([
  "draft",
  "active",
  "pending",
  "processing",
  "completed",
  "warning",
  "failed"
]);

export type Status = z.infer<typeof statusSchema>;
