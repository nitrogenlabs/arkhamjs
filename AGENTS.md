# AI Coding Assistant Instructions

## Shared NLabs Stack
- Use Lex (`@nlabs/lex`) for CLI workflows, building, compiling, deploying, and testing projects.
- Use Vitest for unit and integration tests.
- Use Playwright for end-to-end tests.
- Use GothamUI (`@nlabs/gothamui`) for the web presentation layer. Obtain components, views, routing, Tailwind setup, and default styles from GothamUI before creating custom project-level components.
- Use React v19 for frontend work.
- Use Tailwind v4 for CSS styles.
- Use MetropolisJS (`@nlabs/metropolisjs`) as the starting point for all frontend API integration. Create custom data types, actions, queries, or mutations only after MetropolisJS has been exhausted.
- Use Rip-Hunter to access API endpoints.
- Use `fetch` through Rip-Hunter rather than direct project-level `fetch` calls.
- Use ArkhamJS (`@nlabs/arkhamjs`) as the frontend data store. Store data, including session-storage-backed data, through Flux actions and event listeners.
- Prefer listening for Flux events over chaining `.then(...)` to Flux action promises.
- Flux actions update the data store before dispatching their events.
- Multiple listeners may listen for the same Flux action event.
- Read persistent data from the data store, and read event-specific data directly from the Flux action event when appropriate.
- Send all data as JSON.
- Use Reaktor (`@nlabs/reaktor`) for actions that interact with the ArangoDB database.

## Database
- All projects use the ArangoDB instance at `https://db.reaktor.io:8529`.
- ArangoDB is a document NoSQL database with SQL-style query and graph database features.
- When adding or deleting documents, check whether associated graph edges also need to be added or deleted.

## Project Structure
- Web apps should contain at least one microsite.
- Web apps should include a `src/ui` folder.
- Web apps with a backend should include a `src/api` folder or microsite.
- Library projects may use a root source folder without `src/ui` or `src/api`.
- Shared utility/helper functions should live in a shared file when used in more than one place.
- Keep one component per file.
- Each component should have a sibling test file named `MyComponent.test.ts` or `MyComponent.test.tsx`.
- Group components by component folder, for example `src/ui/components/MyComponent/MyComponent.tsx`.

## Package Scripts
- All projects should have at least `start`, `test`, and `update` scripts.
- If a project includes both `api` and `ui` workspaces, use `concurrently` in `start`:
  `"start": "concurrently \"npm run start -w api\" \"npm run start -w ui\""`
- Use this workspace test script:
  `"test": "npm run test --workspaces --ignore-scripts"`
- Use this workspace update script:
  `"update": "npm run update --workspaces"`

## Testing
- Maintain at least 90% unit test coverage.
- Components that require other components should have integration tests.
- Provide at least one Playwright e2e test for each happy path.

## Code Style
- Use arrow functions for functions.
- Correctly type all variables, props, and arguments unless TypeScript inference already provides the correct type.
- Sort props and object keys alphabetically.
- Check and fix all ESLint errors and warnings.
- Use `eslint-config-styleguide` for linting rules.

<!-- BEGIN SHARED ARCHITECTURE GUARDRAILS -->
## Shared architecture guardrails

These rules apply to new and modified code. The cross-project audit and capability backlog are maintained in `nitrogenx/docs/architecture-audit`. A proposed extraction is not an available package API until its export and consumer adoption are verified.

- Before implementing infrastructure or presentation logic, inspect the owning shared package's public exports, documentation, and tests. Check the consumer's installed version and lockfile, not only the sibling checkout. Use public package entry points; do not import another repository's source/internal files or add absolute runtime paths. Verify public declarations against the actual consumer framework types, including callback inference; preserve supported public framework type aliases rather than emitting private generated-type paths.
- Package ownership: GothamUI (`@nlabs/gothamui`) owns web components, views, routing, styles, scoped document-head lifecycle/serialization, and generic media/editor presentation. MetropolisJS owns frontend API actions/adapters, session policy/orchestration, and cache ingestion. Rip-Hunter owns HTTP/GraphQL encoding, headers, status/errors, timeouts, and streaming. ArkhamJS and its storage/React packages own state, persistence, and Flux event mechanics. Reaktor owns backend/database actions, authorization, and graph-edge lifecycle. Lex owns build/test/lint/deployment orchestration. Utils owns pure reusable helpers without UI, session, endpoint, or database policy.
- Use React 19 and Tailwind v4 for web UI. GothamJS is a legacy dependency: use GothamUI for new shared web capabilities, and migrate legacy imports, mocks, aliases, and style scans together when a validated compatible release is available. Do not introduce new GothamJS dependencies or assume a package rename alone completes migration.
- React Native renderers and lifecycle bindings stay native. Prefer compatible LanternUI/native primitives; do not import DOM-based GothamUI components into native views. Share platform-neutral contracts, policies, and controllers through supported lean entry points.
- Do not create project-level copies of routing/listener protocols, session expiry/refresh controllers, request clients, persistence queues, media compositors, web document-head lifecycle, or generic UI when a supported shared implementation exists. Compose thin app adapters for configuration, callbacks, platform events, and business rules. If the package lacks a required capability, document the concrete gap and extend the owning package within the authorized scope before adoption. Do not silently copy a helper or treat a proposed API as implemented.
- Keep product-specific contracts/selectors/workflows in an existing app-shared/domain package when they have no cross-product meaning. Preserve provider accounting, editorial/provenance rules, game simulation, secure credentials, and authorization checks in their domain owners. Similar-looking pages alone do not justify merging business behavior.
- Use MetropolisJS for frontend integration and Rip-Hunter for transport. No direct app-level `fetch` or parallel HTTP/GraphQL stack. Transport-library implementation and request implementations explicitly injected into Rip-Hunter for tests or native compatibility may use the platform request primitive. Preserve binary/multipart/streaming contracts rather than forcing them to JSON; ordinary API data uses JSON.
- Preserve the consumer's timeout policy explicitly: absolute request/body deadlines and Node socket-idle timeouts are different contracts. Shared deadline scheduling must handle finite durations above the platform timer limit with bounded intervals and elapsed-time accounting; preserve zero-disable policy, exact abort reasons, and timer/listener cleanup. Keep retry, redirect, response decoding and paid-operation accounting in domain adapters; do not replay mutations automatically. Transport tests must inject the binding used by the installed package and block unintended outbound provider/database connections.
- Use public Lex commands for deployment orchestration and Reaktor provisioning for pure resource/configuration planning. Keep only secret-free app descriptors and domain startup smoke checks locally. Preserve provider fields, exact stage targets, revision/ETag guards, asset-before-HTML ordering and smoke-before-ZIP checks; shared Lambda alias promotion and cloud acceptance require separate verification.
- Use ArkhamJS actions/store/event subscriptions for shared and persisted frontend state. Flux actions update state before dispatching events; prefer listeners over promise chains. Use the appropriate secure-storage adapter for credentials, never unencrypted preference persistence. Keep platform-specific storage bindings outside pure policy modules.
- Preserve behavior during extraction: refresh windows and rounding, single-flight semantics, network-failure/signout policies, stale-result guards, retries/idempotency, timeout/cancellation behavior, missing/error handling, and configuration precedence. Keep browser/native events local. An unfinished or stub production flow remains unfinished until separately implemented and tested; a refactor must not claim to complete it.
- Centralize implementation regression tests in the owning package. Keep consumer contract/integration tests and happy-path Playwright tests for web flows; native changes require suitable native/bundle/device checks. Maintain at least 90% unit coverage, run affected typechecks/builds/lint, and report baseline failures separately. Do not weaken assertions or duplicate algorithms in tests merely to satisfy coverage.
- Use Lex CLI workflows and Lex's bundled Vitest/Playwright where supported. Do not add duplicate direct test-runner dependencies solely for a new suite. Inspect script hooks before verification; avoid unintended whole-project auto-fixes, builds, or external tool invocation during a read-only review. Verify the actual installed lint command's nonmutating/fix, config and max-warning contracts against a controlled fixture before read-only use; parsing a dry-run flag or reporting success does not establish that files were unchanged or the requested rules ran. Native command launch failures must report a sanitized command and error code without exposing arguments, paths, environment, or raw errors. If Lex lacks a required native command, use the project's existing native tool and document that limitation; do not copy tooling scripts or patch installed dependencies as a permanent workaround.
- After Lex adoption, verify the actual consumer runner, coverage provider and compiler versions and public types as one installed contract. Check that bare runner imports, public assertion/setup types and jest-dom integration resolve a compatible instance without temporary aliases or symlinks. Validate actual unassisted commands and the supported package-manager peer graph; do not assume a hoisted or peer-only dependency is portable across npm and Yarn.
- Adopt a verified compatible package version with manifest/lockfile agreement. Locally built repository-relative package archives may support unpublished work; document their release requirement. Do not assume local exports are published, blanket-upgrade unrelated dependencies, vendor shared source, or alter registry/release state without authorization.
- For authorized release publication, use the verified public Lex immutable-archive workflow with the exact reviewed tarball, lifecycle scripts disabled and an explicit intended distribution tag. Recheck archive hashes, registry payload/version and tags after execution; a dry run or authenticated identity does not establish publication, and two-factor rejection must remain an unresolved release gate. Never rebuild a frozen archive from a dirty producer tree or promote latest implicitly.
- Shared fixes require package regression tests plus a representative consumer integration check before removing the old implementation. Record ownership, adoption status, and remaining gaps in the audit. Keep local project instructions; update these guardrails centrally and check all scoped AGENTS.md files with `nitrogenx/scripts/sync-architecture-guardrails.py --check`.
<!-- END SHARED ARCHITECTURE GUARDRAILS -->

## Verified persisted preference ownership
- Core PersistedPreferences owns a dedicated memory-only Flux with no attached storage or async middleware. Preserve immediate state-before-event updates, reentrant persistence invocation order, per-entry revisions/idempotent hydration/generation. Restore only entries never locally changed, including same-value sets before first hydration; failed writes never roll back choices.
- NativeStorage remains sole disk writer/queue; existing React Provider/hooks own subscribe-catch-up/current key selection. Native lifecycle/raw enum codec and secure credentials stay outside core. Preserve exact tested AsyncStorage compatibility and unchanged secure/session regressions; verify final builds/archive/installed bytes before adopting local artifacts.
- Evidence: nitrogenx/docs/architecture-audit/phantom-preferences-validation.md.

## Verified audit capabilities — October 6, 2026

- Typed whole-snapshot React selection is owned by the public arkhamjs-utils-react useFluxSnapshot hook. Preserve event snapshot selection, undefined-payload whole-store reread, falsy leaves, fallback stability, intermediate-array rejection, provider/key cleanup and catch-up. Do not copy the subscription protocol into consumers.
