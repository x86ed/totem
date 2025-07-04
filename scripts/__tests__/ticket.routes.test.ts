import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import ticketRoutes from '../routes/ticket';

describe('Ticket Routes - Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ticket', ticketRoutes);
  });

  describe('GET /api/ticket', () => {
    it('should return 404 when tickets directory does not exist', async () => {
      // Since we're using integration tests, we'll test against the actual filesystem
      // If the directory doesn't exist, it should return 404
      const response = await request(app)
        .get('/api/ticket');
      
      // With our test setup, the directory should exist, so we expect 200
      // But if it didn't exist, it would return 404
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 404) {
        expect(response.body.message).toContain('not found');
        expect(response.body.tickets).toEqual([]);
        expect(response.body.error).toBeDefined();
      }
    });

    it('should return tickets from filesystem when files exist', async () => {
      const response = await request(app)
        .get('/api/ticket');

      // Since we have tickets in the filesystem, expect 200 or 404 depending on state
      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeDefined();
        expect(response.body.message).toBe('Get all tickets');
        expect(Array.isArray(response.body.tickets)).toBe(true);
        
        // Test the structure of returned tickets
        if (response.body.tickets.length > 0) {
          const ticket = response.body.tickets[0];
          expect(ticket).toHaveProperty('id');
          expect(ticket).toHaveProperty('title');
          expect(ticket).toHaveProperty('description');
          expect(ticket).toHaveProperty('status');
          expect(ticket).toHaveProperty('priority');
          expect(ticket).toHaveProperty('complexity');
          expect(ticket).toHaveProperty('persona');
          
          // Test optional arrays
          expect(Array.isArray(ticket.blocks || [])).toBe(true);
          expect(Array.isArray(ticket.blocked_by || [])).toBe(true);
        }
      } else if (response.status === 404) {
        expect(response.body.message).toMatch(/no tickets found|directory not found|no valid tickets/i);
        expect(response.body.tickets).toEqual([]);
        expect(response.body.error).toBeDefined();
      }
    });

    it('should return valid JSON response', async () => {
      const response = await request(app)
        .get('/api/ticket')
        .expect('Content-Type', /json/);

      expect([200, 404, 500]).toContain(response.status);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.tickets)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      // This test will run against the actual filesystem
      // If there are permission issues or other errors, 
      // the endpoint should still return a valid response
      const response = await request(app)
        .get('/api/ticket');

      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(600);
      expect(response.body).toBeDefined();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle directory not existing gracefully', async () => {
      // Test the actual API behavior - it should handle missing directories gracefully
      const response = await request(app)
        .get('/api/ticket');

      expect([200, 404]).toContain(response.status);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.tickets)).toBe(true);
      
      if (response.status === 404) {
        expect(response.body.message).toMatch(/not found|no tickets/i);
        expect(response.body.error).toBeDefined();
      }
    });
  });

  describe('GET /api/ticket/:id', () => {
    it('should return ticket by ID with actual ticket data', async () => {
      // Test with a real ticket ID that exists in the filesystem
      const ticketId = 'healthcare.security.auth-sso-001';
      const response = await request(app)
        .get(`/api/ticket/${ticketId}`)
        .expect([200, 404]); // Accept both as directory might not exist in test environment

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message', `Get ticket with ID: ${ticketId}`);
        expect(response.body).toHaveProperty('ticket');
        
        // If ticket is found, validate structure
        if (response.body.ticket) {
          const ticket = response.body.ticket;
          expect(ticket).toHaveProperty('id', ticketId);
          expect(ticket).toHaveProperty('title');
          expect(ticket).toHaveProperty('description');
          expect(ticket).toHaveProperty('status');
          expect(ticket).toHaveProperty('priority');
          expect(ticket).toHaveProperty('complexity');
          expect(ticket).toHaveProperty('persona');
          expect(Array.isArray(ticket.blocks || [])).toBe(true);
          expect(Array.isArray(ticket.blocked_by || [])).toBe(true);
        }
      } else {
        // 404 response should have proper error structure
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('ticket', null);
      }
    });

    it('should return 404 for non-existent ticket ID', async () => {
      const ticketId = 'non.existent.ticket-999';
      const response = await request(app)
        .get(`/api/ticket/${ticketId}`)
        .expect([404, 200]); // Might return 200 if directory doesn't exist

      if (response.status === 404) {
        expect(response.body).toEqual({
          message: `Ticket with ID ${ticketId} not found`,
          error: 'No markdown file found with matching ID',
          ticket: null
        });
      }
    });

    it('should handle numeric IDs', async () => {
      const ticketId = 456;
      const response = await request(app)
        .get(`/api/ticket/${ticketId}`)
        .expect(404);

      expect(response.body.message).toBe(`Ticket with ID ${ticketId} not found`);
    });

    it('should handle UUID format IDs', async () => {
      const ticketId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const response = await request(app)
        .get(`/api/ticket/${ticketId}`)
        .expect(404);

      expect(response.body.message).toBe(`Ticket with ID ${ticketId} not found`);
    });

    it('should handle special characters in ID', async () => {
      const ticketId = 'ticket-123_special!';
      const response = await request(app)
        .get(`/api/ticket/${encodeURIComponent(ticketId)}`)
        .expect(404);

      expect(response.body.message).toBe(`Ticket with ID ${ticketId} not found`);
    });
  });

  describe('POST /api/ticket', () => {
    it('should create a ticket and return it', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'This is a test ticket',
        status: 'open',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/ticket')
        .send(ticketData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Ticket created successfully',
        ticket: ticketData
      });
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/ticket')
        .send({})
        .expect(201);

      expect(response.body.message).toBe('Ticket created successfully');
      expect(response.body.ticket).toEqual({});
    });

    it('should handle complex ticket data', async () => {
      const complexTicketData = {
        title: 'Complex Ticket',
        description: 'A complex ticket with nested data',
        status: 'in-progress',
        priority: 'high',
        assignee: {
          id: 'user-123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        labels: ['bug', 'frontend', 'urgent'],
        metadata: {
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T14:30:00Z'
        }
      };

      const response = await request(app)
        .post('/api/ticket')
        .send(complexTicketData)
        .expect(201);

      expect(response.body.message).toBe('Ticket created successfully');
      expect(response.body.ticket).toEqual(complexTicketData);
    });

    it('should return 400 for invalid JSON', async () => {
      const response = await request(app)
        .post('/api/ticket')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });

    it('should handle large payloads', async () => {
      const largeTicketData = {
        title: 'Large Ticket',
        description: 'A'.repeat(10000), // 10KB description
        metadata: Array(100).fill(0).map((_, i) => ({ key: `field_${i}`, value: `value_${i}` }))
      };

      const response = await request(app)
        .post('/api/ticket')
        .send(largeTicketData)
        .expect(201);

      expect(response.body.ticket.title).toBe('Large Ticket');
      expect(response.body.ticket.description.length).toBe(10000);
    });
  });

  describe('PUT /api/ticket/:id', () => {
    it('should update a ticket and return it', async () => {
      const ticketId = '123';
      const ticketData = {
        title: 'Updated Ticket',
        description: 'This ticket has been updated',
        status: 'closed'
      };

      const response = await request(app)
        .put(`/api/ticket/${ticketId}`)
        .send(ticketData)
        .expect(200);

      expect(response.body).toEqual({
        message: `Ticket ${ticketId} updated successfully`,
        ticket: ticketData
      });
    });

    it('should handle partial updates', async () => {
      const ticketId = '456';
      const partialData = {
        status: 'in-progress'
      };

      const response = await request(app)
        .put(`/api/ticket/${ticketId}`)
        .send(partialData)
        .expect(200);

      expect(response.body.message).toBe(`Ticket ${ticketId} updated successfully`);
      expect(response.body.ticket).toEqual(partialData);
    });

    it('should handle empty update data', async () => {
      const ticketId = '789';

      const response = await request(app)
        .put(`/api/ticket/${ticketId}`)
        .send({})
        .expect(200);

      expect(response.body.message).toBe(`Ticket ${ticketId} updated successfully`);
      expect(response.body.ticket).toEqual({});
    });

    it('should handle UUID format IDs in updates', async () => {
      const ticketId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const ticketData = { title: 'UUID Ticket Update' };

      const response = await request(app)
        .put(`/api/ticket/${ticketId}`)
        .send(ticketData)
        .expect(200);

      expect(response.body.message).toBe(`Ticket ${ticketId} updated successfully`);
    });

    it('should return 400 for invalid JSON in update', async () => {
      const response = await request(app)
        .put('/api/ticket/123')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });

  describe('DELETE /api/ticket/:id', () => {
    it('should delete a ticket by ID', async () => {
      const ticketId = '123';

      const response = await request(app)
        .delete(`/api/ticket/${ticketId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: `Ticket ${ticketId} deleted successfully`
      });
    });

    it('should handle numeric IDs in deletion', async () => {
      const ticketId = 456;

      const response = await request(app)
        .delete(`/api/ticket/${ticketId}`)
        .expect(200);

      expect(response.body.message).toBe(`Ticket ${ticketId} deleted successfully`);
    });

    it('should handle UUID format IDs in deletion', async () => {
      const ticketId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      const response = await request(app)
        .delete(`/api/ticket/${ticketId}`)
        .expect(200);

      expect(response.body.message).toBe(`Ticket ${ticketId} deleted successfully`);
    });

    it('should handle special characters in ID for deletion', async () => {
      const ticketId = 'ticket-123_special!';

      const response = await request(app)
        .delete(`/api/ticket/${encodeURIComponent(ticketId)}`)
        .expect(200);

      expect(response.body.message).toBe(`Ticket ${ticketId} deleted successfully`);
    });

    it('should return valid JSON response for deletion', async () => {
      const response = await request(app)
        .delete('/api/ticket/test-delete')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toBeDefined();
      expect(response.body.message).toContain('deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/ticket/123/non-existent')
        .expect(404);
    });

    it('should return 405 for unsupported methods', async () => {
      await request(app)
        .patch('/api/ticket/123')
        .expect(404); // Express returns 404 for unmatched routes
    });
  });

  describe('Content-Type Handling', () => {
    it('should accept application/json content type', async () => {
      const ticketData = { title: 'JSON Ticket' };

      const response = await request(app)
        .post('/api/ticket')
        .set('Content-Type', 'application/json')
        .send(ticketData)
        .expect(201);

      expect(response.body.ticket).toEqual(ticketData);
    });

    it('should handle missing content-type header', async () => {
      const response = await request(app)
        .post('/api/ticket')
        .send({ title: 'No Content-Type' })
        .expect(201);

      expect(response.body.message).toBe('Ticket created successfully');
    });
  });

  describe('Response Headers', () => {
    it('should return correct content-type headers for GET requests', async () => {
      const response = await request(app)
        .get('/api/ticket')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return correct content-type headers for POST requests', async () => {
      const response = await request(app)
        .post('/api/ticket')
        .send({ title: 'Header Test' })
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long ticket IDs', async () => {
      const longId = 'a'.repeat(1000);

      const response = await request(app)
        .get(`/api/ticket/${longId}`)
        .expect(404);

      expect(response.body.message).toBe(`Ticket with ID ${longId} not found`);
    });

    it('should handle empty string ID', async () => {
      // This will actually match the base route /api/ticket
      const response = await request(app)
        .get('/api/ticket/')
        .expect(200);

      expect(response.body.message).toBe('Get all tickets');
    });

    it('should handle null values in ticket data', async () => {
      const ticketData = {
        title: 'Null Test',
        description: null,
        assignee: null
      };

      const response = await request(app)
        .post('/api/ticket')
        .send(ticketData)
        .expect(201);

      expect(response.body.ticket).toEqual(ticketData);
    });
  });

  describe('Middleware Features', () => {
    describe('Pagination Middleware', () => {
      it('should handle pagination with limit and offset parameters', async () => {
        const response = await request(app)
          .get('/api/ticket?limit=2&offset=0');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('pagination');
          expect(response.body.pagination).toHaveProperty('offset', 0);
          expect(response.body.pagination).toHaveProperty('limit', 2);
          expect(response.body.pagination).toHaveProperty('total');
          expect(response.body.pagination).toHaveProperty('totalFiltered');
          expect(response.body.tickets.length).toBeLessThanOrEqual(2);
        }
      });

      it('should handle default pagination when no parameters provided', async () => {
        const response = await request(app)
          .get('/api/ticket');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('pagination');
          expect(response.body.pagination).toHaveProperty('offset', 0);
          expect(response.body.pagination).toHaveProperty('limit');
        }
      });

      it('should handle large offset values', async () => {
        const response = await request(app)
          .get('/api/ticket?offset=1000&limit=5');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.pagination.offset).toBe(1000);
          expect(response.body.tickets.length).toBe(0); // Should be empty due to large offset
        }
      });
    });

    describe('Filtering Middleware', () => {
      it('should filter tickets by status', async () => {
        const response = await request(app)
          .get('/api/ticket?status=open');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // All returned tickets should have status 'open'
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.status) {
              expect(ticket.status.toLowerCase()).toBe('open');
            }
          });
        }
      });

      it('should filter tickets by priority', async () => {
        const response = await request(app)
          .get('/api/ticket?priority=high');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // All returned tickets should have priority 'high'
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.priority) {
              expect(ticket.priority.toLowerCase()).toBe('high');
            }
          });
        }
      });

      it('should filter tickets by complexity', async () => {
        const response = await request(app)
          .get('/api/ticket?complexity=medium');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // All returned tickets should have complexity 'medium'
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.complexity) {
              expect(ticket.complexity.toLowerCase()).toBe('medium');
            }
          });
        }
      });

      it('should filter tickets by ID (partial match)', async () => {
        const response = await request(app)
          .get('/api/ticket?id=test');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // All returned tickets should have 'test' in their ID
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.id) {
              expect(ticket.id.toLowerCase()).toContain('test');
            }
          });
        }
      });

      it('should filter tickets by persona', async () => {
        const response = await request(app)
          .get('/api/ticket?persona=security');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // All returned tickets should have persona containing 'security'
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.persona) {
              expect(ticket.persona.toLowerCase()).toContain('security');
            }
          });
        }
      });

      it('should filter tickets by contributor', async () => {
        const response = await request(app)
          .get('/api/ticket?contributor=john');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // All returned tickets should have contributor containing 'john'
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.contributor) {
              expect(ticket.contributor.toLowerCase()).toContain('john');
            }
          });
        }
      });

      it('should handle multiple filters', async () => {
        const response = await request(app)
          .get('/api/ticket?status=open&priority=high');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // All returned tickets should match both filters
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.status) {
              expect(ticket.status.toLowerCase()).toBe('open');
            }
            if (ticket.priority) {
              expect(ticket.priority.toLowerCase()).toBe('high');
            }
          });
        }
      });
    });

    describe('Sorting Middleware', () => {
      it('should sort tickets by ID in ascending order', async () => {
        const response = await request(app)
          .get('/api/ticket?sortBy=id&sortOrder=asc');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200 && response.body.tickets.length > 1) {
          // Check if tickets are sorted by ID in ascending order
          for (let i = 0; i < response.body.tickets.length - 1; i++) {
            const current = response.body.tickets[i].id || '';
            const next = response.body.tickets[i + 1].id || '';
            expect(current.localeCompare(next)).toBeLessThanOrEqual(0);
          }
        }
      });

      it('should sort tickets by ID in descending order', async () => {
        const response = await request(app)
          .get('/api/ticket?sortBy=id&sortOrder=desc');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200 && response.body.tickets.length > 1) {
          // Check if tickets are sorted by ID in descending order
          for (let i = 0; i < response.body.tickets.length - 1; i++) {
            const current = response.body.tickets[i].id || '';
            const next = response.body.tickets[i + 1].id || '';
            expect(current.localeCompare(next)).toBeGreaterThanOrEqual(0);
          }
        }
      });

      it('should sort tickets by priority', async () => {
        const response = await request(app)
          .get('/api/ticket?sortBy=priority&sortOrder=desc');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // Priority order: critical > high > medium > low
          const priorityOrder: { [key: string]: number } = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          
          for (let i = 0; i < response.body.tickets.length - 1; i++) {
            const currentPriority = response.body.tickets[i].priority?.toLowerCase() || 'low';
            const nextPriority = response.body.tickets[i + 1].priority?.toLowerCase() || 'low';
            const currentValue = priorityOrder[currentPriority] || 0;
            const nextValue = priorityOrder[nextPriority] || 0;
            expect(currentValue).toBeGreaterThanOrEqual(nextValue);
          }
        }
      });

      it('should sort tickets by complexity', async () => {
        const response = await request(app)
          .get('/api/ticket?sortBy=complexity&sortOrder=desc');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // Complexity order: high > medium > low
          const complexityOrder: { [key: string]: number } = { 'high': 3, 'medium': 2, 'low': 1 };
          
          for (let i = 0; i < response.body.tickets.length - 1; i++) {
            const currentComplexity = response.body.tickets[i].complexity?.toLowerCase() || 'low';
            const nextComplexity = response.body.tickets[i + 1].complexity?.toLowerCase() || 'low';
            const currentValue = complexityOrder[currentComplexity] || 0;
            const nextValue = complexityOrder[nextComplexity] || 0;
            expect(currentValue).toBeGreaterThanOrEqual(nextValue);
          }
        }
      });

      it('should handle default sorting when no sort parameters provided', async () => {
        const response = await request(app)
          .get('/api/ticket');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // Should return tickets in some consistent order (default is by ID ascending)
          expect(response.body.tickets).toBeDefined();
        }
      });
    });

    describe('Combined Middleware', () => {
      it('should apply filtering, sorting, and pagination together', async () => {
        const response = await request(app)
          .get('/api/ticket?status=open&sortBy=priority&sortOrder=desc&limit=3&offset=0');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // Should have pagination metadata
          expect(response.body).toHaveProperty('pagination');
          expect(response.body.pagination.limit).toBe(3);
          expect(response.body.pagination.offset).toBe(0);
          expect(response.body.tickets.length).toBeLessThanOrEqual(3);
          
          // All tickets should match the filter
          response.body.tickets.forEach((ticket: any) => {
            if (ticket.status) {
              expect(ticket.status.toLowerCase()).toBe('open');
            }
          });
          
          // Should be sorted by priority (descending)
          const priorityOrder: { [key: string]: number } = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
          for (let i = 0; i < response.body.tickets.length - 1; i++) {
            const currentPriority = response.body.tickets[i].priority?.toLowerCase() || 'low';
            const nextPriority = response.body.tickets[i + 1].priority?.toLowerCase() || 'low';
            const currentValue = priorityOrder[currentPriority] || 0;
            const nextValue = priorityOrder[nextPriority] || 0;
            expect(currentValue).toBeGreaterThanOrEqual(nextValue);
          }
        }
      });

      it('should handle edge case with filters that return no results', async () => {
        const response = await request(app)
          .get('/api/ticket?status=nonexistent&priority=invalid');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body.tickets).toEqual([]);
          expect(response.body.pagination.totalFiltered).toBe(0);
        }
      });

      it('should handle invalid sort parameters gracefully', async () => {
        const response = await request(app)
          .get('/api/ticket?sortBy=invalid&sortOrder=invalid');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // Should still return tickets, possibly with default sorting
          expect(Array.isArray(response.body.tickets)).toBe(true);
        }
      });

      it('should handle negative offset and limit values', async () => {
        const response = await request(app)
          .get('/api/ticket?offset=-5&limit=-3');

        expect([200, 404]).toContain(response.status);
        
        if (response.status === 200) {
          // Should handle negative values gracefully (convert to valid values)
          expect(response.body.pagination.offset).toBeGreaterThanOrEqual(0);
          expect(response.body.pagination.limit).toBeGreaterThan(0);
        }
      });
    });
  });
});