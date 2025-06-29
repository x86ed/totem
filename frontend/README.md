# Totem - Markdown-Based Ticketing System

A modern, React-based ticketing system that uses markdown as the foundation for project management. Built with Vite, React, and Tailwind CSS.

## 🚀 Features

### Core Functionality

- **Kanban Board**: Visual ticket management with status columns (To Do, In Progress, Review, Done)
- **Roadmap View**: Milestone-based planning with progress tracking
- **Ticket Creation**: Simple form interface for creating new tickets
- **Export System**: Export tickets and roadmaps as markdown or JSON

### Key Capabilities

- **Kanban Workflow**: Move tickets between columns using hover buttons
- **Milestone Tracking**: Organize tickets by milestones with progress visualization
- **Priority Management**: High, medium, and low priority levels with color coding
- **Assignee Management**: Track who's working on what
- **Progress Visualization**: Real-time progress bars for milestones
- **Export Options**: 
  - Individual ticket markdown files
  - Complete roadmap markdown
  - Full JSON backup with all data

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── KanbanBoard.jsx    # Main kanban board view
│   │   ├── TicketCard.jsx     # Individual ticket display
│   │   ├── CreateTicket.jsx   # Ticket creation form
│   │   ├── RoadmapView.jsx    # Milestone and roadmap view
│   │   └── ExportView.jsx     # Data export functionality
│   ├── context/
│   │   └── TicketContext.jsx  # Global state management
│   ├── App.jsx                # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles with Tailwind
├── public/
├── package.json
└── README.md
```

## 🎨 Design Features

- **Modern UI**: Clean, professional interface with dark/light mode support
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Tab-based interface for easy switching between views
- **Visual Indicators**: Color-coded priorities, status badges, and progress bars
- **Hover Interactions**: Quick actions appear on ticket hover

## 📋 Usage Guide

### Creating Tickets

1. Go to the "Create Ticket" tab
2. Fill in the ticket information:
   - **Title**: Brief description of the task
   - **Description**: Detailed requirements or issue description
   - **Priority**: High (🔴), Medium (🟡), or Low (🟢)
   - **Assignee**: Username or email of the person responsible
   - **Milestone**: Select from available project milestones
3. Click "Create Ticket" to add it to the board

### Managing the Kanban Board

- **View Tickets**: See all tickets organized by status columns
- **Move Tickets**: Hover over a ticket and use the emoji buttons to move between columns:
  - 📝 = Move to To Do
  - 🔄 = Move to In Progress
  - 👀 = Move to Review  
  - ✅ = Move to Done
- **Track Progress**: Column headers show ticket counts

### Using the Roadmap

- **View Milestones**: See all project milestones with due dates and status
- **Track Progress**: Visual progress bars show completion percentage
- **Monitor Status**: Color-coded status indicators (active, completed, planning)
- **Ticket Breakdown**: See which tickets are assigned to each milestone

### Exporting Data

Choose from three export formats:

1. **📝 Markdown Tickets**: Individual markdown files for each ticket
2. **🗺️ Markdown Roadmap**: Complete roadmap with milestone breakdown
3. **📊 JSON Backup**: Full project data for backup or migration

Export options:
- **Preview**: See the content before downloading
- **Download**: Save files to your computer
- **Copy to Clipboard**: Copy content for immediate use

## 🔧 Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

### Technical Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **Icons**: Emoji-based for simplicity
- **Build Tool**: Vite for fast development

## 📝 Markdown Export Format

Tickets are exported in this structured format:

```markdown
# Fix user authentication bug

**ID:** TKT-001
**Status:** todo
**Priority:** high
**Assignee:** john.doe
**Milestone:** v1.0
**Created:** 2025-06-26

## Description

Users are experiencing issues with login validation...

---
```

## 🎯 Sample Data

The application includes sample tickets and milestones to demonstrate functionality:

- **Tickets**: 4 sample tickets across different statuses and priorities
- **Milestones**: 3 milestones (Beta Release, Production Release, Enhanced Features)
- **Assignees**: Sample usernames for demonstration

## 🚀 Future Enhancements

Potential improvements for production use:

- **File System Integration**: Real markdown file reading/writing
- **Search & Filtering**: Find tickets by various criteria
- **User Management**: Proper user authentication and profiles
- **Advanced Drag & Drop**: Visual drag and drop between columns
- **Time Tracking**: Log time spent on tickets
- **Comments**: Add discussion threads to tickets
- **API Integration**: REST API for external tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
