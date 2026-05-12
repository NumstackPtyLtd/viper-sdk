# @supaproxy/viper-sdk

Typed TypeScript API client for the Viper code review server. Part of the Viper product within the SupaProxy ecosystem.

See the [central hub](https://github.com/NumstackPtyLtd/supaproxy) for cross-repo governance, workflow, and conventions.

## What this package does

This SDK wraps every Viper server endpoint with typed methods. The dashboard imports this package and calls its methods; it never calls `fetch` against the server directly.

The client exposes namespaced API groups: `auth`, `reviews`, `tokens`, `connections`, `projects`, `wiki`, `policies`, `reviewConfigs`, `settings`, and `providers`.

## Project structure

```
src/
  index.ts       Public exports
  client.ts      ViperClient class and namespaced API classes
  api.ts         Request/response type definitions (mirrors server contracts)
  entities.ts    Domain entity types (Review, Finding, Token, Connection, etc.)
```

## Git workflow

NEVER push directly to `main`. NEVER run destructive git commands (`push --force`, `reset --hard`, `clean -f`).

All changes go through pull requests:

1. Create a feature branch: `git checkout -b {feat|fix|chore|docs}/description`
2. Make commits on the branch.
3. Push the branch: `git push -u origin {branch}`
4. Create a PR: `gh pr create`
5. Squash merge to main via the GitHub UI.

## Code standards

### Type safety

- No `any` types. Create interfaces for all API responses and function parameters.
- No `as any` casts. Define proper interfaces instead.
- All server response shapes must have a corresponding interface in `api.ts`.
- All domain entities must have a corresponding interface in `entities.ts`.

### Provider and VCS agnosticism

- No hardcoded provider or VCS platform names in user-facing output.
- Say "AI provider" or "VCS provider", not specific vendor names.
- Provider types are dynamic; the SDK discovers them via `/api/vcs/types` and `/api/ai/types`.

### No hardcoded values

- No env var fallbacks. Use `requireEnv()` with no defaults.
- No hardcoded API URLs, secrets, or magic numbers.
- The `baseUrl` is always provided by the consumer at construction time.

### Error handling

- Check `res.ok` before parsing. The `request()` method must verify the response status.
- Wrap `JSON.parse()` in try/catch with a fallback.
- No empty catch blocks. Every `.catch()` must handle the error.

### Writing standards

- British English throughout (colour, organisation, behaviour, licence).
- No em dashes or en dashes. Use commas, full stops, or semicolons.
- No smart quotes. Use straight quotes only.
- Sentence case for headings.

## Adding a new SDK method

1. Add the request/response types in `src/api.ts`.
2. Add any new entity types in `src/entities.ts`.
3. Add the method to the appropriate API class in `src/client.ts`.
4. Export any new types from `src/index.ts`.
5. Write tests for the new method.
6. The method must match a server route. If the route does not exist yet, add it to the server first.

## Scripts

```bash
npm run build          # Compile TypeScript
npm run lint           # Type check without emitting
npm run test           # Run tests with Vitest
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Publishing

Published to npm as `@supaproxy/viper-sdk`. Follow semver strictly. All tests and build must pass before publishing. Update CHANGELOG.md before every release.
