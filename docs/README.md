# Intent Commerce — Specification Documents

This folder contains all specifications for the Intent Commerce platform, written in **Spec-Driven Development (SDD)** style.

## Philosophy

Every feature starts as a spec. No code is written without:
1. A user story with clear acceptance criteria
2. Technical notes and boundaries
3. Assigned owner and dependencies
4. Estimated effort

## Document Structure

```
docs/
├── README.md                 # This file
├── roles.md                  # Detailed role definitions for 5 team members
├── sprints/
│   ├── sprint-0.md           # Week 1: Foundation
│   ├── sprint-1.md           # Weeks 2-4: Core Commerce
│   ├── sprint-2.md           # Weeks 5-7: Conversational AI
│   └── sprint-3.md           # Weeks 8-10: Intelligence & Polish
├── specs/
│   ├── auth-system.md
│   ├── product-catalog.md
│   ├── rag-pipeline.md
│   ├── shopping-agent.md
│   ├── cart-checkout.md
│   ├── vendor-dashboard.md
│   ├── demand-forecasting.md
│   ├── nl-analytics.md
│   └── infrastructure.md
└── architecture/
    ├── data-flow.md
    ├── api-contract.md
    └── security-model.md
```

## Story ID Convention

`[SPRINT]-[PERSON]-[NUMBER]`

- **Sprint**: S0, S1, S2, S3
- **Person**: P1 (AI/ML), P2 (Backend), P3 (Frontend), P4 (Analytics), P5 (DevOps)
- **Number**: Sequential within sprint/person

Example: `S1-P2-003` = Sprint 1, Person 2 (Backend), Story 3

## Story Template

Every story follows this exact template:

```markdown
### [STORY-ID] [Title]

**As a** [role]
**I want** [action]
**So that** [benefit]

#### Acceptance Criteria
- **Given** [context]
- **When** [action]
- **Then** [expected result]

#### Technical Notes
- [Implementation details, boundaries, constraints]

#### Dependencies
- [List of story IDs this depends on]

#### Assigned To
- [Person name and role]

#### Estimation
- [Hours or story points]
```

## Definition of Done

A story is done when:
1. All acceptance criteria are met and demonstrable
2. Code is reviewed and merged to `main`
3. Tests pass (`make test`)
4. Documentation is updated (this folder + inline code comments)
5. Feature works in local Docker environment (`make up`)

## How to Use These Specs

1. **Before starting work**: Read your assigned stories for the current sprint
2. **During development**: Keep the spec open. If you deviate, update the spec first
3. **At standup**: Reference story IDs ("I'm working on S1-P2-003")
4. **At review**: Demo against acceptance criteria
5. **After merge**: Mark story as completed in sprint doc

---

## Sprint Calendar

| Sprint | Duration | Theme | Demo Goal |
|--------|----------|-------|-----------|
| Sprint 0 | Week 1 | Foundation | Docker running, hot reload works, schema created |
| Sprint 1 | Weeks 2-4 | Core Commerce | Vendor can upload product, user can browse, auth works |
| Sprint 2 | Weeks 5-7 | Conversational AI | User can chat, get recommendations, add to cart, checkout |
| Sprint 3 | Weeks 8-10 | Intelligence | Vendor dashboard with NL analytics, demand forecasting live |

## Quick Reference: Team Members

| Person | Role | Primary Directory |
|--------|------|-------------------|
| Person 1 | AI/ML Lead | `apps/backend/src/agents/`, `src/embeddings/` |
| Person 2 | Backend Lead | `apps/backend/src/models/`, `src/api/`, `src/services/` |
| Person 3 | Frontend Lead | `apps/frontend/src/`, `packages/shared/` |
| Person 4 | AI/Analytics Engineer | `apps/backend/src/forecasting/`, `src/api/v1/endpoints/analytics.py` |
| Person 5 | DevOps / Full-Stack Support | `docker-compose.yml`, `apps/backend/src/worker/`, CI/CD |
