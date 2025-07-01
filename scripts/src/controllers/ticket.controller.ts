import { Controller, Get, Post, Put, Delete, Param, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateTicketDto, UpdateTicketDto, TicketResponseDto, TicketsListResponseDto, ErrorResponseDto } from '../dto/ticket.dto';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';

@ApiTags('Tickets')
@Controller('api/ticket')
export class TicketController {

  // Get tickets directory from environment or use default
  private readonly TICKETS_DIR = process.env.TICKETS_DIR || '.totem/tickets';

  // Helper function to parse markdown ticket files
  private parseTicketMarkdown(filePath: string): any {
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

  @Get()
  @ApiOperation({ 
    summary: 'Get all tickets from markdown files',
    description: 'Retrieves all tickets by parsing markdown files from the .totem/tickets directory. Returns 404 if no tickets are found or directory is missing.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tickets retrieved successfully',
    type: TicketsListResponseDto,
    examples: {
      success: {
        summary: 'Successful response with tickets',
        value: {
          message: 'Get all tickets',
          tickets: [
            {
              id: 'healthcare.frontend.patient-dashboard-003',
              title: 'Patient Dashboard Redesign',
              description: 'Modern React-based dashboard with real-time data visualization',
              status: 'in-progress',
              priority: 'medium',
              complexity: 'high',
              persona: 'product-proteus',
              collabotator: null,
              model: null,
              effort_days: null,
              blocks: ['healthcare.mobile.app-sync-007'],
              blocked_by: ['healthcare.security.auth-sso-001'],
              acceptance_criteria: [
                { criteria: 'Wireframes approved by UX team', complete: true },
                { criteria: 'Component library integration', complete: true }
              ],
              tags: ['product-proteus', 'medium', 'high'],
              notes: 'Modern React-based dashboard with real-time data visualization',
              risks: ['Performance issues with real-time updates (medium)'],
              resources: ['Use ChartJS for vitals visualization']
            }
          ]
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No tickets found or tickets directory not found',
    type: ErrorResponseDto,
    examples: {
      no_directory: {
        summary: 'Tickets directory not found',
        value: {
          message: 'Tickets directory not found',
          error: 'No tickets directory exists',
          tickets: []
        }
      },
      no_files: {
        summary: 'No markdown files found',
        value: {
          message: 'No tickets found',
          error: 'No markdown ticket files exist in the tickets directory',
          tickets: []
        }
      },
      no_valid_tickets: {
        summary: 'No parseable tickets found',
        value: {
          message: 'No valid tickets found',
          error: 'No ticket files could be parsed successfully',
          tickets: []
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Server error while reading tickets',
    type: ErrorResponseDto,
    examples: {
      server_error: {
        summary: 'Filesystem error',
        value: {
          message: 'Error reading tickets',
          error: 'Permission denied',
          tickets: []
        }
      }
    }
  })
  async getAllTickets() {
    try {
      const ticketsDir = join(__dirname, '../../../', this.TICKETS_DIR);
      
      // Check if tickets directory exists
      if (!existsSync(ticketsDir)) {
        throw new HttpException({
          message: 'Tickets directory not found',
          error: 'No tickets directory exists',
          tickets: []
        }, HttpStatus.NOT_FOUND);
      }
      
      // Read all markdown files from the tickets directory
      const files = readdirSync(ticketsDir).filter(file => file.endsWith('.md'));
      
      // Return 404 if no markdown files exist
      if (files.length === 0) {
        throw new HttpException({
          message: 'No tickets found',
          error: 'No markdown ticket files exist in the tickets directory',
          tickets: []
        }, HttpStatus.NOT_FOUND);
      }
      
      const tickets = files
        .map(file => this.parseTicketMarkdown(join(ticketsDir, file)))
        .filter(ticket => ticket !== null); // Filter out failed parses
      
      // Return 404 if no tickets could be parsed successfully
      if (tickets.length === 0) {
        throw new HttpException({
          message: 'No valid tickets found',
          error: 'No ticket files could be parsed successfully',
          tickets: []
        }, HttpStatus.NOT_FOUND);
      }
      
      return {
        message: 'Get all tickets',
        tickets
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      console.error('Error reading tickets:', error);
      throw new HttpException({
        message: 'Error reading tickets',
        error: error instanceof Error ? error.message : 'Unknown error',
        tickets: []
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get ticket by ID',
    description: 'Retrieves a specific ticket by its ID from markdown files. Returns the full ticket data if found.'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID', example: 'healthcare.security.auth-sso-001' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket retrieved successfully',
    type: TicketResponseDto,
    examples: {
      success: {
        summary: 'Successful ticket retrieval',
        value: {
          message: 'Get ticket with ID: healthcare.security.auth-sso-001',
          ticket: {
            id: 'healthcare.security.auth-sso-001',
            status: 'open',
            priority: 'high',
            complexity: 'medium',
            persona: 'security-sasha',
            collabotator: null,
            model: null,
            blocks: ['patient-dashboard-003'],
            blocked_by: ['ad-integration-001'],
            title: 'Implement Single Sign-On (SSO) for Healthcare Application',
            description: 'Implement Single Sign-On (SSO) to enhance security and user experience in the healthcare application',
            acceptance_criteria: [
              { criteria: 'SSO is implemented using OAuth 2.0 and OpenID Connect standards', complete: false },
              { criteria: 'Users can log in using their organizational credentials', complete: false }
            ],
            tags: ['security', 'sso', 'oauth2', 'openid-connect'],
            notes: 'Ensure compliance with HIPAA regulations. Implement logging for all authentication attempts.',
            risks: ['Potential integration issues with existing authentication systems'],
            resources: ['OAuth 2.0 and OpenID Connect documentation']
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Ticket not found',
    type: ErrorResponseDto,
    examples: {
      not_found: {
        summary: 'Ticket not found',
        value: {
          message: 'Ticket with ID healthcare.nonexistent.ticket-999 not found',
          error: 'No markdown file found with matching ID',
          ticket: null
        }
      },
      directory_not_found: {
        summary: 'Tickets directory not found',
        value: {
          message: 'Tickets directory not found',
          error: 'No tickets directory exists',
          ticket: null
        }
      },
      id_mismatch: {
        summary: 'Ticket ID mismatch',
        value: {
          message: 'Ticket with ID healthcare.wrong.id-001 not found',
          error: 'Ticket ID mismatch',
          ticket: null
        }
      }
    }
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Error parsing ticket file',
    type: ErrorResponseDto,
    examples: {
      parse_error: {
        summary: 'Failed to parse ticket file',
        value: {
          message: 'Error parsing ticket healthcare.security.auth-sso-001',
          error: 'Failed to parse markdown file',
          ticket: null
        }
      },
      server_error: {
        summary: 'Server error',
        value: {
          message: 'Error retrieving ticket healthcare.security.auth-sso-001',
          error: 'Permission denied',
          ticket: null
        }
      }
    }
  })
  async getTicketById(@Param('id') id: string) {
    try {
      const ticketsDir = join(__dirname, '../../../', this.TICKETS_DIR);
      
      // Check if tickets directory exists
      if (!existsSync(ticketsDir)) {
        throw new HttpException({
          message: 'Tickets directory not found',
          error: 'No tickets directory exists',
          ticket: null
        }, HttpStatus.NOT_FOUND);
      }
      
      // Find the markdown file with the matching ID
      const files = readdirSync(ticketsDir).filter(file => file.endsWith('.md'));
      const matchingFile = files.find(file => file.includes(id) || file.startsWith(id));
      
      if (!matchingFile) {
        throw new HttpException({
          message: `Ticket with ID ${id} not found`,
          error: 'No markdown file found with matching ID',
          ticket: null
        }, HttpStatus.NOT_FOUND);
      }
      
      const filePath = join(ticketsDir, matchingFile);
      
      // Parse the ticket markdown file
      const ticket = this.parseTicketMarkdown(filePath);
      
      if (!ticket) {
        throw new HttpException({
          message: `Error parsing ticket ${id}`,
          error: 'Failed to parse markdown file',
          ticket: null
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
      // Verify the parsed ticket ID matches the requested ID
      if (ticket.id !== id) {
        throw new HttpException({
          message: `Ticket with ID ${id} not found`,
          error: 'Ticket ID mismatch',
          ticket: null
        }, HttpStatus.NOT_FOUND);
      }
      
      return {
        message: `Get ticket with ID: ${id}`,
        ticket
      };
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      console.error(`Error retrieving ticket ${id}:`, error);
      throw new HttpException({
        message: `Error retrieving ticket ${id}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        ticket: null
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new ticket',
    description: 'Creates a new ticket with the provided data. Currently returns the submitted data as confirmation.'
  })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Ticket created successfully',
    type: TicketResponseDto,
    examples: {
      created: {
        summary: 'Ticket creation response',
        value: {
          message: 'Ticket created successfully',
          ticket: {
            title: 'Fix login bug',
            description: 'Users cannot login with their credentials',
            status: 'open',
            priority: 'high'
          }
        }
      }
    }
  })
  async createTicket(@Body() ticketData: CreateTicketDto) {
    return {
      message: 'Ticket created successfully',
      ticket: ticketData
    };
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update an existing ticket',
    description: 'Updates an existing ticket with the provided data. Currently returns the submitted data as confirmation.'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID to update', example: 'healthcare.frontend.patient-dashboard-003' })
  @ApiBody({ type: UpdateTicketDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket updated successfully',
    type: TicketResponseDto,
    examples: {
      updated: {
        summary: 'Ticket update response',
        value: {
          message: 'Ticket healthcare.frontend.patient-dashboard-003 updated successfully',
          ticket: {
            title: 'Updated ticket title',
            status: 'in-progress'
          }
        }
      }
    }
  })
  async updateTicket(@Param('id') id: string, @Body() ticketData: UpdateTicketDto) {
    return {
      message: `Ticket ${id} updated successfully`,
      ticket: ticketData
    };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a ticket',
    description: 'Deletes a ticket by its ID. Currently returns a confirmation message.'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID to delete', example: 'healthcare.frontend.patient-dashboard-003' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ticket deleted successfully',
    examples: {
      deleted: {
        summary: 'Ticket deletion response',
        value: {
          message: 'Ticket healthcare.frontend.patient-dashboard-003 deleted successfully'
        }
      }
    }
  })
  async deleteTicket(@Param('id') id: string) {
    return {
      message: `Ticket ${id} deleted successfully`
    };
  }
}
