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

export const aiDemoWorkflowSchema = z.enum([
  "requirements.analyzeBrief",
  "operations.explainRecommendation",
  "rag.answerWithContext"
]);

export const aiDemoRunRequestSchema = z.object({
  workflow: aiDemoWorkflowSchema,
  input: z.record(z.unknown()).default({})
});

export const aiDemoRunResponseSchema = z.object({
  runId: z.string().nullable(),
  status: z.enum(["succeeded", "failed", "validation_failed"]),
  provider: z.enum(["mock", "openai"]),
  promptVersion: z.object({
    key: z.string(),
    version: z.number(),
    title: z.string(),
    source: z.enum(["database", "default"])
  }),
  output: z.unknown(),
  latencyMs: z.number(),
  warning: z.string().optional()
});

export type AiDemoWorkflow = z.infer<typeof aiDemoWorkflowSchema>;
export type AiDemoRunRequest = z.infer<typeof aiDemoRunRequestSchema>;
export type AiDemoRunResponse = z.infer<typeof aiDemoRunResponseSchema>;

export const aiRunListItemSchema = z.object({
  id: z.string(),
  module: z.string(),
  workflow: z.string(),
  step: z.string().nullable(),
  provider: z.string(),
  model: z.string().nullable(),
  status: z.string(),
  input: z.unknown(),
  output: z.unknown().nullable(),
  validationErrors: z.unknown().nullable(),
  latencyMs: z.number().nullable(),
  tokenUsage: z.unknown().nullable(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  promptVersion: z
    .object({
      key: z.string(),
      version: z.number(),
      title: z.string()
    })
    .nullable()
});

export const promptVersionSummarySchema = z.object({
  id: z.string(),
  key: z.string(),
  version: z.number(),
  module: z.string(),
  title: z.string(),
  template: z.string(),
  status: z.string(),
  notes: z.string().nullable(),
  metadata: z.unknown().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const auditLogItemSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  action: z.string(),
  module: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  metadata: z.unknown().nullable(),
  createdAt: z.string().datetime()
});

export type AiRunListItem = z.infer<typeof aiRunListItemSchema>;
export type PromptVersionSummary = z.infer<typeof promptVersionSummarySchema>;
export type AuditLogItem = z.infer<typeof auditLogItemSchema>;
