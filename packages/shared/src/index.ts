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

export const metricToneSchema = z.enum(["blue", "teal", "amber", "red", "green", "gray"]);

export const dashboardMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  detail: z.string(),
  tone: metricToneSchema
});

export const workflowStatusSchema = z.object({
  name: z.string(),
  status: z.string(),
  tone: metricToneSchema
});

export const recentRunSchema = z.object({
  id: z.string(),
  module: z.string(),
  workflow: z.string(),
  status: z.string(),
  latencyMs: z.number().nullable(),
  createdAt: z.string().datetime()
});

export const recentAuditLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  module: z.string(),
  entityType: z.string(),
  createdAt: z.string().datetime()
});

export const dashboardSummarySchema = z.object({
  metrics: z.array(dashboardMetricSchema),
  workflowStatus: z.array(workflowStatusSchema),
  recentAiRuns: z.array(recentRunSchema),
  recentAuditLogs: z.array(recentAuditLogSchema)
});

export type MetricTone = z.infer<typeof metricToneSchema>;
export type DashboardMetric = z.infer<typeof dashboardMetricSchema>;
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;
export type RecentRun = z.infer<typeof recentRunSchema>;
export type RecentAuditLog = z.infer<typeof recentAuditLogSchema>;
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>;
