# Backend API Standards and Documentation

## OpenAPI/Swagger Generation

This project uses [NestJS Swagger](https://docs.nestjs.com/openapi/introduction) to automatically generate OpenAPI (Swagger) documentation for the backend RESTful API. The documentation is generated at runtime based on the decorators and metadata in the controller and DTO (Data Transfer Object) files.

- **How it works:**
  - The backend server uses the `@nestjs/swagger` package.
  - Decorators such as `@ApiTags`, `@ApiOperation`, `@ApiResponse`, and DTO class decorators are used to describe endpoints, request/response schemas, and parameters.
  - When the backend server is started (see `npm run start` or `npm run dev:backend`), the Swagger UI is made available at `/api/docs` (or a similar route, depending on configuration).
  - The OpenAPI spec is generated dynamically from the codebase and can be used for client generation, documentation, and testing.

## RESTful API Conventions

- **Resource-Oriented:**
  - Each controller in the backend corresponds to a resource (e.g., `artifacts`, `personas`, `projects`).
  - Standard RESTful HTTP methods are used:
    - `GET` for retrieval
    - `POST` for creation
    - `PUT`/`PATCH` for updates
    - `DELETE` for removal
  - Endpoints are plural and use resource-based routing (e.g., `/api/artifacts`, `/api/personas`).

- **DTOs and Validation:**
  - All request and response payloads are defined using TypeScript DTO classes.
  - Validation is enforced using class-validator decorators.

- **Error Handling:**
  - Standard HTTP status codes are used for success and error responses.
  - Error responses follow a consistent structure for easier client handling.

## Controllers and Datastores

Each controller in the backend (see `src/controllers/` and `scripts/__tests__/api.controller.test.ts` for examples) is responsible for handling API requests for a specific resource. Controllers interact with service classes, which in turn manage data access and business logic.

### Data Storage: Markdown Files in `.totem`

All controllers ultimately use markdown files in the `.totem` directory as their datastore. These files serve as the source of truth for the data managed by each controller. The mapping from controller to markdown file is as follows:

| Controller                | Markdown File Location                                   |
|---------------------------|--------------------------------------------------------|
| ArtifactsController       | `.totem/artifacts/Artifacts.md`                         |
| PrefixController          | `.totem/projects/conventions/id.md` (## Prefix section) |
| LayerController           | `.totem/projects/conventions/id.md` (## Layer section)  |
| FeatureController         | `.totem/projects/conventions/id.md` (## Feature section)|
| ComponentController       | `.totem/projects/conventions/id.md` (## Component section)|
| ComplexityController      | `.totem/projects/conventions/complexity.md`             |
| PriorityController        | `.totem/projects/conventions/priority.md`               |
| StatusController          | `.totem/projects/conventions/status.md`                 |
| IconController            | (No markdown file; generates SVG icons dynamically)     |
| PersonasController        | `.totem/personas/Personas.md`                          |
| ContributorsController    | `.totem/contributors/Contributors.md`                   |
| TicketsController         | `.totem/tickets/Tickets.md`                             |

Other controllers follow a similar pattern, with each resource mapped to a markdown file in the appropriate `.totem` subdirectory. These files are read from and written to by the backend to persist and retrieve resource data.

**Note on IconController:**

The `IconController` does not use a markdown file for data storage. Instead, it provides a dynamic endpoint (`/api/icon`) that generates and returns SVG avatar icons on-the-fly using the `boring-avatars` React component. The icon is determined by the `value` query parameter and is rendered server-side as SVG.

## Project Metadata and Documentation Folders

- `.totem/artifacts/`: Contains wiki-like documentation about the technologies, standards, and patterns used in the project. This folder is not a datastore for application data, but rather a reference for developers and AI agents.
- `.totem/projects/`: Stores project settings and configuration files relevant to the current project instance.
- `.totem/personas/`: Contains persona definitions for AI agents, describing their roles, behaviors, and capabilities.
- `.totem/contributors/`: Documents human collaborators, their roles, and contributions to the project.
- `.totem/tickets/`: Contains task and issue tracking information for the project, serving as a to-do list or backlog for ongoing work.

These folders are used for documentation, configuration, and collaboration purposes, and should be kept up to date to reflect the current state of the project and its contributors.

## References

- Main API code: `src/controllers/`, `src/dto/`, `src/services/`
- Data model docs: `.totem/artifacts/`
- OpenAPI/Swagger config: `@nestjs/swagger` usage in backend code

For more details, see the individual resource documentation in `.totem/artifacts/` and the Swagger UI at `/api/docs` when the backend server is running.
