# Totem 🎯

An AI-native, git-native, distributed project management platform that's open source and self-hosted. Totem reimagines project management by leveraging AI assistance, git workflows, and markdown-based ticketing for modern development teams.

## 🌟 Overview

Totem is an innovative project management platform designed for the AI era. It seamlessly integrates with your development workflow by being:

- **🤖 AI-Native**: Built with AI assistance and designed for AI-enhanced workflows
- **📡 Git-Native**: Leverages git for version control, distributed collaboration, and data integrity
- **🌐 Distributed**: Works across teams and locations with git-based synchronization
- **🔓 Open Source**: Fully transparent, community-driven, and extensible
- **🏠 Self-Hosted**: Complete control over your data and infrastructure
- **📝 Markdown-Powered**: Human-readable, version-controllable project documentation

## 📦 Project Structure

```
totem/
├── scripts/
│   └── init.js                 # Project initialization script
├── frontend/                   # React-based web application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/          # State management
│   │   ├── test/             # Test utilities
│   │   └── assets/           # Static assets
│   ├── coverage/             # Test coverage reports
│   └── public/               # Public assets
├── textlint-rules/            # Custom textlint rules
├── package.json              # Root project configuration
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Latest version recommended

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd totem
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the frontend**:
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables** (optional):
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your preferred settings
   nano .env
   ```

### Environment Configuration

Totem uses environment variables for configuration. A `.env` file will be created automatically with sensible defaults, but you can customize it:

```bash
# Server Configuration
PORT=7073
NODE_ENV=development
HOST=localhost

# API Configuration
API_PREFIX=api
ENABLE_SWAGGER=true

# CORS Configuration
CORS_ORIGIN=*

# File System Paths
TICKETS_DIR=.totem/tickets
CONFIG_DIR=.totem
FRONTEND_DIST=frontend/dist

# Logging
LOG_LEVEL=info
DEBUG=false
```

#### Available Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `7073` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `HOST` | `localhost` | Server host |
| `API_PREFIX` | `api` | API route prefix |
| `ENABLE_SWAGGER` | `true` | Enable Swagger documentation |
| `CORS_ORIGIN` | `*` | CORS allowed origins |
| `TICKETS_DIR` | `.totem/tickets` | Tickets directory path |
| `CONFIG_DIR` | `.totem` | Configuration directory |
| `FRONTEND_DIST` | `frontend/dist` | Frontend build directory |
| `LOG_LEVEL` | `info` | Logging level |
| `DEBUG` | `false` | Enable debug mode |

### Running the Application

#### Option 1: Express Server (Default)

1. **Start the production server**:
   ```bash
   npm start
   ```

2. **Start the development server**:
   ```bash
   npm run dev:server
   ```

#### Option 2: NestJS Server with Swagger/OpenAPI

1. **Start the NestJS production server**:
   ```bash
   npm run start:nestjs
   ```

2. **Start the NestJS development server**:
   ```bash
   npm run dev:nestjs
   ```

3. **Access the API documentation**:
   - Web Interface: `http://localhost:7073`
   - API Documentation: `http://localhost:7073/api/docs`
   - API Status: `http://localhost:7073/api/status`
   - Health Check: `http://localhost:7073/api/health`

#### Frontend Development

1. **Start the frontend development server**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open your browser** and navigate to `http://localhost:5173`

## 🎯 Features

### AI-Native Project Management

- **🤖 AI-Enhanced Workflows**: Designed to work seamlessly with AI assistants and copilots
- **🧠 Intelligent Project Structure**: Smart scaffolding and organization patterns
- **� AI-Friendly Data**: Structured markdown that's perfect for AI consumption and generation
- **🔍 Context-Aware**: Rich project context for better AI assistance

### Git-Native Architecture

- **📡 Version-Controlled Projects**: Every ticket, milestone, and change is tracked in git
- **🌿 Branch-Based Workflows**: Tickets and features aligned with git branches
- **� Distributed Collaboration**: Teams sync through git repositories
- **📈 Change History**: Full audit trail of all project modifications
- **🔀 Merge-Based Updates**: Collaborative editing through git merge workflows

### Self-Hosted & Open Source

- **🏠 Complete Data Control**: Host on your infrastructure, own your data
- **� Privacy First**: No external dependencies for core functionality
- **🛠️ Fully Customizable**: Modify and extend to fit your team's needs
- **🌍 Community Driven**: Open source with transparent development
- **📦 Easy Deployment**: Simple setup on any server or cloud platform

### Modern Web Interface

- **📋 Kanban Board**: Visual ticket management with intuitive workflows
- **🗺️ Roadmap View**: Milestone-based planning with progress tracking
- **➕ Ticket Creation**: Streamlined interface for creating and managing tickets
- **📁 Export System**: Export to markdown, JSON, or sync with external tools

### Key Capabilities

- **🤖 AI Integration**: Built for AI-assisted development and project management
- **📡 Git Synchronization**: Distributed teams collaborate through git repositories
- **🏠 Self-Hosted Control**: Deploy anywhere, own your data completely
- **📝 Markdown Everything**: Human and AI-readable project documentation
- **🌐 Distributed Teams**: Work across locations with git-based coordination
- **🔒 Privacy Focused**: No external data dependencies or tracking
- **🛠️ Extensible Platform**: Open source architecture for custom modifications
- **⚡ Modern Stack**: Fast, responsive web interface with full TypeScript support

## 🛠️ Development

### Available Scripts

**Root Level:**
```bash
npm run init        # Initialize new projects
npm test           # Run linting tests
```

**Frontend:**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run test       # Run test suite
npm run coverage   # Generate test coverage
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

### Technology Stack

**AI-Native Architecture:**
- **🤖 AI-Friendly Design**: Structured for seamless AI assistant integration
- **📝 Markdown-First**: Git-trackable, human and AI-readable documentation
- **🌐 Distributed Architecture**: Git-based synchronization and collaboration

**Frontend:**
- **React 19**: Modern React with hooks and context
- **TypeScript**: Full type safety and AI-friendly code structure
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Vitest**: Testing framework
- **Testing Library**: Component testing utilities

**Self-Hosted Infrastructure:**
- **Git-Based Storage**: Version-controlled project data
- **Static Deployment**: Deploy anywhere with web server capability
- **No External Dependencies**: Complete data sovereignty
- **Docker Ready**: Container deployment support (coming soon)

## 📋 Usage Examples

### AI-Enhanced Project Management

1. **AI-Assisted Setup**: Use AI to help structure your project and create initial tickets
2. **Context-Rich Documentation**: All project data in markdown format for AI consumption
3. **Git-Native Workflows**: Branch-based development with ticket tracking
4. **Distributed Collaboration**: Teams sync through git repositories

### Git-Native Workflows

1. **Initialize Project**: Create git repository with Totem project structure
2. **Branch-Based Tickets**: Link tickets to git branches for development tracking
3. **Collaborative Updates**: Team members push changes through git workflows
4. **Merge-Based Progress**: Ticket updates flow through standard git merge processes

### Self-Hosted Deployment

```bash
# Clone and deploy your own instance
git clone <your-totem-instance>
cd totem
npm install
cd frontend && npm install
npm run build

# Deploy to your server
# Copy frontend/dist/ to your web server
```

## 📊 Testing and Quality

Totem maintains high code quality with comprehensive testing:

- **142+ Tests**: Covering all major functionality
- **100% Component Coverage**: All React components tested
- **Type Safety**: Full TypeScript implementation
- **Linting**: ESLint and Textlint for code and documentation quality

### Running Tests

```bash
# Test the scripts and server
npm run test:scripts

# Test with coverage
npm run test:coverage

# Test frontend components
cd frontend && npm test

# Run with coverage
npm run coverage

# Run type checking
npm run type-check

# Test the NestJS API endpoints
npm run start:nestjs
# Then visit http://localhost:7073/api/docs to test interactively
```

### Test Coverage

The project maintains comprehensive test coverage for:
- **Scripts**: TypeScript server and initialization scripts (27 tests)
- **NestJS Components**: Controllers, services, and DTOs (8 tests)  
- **Frontend**: React components and utilities
- **API Endpoints**: RESTful API integration tests

Total: **35+ tests** covering core functionality with continuous integration.

## 🔧 Configuration

### Environment Setup

The project uses standard Node.js and React configurations:

- **Vite Config**: Frontend build and development server
- **TypeScript Config**: Type checking and compilation
- **ESLint Config**: Code quality and formatting rules
- **Tailwind Config**: CSS utility configuration

### Custom Textlint Rules

Located in `textlint-rules/`, including:
- **Word Count Limits**: Enforce reasonable content length
- **Documentation Standards**: Maintain consistent documentation quality

## 🚀 Deployment

### Self-Hosted Setup

Totem is designed to be self-hosted, giving you complete control over your project data:

```bash
# Build the application
cd frontend
npm run build

# Deploy the static files
# Copy frontend/dist/ to your web server
# Configure your web server to serve the static files
# Point your domain to the deployment
```

### Deployment Options

- **🌐 Static Hosting**: Deploy to any static file server (Nginx, Apache, Caddy)
- **☁️ Cloud Platforms**: Deploy to Netlify, Vercel, or GitHub Pages
- **🐳 Docker**: Container deployment (configuration coming soon)
- **🏠 On-Premises**: Deploy on your own infrastructure for maximum control
- **🔒 Air-Gapped**: Works completely offline once deployed

### Git Repository Setup

For distributed team collaboration:

```bash
# Create a central project repository
git init --bare project-name.git

# Team members clone and contribute
git clone <central-repo> project-name
cd project-name
# Make changes and push through normal git workflows
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with appropriate tests
4. **Run the test suite**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- **Write Tests**: All new features should include tests
- **TypeScript**: Maintain type safety
- **Documentation**: Update JSDoc comments for new functions
- **Linting**: Follow existing code style

## 📈 Roadmap

### Current Version: v0.4.0

Recent improvements:
- ✅ AI-native architecture foundation
- ✅ Git-native project structure
- ✅ Self-hosted deployment ready
- ✅ Comprehensive JSDoc documentation
- ✅ Complete test suite (142+ tests)
- ✅ TypeScript migration for AI-friendly codebase

### Future Enhancements

**🤖 AI Integration:**
- **AI Assistant Integration**: Direct integration with popular AI coding assistants
- **Intelligent Project Analysis**: AI-powered project insights and recommendations
- **Auto-Generated Documentation**: AI-assisted readme and documentation generation
- **Smart Ticket Creation**: AI-suggested tickets based on code changes

**📡 Git-Native Features:**
- **Branch-Ticket Linking**: Automatic association of tickets with git branches
- **Commit Integration**: Link commits to tickets for better traceability
- **Multi-Repository Support**: Manage projects across multiple git repositories
- **Advanced Merge Workflows**: Sophisticated conflict resolution for project data

**🌐 Distributed Collaboration:**
- **Offline-First**: Full functionality without network connectivity
- **Conflict Resolution**: Advanced merge strategies for concurrent editing
- **Team Synchronization**: Better tools for distributed team coordination
- **Federation**: Connect multiple Totem instances across organizations

**🏠 Self-Hosted Enhancements:**
- **Docker Containers**: One-click deployment with Docker Compose
- **Backup Tools**: Automated backup and restore functionality
- **Admin Interface**: Web-based administration for self-hosted instances
- **SSO Integration**: Enterprise authentication support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Comprehensive docs in `/frontend/README.md`
- **Community**: Join discussions in GitHub Discussions

## 🙏 Acknowledgments

- **🤖 AI Community**: For inspiring AI-native development approaches
- **📡 Git Ecosystem**: For providing the foundation of distributed version control
- **🔓 Open Source Movement**: For demonstrating the power of transparent, collaborative development
- **React Team**: For the excellent React framework
- **Vite Team**: For the fast build tool
- **Tailwind CSS**: For the utility-first CSS framework
- **Testing Library**: For excellent testing utilities
- **TypeScript Team**: For enabling AI-friendly, type-safe development

---

**Built with 🤖 AI assistance for the future of distributed project management**

## 📖 API Documentation

Totem provides a comprehensive RESTful API with full OpenAPI/Swagger documentation when using the NestJS server.

### Available Endpoints

- **GET /api/status** - Get server status and initialization state
- **GET /api/health** - Get detailed server health information
- **GET /api/ticket** - Get all tickets from markdown files
- **GET /api/ticket/:id** - Get a specific ticket by ID
- **POST /api/ticket** - Create a new ticket
- **PUT /api/ticket/:id** - Update an existing ticket
- **DELETE /api/ticket/:id** - Delete a ticket

### Interactive API Documentation

When running the NestJS server, you can access interactive API documentation at:
```
http://localhost:7073/api/docs
```

This provides:
- **🔍 Interactive API Explorer**: Test endpoints directly in the browser
- **📋 Complete Schema Documentation**: Detailed request/response schemas
- **🎯 Example Requests**: Sample data for all endpoints
- **🔧 Try It Out**: Execute API calls with real responses
- **📄 OpenAPI Specification**: Download the complete API specification

### API Response Examples

#### Ticket Endpoints

**GET /api/ticket** - Get all tickets:

**Success Response (200)**:
```json
{
  "message": "Get all tickets",
  "tickets": [
    {
      "id": "healthcare.security.auth-sso-001",
      "status": "open",
      "priority": "high",
      "complexity": "medium",
      "persona": "security-sasha",
      "contributor": null,
      "model": null,
      "effort_days": null,
      "blocks": ["patient-dashboard-003"],
      "blocked_by": ["ad-integration-001"],
      "title": "SSO Authentication for Patient Portal",
      "description": "HIPAA-compliant SAML/OAuth integration with Active Directory.",
      "acceptance_criteria": [
        {
          "criteria": "Corporate credential login",
          "complete": true
        },
        {
          "criteria": "Failed attempts logged and monitored",
          "complete": false
        }
      ],
      "tags": ["security-sasha", "high", "medium"],
      "notes": "HIPAA-compliant SAML/OAuth integration with Active Directory.",
      "risks": ["Patient data exposure (high)", "AD maintenance downtime (medium)"],
      "resources": ["Use SecurityAuthProvider in /src/auth/", "Follow existing token patterns"]
    }
  ]
}
```

**No Tickets Found (404)**:
```json
{
  "message": "No tickets found",
  "error": "No markdown ticket files exist in the tickets directory",
  "tickets": []
}
```

**Directory Not Found (404)**:
```json
{
  "message": "Tickets directory not found",
  "error": "No tickets directory exists",
  "tickets": []
}
```

**No Valid Tickets (404)**:
```json
{
  "message": "No valid tickets found",
  "error": "No ticket files could be parsed successfully",
  "tickets": []
}
```

**Server Error (500)**:
```json
{
  "message": "Error reading tickets",
  "error": "Permission denied",
  "tickets": []
}
```

#### Status and Health Endpoints

**Status Endpoint**:
```json
{
  "status": "running",
  "initialized": true,
  "timestamp": "2025-06-30T12:00:00.000Z",
  "version": "0.6.1"
}
```

**Health Endpoint**:
```json
{
  "status": "healthy",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 16777216,
    "heapUsed": 10485760,
    "external": 1048576,
    "arrayBuffers": 0
  },
  "platform": "linux",
  "nodeVersion": "v18.17.0"
}
```
