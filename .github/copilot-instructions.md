# Copilot Instructions

<!-- Workspace-specific customization for assistants. Keep concise but actionable. -->

## Project Overview

React + Vite + TypeScript + Tailwind CSS single‑page tool for managing multiple Kingshot accounts and bulk redeeming Gift Codes. Pure frontend (localStorage persistence). Multi‑language UI: zh-TW / en-US / ko-KR.

## Current Core Features

- Account add/import/export/delete (numeric IDs). Import: one ID per line; lines starting with `#` skipped.
- Automatic validation (fetch nickname / kingdom / castle level) after add & on page load (re‑validation) while showing previous playerInfo.
- Sequential Gift Code redemption for validated accounts only.
- Live per‑account status: idle | validating | processing | success | error.
- Status stats (validated / processing / success / error + rates).
- Configurable API request interval (0.5s~3s, default 2000ms) stored under `kingshot-delay-ms`.
- Mid‑batch deleted accounts are skipped (no wasted requests).
- i18n with react-i18next; language switch persisted.

## Development Guidelines

- Always use TypeScript types; no implicit any.
- Prefer functional React + hooks. Encapsulate account logic in `useAccountActions`, alerts in `useAlert`.
- Keep validation / redeem loops sequential using `await` + `setTimeout` wrapped in a Promise (no `setInterval`).
- Do not reintroduce deprecated fixed delay constants (e.g. removed REQUEST_DELAYS). Use dynamic `delayMs` state.
- During re‑validation on load, DO NOT clear existing `playerInfo`; only set `isValidated=false`, `status="validating"`, and update progress text.
- Avoid unnecessary re-renders of initialization effect: exclude `t` from deps intentionally with a comment when caching translation strings.
- New settings keys belong under `settings.*` namespace in i18n.

## i18n Rules

- Every new user-visible string must have an i18n key (no hardcoded literals in components except temporary dev logs).
- Update all three locale files (zh-TW, en-US, ko-KR) together.
- Reuse keys only when semantics match; otherwise create a new one.
- Prefer sentence style capitalization consistency per language.

## Storage Conventions

- LocalStorage keys: `accounts`, `kingshot-delay-ms` (list here when adding more).
- When changing the account object shape, provide backward compatibility or a migration inside the initialization logic.
- Import/export only depends on plain list of account numbers; other fields recomputed.

## Code Style

- ES202x syntax, `const` / `let` only.
- Arrow functions for inline handlers & small utilities.
- Consistent naming: camelCase for functions/vars, PascalCase for components/types.
- Keep components presentational; heavy logic stays in hooks or utils.
- Tailwind utility-first; avoid custom CSS unless unavoidable.
- Keep JSX clean: derive computed values outside return when complex.

## Error & Status Handling

- Player validation errors: map API error codes to i18n messages (see `constants` & api error classes).
- Gift code results use short & long message variants (`...Short` when space constrained).
- When skipping deleted accounts mid-batch, ensure logs remain in console only (no stale UI updates).

## Adding Features Checklist

1. Define i18n keys (all locales) before wiring UI.
2. Update README (and localized versions) if user-facing behavior changes (new setting / workflow / state).
3. Maintain backward compatibility for localStorage.
4. Provide types & narrow error handling (custom error classes where applicable).
5. Consider performance: avoid re-validating all accounts on trivial UI state (e.g. theme/language switch handled via guards).

## Testing / Manual QA Hints

- Add several accounts, reload page: should show old data with validating status then refresh.
- Delete an account mid-validation: no further requests for that account.
- Change API interval mid-process: affects subsequent requests only.
- Switch language: should NOT restart initialization.

## Non-Goals / Avoid

- No server sync, no authentication layer.
- Avoid introducing global state libraries unless complexity justifies.
- Do not store secrets; everything is public client logic.

## Contribution Notes

- Keep PRs focused (one feature or fix) and update docs & i18n in same commit.
- Include rationale in commit message when adjusting validation flow or timing.
