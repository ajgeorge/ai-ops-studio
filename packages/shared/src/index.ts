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

export const createRequirementProjectRequestSchema = z.object({
  name: z.string().min(2),
  industry: z.string().min(2),
  clientType: z.string().optional(),
  businessDescription: z.string().min(10),
  currentWorkflow: z.string().optional(),
  painPoints: z.string().optional(),
  requiredModules: z.array(z.string()).default([]),
  knownUsers: z.array(z.string()).default([]),
  rawBrief: z.string().min(20),
  deadline: z.string().datetime().optional(),
  budgetRange: z.string().optional(),
  additionalNotes: z.string().optional()
});

export const requirementProjectListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  status: z.string(),
  completionPercentage: z.number(),
  requirementCount: z.number(),
  unansweredQuestionCount: z.number(),
  updatedAt: z.string().datetime()
});

export const requirementRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: z.string(),
  confidence: z.string(),
  source: z.string()
});

export const clarifyingQuestionRecordSchema = z.object({
  id: z.string(),
  category: z.string(),
  question: z.string(),
  answer: z.string().nullable(),
  status: z.string(),
  confidence: z.string()
});

export const requirementFeatureRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  bucket: z.string()
});

export const userStoryRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  role: z.string(),
  goal: z.string(),
  benefit: z.string(),
  priority: z.string(),
  relatedFeature: z.string().nullable(),
  status: z.string(),
  acceptanceCriteria: z.array(z.string())
});

export const dataEntityRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  fields: z.unknown(),
  relationships: z.unknown().nullable(),
  notes: z.string().nullable()
});

export const apiRouteSuggestionRecordSchema = z.object({
  id: z.string(),
  method: z.string(),
  path: z.string(),
  purpose: z.string(),
  requestBody: z.unknown().nullable(),
  responseShape: z.unknown().nullable(),
  permission: z.string().nullable(),
  relatedDataModel: z.string().nullable()
});

export const generatedProposalRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  markdown: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const requirementProjectDetailSchema = requirementProjectListItemSchema.extend({
  clientType: z.string().nullable(),
  budgetRange: z.string().nullable(),
  additionalNotes: z.string().nullable(),
  brief: z
    .object({
      businessDescription: z.string(),
      currentWorkflow: z.string().nullable(),
      painPoints: z.string().nullable(),
      requiredModules: z.array(z.string()),
      knownUsers: z.array(z.string()),
      rawBrief: z.string()
    })
    .nullable(),
  requirements: z.array(requirementRecordSchema),
  clarifyingQuestions: z.array(clarifyingQuestionRecordSchema),
  features: z.array(requirementFeatureRecordSchema),
  userStories: z.array(userStoryRecordSchema),
  dataEntities: z.array(dataEntityRecordSchema),
  apiRouteSuggestions: z.array(apiRouteSuggestionRecordSchema),
  proposals: z.array(generatedProposalRecordSchema)
});

export const analyzeRequirementProjectResponseSchema = z.object({
  project: requirementProjectDetailSchema,
  aiRun: aiDemoRunResponseSchema,
  generated: z.object({
    requirements: z.number(),
    clarifyingQuestions: z.number()
  })
});

export const generateRequirementArtifactsResponseSchema = z.object({
  project: requirementProjectDetailSchema,
  generated: z.object({
    features: z.number(),
    userStories: z.number(),
    dataEntities: z.number(),
    apiRoutes: z.number(),
    proposals: z.number()
  })
});

export const markdownExportResponseSchema = z.object({
  projectId: z.string(),
  filename: z.string(),
  markdown: z.string()
});

export type CreateRequirementProjectRequest = z.infer<
  typeof createRequirementProjectRequestSchema
>;
export type RequirementProjectListItem = z.infer<typeof requirementProjectListItemSchema>;
export type RequirementRecord = z.infer<typeof requirementRecordSchema>;
export type ClarifyingQuestionRecord = z.infer<typeof clarifyingQuestionRecordSchema>;
export type RequirementFeatureRecord = z.infer<typeof requirementFeatureRecordSchema>;
export type UserStoryRecord = z.infer<typeof userStoryRecordSchema>;
export type DataEntityRecord = z.infer<typeof dataEntityRecordSchema>;
export type ApiRouteSuggestionRecord = z.infer<typeof apiRouteSuggestionRecordSchema>;
export type GeneratedProposalRecord = z.infer<typeof generatedProposalRecordSchema>;
export type RequirementProjectDetail = z.infer<typeof requirementProjectDetailSchema>;
export type AnalyzeRequirementProjectResponse = z.infer<
  typeof analyzeRequirementProjectResponseSchema
>;
export type GenerateRequirementArtifactsResponse = z.infer<
  typeof generateRequirementArtifactsResponseSchema
>;
export type MarkdownExportResponse = z.infer<typeof markdownExportResponseSchema>;
