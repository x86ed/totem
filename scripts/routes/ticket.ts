import { Router, Request, Response } from 'express';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

const router = Router();

// Get tickets directory from environment or use default
const TICKETS_DIR = process.env.TICKETS_DIR || '.totem/tickets';

// Helper function to parse markdown ticket files
function parseTicketMarkdown(filePath: string): any {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Extract YAML frontmatter
    const yamlMatch = content.match(/^```yaml\n([\s\S]*?)\n```/);
    if (!yamlMatch) {
      throw new Error('No YAML frontmatter found');
    }
    
    const yamlData = parse(yamlMatch[1]) as any;
    
    // Extract title from markdown heading
    const titleMatch = content.match(/^# (.+)$/m);
    const title = titleMatch ? titleMatch[1] : yamlData.id;
    
    // Extract description (first paragraph after title)
    const descriptionMatch = content.match(/^# .+\n\n(.+?)(?:\n\n|$)/m);
    const description = descriptionMatch ? descriptionMatch[1] : '';
    
    // Extract acceptance criteria
    const criteriaSection = content.match(/## Acceptance Criteria\n([\s\S]*?)(?:\n## |$)/);
    const acceptance_criteria: Array<{criteria: string, complete: boolean}> = [];
    
    if (criteriaSection) {
      const criteriaLines = criteriaSection[1].split('\n').filter(line => line.trim().startsWith('- ['));
      criteriaLines.forEach(line => {
        const isComplete = line.includes('[x]');
        const criteria = line.replace(/^- \[[x\s]\]\s*/, '').trim();
        if (criteria) {
          acceptance_criteria.push({ criteria, complete: isComplete });
        }
      });
    }
    
    // Extract tags from various sources
    const tags: string[] = [];
    if (yamlData.persona) tags.push(yamlData.persona);
    if (yamlData.priority) tags.push(yamlData.priority);
    if (yamlData.complexity) tags.push(yamlData.complexity);
    
    // Extract risks
    const risksMatch = content.match(/\*\*Risks:\*\*\s*(.+)/);
    const risks: string[] = [];
    if (risksMatch) {
      const riskText = risksMatch[1];
      const riskItems = riskText.split(/,\s*(?=[A-Z])/);
      risks.push(...riskItems.map(risk => risk.trim()));
    }
    
    // Extract implementation notes as resources
    const notesMatch = content.match(/## Implementation Notes\n```[\s\S]*?\n([\s\S]*?)\n```/);
    const resources: string[] = [];
    if (notesMatch) {
      const notes = notesMatch[1].split('\n').filter(line => line.trim().startsWith('//'));
      resources.push(...notes.map(note => note.replace(/^\/\/\s*/, '').trim()));
    }
    
    return {
      id: yamlData.id,
      status: yamlData.status || 'open',
      priority: yamlData.priority || 'medium',
      complexity: yamlData.complexity || 'medium',
      persona: yamlData.persona || null,
      collabotator: yamlData.collabotator || null,
      model: yamlData.model || null,
      effort_days: yamlData.effort_days || null,
      blocks: yamlData.blocks || [],
      blocked_by: yamlData.blocked_by || [],
      title,
      description,
      acceptance_criteria,
      tags,
      notes: description,
      risks,
      resources
    };
  } catch (error) {
    console.error(`Error parsing ticket file ${filePath}:`, error);
    return null;
  }
}

// Ticket endpoints
router.get('/', (req: Request, res: Response) => {
  try {
    const ticketsDir = join(__dirname, '../../', TICKETS_DIR);
    
    // Check if tickets directory exists
    if (!existsSync(ticketsDir)) {
      return res.status(404).json({
        message: 'Tickets directory not found',
        error: 'No tickets directory exists',
        tickets: []
      });
    }
    
    // Read all markdown files from the tickets directory
    const files = readdirSync(ticketsDir).filter(file => file.endsWith('.md'));
    
    // Return 404 if no markdown files exist
    if (files.length === 0) {
      return res.status(404).json({
        message: 'No tickets found',
        error: 'No markdown ticket files exist in the tickets directory',
        tickets: []
      });
    }
    
    const tickets = files
      .map(file => parseTicketMarkdown(join(ticketsDir, file)))
      .filter(ticket => ticket !== null); // Filter out failed parses
    
    // Return 404 if no tickets could be parsed successfully
    if (tickets.length === 0) {
      return res.status(404).json({
        message: 'No valid tickets found',
        error: 'No ticket files could be parsed successfully',
        tickets: []
      });
    }
    
    res.json({
      message: 'Get all tickets',
      tickets
    });
    return;
  } catch (error) {
    console.error('Error reading tickets:', error);
    res.status(500).json({
      message: 'Error reading tickets',
      error: error instanceof Error ? error.message : 'Unknown error',
      tickets: []
    });
    return;
  }
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const ticketsDir = join(__dirname, '../../', TICKETS_DIR);
    
    // Check if tickets directory exists
    if (!existsSync(ticketsDir)) {
      return res.status(404).json({
        message: 'Tickets directory not found',
        error: 'No tickets directory exists',
        ticket: null
      });
    }
    
    // Find the markdown file with the matching ID
    const files = readdirSync(ticketsDir).filter(file => file.endsWith('.md'));
    const matchingFile = files.find(file => file.includes(id) || file.startsWith(id));
    
    if (!matchingFile) {
      return res.status(404).json({
        message: `Ticket with ID ${id} not found`,
        error: 'No markdown file found with matching ID',
        ticket: null
      });
    }
    
    const filePath = join(ticketsDir, matchingFile);
    
    // Parse the ticket markdown file
    const ticket = parseTicketMarkdown(filePath);
    
    if (!ticket) {
      return res.status(500).json({
        message: `Error parsing ticket ${id}`,
        error: 'Failed to parse markdown file',
        ticket: null
      });
    }
    
    // Verify the parsed ticket ID matches the requested ID
    if (ticket.id !== id) {
      return res.status(404).json({
        message: `Ticket with ID ${id} not found`,
        error: 'Ticket ID mismatch',
        ticket: null
      });
    }
    
    res.json({
      message: `Get ticket with ID: ${id}`,
      ticket
    });
    return;
    
  } catch (error) {
    console.error(`Error retrieving ticket ${id}:`, error);
    res.status(500).json({
      message: `Error retrieving ticket ${id}`,
      error: error instanceof Error ? error.message : 'Unknown error',
      ticket: null
    });
    return;
  }
});

router.post('/', (req: Request, res: Response) => {
  const ticketData = req.body;
  res.status(201).json({
    message: 'Ticket created successfully',
    ticket: ticketData
  });
});

router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const ticketData = req.body;
  res.json({
    message: `Ticket ${id} updated successfully`,
    ticket: ticketData
  });
});

router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({
    message: `Ticket ${id} deleted successfully`
  });
});

export default router;
