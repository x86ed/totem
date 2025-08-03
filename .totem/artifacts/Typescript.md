# TypeScript Standards for This Repository

This repository uses TypeScript for both frontend and backend/scripts code. The TypeScript configuration is organized to support strict type safety, modern JavaScript features, and best practices for maintainability and consistency.

## TypeScript Configuration Files

- **Frontend:**
  - Main config: `frontend/tsconfig.json`
    - Target: ES2020
    - Module: ESNext (with bundler resolution)
    - JSX: React (react-jsx)
    - Strict type checking and unused code checks enabled
    - Decorators: `experimentalDecorators` and `emitDecoratorMetadata` enabled
    - Types: Includes `vitest/globals` for testing
    - Only files in `frontend/src` are included
  - Node config: `frontend/tsconfig.node.json` (for Vite and Node scripts)
    - Composite build support
    - Strict mode
    - Used for Vite config files

- **Backend/Scripts:**
  - Config: `tsconfig.scripts.json`
    - Target: ES2021
    - Module: CommonJS
    - Output: Compiled JS in `dist/` from `scripts/`
    - Strict mode, source maps, and modern features enabled
    - Decorators and metadata enabled
    - Excludes `frontend`, `dist`, and `node_modules`

- **Root config:**
  - `tsconfig.json` at the repo root extends the frontend config and includes both `scripts/**/*.ts` and `frontend/src` for type checking.

## TypeScript Standards

- **Strictness:**
  - All configs use `strict: true` for maximum type safety.
  - Unused locals and parameters are flagged in the frontend.
  - No fallthrough in switch statements.

- **Modern JavaScript:**
  - Targeting ES2020+ (frontend) and ES2021 (scripts)
  - Use of decorators is supported and required for certain patterns (e.g., NestJS, class-based code)

- **Module Resolution:**
  - Uses `moduleResolution: bundler` for frontend and node configs
  - Allows importing JSON modules and TypeScript extensions

- **Testing:**
  - Frontend uses Vitest for testing (`types: ["vitest/globals"]`)

- **Project Structure:**
  - TypeScript source files are organized under `frontend/src` for the frontend and `scripts/` for backend/scripts
  - Output for scripts is in `dist/`

## Where to Find TypeScript Settings

- `frontend/tsconfig.json`: Main frontend TypeScript config
- `frontend/tsconfig.node.json`: Node/Vite config for frontend
- `tsconfig.scripts.json`: Backend/scripts TypeScript config
- `tsconfig.json`: Root config, extends frontend config and includes scripts

Refer to these files for the authoritative TypeScript settings and update them as needed to enforce standards across the codebase.

## Additional Guidelines

- **Refactor JavaScript:**
  - If you encounter JavaScript files in this repository (other than minimal scaffolding or bootstrapping code required to support TypeScript), refactor them into TypeScript. The goal is to have all business logic, components, and utilities written in TypeScript for type safety and maintainability.

- **Exports Per File:**
  - Prefer a single export (default or named) per file to keep code modular and maintainable.
  - Exceptions are allowed for related types, such as props and interfaces, but in general, strive to separate concerns and avoid grouping unrelated exports in the same file.
