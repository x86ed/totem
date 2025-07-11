import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import TicketMarkdownView from './TicketMarkdownView'

describe('TicketMarkdownView', () => {
  const mockTicket = {
    id: 'test-ticket-001',
    title: 'API Gateway Implementation',
    description: 'Centralized API gateway for microservices with rate limiting, authentication, and monitoring capabilities.',
    status: 'planning',
    priority: 'medium',
    complexity: 'medium',
    persona: 'security-sasha',
    contributor: 'john-doe',
    model: 'gpt-4',
    effort_days: 5,
    blocks: ['analytics-engine-015'],
    blocked_by: [],
    acceptance_criteria: [
      { criteria: 'Kong or AWS API Gateway setup', complete: false },
      { criteria: 'Rate limiting configured', complete: false },
      { criteria: 'API key management', complete: false }
    ],
    tags: ['authentication', 'security', 'backend'],
    notes: 'Configure rate limits: 1000 req/hour per user\nImplement JWT token validation\nSet up CloudWatch monitoring\nUse OpenAPI 3.0 for documentation',
    risks: ['Single point of failure (medium)', 'Configuration complexity (medium)', 'Performance bottlenecks (low)'],
    resources: ['https://docs.aws.amazon.com/apigateway/', 'Kong documentation']
  }

  it('renders ticket title as h1', () => {
    render(<TicketMarkdownView ticket={mockTicket} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('API Gateway Implementation')
  })

  it('renders YAML frontmatter with ticket metadata', () => {
    render(<TicketMarkdownView ticket={mockTicket} />)
    // Check that the YAML frontmatter code block exists
    const codeBlocks = screen.getAllByRole('code')
    expect(codeBlocks.length).toBeGreaterThan(0)
    
    // Verify that the rendered component contains the ID in any form
    const elementsWithTicketId = screen.getAllByText((_, element) => 
      element?.textContent?.includes('test-ticket-001') || false
    )
    expect(elementsWithTicketId.length).toBeGreaterThan(0)
  })

  it('renders acceptance criteria with checkboxes', () => {
    render(<TicketMarkdownView ticket={mockTicket} />)
    expect(screen.getByText('Acceptance Criteria')).toBeInTheDocument()
    expect(screen.getByText(/Kong or AWS API Gateway setup/)).toBeInTheDocument()
  })

  it('renders implementation notes in code block', () => {
    render(<TicketMarkdownView ticket={mockTicket} />)
    expect(screen.getByText('Implementation Notes')).toBeInTheDocument()
  })

  it('renders risks and resources sections', () => {
    render(<TicketMarkdownView ticket={mockTicket} />)
    expect(screen.getByText(/Single point of failure/)).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<TicketMarkdownView ticket={mockTicket} />)
    expect(screen.getByText('Tags:')).toBeInTheDocument()
    expect(screen.getAllByText(/authentication/)).toHaveLength(2) // once in description, once in tags
  })
})
