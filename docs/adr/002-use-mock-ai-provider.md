# ADR 002: Use Mock AI by Default

## Status

Accepted

## Context

Reviewers should be able to run the project without creating AI provider accounts or adding API keys.

## Decision

Default local development to `AI_PROVIDER=mock`. Real providers will be added behind the same provider interface.

## Consequences

The app can be tested deterministically, while still leaving room for OpenAI-compatible providers later.
