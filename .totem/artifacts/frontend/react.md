# React Frontend Conventions and Libraries

## Framework & Tooling

- **React 19**: Functional components and hooks only
- **Vite**: Build tool and dev server
- **TypeScript**: All code is typed
- **ESLint**: Enforces code quality and style

## Component Libraries

- **boring-avatars**: SVG avatar icons
- **lucide-react**: SVG icon set
- **react-markdown** + **remark-gfm**: Markdown rendering
- **@dnd-kit/**: Drag-and-drop and sortable lists
- **@milkdown/**: Rich text editing and Markdown

## Testing

- **Vitest**: Unit/integration testing (`jsdom` environment)
- **@testing-library/react**: User-focused component tests
- **@testing-library/jest-dom**: DOM matchers
- **@testing-library/user-event**: Simulate user events

See [testing.md](./testing.md) for additional testing standards and details.

## Conventions

- Components in `frontend/src/components/`, PascalCase
- All props and state typed
- Use React hooks for state/effects
- All components should have tests
- Linting required before merge
- Use `react-markdown` + `remark-gfm` for user content
- See [styling.md](./styling.md) for styling conventions and recommendations.

## Context Strategy

Global state is managed with React Context. Providers are in `frontend/src/context/`. Use the `useContext` hook to access shared state and logic across components.

See `frontend/package.json` and `frontend/vite.config.ts` for dependencies and config.
