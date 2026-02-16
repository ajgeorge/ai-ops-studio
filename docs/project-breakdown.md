# AI Ops Studio: Detailed Project Specification and Build Plan

## 1. Executive Summary

**AI Ops Studio** is a full-stack portfolio project designed to show that you can build practical AI systems inside real business software.

It is not a chatbot clone. It is not a simple OpenAI wrapper. It is a production-style internal platform that demonstrates how AI can be used for:

1. Requirements generation
2. Operations decision support
3. RAG-based document question answering
4. AI output evaluation
5. Human approval flows
6. Audit logging
7. Prompt versioning
8. Structured output validation
9. Full-stack product engineering

The project should be built as one coherent application with multiple modules, rather than several unrelated apps.

## 2. One-Line Pitch

> AI Ops Studio is a full-stack AI workflow platform for requirements generation, operations decision support, and RAG evaluation.

## 3. Better Human Explanation

AI Ops Studio is a case-study platform that demonstrates how AI can be applied to real internal business workflows.

The app has three major AI modules:

1. **Requirements Engine**  
   Converts rough client briefs into structured requirements, MVP scope, user stories, data models, API route suggestions, and proposal documents.

2. **Operations Copilot**  
   Helps an admin understand jobs, technicians, delays, workload, SLA risks, and assignment recommendations using backend data.

3. **RAG Evaluation Lab**  
   Allows users to upload documents, ask questions, inspect retrieved chunks, and evaluate answer quality.

The overall story is:

> I build AI-enabled internal tools with real architecture, data models, validation, auditability, and deployment, not just basic AI demos.

## 4. Why This Project Fits Your Profile

This project matches a profile built around:

- Full-stack software engineering
- Internal operations tools
- Real-time service workflows
- React dashboards
- Node.js APIs
- Flutter/mobile experience
- Docker and CI/CD
- Cloud deployment
- Testing
- LLM workflow automation
- Business process digitization

The project lets you publicly demonstrate patterns from private production work without exposing private company code.

## 5. Portfolio Positioning

Use this wording in your GitHub profile, README, or interviews:

> Most of my production work is in private repositories, so I built AI Ops Studio as a public case-study project to demonstrate how I approach AI-powered internal tools, workflow automation, structured outputs, human approval, evaluation, and deployment.

Avoid positioning it as:

- An enterprise product used by real clients
- A production system for a real company
- A full commercial SaaS
- A finished AI platform

Position it as:

- A public case-study project
- A production-inspired AI workflow platform
- A practical full-stack AI engineering demo
- A realistic internal tools architecture

## 6. What This Project Should Prove

By the time the project is complete, it should prove that you can build:

- AI workflows
- Structured LLM outputs
- Tool-calling style backend functions
- Human approval flows
- Audit logs
- Prompt versioning
- RAG pipelines
- Evaluation dashboards
- Full-stack dashboards
- Real database-backed applications
- Background jobs
- File upload and processing
- Testing
- Dockerized local development
- CI/CD
- Deployment documentation
- Clean technical documentation

The important thing is not just that the app uses AI. The important thing is that it treats AI as part of a real software system.

## 7. High-Level Product Architecture

```txt
User
 |
React Frontend
 |
RTK Query
 |
Express API
 |
 +-- Requirements Module
 +-- Operations Module
 +-- RAG Module
 +-- AI Orchestration Layer
 +-- Audit Layer
 |
PostgreSQL
Redis / BullMQ
Object Storage
 |
AI Provider
Mock Provider / OpenAI-Compatible Provider
```

## 8. Recommended Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- RTK Query
- React Hook Form
- Zod
- Recharts
- React Router

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Zod
- Jest
- Supertest

### AI Layer

- OpenAI-compatible provider abstraction
- Mock AI provider for demo mode
- Structured JSON outputs
- Prompt versioning
- AI run logging
- RAG pipeline
- Basic evaluation scoring
- Optional future LangGraph-style orchestration

### DevOps

- Docker Compose
- GitHub Actions
- `.env.example`
- Seed script
- Health check endpoint
- Deployment docs
- README screenshots
- Demo video

## 9. Repository Structure

```txt
ai-ops-studio/
|
|-- apps/
|   |-- web/
|   |   |-- src/
|   |   |   |-- app/
|   |   |   |-- components/
|   |   |   |-- features/
|   |   |   |   |-- requirements/
|   |   |   |   |-- operations/
|   |   |   |   |-- rag/
|   |   |   |   |-- ai-control-center/
|   |   |   |-- services/
|   |   |   |-- store/
|   |   |   |-- lib/
|   |   |-- package.json
|   |
|   |-- api/
|       |-- src/
|       |   |-- modules/
|       |   |   |-- requirements/
|       |   |   |-- operations/
|       |   |   |-- rag/
|       |   |   |-- ai/
|       |   |   |-- audit/
|       |   |   |-- auth/
|       |   |-- db/
|       |   |-- jobs/
|       |   |-- middleware/
|       |   |-- tests/
|       |   |-- server.ts
|       |-- package.json
|
|-- packages/
|   |-- shared/
|       |-- src/
|       |   |-- schemas/
|       |   |-- types/
|       |   |-- constants/
|       |-- package.json
|
|-- docs/
|   |-- architecture.md
|   |-- ai-workflows.md
|   |-- database-schema.md
|   |-- evaluation-strategy.md
|   |-- deployment.md
|   |-- adr/
|       |-- 001-use-postgresql.md
|       |-- 002-use-ai-provider-abstraction.md
|       |-- 003-use-structured-output-validation.md
|       |-- 004-require-human-approval-for-ai-actions.md
|       |-- 005-store-ai-run-history.md
|
|-- prisma/
|   |-- schema.prisma
|   |-- seed.ts
|
|-- docker-compose.yml
|-- .env.example
|-- README.md
|-- package.json
```

## 10. Main Navigation

The frontend should feel like a polished internal SaaS dashboard.

Main navigation:

- Dashboard
- Requirements Engine
- Operations Copilot
- RAG Evaluation Lab
- AI Control Center
- Audit Logs
- Settings

## 11. Dashboard Homepage

The dashboard should show a quick overview of the whole system.

### Metric Cards

- Total projects analyzed
- Requirements generated
- Operations recommendations made
- RAG questions answered
- AI runs this week
- Average response latency
- Failed AI runs
- Pending approvals

### Tables

- Recent AI runs
- Recent audit logs
- Pending approvals
- Failed AI workflows

### Charts

- AI runs by module
- Average latency over time
- RAG evaluation scores
- Operations jobs by status

---

# Module 1: Requirements Engine

## 12. Module Purpose

The Requirements Engine converts a rough client brief into structured product planning material.

Example input:

```txt
We need a garage management system for jobs, customers, vehicles, inventory, staff, payments, credit customers, reports, and multiple departments like wash, detailing, repairs, and wrapping.
```

The system generates:

- Business summary
- Problem statement
- User roles
- MVP scope
- Future features
- Functional requirements
- Non-functional requirements
- User stories
- Database entities
- API route suggestions
- Risks
- Assumptions
- Clarifying questions
- Proposal document

## 13. Why This Module Matters

This module shows that you can use AI for structured business automation.

It is stronger than a chatbot because it has:

- Multiple workflow steps
- Structured output
- Validation
- Stored project data
- Editable generated sections
- Exportable proposals
- Prompt run history

## 14. Requirements Engine User Flow

```txt
1. User creates a new project.
2. User enters a rough client brief.
3. System analyzes the brief.
4. AI extracts known requirements.
5. AI identifies missing information.
6. System asks follow-up questions.
7. User answers or skips questions.
8. AI generates MVP scope.
9. AI separates future features.
10. AI generates user stories.
11. AI suggests data entities and API routes.
12. User edits sections manually.
13. User exports the final proposal.
```

## 15. Requirements Engine Screens

```txt
/requirements
/requirements/new
/requirements/:projectId/brief
/requirements/:projectId/questions
/requirements/:projectId/scope
/requirements/:projectId/user-stories
/requirements/:projectId/data-model
/requirements/:projectId/api-routes
/requirements/:projectId/proposal
/requirements/:projectId/ai-runs
```

## 16. Requirements Dashboard

Shows all generated projects.

### Project Cards

Each project card should show:

- Project name
- Industry
- Status
- Last AI run
- Completion percentage
- Number of requirements
- Number of unanswered questions
- Last updated date

### Filters

- Draft
- Analyzed
- Needs clarification
- Proposal ready
- Archived

## 17. New Project Page

Fields:

- Project name
- Industry
- Client type
- Business description
- Current workflow
- Pain points
- Required modules
- Known users
- Deadline
- Budget range
- Additional notes

Main button:

```txt
Analyze Brief
```

## 18. Brief Analysis Page

After the user submits the brief, show:

- Business domain
- Main problem
- Target users
- Core workflows
- Important entities
- Possible missing information

Each extracted item should include a confidence level:

- High confidence
- Medium confidence
- Low confidence
- Needs user confirmation

This makes the AI behavior feel more trustworthy and realistic.

## 19. Clarifying Questions Page

AI generates questions grouped by category.

Categories:

- Business model
- User roles
- Permissions
- Workflow rules
- Payments
- Reports
- Inventory
- Notifications
- Integrations
- Deployment

Example questions:

- Should each department have separate pricing and staff?
- Can one job move between departments?
- Do credit customers have payment limits?
- Should inventory be deducted automatically when a job is completed?
- Who can approve discounts?
- Should customer payments be tracked inside the system or handled externally?
- Do managers need department-specific reporting?

User actions:

- Answer
- Skip
- Mark as not relevant
- Regenerate questions

## 20. Scope Page

Split the generated scope into:

- MVP requirements
- Future features
- Out of scope
- Assumptions
- Risks

Example output:

```txt
MVP:
- Customer and vehicle management
- Job creation and tracking
- Department-based workflows
- Staff assignment
- Basic inventory tracking
- Revenue dashboard

Future:
- Customer mobile app
- Advanced accounting integration
- AI job estimation
- WhatsApp notifications
- Multi-branch support
```

This section is important because it shows product thinking, not just AI generation.

## 21. User Stories Page

Generate user stories like:

```txt
As an admin, I want to create a new job so that I can track work from intake to completion.

As a technician, I want to view assigned jobs so that I know what work I need to complete.

As an accountant, I want to view unpaid credit invoices so that I can follow up with customers.
```

Each user story should include:

- Title
- Role
- Goal
- Acceptance criteria
- Priority
- Related feature
- Status

Example structure:

```json
{
  "title": "Create a new job",
  "role": "Admin",
  "goal": "create and assign a job",
  "benefit": "work can be tracked from intake to completion",
  "priority": "must_have",
  "acceptanceCriteria": [
    "Admin can select a customer and vehicle",
    "Admin can assign a department",
    "Admin can set job priority",
    "System creates a job status history entry"
  ]
}
```

## 22. Data Model Page

AI suggests entities such as:

- Customer
- Vehicle
- Job
- Department
- Service
- Staff
- InventoryItem
- Invoice
- Payment
- CreditAccount
- JobStatusHistory

Each entity should show:

- Fields
- Relationships
- Notes
- Potential indexes

Example:

```txt
Job
- id
- customerId
- vehicleId
- departmentId
- assignedStaffId
- status
- priority
- estimatedCost
- finalCost
- createdAt
- completedAt
```

## 23. API Route Suggestions Page

Example output:

```txt
POST /api/jobs
GET /api/jobs
GET /api/jobs/:id
PATCH /api/jobs/:id/status
POST /api/jobs/:id/assign
GET /api/customers/:id/jobs
GET /api/reports/revenue
```

Each suggested route should show:

- Method
- Path
- Purpose
- Request body
- Response shape
- Permission required
- Related data model

## 24. Proposal Page

Generate a polished proposal with:

- Executive summary
- Objectives
- Requirements scope
- MVP features
- Future features
- Timeline estimate
- Assumptions
- Exclusions
- Recommended technical architecture
- Next steps

Export options:

- Export Markdown
- Export PDF
- Copy to clipboard

## 25. Requirements Engine AI Workflow

Do not use one giant prompt. Use a staged workflow.

```txt
AnalyzeBriefWorkflow
|
|-- Step 1: classifyProjectDomain()
|-- Step 2: extractKnownRequirements()
|-- Step 3: identifyMissingInformation()
|-- Step 4: generateClarifyingQuestions()
|-- Step 5: generateMvpScope()
|-- Step 6: generateFutureFeatures()
|-- Step 7: generateUserStories()
|-- Step 8: suggestDataModel()
|-- Step 9: suggestApiRoutes()
|-- Step 10: generateProposal()
|-- Step 11: validateAndSaveOutput()
```

Each step should save an `AIRun`.

## 26. Requirements Engine Data Models

- Project
- ClientBrief
- ClarifyingQuestion
- Requirement
- Feature
- UserStory
- DataEntity
- ApiRouteSuggestion
- GeneratedProposal
- PromptRun
- PromptVersion
- AIValidationError

## 27. Example Requirement Schema

```ts
const RequirementSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: z.enum([
    "user_management",
    "workflow",
    "reporting",
    "payments",
    "inventory",
    "notifications",
    "integration",
    "security",
    "other",
  ]),
  priority: z.enum(["must_have", "should_have", "could_have"]),
  confidence: z.enum(["high", "medium", "low"]),
  source: z.enum(["user_provided", "ai_inferred"]),
});
```

## 28. Requirements Engine API Endpoints

```txt
POST   /api/requirements/projects
GET    /api/requirements/projects
GET    /api/requirements/projects/:id
PATCH  /api/requirements/projects/:id

POST   /api/requirements/projects/:id/brief
POST   /api/requirements/projects/:id/analyze
POST   /api/requirements/projects/:id/generate-questions
POST   /api/requirements/projects/:id/generate-scope
POST   /api/requirements/projects/:id/generate-user-stories
POST   /api/requirements/projects/:id/generate-data-model
POST   /api/requirements/projects/:id/generate-api-routes
POST   /api/requirements/projects/:id/generate-proposal

GET    /api/requirements/projects/:id/export/markdown
GET    /api/requirements/projects/:id/export/pdf
GET    /api/requirements/projects/:id/ai-runs
```

## 29. Requirements Engine Definition of Done

This module is done when:

- User can create a project
- User can submit a client brief
- AI can analyze the brief
- AI can generate clarifying questions
- AI can generate MVP and future scope
- AI can generate user stories
- AI can suggest data entities
- AI can suggest API routes
- AI can generate a proposal
- User can edit generated output
- User can export a proposal
- AI runs are logged
- Invalid AI output is handled
- At least 3 sample projects are seeded

---

# Module 2: Operations Copilot

## 30. Module Purpose

The Operations Copilot simulates an operations dashboard for a field service, garage, roadside assistance, or technician-based business.

The AI copilot helps an admin answer operational questions using actual backend data.

Example questions:

- Which jobs are delayed today?
- Which technician is overloaded?
- Who should handle this battery replacement job?
- Which customers have waited more than 30 minutes?
- Generate today’s operations report.
- What are the SLA risks right now?

## 31. Why This Module Matters

This module shows:

- Backend tool-calling
- Operational decision support
- Business dashboards
- Human approval
- Audit logs
- Realtime-ish workflows
- Data-driven recommendations
- Deterministic logic plus AI explanation

It is one of the strongest modules because it shows AI being used in a real business workflow.

## 32. Operations Screens

```txt
/ops/dashboard
/ops/jobs
/ops/jobs/:jobId
/ops/technicians
/ops/copilot
/ops/reports
/ops/audit-log
```

## 33. Fake Company Context

Use a fake company for demo data:

```txt
Company: Doha Rapid Assist
Industry: Roadside assistance and field service operations
Location: Doha, Qatar
```

The company handles:

- Battery replacement
- Flat tire support
- Towing
- Fuel delivery
- Lockout support
- Minor mechanical issues

## 34. Operations Seed Data

Seed the database with:

- 8 technicians
- 50 jobs
- 12 active jobs
- 10 delayed jobs
- 30 completed jobs
- 5 service types
- 100 job events
- 40 location pings

Technicians:

- Omar Hassan
- Daniel Reyes
- Ahmed Khan
- Faris Ali
- Jason Miller
- Karim Nasser
- Samuel Thomas
- Bilal Rahman

Service types:

- Battery replacement
- Tire change
- Towing
- Fuel delivery
- Vehicle lockout
- Minor mechanical issue

Technician skills:

- Battery
- Tire
- Towing
- Mechanical
- Electrical
- Diagnostics

Job statuses:

- pending
- assigned
- accepted
- en_route
- arrived
- in_progress
- completed
- cancelled
- delayed

## 35. Operations Data Models

- Customer
- Vehicle
- Technician
- ServiceType
- Job
- JobEvent
- LocationPing
- Assignment
- AIRecommendation
- AIAuditLog
- DailyOpsReport

## 36. Operations Dashboard

Metric cards:

- Active jobs
- Delayed jobs
- Available technicians
- Average response time
- SLA breaches
- Pending AI recommendations
- Jobs completed today

Charts:

- Jobs by status
- Jobs by service type
- Technician workload
- Response time trend

Tables:

- Delayed jobs
- Technician availability
- Recent job events
- Pending AI recommendations

## 37. Jobs Page

Columns:

- Job ID
- Customer
- Service type
- Location
- Status
- Assigned technician
- Created time
- SLA deadline
- Delay risk
- Actions

Actions:

- View job
- Recommend technician
- Assign manually
- Mark delayed
- Complete job

## 38. Technician Page

Fields:

- Name
- Skills
- Status
- Current job count
- Completed jobs today
- Average completion time
- Last known location
- Availability

Statuses:

- available
- busy
- offline
- on_break

## 39. Copilot Page

This is the key screen.

Layout:

```txt
Left side:
- Chat interface

Right side:
- Tool calls made
- Data used
- Recommendation
- Confidence
- Approval action
```

Example interaction:

User:

```txt
Who should handle job JOB-1042?
```

System tool calls:

```txt
getJobById("JOB-1042")
getAvailableTechnicians()
getTechnicianWorkload()
calculateDistanceToJob()
getTechnicianSkillMatch()
```

AI response:

```txt
Recommended technician: Omar Hassan

Reason:
Omar is available, has battery replacement experience, is 3.1km away from the customer, and currently has no active jobs. Assigning him gives the fastest estimated response time and avoids overloading the other nearby technician.

Confidence: High
```

Buttons:

- Approve assignment
- Reject
- Edit manually
- Regenerate

## 40. Recommendation Scoring

Do not let the AI randomly choose technicians.

Use deterministic scoring first.

Example formula:

```txt
score =
  skillMatch * 0.35 +
  availability * 0.25 +
  distanceScore * 0.20 +
  workloadScore * 0.15 +
  slaUrgency * 0.05
```

The backend calculates the recommendation. The AI explains the decision in natural language.

This gives you a strong interview point:

> I did not let the LLM directly control assignment. I used deterministic scoring for the actual recommendation and used the model to explain the decision, generate summaries, and flag risks.

## 41. Operations AI Tools

Implement backend functions like:

```ts
getActiveJobs()
getDelayedJobs()
getJobById(jobId)
getAvailableTechnicians()
getTechnicianWorkload()
getTechnicianSkillMatch(serviceType)
getNearbyTechnicians(location)
calculateSlaRisk(jobId)
recommendTechnician(jobId)
generateDailyOpsReport()
```

The AI should only answer using tool results.

## 42. Human Approval Flow

For any action that changes system state, require approval.

AI can suggest:

- Assign Omar to JOB-1042
- Mark JOB-1039 as SLA risk
- Escalate delayed jobs
- Generate daily report

But the admin must approve.

Flow:

```txt
AI suggests
Human reviews
Human approves or rejects
System executes approved action
Audit log records the decision
```

## 43. Daily Report Generator

Generate a daily operations report.

Example output:

```txt
Operations Summary - 22 May 2026

Total jobs: 47
Completed: 31
Delayed: 8
Cancelled: 3
Average response time: 24 minutes
Top issue: Battery replacement
Technician utilization: 72%

Key risks:
- 4 jobs exceeded SLA
- 2 technicians had unusually high workload
- Tire-related jobs increased by 18%

Recommended actions:
- Add one backup technician during evening shift
- Review delay reasons for towing jobs
```

Save the report to the database and allow export as Markdown or PDF.

## 44. Operations API Endpoints

```txt
GET    /api/ops/dashboard
GET    /api/ops/jobs
GET    /api/ops/jobs/:id
GET    /api/ops/jobs/delayed
GET    /api/ops/technicians
GET    /api/ops/technicians/workload

POST   /api/ops/jobs/:id/recommend-technician
POST   /api/ops/jobs/:id/approve-assignment
POST   /api/ops/copilot/query
POST   /api/ops/reports/daily
GET    /api/ops/reports
GET    /api/ops/audit-log
```

## 45. Operations Definition of Done

This module is done when:

- Jobs and technicians are seeded
- Dashboard shows live-looking operational data
- User can view jobs
- User can view technicians
- User can ask copilot operational questions
- Backend tools are called
- Technician recommendation works
- AI explains recommendation
- User can approve or reject recommendation
- Audit log records the action
- Daily report can be generated
- At least 3 operations-related tests exist

---

# Module 3: RAG Evaluation Lab

## 46. Module Purpose

The RAG Evaluation Lab allows users to upload documents, ask questions, inspect retrieved chunks, and evaluate answer quality.

This module proves that you understand AI reliability, not just prompting.

## 47. Why This Module Matters

Most portfolio projects stop at:

```txt
Upload PDF
Ask question
Get AI answer
```

This module goes further by showing:

- Retrieved chunks
- Citations
- Prompt versions
- Evaluation metrics
- Failed queries
- Test cases
- Manual ratings
- Quality tracking over time

This makes the project feel more serious.

## 48. RAG Screens

```txt
/rag/documents
/rag/documents/upload
/rag/documents/:documentId
/rag/ask
/rag/evaluations
/rag/test-cases
/rag/prompt-versions
```

## 49. RAG User Flow

```txt
1. User uploads a document.
2. System extracts text.
3. System chunks the document.
4. System stores chunks.
5. User asks a question.
6. System retrieves relevant chunks.
7. AI generates an answer using retrieved context.
8. UI shows answer plus citations.
9. UI shows retrieved chunks.
10. User runs evaluation.
11. System shows quality metrics.
```

## 50. RAG Sample Documents

Create fake documents such as:

- Roadside assistance SLA policy
- Technician dispatch SOP
- Customer escalation policy
- Garage service workflow
- Inventory usage guide
- Example technical proposal

Do not use real private company documents.

## 51. RAG Data Models

- Document
- DocumentChunk
- Question
- Answer
- RetrievedContext
- EvaluationRun
- EvaluationMetric
- PromptVersion
- TestCase

## 52. Document Table Fields

- id
- title
- fileName
- fileType
- source
- status
- uploadedAt
- processedAt
- chunkCount

## 53. Chunk Table Fields

- id
- documentId
- chunkIndex
- content
- tokenCount
- metadata
- embedding
- createdAt

For the MVP, you can use simple keyword or basic vector retrieval. Later, upgrade to `pgvector`.

## 54. Ask Page

User asks:

```txt
What is the escalation process for delayed jobs?
```

System shows:

- Answer
- Citations
- Retrieved chunks
- Confidence
- Prompt version
- Latency
- Token estimate
- Evaluation button

## 55. RAG Evaluation Metrics

Start simple.

Track:

- Answer relevance
- Context relevance
- Citation coverage
- Hallucination risk
- User rating
- Latency
- Token cost

Later, add:

- Faithfulness
- Context precision
- Context recall
- Answer similarity
- Answer correctness

## 56. Evaluation Dashboard

Show:

- Total questions tested
- Average answer relevance
- Average context relevance
- Average hallucination risk
- Worst-performing questions
- Best-performing prompt version
- Average latency
- Average cost

Charts:

- Score by prompt version
- Score by document
- Latency over time
- Failed queries by category

## 57. Test Cases

Each test case has:

- Question
- Expected answer
- Relevant document
- Expected source section
- Difficulty
- Category

Example:

```txt
Question:
When should a delayed roadside job be escalated?

Expected answer:
A job should be escalated when it exceeds the SLA threshold, the technician is unavailable, or the customer has waited beyond the allowed time.

Category:
Operations policy
```

## 58. RAG API Endpoints

```txt
POST   /api/rag/documents
GET    /api/rag/documents
GET    /api/rag/documents/:id
POST   /api/rag/documents/:id/process

POST   /api/rag/ask
POST   /api/rag/evaluate
GET    /api/rag/evaluations
POST   /api/rag/test-cases
GET    /api/rag/test-cases
GET    /api/rag/prompt-versions
```

## 59. RAG Definition of Done

This module is done when:

- User can upload or select a sample document
- Document text can be processed
- Document is chunked
- User can ask a question
- System retrieves chunks
- AI answers using context
- UI shows retrieved chunks
- UI shows citations
- Evaluation metrics are saved
- Test cases can be created
- At least 2 RAG tests exist

---

# Module 4: AI Control Center

## 60. Module Purpose

The AI Control Center is a centralized area for inspecting and managing AI behavior.

Most portfolio AI apps skip this. You should include it because it makes the project feel production-aware.

## 61. AI Control Center Screens

```txt
/ai/runs
/ai/runs/:runId
/ai/prompts
/ai/prompts/:promptId
/ai/evaluations
/ai/settings
```

## 62. AI Runs Page

Every AI call in the system should be logged.

Show:

- Run ID
- Module
- Workflow name
- Prompt version
- Provider
- Model
- Status
- Latency
- Input tokens
- Output tokens
- Cost estimate
- Created at

Click into a run to see:

- Input
- Prompt
- Output
- Parsed JSON
- Validation result
- Error logs

## 63. Prompt Versions Page

Show prompt templates:

- requirements-extraction-v1
- scope-generation-v1
- user-story-generation-v1
- data-model-suggestion-v1
- technician-recommendation-explainer-v1
- daily-ops-report-v1
- rag-answer-v1
- rag-evaluation-v1

Each prompt version has:

- Name
- Version
- Module
- Template
- JSON schema
- Active/inactive
- Created at

## 64. Why This Matters

In interviews, you can say:

> I treated prompts like application logic. I versioned them, logged each run, validated outputs, and kept a history so failures could be debugged.

This sounds much more mature than:

> I used the ChatGPT API.

## 65. AI Control Center Definition of Done

This module is done when:

- All AI calls are logged
- User can view AI run history
- User can inspect input and output
- User can see validation failures
- User can view prompt versions
- User can see which module triggered the run
- Failed AI runs are visible on the dashboard

---

# Shared System Design

## 66. Shared Database Models

### Shared Models

- User
- Organization
- AuditLog
- AIRun
- PromptVersion
- AIValidationError

### Requirements Models

- Project
- ClientBrief
- ClarifyingQuestion
- Requirement
- Feature
- UserStory
- DataEntity
- ApiRouteSuggestion
- GeneratedProposal

### Operations Models

- Customer
- Vehicle
- Technician
- ServiceType
- Job
- JobEvent
- LocationPing
- Assignment
- AIRecommendation
- DailyOpsReport

### RAG Models

- Document
- DocumentChunk
- Question
- Answer
- RetrievedContext
- EvaluationRun
- EvaluationMetric
- TestCase

## 67. Example Prisma Model: AIRun

```prisma
model AIRun {
  id              String   @id @default(cuid())
  module          String
  workflowName    String
  promptVersionId String?
  provider        String
  model           String?
  inputJson       Json
  outputJson      Json?
  rawOutput       String?
  status          String
  latencyMs       Int?
  inputTokens     Int?
  outputTokens    Int?
  costEstimate    Float?
  errorMessage    String?
  createdAt       DateTime @default(now())

  promptVersion   PromptVersion? @relation(fields: [promptVersionId], references: [id])
}
```

## 68. Example Prisma Model: PromptVersion

```prisma
model PromptVersion {
  id          String   @id @default(cuid())
  name        String
  version     Int
  module      String
  template    String
  schemaJson  Json?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  aiRuns      AIRun[]
}
```

## 69. Example Prisma Model: Job

```prisma
model Job {
  id              String   @id @default(cuid())
  customerId      String
  vehicleId       String?
  serviceTypeId   String
  assignedTechId  String?
  status          String
  priority        String
  locationLat     Float
  locationLng     Float
  slaDeadline     DateTime
  createdAt       DateTime @default(now())
  completedAt     DateTime?

  customer        Customer @relation(fields: [customerId], references: [id])
}
```

## 70. Global API Endpoints

```txt
GET    /api/health
GET    /api/dashboard/summary
GET    /api/audit-logs
GET    /api/audit-logs/:id

GET    /api/ai/runs
GET    /api/ai/runs/:id
GET    /api/ai/prompts
POST   /api/ai/prompts
PATCH  /api/ai/prompts/:id
```

## 71. AI Provider Abstraction

Create a provider interface.

```ts
export interface AIProvider {
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
  generateStructured<T>(input: GenerateStructuredInput<T>): Promise<T>;
}
```

Providers:

- MockAIProvider
- OpenAIProvider

## 72. Why the Mock Provider Matters

The app should run without API keys.

That means someone can clone the repo and test it immediately.

Use:

```txt
AI_PROVIDER=mock
```

The mock provider should return realistic canned responses.

This is a major portfolio quality boost because it removes friction for reviewers.

## 73. Environment Variables

Example `.env.example`:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_ops_studio
REDIS_URL=redis://localhost:6379

AI_PROVIDER=mock
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

APP_URL=http://localhost:5173
API_URL=http://localhost:3000
```

## 74. Background Jobs

Use BullMQ for heavier tasks:

- Document processing
- RAG chunking
- Proposal PDF generation
- Daily report generation
- Evaluation batch runs

Queues:

- document-processing-queue
- proposal-export-queue
- evaluation-queue
- daily-report-queue

You do not need to overbuild this. Having one or two real background jobs is enough for the portfolio version.

## 75. Audit Logging

Log important events:

- Project created
- Requirements generated
- Proposal exported
- AI recommendation created
- Assignment approved
- Assignment rejected
- RAG question answered
- Evaluation run completed
- AI output validation failed

Audit log fields:

- id
- actorId
- action
- module
- entityType
- entityId
- metadata
- createdAt

## 76. Human-in-the-Loop Pattern

For sensitive actions, follow this pattern:

```txt
AI suggests
Human reviews
Human approves or rejects
System executes approved action
Audit log records it
```

Use this for:

- Technician assignment
- Escalating delayed jobs
- Exporting final proposal
- Accepting generated requirements
- Marking RAG answer as approved

This shows mature AI product thinking.

---

# UI Design Direction

## 77. Visual Style

Make it look like a premium internal tool.

Suggested style:

- Dark sidebar
- White or soft grey content area
- Clean cards
- Status pills
- Tables
- Command-bar style AI input
- Timeline components
- Charts
- Drawer panels
- Approval modals
- Subtle borders
- Good spacing

## 78. Key UI Components

Build reusable components:

- MetricCard
- StatusPill
- DataTable
- AIPromptBox
- AIRunTimeline
- ApprovalModal
- ChunkViewer
- ConfidenceBadge
- WorkflowStepper
- AuditLogTable
- PromptVersionBadge
- EmptyState
- ErrorState

## 79. Status Colors

Keep status colors simple:

- Green: completed or healthy
- Yellow: pending or warning
- Red: delayed or failed
- Blue: active or processing
- Grey: draft or inactive

## 80. Dashboard UX Principle

Every AI output should show:

- What was generated
- What data was used
- Whether it passed validation
- Whether human approval is required
- What happened after approval or rejection

This makes the app feel controlled, not magical.

---

# Testing Strategy

## 81. Minimum Test Suite

Include at least these tests:

1. API health check
2. Project creation
3. Requirement schema validation
4. Malformed AI output handling
5. Technician recommendation scoring
6. Assignment approval flow
7. Document chunking
8. RAG answer creation with mock provider
9. AI run logging
10. Audit log creation

## 82. Best Tests to Include

The strongest tests are:

- Recommendation scoring test
- Structured AI output validation test
- RAG chunking test
- Human approval flow test
- AI run logging test

These show actual business logic, not just route testing.

## 83. Example Test Names

```txt
should_create_project_from_valid_payload
should_reject_invalid_requirement_output
should_log_failed_ai_run_when_schema_validation_fails
should_rank_available_technicians_by_skill_distance_and_workload
should_create_audit_log_when_assignment_is_approved
should_chunk_document_into_searchable_sections
should_return_mock_rag_answer_with_retrieved_context
```

---

# Seed Data Plan

## 84. Requirements Seed Projects

Create sample projects:

1. Garage Management System
2. Warehouse Operations Platform
3. Roadside Assistance Dispatch System
4. Clinic Appointment Management System

Each should have:

- Brief
- Extracted requirements
- Clarifying questions
- MVP scope
- Future features
- User stories
- Proposal

## 85. Operations Seed Data

Company:

```txt
Doha Rapid Assist
```

Technicians:

- Omar Hassan
- Daniel Reyes
- Ahmed Khan
- Faris Ali
- Jason Miller
- Karim Nasser
- Samuel Thomas
- Bilal Rahman

Service types:

- Battery replacement
- Tire change
- Towing
- Fuel delivery
- Vehicle lockout
- Minor mechanical issue

Jobs:

- 50 historical jobs
- 12 active jobs
- 5 delayed jobs
- 3 high-priority jobs

## 86. RAG Seed Documents

Documents:

- Roadside assistance SLA policy
- Technician dispatch SOP
- Customer escalation policy
- Garage service workflow
- Inventory usage guide

Each document should have 5 to 10 sections so RAG retrieval can look realistic.

---

# Build Roadmap

## 87. Phase 1: Foundation

Build:

- Monorepo setup
- React dashboard shell
- Express API
- PostgreSQL
- Prisma schema
- Shared types package
- Mock AI provider
- Prompt runs table
- Audit logs table
- Seed script

Definition of done:

- Frontend runs
- Backend runs
- Database connects
- Seed data loads
- Dashboard shows basic metrics
- AI run can be created with mock provider

## 88. Phase 2: Requirements Engine

Build:

- Project creation
- Client brief form
- Requirement extraction
- Follow-up questions
- MVP and future scope
- User stories
- Data model suggestions
- API route suggestions
- Proposal export

Definition of done:

- A full project can be created from a brief
- Generated output is saved
- User can edit generated output
- Proposal can be exported
- AI runs are logged

## 89. Phase 3: Operations Copilot

Build:

- Seed jobs and technicians
- Operations dashboard
- Jobs page
- Technician page
- AI copilot query box
- Technician recommendation scoring
- AI recommendation explanation
- Approval and rejection flow
- Audit log integration
- Daily report generation

Definition of done:

- User can ask who should handle a job
- System calculates recommendation
- AI explains recommendation
- User can approve or reject
- Approved action updates job
- Audit log records event

## 90. Phase 4: RAG Evaluation Lab

Build:

- Document upload or sample document selection
- Document processing
- Chunking
- Question answering
- Retrieved context viewer
- Citations
- Basic evaluation scores
- Test cases
- Prompt version comparison

Definition of done:

- User can ask a question against a document
- System retrieves chunks
- System answers with context
- UI shows retrieved chunks
- Evaluation run can be saved

## 91. Phase 5: Polish

Build:

- Charts
- Tests
- Docker Compose
- GitHub Actions
- Screenshots
- README
- Docs
- Deployment
- Demo video

Definition of done:

- Live demo exists
- README is complete
- Tests run in CI
- Docker setup works
- Screenshots are included
- Demo video explains the project

---

# Version Roadmap

## 92. v0.1: Foundation

- Monorepo setup
- Frontend layout
- Backend setup
- Database schema
- Prisma migrations
- Seed data
- Mock AI provider
- AI run logging

## 93. v0.2: Requirements Engine

- Project creation
- Brief input
- Requirement extraction
- Clarifying questions
- MVP and future scope
- Proposal generation

## 94. v0.3: Operations Copilot

- Jobs and technicians
- Operations dashboard
- Technician scoring
- AI recommendation explanation
- Approval flow
- Audit logging

## 95. v0.4: RAG Lab

- Document upload
- Chunking
- Ask question
- Retrieved context viewer
- Basic evaluation metrics

## 96. v0.5: Polish

- Charts
- Tests
- Docker
- CI
- Screenshots
- Docs
- Demo video
- Deployment

## 97. v1.0: Portfolio Ready

- Live demo
- Full README
- Seeded demo account
- Architecture docs
- Known limitations
- Future roadmap

---

# What Counts as Done

## 98. Portfolio-Ready Definition of Done

The project is portfolio-ready when it has:

- A deployed demo
- A clean README
- Screenshots
- A demo video
- Seed data
- Working mock AI mode
- At least 3 meaningful AI workflows
- AI run logging
- Audit logging
- Human approval flow
- RAG chunk viewer
- Evaluation dashboard
- Docker Compose
- GitHub Actions
- 10 to 15 tests
- Architecture docs
- Known limitations section

## 99. What You Can Skip for v1

You can skip:

- Real multi-tenant auth
- Complex role-based permissions
- Payment systems
- Perfect PDF design
- Real-time sockets
- Advanced vector search
- Full Ragas integration
- Enterprise-level security
- Production deployment scaling
- Complex admin settings

Mention these as future improvements.

---

# README Plan

## 100. README Structure

```md
# AI Ops Studio

## Overview

AI Ops Studio is a full-stack case-study platform for building AI-powered internal tools. It demonstrates structured LLM workflows, operational decision support, RAG, evaluation, human approval, audit logging, and production-style deployment.

## Why I Built This

Most of my production work is in private repositories, so I built this public case-study project to demonstrate how I approach AI-enabled business systems.

## Core Modules

### 1. Requirements Engine
### 2. Operations Copilot
### 3. RAG Evaluation Lab
### 4. AI Control Center

## Architecture

## AI Workflow Design

## Database Design

## Screenshots

## Local Setup

## Environment Variables

## Testing

## Deployment

## Known Limitations

## Future Improvements
```

## 101. GitHub Repo Description

Use this:

```txt
Full-stack AI workflow platform built with React, Node.js, PostgreSQL, structured LLM outputs, human approval flows, audit logs, and RAG evaluation.
```

## 102. README Opening Paragraph

```md
AI Ops Studio is a production-inspired case-study platform for building AI-powered internal tools. It demonstrates practical AI workflows across requirements generation, operations decision support, and RAG evaluation, with a focus on structured outputs, human approval, audit logs, prompt versioning, and deployment-ready full-stack architecture.
```

## 103. Known Limitations Section

Include this because real projects acknowledge limitations.

```md
## Known Limitations

- The project uses synthetic data and does not connect to a real operations system.
- Mock AI mode is provided so the app can run without API keys.
- The RAG module starts with simple retrieval and can be extended with pgvector.
- Evaluation metrics are intentionally lightweight in the MVP.
- Authentication and multi-tenant permissions are simplified for portfolio purposes.
- AI recommendations require human approval and are not automatically executed.
```

## 104. Future Improvements Section

```md
## Future Improvements

- Add pgvector-based semantic search.
- Add WebSocket-based live operations updates.
- Add stronger role-based access control.
- Add LangGraph-style orchestration for longer-running workflows.
- Add Ragas integration for deeper evaluation.
- Add advanced PDF proposal styling.
- Add organization-level multi-tenancy.
- Add real deployment observability with logs and metrics.
```

---

# Demo Video Plan

## 105. Demo Video Length

Aim for 3 to 5 minutes.

## 106. Demo Script

```txt
1. Show dashboard.
2. Create a new project brief.
3. Generate requirements and MVP scope.
4. Show AI run logs and structured output validation.
5. Move to operations copilot.
6. Ask who should handle a delayed job.
7. Show backend tool calls and technician recommendation.
8. Approve the recommendation.
9. Show audit log.
10. Move to RAG lab.
11. Ask a question from a policy document.
12. Show retrieved chunks and evaluation score.
13. End with architecture diagram and README.
```

## 107. What to Emphasize in the Demo

Emphasize:

- It is not a chatbot.
- AI outputs are structured.
- AI decisions are logged.
- Human approval is required for actions.
- RAG answers show retrieved context.
- Evaluation is built into the platform.
- It can run in mock AI mode.
- The system has Docker, tests, CI, and docs.

---

# Interview Talking Points

## 108. If Asked What AI Ops Studio Is

Say:

```txt
AI Ops Studio is a public case-study project I built to demonstrate how I approach AI-enabled internal tools. I focused on practical workflows rather than a generic chatbot: structured requirements generation, operations decision support, and RAG evaluation. The important parts are the AI provider abstraction, structured output validation, AI run logging, human approval for sensitive actions, and evaluation of RAG answers.
```

## 109. If Asked Why You Built It

Say:

```txt
Most of my production work is in private company repositories, so I wanted a public project that shows my engineering approach end-to-end. I chose internal operations workflows because they match the kind of systems I have worked on professionally, but I rebuilt everything with synthetic data.
```

## 110. If Asked What the Hardest Part Was

Say:

```txt
The main challenge was designing AI workflows that are useful but controlled. I did not want the model to directly mutate business data, so I separated deterministic backend logic from AI explanation and required human approval for operational actions.
```

## 111. If Asked What You Would Improve

Say:

```txt
I would add stronger evaluation datasets, more detailed role-based permissions, real vector search with pgvector, WebSocket-based live operations updates, and a LangGraph-style orchestration layer for longer-running workflows.
```

## 112. If Asked Why You Used a Mock Provider

Say:

```txt
I wanted reviewers to be able to clone and run the project without needing API keys. The mock provider also made it easier to test the application deterministically.
```

## 113. If Asked How You Prevent Hallucinations

Say:

```txt
I used structured output validation, stored prompt versions, logged AI runs, exposed retrieved context for RAG answers, and required human approval before operational actions were applied.
```

---

# GitHub Workflow

## 114. Suggested Issues

Create GitHub issues like:

- Set up monorepo structure
- Add React dashboard shell
- Add Express API with health check
- Set up Prisma and PostgreSQL
- Add mock AI provider
- Add AI run logging
- Build project intake form
- Add requirements extraction workflow
- Add clarifying questions workflow
- Add proposal generation
- Seed operations data
- Build operations dashboard
- Add technician recommendation scoring
- Add approval flow
- Add audit logs
- Add RAG document upload
- Add document chunking
- Add RAG answer flow
- Add evaluation dashboard
- Add Docker Compose
- Add GitHub Actions
- Add README screenshots
- Record demo video

## 115. Suggested Branches

- `feature/project-setup`
- `feature/ai-provider-abstraction`
- `feature/requirements-engine`
- `feature/operations-dashboard`
- `feature/technician-recommendation`
- `feature/rag-lab`
- `feature/ai-control-center`
- `feature/docker-ci`
- `feature/docs-demo`

## 116. Suggested Commit Messages

- `Initial monorepo setup`
- `Add dashboard layout and navigation`
- `Set up Express API and health check`
- `Add Prisma schema and seed script`
- `Add mock AI provider`
- `Log AI workflow runs`
- `Add project intake form`
- `Implement requirements extraction workflow`
- `Add structured output validation`
- `Generate clarifying questions`
- `Add MVP and future scope generation`
- `Add operations seed data`
- `Build technician workload API`
- `Add technician recommendation scoring`
- `Add approval flow and audit logs`
- `Add document processing workflow`
- `Add RAG question answering flow`
- `Show retrieved chunks in RAG answer view`
- `Add evaluation metrics dashboard`
- `Add Docker Compose setup`
- `Add CI workflow`
- `Document architecture decisions`

---

# Codex Build Prompt

## 117. Master Prompt for Building the Project

Use this prompt with Codex or another coding agent when you are ready to start.

```txt
Build a full-stack project called AI Ops Studio.

AI Ops Studio is a production-inspired case-study platform for AI-powered internal tools. It should demonstrate three main modules:

1. Requirements Engine
- Converts rough client briefs into structured requirements.
- Generates clarifying questions, MVP scope, future features, user stories, data model suggestions, API route suggestions, and a proposal.
- Uses structured JSON output and Zod validation.
- Saves AI runs and prompt versions.

2. Operations Copilot
- Simulates a roadside assistance or field-service operations dashboard.
- Uses synthetic jobs, technicians, customers, service types, and job events.
- Allows an admin to ask operational questions such as delayed jobs, technician workload, SLA risks, and who should handle a job.
- Uses deterministic backend scoring to recommend technicians, then uses AI to explain recommendations.
- Requires human approval before applying operational changes.
- Saves audit logs.

3. RAG Evaluation Lab
- Allows uploading or selecting sample documents.
- Chunks documents and lets users ask questions.
- Shows generated answers, retrieved chunks, citations, prompt versions, latency, and basic evaluation scores.
- Supports test cases and evaluation history.

Use this stack:
- React + Vite + TypeScript for frontend
- Tailwind CSS and shadcn/ui for UI
- Redux Toolkit Query for API calls
- Node.js + Express + TypeScript for backend
- PostgreSQL with Prisma
- Redis and BullMQ for background jobs where useful
- Zod for validation
- Jest and Supertest for tests
- Docker Compose for local development
- GitHub Actions for CI

Important architecture requirements:
- Create an AI provider abstraction with MockAIProvider and OpenAIProvider.
- The app must run without API keys using AI_PROVIDER=mock.
- Every AI call must be logged in an AIRun table.
- Prompt templates must be versioned using a PromptVersion table.
- Important user or AI actions must be stored in an AuditLog table.
- Any AI recommendation that changes operational state must require human approval.
- Use synthetic demo data only. Do not include any private company data.
- Include seed data for requirements projects, operations jobs, technicians, and RAG documents.
- Include a clean README, docs folder, architecture notes, known limitations, and future improvements.

Start by creating the monorepo structure:
apps/web
apps/api
packages/shared
docs
prisma

Then implement the project in phases:
1. Foundation
2. Requirements Engine
3. Operations Copilot
4. RAG Evaluation Lab
5. AI Control Center
6. Tests, Docker, CI, and documentation

Prioritize clean, working code over overengineering. Use mock AI responses first, then make the AI provider replaceable.
```

---

# Final Notes

## 118. The Main Point

The project is not:

```txt
A chatbot
```

The project is:

```txt
A production-style AI workflow platform for business operations.
```

## 119. What Makes It Impressive

The impressive part is that the app:

- Validates AI outputs
- Logs AI calls
- Handles failure
- Separates AI suggestions from approved actions
- Uses real database models
- Has workflows instead of random prompts
- Has evaluation
- Has tests
- Has deployment docs
- Has realistic seed data
- Can run without API keys

## 120. Final GitHub Pinned Description

Use:

```txt
Full-stack AI workflow platform built with React, Node.js, PostgreSQL, structured LLM outputs, human approval flows, audit logs, and RAG evaluation.
```

## 121. Final Portfolio Story

The story you want this project to tell is:

> I can build complete software products, and I know how to apply AI where it actually makes sense.
