# Database Schema

The Prisma schema models the demo workflows as auditable, AI-assisted business processes.

## Governance

- `AIRun`: Captures provider, prompt, status, validation state, latency, token counts, request/response payloads, and errors.
- `PromptVersion`: Stores active and historical prompt definitions by key and version.
- `AuditLog`: Records user, system, and AI-assisted events across modules.

## Requirements Engine

- `RequirementProject`: Stores the original client brief, analysis status, generated summary, and risk metadata.
- `RequirementQuestion`: Tracks clarifying questions and categories.
- `RequirementItem`: Stores structured functional, non-functional, integration, data, and security requirements.
- `RequirementArtifact`: Stores generated user stories, data models, API suggestions, risk registers, and proposal text.

## Operations Copilot

- `ServiceType`: Defines service categories and required skills.
- `Technician`: Stores availability, skills, location, capacity, and rating.
- `OperationJob`: Represents dispatchable work.
- `TechnicianRecommendation`: Stores scored technician recommendations, AI explanations, and approval status.

## RAG Evaluation Lab

- `RagDocument`: Stores uploaded or pasted source documents.
- `RagChunk`: Stores searchable document chunks.
- `RagAnswer`: Stores generated answers, question text, quality scores, and feedback.
- `RagCitation`: Links answers back to retrieved chunks.
- `RagEvaluationRun`: Stores aggregate evaluation metadata.

## Data Lifecycle Notes

Seed data creates realistic examples for all implemented modules. Production hardening should add migrations, retention policies, and redaction rules for sensitive AI payloads.
