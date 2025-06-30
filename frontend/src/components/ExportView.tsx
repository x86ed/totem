import React, { useState } from 'react'
import { useTickets } from '../context/TicketContext'
import { Ticket } from '../types'

/**
 * Available export formats for project data
 * @typedef {'markdown-tickets' | 'markdown-roadmap' | 'json'} ExportFormat
 */
type ExportFormat = 'markdown-tickets' | 'markdown-roadmap' | 'json'

/**
 * Result object returned by export generation functions
 * @interface ExportResult
 */
interface ExportResult {
  /** The generated content as a string */
  content: string
  /** Suggested filename for the export */
  filename: string
}

/**
 * ExportView Component
 * 
 * A component for exporting project data in various formats including:
 * - Individual ticket markdown documents
 * - Roadmap with milestone breakdown
 * - Complete JSON export with all project data
 * 
 * Features:
 * - Multiple export formats (Markdown tickets, Markdown roadmap, JSON)
 * - Live preview of export content
 * - Download functionality
 * - Copy to clipboard
 * - Sample format examples
 * 
 * @component
 * @returns {JSX.Element} The ExportView component with export options and preview
 * 
 * @example
 * ```tsx
 * import ExportView from './components/ExportView'
 * 
 * function App() {
 *   return (
 *     <div>
 *       <ExportView />
 *     </div>
 *   )
 * }
 * ```
 */
const ExportView: React.FC = () => {
  const { tickets, milestones } = useTickets()
  const [exportFormat, setExportFormat] = useState<ExportFormat>('markdown-tickets')
  const [showPreview, setShowPreview] = useState<boolean>(false)
  const [previewContent, setPreviewContent] = useState<string>('')

  /**
   * Generates markdown content for a single ticket
   * @param {Ticket} ticket - The ticket object to convert to markdown
   * @returns {string} Formatted markdown string for the ticket
   */
  const generateMarkdownTicket = (ticket: Ticket): string => {
    return `# Ticket: ${ticket.title}

**ID:** ${ticket.id}
**Status:** ${ticket.status}
**Priority:** ${ticket.priority}
**Assignee:** ${ticket.assignee || 'Unassigned'}
**Milestone:** ${ticket.milestone || 'None'}
**Created:** ${ticket.created}

## Description

${ticket.description}

---
`
  }

  /**
   * Generates a markdown roadmap document with all milestones and their tickets
   * @returns {string} Formatted markdown string containing the complete roadmap
   */
  const generateMarkdownRoadmap = (): string => {
    let content = `# Project Roadmap

Generated: ${new Date().toLocaleString()}

`
    
    milestones.forEach(milestone => {
      const milestoneTickets = tickets.filter(ticket => ticket.milestone === milestone.id)
      
      content += `## ${milestone.title}

**Due Date:** ${milestone.dueDate}
**Status:** ${milestone.status}

${milestone.description}

### Tickets:
${milestoneTickets.map(ticket => 
    `- [${ticket.status === 'done' ? 'x' : ' '}] ${ticket.title} (${ticket.id})`
).join('\n') || '- No tickets assigned'}

`
    })
    
    return content
  }

  /**
   * Generates a complete JSON export with all project data and statistics
   * @returns {string} JSON string containing tickets, milestones, and summary statistics
   */
  const generateJSONExport = (): string => {
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      tickets,
      milestones,
      summary: {
        totalTickets: tickets.length,
        ticketsByStatus: {
          todo: tickets.filter(t => t.status === 'todo').length,
          'in-progress': tickets.filter(t => t.status === 'in-progress').length,
          review: tickets.filter(t => t.status === 'review').length,
          done: tickets.filter(t => t.status === 'done').length
        },
        totalMilestones: milestones.length
      }
    }, null, 2)
  }

  /**
   * Generates export content based on the selected format
   * @returns {ExportResult} Object containing the generated content and suggested filename
   */
  const generateExport = (): ExportResult => {
    let content = ''
    let filename = ''
    
    switch (exportFormat) {
      case 'markdown-tickets':
        content = tickets.map(generateMarkdownTicket).join('\n')
        filename = `tickets-${new Date().toISOString().split('T')[0]}.md`
        break
      case 'markdown-roadmap':
        content = generateMarkdownRoadmap()
        filename = `roadmap-${new Date().toISOString().split('T')[0]}.md`
        break
      case 'json':
        content = generateJSONExport()
        filename = `project-export-${new Date().toISOString().split('T')[0]}.json`
        break
      default:
        content = tickets.map(generateMarkdownTicket).join('\n')
        filename = `tickets-${new Date().toISOString().split('T')[0]}.md`
    }
    
    return { content, filename }
  }

  /**
   * Handles the preview functionality
   * Generates export content and displays it in a modal
   */
  const handlePreview = (): void => {
    const { content } = generateExport()
    setPreviewContent(content)
    setShowPreview(true)
  }

  /**
   * Handles the download functionality
   * Generates export content and triggers browser download
   */
  const handleDownload = (): void => {
    const { content, filename } = generateExport()
    
    const blob = new Blob([content], { 
      type: exportFormat === 'json' ? 'application/json' : 'text/markdown' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Handles copying export content to clipboard
   * Uses the Clipboard API to copy generated content
   * @returns {Promise<void>} Promise that resolves when copy operation completes
   */
  const handleCopyToClipboard = async (): Promise<void> => {
    const { content } = generateExport()
    try {
      await navigator.clipboard.writeText(content)
      alert('Content copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <div className="content-wrapper">
          <h2 className="section-title">
            <span className="icon-spacing">📁</span>
            Export Data
          </h2>
          <p className="section-subtitle">
            Export your tickets and roadmap data as markdown files for backup or version control.
          </p>

          <div className="form-section">
            <label className="form-label">
              <span className="icon-spacing">⚙️</span>
              Export Format
            </label>
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="exportFormat"
                  value="markdown-tickets"
                  checked={exportFormat === 'markdown-tickets'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium" style={{ color: '#2d3e2e' }}>
                    <span className="icon-spacing">📄</span>
                    Export Tickets
                  </div>
                  <div className="text-sm" style={{ color: '#5a6e5a' }}>
                    Export all tickets as individual markdown documents
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="exportFormat"
                  value="markdown-roadmap"
                  checked={exportFormat === 'markdown-roadmap'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium" style={{ color: '#2d3e2e' }}>
                    <span className="icon-spacing">🗺️</span>
                    Export Roadmap
                  </div>
                  <div className="text-sm" style={{ color: '#5a6e5a' }}>
                    Export roadmap with milestone breakdown and progress
                  </div>
                </div>
              </label>
              
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="exportFormat"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium" style={{ color: '#2d3e2e' }}>
                    <span className="icon-spacing">📦</span>
                    Export All Data
                  </div>
                  <div className="text-sm" style={{ color: '#5a6e5a' }}>
                    Complete project export with all data in JSON format
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="button-group">
            <button onClick={handlePreview} className="btn-secondary-green">
              <span className="icon-spacing">👁️</span>
              Preview
            </button>
            <button onClick={handleDownload} className="btn-primary-green">
              <span className="icon-spacing">📁</span>
              Download
            </button>
            <button onClick={handleCopyToClipboard} className="btn-secondary-green">
              <span className="icon-spacing">📋</span>
              Copy to Clipboard
            </button>
          </div>

          <div className="export-section-green">
            <h3 className="text-lg font-medium mb-4" style={{ color: '#2d3e2e' }}>
              <span className="icon-spacing">📝</span>
              Sample Ticket Markdown Format
            </h3>
            <div className="code-preview-green">
{`# Ticket: Fix login validation

**ID:** TKT-001
**Status:** todo
**Priority:** high
**Assignee:** john.doe
**Milestone:** v1.0
**Created:** 2025-06-26

## Description

Users are experiencing issues with login validation when using special characters in passwords.

## Acceptance Criteria

- [ ] Validate special characters properly
- [ ] Update error messages
- [ ] Add unit tests`}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="card-green max-w-4xl max-h-[80vh] w-full overflow-hidden">
              <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #c8d5c8' }}>
                <h3 className="text-lg font-medium" style={{ color: '#2d3e2e' }}>
                  <span className="icon-spacing">👁️</span>
                  Export Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                  style={{ color: '#5a6e5a' }}
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[60vh]">
                <pre className="code-preview-green">
                  {previewContent}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Default export of the ExportView component
 * @default ExportView
 */
export default ExportView
