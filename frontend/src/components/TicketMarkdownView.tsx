import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import MilkdownEditor from './MilkdownEditor'

interface Ticket {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  complexity: string
  persona?: string
  contributor?: string
  model?: string
  effort_days?: number
  blocks?: string[]
  blocked_by?: string[]
  acceptance_criteria?: Array<{ criteria: string; complete: boolean }>
  tags?: string[]
  notes?: string
  risks?: string[]
  resources?: string[]
}

interface TicketMarkdownViewProps {
  ticket: Ticket
  isEditable?: boolean
  onTicketUpdate?: (updatedTicket: Partial<Ticket>) => void
}

const TicketMarkdownView: React.FC<TicketMarkdownViewProps> = ({ 
  ticket, 
  isEditable = false, 
  onTicketUpdate 
}) => {
  const [editableDescription, setEditableDescription] = useState(ticket.description || '')
  const [editableNotes, setEditableNotes] = useState(ticket.notes || '')

  const handleDescriptionChange = (newDescription: string) => {
    setEditableDescription(newDescription)
    if (onTicketUpdate) {
      onTicketUpdate({ description: newDescription })
    }
  }

  const handleNotesChange = (newNotes: string) => {
    setEditableNotes(newNotes)
    if (onTicketUpdate) {
      onTicketUpdate({ notes: newNotes })
    }
  }

  return (
    <div className="ticket-markdown-view">
      {/* YAML Frontmatter */}
      <div 
        style={{
          float: 'right',
          marginLeft: '20px',
          marginBottom: '20px',
          width: '320px',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}
      >
        <h3 className="text-lg font-semibold text-white mb-6">Ticket Details</h3>
        <SyntaxHighlighter
          style={tomorrow as any}
          language="yaml"
          PreTag="div"
          customStyle={{
            background: 'transparent',
            padding: '0',
            margin: '0',
            fontSize: '14px'
          }}
        >
          {`id: ${ticket.id}
status: ${ticket.status}
priority: ${ticket.priority}
complexity: ${ticket.complexity}${ticket.blocks && ticket.blocks.length > 0 ? `
blocks: [${ticket.blocks.map(id => `${id}`).join(', ')}]` : ''}${ticket.blocked_by && ticket.blocked_by.length > 0 ? `
blocked_by: [${ticket.blocked_by.map(id => `${id}`).join(', ')}]` : ''}${ticket.persona ? `
persona: ${ticket.persona}` : ''}${ticket.contributor ? `
contributor: ${ticket.contributor}` : ''}${ticket.model ? `
model: ${ticket.model}` : ''}${ticket.effort_days ? `
effort_days: ${ticket.effort_days}` : ''}`}
        </SyntaxHighlighter>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">
        {ticket.title}
      </h1>

      {/* Description - Milkdown Editor */}
      {isEditable ? (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Description</h2>
          <MilkdownEditor
            value={editableDescription}
            onChange={handleDescriptionChange}
            placeholder="Enter ticket description..."
            minHeight="150px"
            className="mb-4"
          />
        </div>
      ) : (
        ticket.description && (
          <div className="mb-6">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
              }}
            >
              {ticket.description}
            </ReactMarkdown>
          </div>
        )
      )}

      {/* Acceptance Criteria */}
      {ticket.acceptance_criteria && ticket.acceptance_criteria.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Acceptance Criteria</h2>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            {ticket.acceptance_criteria.map((ac, index) => (
              <li key={index} className="text-gray-700">
                <input 
                  type="checkbox" 
                  checked={ac.complete} 
                  readOnly 
                  className="mr-2" 
                />
                {ac.criteria}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Implementation Notes - Milkdown Editor */}
      {isEditable ? (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Implementation Notes</h2>
          <MilkdownEditor
            value={editableNotes}
            onChange={handleNotesChange}
            placeholder="Enter implementation notes..."
            minHeight="120px"
            className="mb-4"
          />
        </div>
      ) : (
        ticket.notes && (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Implementation Notes</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => (
                    <p className="text-gray-700 mb-2 leading-relaxed">
                      {children}
                    </p>
                  ),
                }}
              >
                {ticket.notes}
              </ReactMarkdown>
            </div>
          </div>
        )
      )}

      {/* Risks */}
      {ticket.risks && ticket.risks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Risks</h3>
          <ul className="list-disc pl-6 space-y-1">
            {ticket.risks.map((risk, index) => (
              <li key={index} className="text-gray-700">{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {ticket.resources && ticket.resources.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resources</h2>
          <ul className="list-disc pl-6 space-y-2">
            {ticket.resources.map((resource, index) => (
              <li key={index} className="text-gray-700">
                {resource.startsWith('http') ? (
                  <a 
                    href={resource} 
                    className="text-green-600 hover:text-green-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource}
                  </a>
                ) : (
                  resource
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {ticket.tags && ticket.tags.length > 0 && (
        <div className="mb-6">
          <hr className="my-8 border-gray-200" />
          <div>
            <strong className="font-semibold text-gray-900">Tags: </strong>
            {ticket.tags.map((tag, index) => (
              <span key={index}>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{tag}</code>
                {index < ticket.tags!.length - 1 && ', '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TicketMarkdownView
