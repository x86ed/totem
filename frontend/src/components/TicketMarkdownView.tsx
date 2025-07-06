import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
}

const TicketMarkdownView: React.FC<TicketMarkdownViewProps> = ({ ticket }) => {
  const generateMarkdownContent = (): string => {
    const frontmatter = `\`\`\`yaml
id: ${ticket.id}
status: ${ticket.status}
priority: ${ticket.priority}
complexity: ${ticket.complexity}${ticket.blocks && ticket.blocks.length > 0 ? `
blocks: [${ticket.blocks.map(id => `${id}`).join(', ')}]` : ''}${ticket.blocked_by && ticket.blocked_by.length > 0 ? `
blocked_by: [${ticket.blocked_by.map(id => `${id}`).join(', ')}]` : ''}${ticket.persona ? `
persona: ${ticket.persona}` : ''}${ticket.contributor ? `
contributor: ${ticket.contributor}` : ''}${ticket.model ? `
model: ${ticket.model}` : ''}${ticket.effort_days ? `
effort_days: ${ticket.effort_days}` : ''}
\`\`\``

    let content = `${frontmatter}

# ${ticket.title}
`

    if (ticket.description) {
      content += `\n${ticket.description}\n`
    }

    if (ticket.acceptance_criteria && ticket.acceptance_criteria.length > 0) {
      content += `\n## Acceptance Criteria\n`
      ticket.acceptance_criteria.forEach(ac => {
        const checkbox = ac.complete ? '[x]' : '[ ]'
        content += `- ${checkbox} ${ac.criteria}\n`
      })
    }

    if (ticket.notes) {
      content += `\n## Implementation Notes\n\`\`\`yaml\n${ticket.notes}\n\`\`\`\n`
    }

    if (ticket.risks && ticket.risks.length > 0) {
      content += `\n**Risks:** ${ticket.risks.join(', ')}\n`
    }

    if (ticket.resources && ticket.resources.length > 0) {
      content += `\n## Resources\n`
      ticket.resources.forEach(resource => {
        if (resource.startsWith('http')) {
          content += `- [${resource}](${resource})\n`
        } else {
          content += `- ${resource}\n`
        }
      })
    }

    if (ticket.tags && ticket.tags.length > 0) {
      content += `\n---\n\n**Tags:** ${ticket.tags.map(tag => `\`${tag}\``).join(', ')}\n`
    }

    return content
  }

  return (
    <div className="ticket-markdown-view">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !props.node?.children?.some?.((child: any) => child.type === 'text' && child.value.includes('\n'))
            return !isInline && match ? (
              <SyntaxHighlighter
                style={tomorrow as any}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-green-500 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-6">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-green-500 pl-4 my-4 text-gray-600 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700 border-b">
              {children}
            </td>
          ),
          hr: () => (
            <hr className="my-8 border-gray-200" />
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-600">
              {children}
            </em>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-green-600 hover:text-green-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          )
        }}
      >
        {generateMarkdownContent()}
      </ReactMarkdown>
    </div>
  )
}

export default TicketMarkdownView
