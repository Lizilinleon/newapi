# Documentation Index

This directory contains the project documentation that is specific to this customized `new-api`
fork. Use this file as the starting point when checking whether a document is current,
historical, or a future plan.

## Top-Level Project Documents

- `../README.md`
  - Local development startup entry.
  - Keep this at repository root.
- `../AGENTS.md`
  - Agent/Codex project rules.
  - Keep this at repository root so tools can discover it automatically.
- `CLAUDE.md`
  - Human-readable project conventions and engineering rules.
  - Mirrors the important conventions from `AGENTS.md`; `AGENTS.md` remains authoritative for
    agent behavior.
- `PROJECT_CUSTOMIZATIONS.md`
  - Source of truth for local customizations that differ from upstream `new-api`.
  - Use this first for public homepage, footer, legal pages, auth page style, model plaza,
    branding, super-admin sidebar, and enterprise-owner token behavior.

## Enterprise Documentation

Read these in order:

1. `enterprise-feature-report.md`
   - High-level current enterprise feature overview.
   - Use this as the enterprise module summary.
2. `enterprise-entry-and-registration.md`
   - Detailed account, registration, login, enterprise entry, invitation, and lifecycle behavior.
3. `enterprise-api-key-management.md`
   - Detailed enterprise quota, member quota, API key, token, and admin-management behavior.
4. `enterprise-todo-report.md`
   - Future work only. Do not treat its items as implemented unless another current-state document
     or the code confirms them.
5. `email-verification-registration-plan.md`
   - Future plan for registration email verification.
   - Registration email verification is not currently implemented.

## Other Documents

- `translation-glossary*.md`
  - Translation terminology references.
- `ionet-client.md`
  - IONet client notes.
- `installation/`
  - Deployment/installation notes.
- `channel/`
  - Channel-specific notes.
- `openapi/`
  - API schema files.

## Current Conflict Rules

- Local development mode:
  - Full local development uses Docker for backend/PostgreSQL/Redis and Bun for the default
    frontend.
  - Frontend-only mode is fine for public-page and layout debugging, but API-backed pages still
    need the backend.
- Public entry vs authenticated entry:
  - Public visitors land on `/`.
  - Signed-in console redirects can still default to `/enterprise`.
- Footer settings:
  - Admin `Footer` content affects only the bottom small text/copyright area.
  - Upper footer links are controlled by the frontend layout and currently only expose user
    agreement and privacy policy links.
- Legal/about pages:
  - `/about`, `/user-agreement`, and `/privacy-policy` use the shared public content layout.
  - Their content is controlled by admin settings and related backend content endpoints.
- Enterprise owner tokens:
  - Enterprise owner company-billed API keys are separated from member read-only display.
  - Owner-side API key behavior is documented in `PROJECT_CUSTOMIZATIONS.md` and detailed
    enterprise token behavior is in `enterprise-api-key-management.md`.

## Known Future / Not Implemented Items

- Formal payment/recharge flow.
- User-side reversal of enterprise funds back to personal balance.
- Registration email verification.
- Invitation record management, resend, and revoke UI.
- Complex enterprise roles beyond owner/member.
- Full funds audit pages and export.
- Cross-database and concurrency regression coverage for all enterprise quota flows.
