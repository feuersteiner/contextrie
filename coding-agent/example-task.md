---
id: T00A9Qz
title: Add login flow
status: todo
agent: codex
agentSessionId: codex-session-123
createdAt: 2026-04-01T12:00:00Z
updatedAt: 2026-04-01T12:05:00Z
---

# Add login flow

## Source Prompt

Add a basic email/password login flow.

## Spec

- Users need a basic email/password sign-in flow to access authenticated areas.
- **In:** Email/password form with validation, session/token management, dashboard redirect on success, error messaging, optional remember-me, and basic rate limiting.
- **Out of Scope:** Social auth, password reset, 2FA, user registration, account lockout, and advanced security features.

## Acceptance Criteria

- Given a valid email and password, when the user submits the form, then they are signed in and redirected to the dashboard.
- Given invalid credentials, when the auth request fails, then the user stays on the login page and sees a clear error message.

## History

- 2026-04-01, 12:30pm, sha: abc123: Initial task scaffold created by CLI.
- 2026-04-01, 1:00pm, sha: def456: Added detailed spec and acceptance criteria.
- 2026-04-01, 2:00pm: decided to use JWTs for session management, because the company's frontend is decoupled from the backend and JWTs allow for stateless auth that scales well with this architecture.