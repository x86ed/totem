import React, { useState } from 'react'
import { useTickets } from '../context/TicketContext'

const ExportView = () => {
  const { tickets, milestones } = useTickets()
  const [exportFormat, setExportFormat] = useState('markdown-tickets')
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  const generateMarkdownTicket = (ticket) => {
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

  const generateMarkdownRoadmap = () => {
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

  const generateJSONExport = () => {
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

  const generateExport = () => {
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

  const handlePreview = () => {
    const { content } = generateExport()
    setPreviewContent(content)
    setShowPreview(true)
  }

  const handleDownload = () => {
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

  const handleCopyToClipboard = () => {
    const { content } = generateExport()
    navigator.clipboard.writeText(content).then(() => {
      alert('Content copied to clipboard!')
    })
  }

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <div className="content-wrapper">
          <div className="flex items-center mb-4">
            <span className="icon-spacing text-2xl">📁</span>
            <h2 className="section-title">Export Data</h2>
          </div>
          <p className="section-subtitle">
            Export your tickets and roadmap data as markdown files for backup or version control.
          </p>

          <div className="form-section">
            <label className="form-label">
              <span className="icon-spacing">📋</span>
              Export Format
            </label>
            <div className="space-y-4">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="exportFormat"
                  value="markdown-tickets"
                  checked={exportFormat === 'markdown-tickets'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium" style={{ color: '#2d3e2e' }}>📄 Export Tickets</div>
                  <div className="text-sm" style={{ color: '#5a6e5a' }}>Export all tickets as individual markdown documents</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="exportFormat"
                  value="markdown-roadmap"
                  checked={exportFormat === 'markdown-roadmap'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium" style={{ color: '#2d3e2e' }}>🗺️ Export Roadmap</div>
                  <div className="text-sm" style={{ color: '#5a6e5a' }}>Export roadmap with milestone breakdown and progress</div>
                </div>
              </label>
              
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="exportFormat"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium" style={{ color: '#2d3e2e' }}>📦 Export All Data</div>
                  <div className="text-sm" style={{ color: '#5a6e5a' }}>Complete project export with all data in JSON format</div>
                </div>
              </label>
            </div>
          </div>

          <div className="button-group">
            <button
              onClick={handlePreview}
              className="btn-secondary-green"
            >
              <span className="icon-spacing">👁️</span>
              Preview
            </button>
            <button
              onClick={handleDownload}
              className="btn-primary-green"
            >
              <span className="icon-spacing">�</span>
              Download
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="btn-secondary-green"
            >
              <span className="icon-spacing">📋</span>
              Copy to Clipboard
            </button>
          </div>

          <div className="export-section-green">
            <div className="flex items-center mb-4">
              <span className="icon-spacing">📝</span>
              <h3 className="text-lg font-medium" style={{ color: '#2d3e2e' }}>
                Sample Ticket Markdown Format
              </h3>
            </div>
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
                <h3 className="text-lg font-medium" style={{ color: '#2d3e2e' }}>Export Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                  style={{ color: '#5a6e5a' }}
                >
                  ✕
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[60vh]">
                <pre className="code-preview-green p-4 text-sm font-mono whitespace-pre-wrap">
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

export default ExportView