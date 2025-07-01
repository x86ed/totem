import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateTicketDto, UpdateTicketDto, TicketResponseDto, TicketsListResponseDto } from '../dto/ticket.dto';

@ApiTags('Tickets')
@Controller('api/ticket')
export class TicketController {

  @Get()
  @ApiOperation({ summary: 'Get all tickets' })
  @ApiResponse({ status: 200, description: 'Tickets retrieved successfully' })
  async getAllTickets() {
    return {
      message: 'Get all tickets',
      tickets: []
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiResponse({ status: 200, description: 'Ticket retrieved successfully' })
  async getTicketById(@Param('id') id: string) {
    return {
      message: `Get ticket with ID: ${id}`,
      ticket: null
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new ticket' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  async createTicket(@Body() ticketData: CreateTicketDto) {
    return {
      message: 'Ticket created successfully',
      ticket: ticketData
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing ticket' })
  @ApiResponse({ status: 200, description: 'Ticket updated successfully' })
  async updateTicket(@Param('id') id: string, @Body() ticketData: UpdateTicketDto) {
    return {
      message: `Ticket ${id} updated successfully`,
      ticket: ticketData
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  async deleteTicket(@Param('id') id: string) {
    return {
      message: `Ticket ${id} deleted successfully`
    };
  }
}
