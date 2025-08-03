# Frontend Testing Standards

This repository uses [Vitest](https://vitest.dev/) as the primary test runner for the frontend. The following standards and practices apply to all frontend testing (excluding the base folder):

## Test Runner & Environment

- **Test Runner:** Vitest is used for all frontend tests.
- **Test Environment:**
  - Default environment is `jsdom` (see `frontend/vitest.config.ts` and root `vitest.config.ts` for config details).
  - Global test setup files are located in `frontend/src/test/setup.ts` and referenced in config.

## Test File Organization

- All frontend tests should be placed in `frontend/src/components/`, `frontend/src/context/`, or other relevant frontend subfolders.
- Test files should follow the naming convention `*.test.tsx` or `*.spec.tsx` (or `.ts`/`.js` for non-React code).
- Only TypeScript or modern JavaScript test files are supported for the frontend.

## Running Tests

- **Run all frontend tests:**
  - `npm run test:frontend` (runs Vitest on frontend tests)
- **Watch mode:**
  - `npm run test:watch:frontend`
- **Coverage:**
  - `npm run test:coverage:frontend` (generates coverage reports)

## Coverage

- Coverage is collected for all files in `frontend/src/**/*.{ts,tsx}` except type definitions and test setup files.
- Coverage reports are output in text, JSON, and HTML formats.

## Test Standards

- All new frontend code must be accompanied by relevant unit or integration tests.
- Use descriptive test names and group related tests with `describe` blocks.
- Mock external dependencies and side effects where possible.
- Prefer TypeScript for new tests; JavaScript is allowed for legacy or utility code only.
- Keep tests deterministic and isolated from external state.

## Test Setup

- Use `frontend/src/test/setup.ts` for global test setup (e.g., environment variables, mocks).
- Avoid duplicating setup logic in individual test files.

## References

- Main configuration: `frontend/vitest.config.ts`, root `vitest.config.ts`, `package.json` scripts

For backend testing standards, see the documentation in the `scripts/` or `.totem/artifacts/backend/` folder.
