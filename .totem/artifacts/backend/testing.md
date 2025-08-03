# Backend Testing Standards

This repository uses [Vitest](https://vitest.dev/) as the primary test runner for backend and scripts (excluding the frontend folder). The following standards and practices apply to all backend and script testing:

## Test Runner & Environment

- **Test Runner:** Vitest is used for all backend and script tests.
- **Test Environment:**
  - Default environment is `node` (see `jest.config.js` and `vitest.config.ts` for config details).
  - Global test setup files are located in `scripts/__tests__/setup.ts` and referenced in config.

## Test File Organization

- All backend and script tests should be placed in `scripts/__tests__/` and follow the naming convention `*.test.ts`.
- Only TypeScript test files are supported for backend/scripts.
- Test files should be colocated with the code they test when possible, or in the `__tests__` directory for integration/system tests.

## Running Tests

- **Run all backend tests:**
  - `npm run test:backend` (runs Vitest on backend tests)
- **Watch mode:**
  - `npm run test:watch:backend`
- **Coverage:**
  - `npm run test:coverage:backend` (generates coverage reports)

## Coverage

- Coverage is collected for all files in `scripts/**/*.ts` except type definitions and test setup files.
- Coverage reports are output in text, JSON, and HTML formats.

## Test Standards

- All new backend code must be accompanied by relevant unit or integration tests.
- Use descriptive test names and group related tests with `describe` blocks.
- Mock external dependencies and side effects where possible.
- Avoid using JavaScript for new tests; use TypeScript exclusively.
- Keep tests deterministic and isolated from external state.

## Test Setup

- Use `scripts/__tests__/setup.ts` for global test setup (e.g., environment variables, mocks).
- Avoid duplicating setup logic in individual test files.

## Redundant/Unused Files

- The following files are not referenced in any current test scripts and should be deleted if present:
  - `test-textlint.sh` (not used in any npm scripts)

## References

- Main configuration: `jest.config.js`, `vitest.config.ts`, `package.json` scripts

For frontend testing standards, see the documentation in the `frontend/` folder.