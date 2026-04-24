# Evaluation Strategy

AI Ops Studio uses transparent, deterministic evaluation first so users can inspect how each score was produced.

## RAG Evaluation

The RAG Evaluation Lab scores answers with:

- Citation coverage
- Retrieved context visibility
- Answer completeness
- Faithfulness to supplied chunks
- User feedback

The current mock provider returns deterministic answers and citation mappings, which keeps regression tests stable while the workflow and UI mature.

## Requirements Evaluation

Generated requirements are checked for:

- Structured schema validity
- Coverage across functional, non-functional, integration, data, and security categories
- Presence of clarifying questions
- Risk identification
- Artifact completeness for stories, data model, API suggestions, and proposal drafts

## Operations Evaluation

Technician recommendations are explainable because each score is broken into:

- Skill fit
- Location proximity
- Availability
- Capacity
- Rating
- AI-generated rationale

The assignment workflow requires explicit approval or rejection, which gives reviewers a clean audit trail.

## Future Improvements

- Add golden test cases for RAG answer faithfulness.
- Track prompt version performance over time.
- Compare mock, staging, and real-provider outputs.
- Add human review labels for answer usefulness and operational recommendation quality.
- Export evaluation runs for external review.
