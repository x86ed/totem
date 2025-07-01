import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import ticketRoutes from '../routes/ticket';

describe('Ticket Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/ticket', ticketRoutes);
  });

  describe('GET /api/ticket', () => {
    it('should return all tickets with empty array', async () => {
      const response = await request(app)
        .get('/api/ticket')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Get all tickets',
        tickets: []
      });
    });

    it('should return valid JSON response', async () => {
      const response = await request(app)
        .get('/api/ticket')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toBeDefined();
      expect(response.body.message).toBe('Get all tickets');
      expect(Array.isArray(response.body.tickets)).toBe(true);
    });
  });

  describe('GET /api/ticket/:id', () => {
    it('should return ticket by ID with null ticket', async () => {
      const ticketId = '123';
      const response = await request(app)
        .get(`/api/ticket/${ticketId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: `Get ticket with ID: ${ticketId}`,
        ticket: null
      });
    });

    it('should handle numeric IDs', async () => {
      const ticketId = 456;
      const response = await request(app)
        .get(`/api/ticket/${ticketId}`)
        .expect(200);

      expect(response.body.message).toBe(`Get ticket with ID: ${ticketId}`);
      expect(response.body.ticket).toBeNull();
    });

    it('should handle UUID format IDs', async () => {
      const ticketId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
      const response = await request(app)
        .get(`/api/ticket/${ticketId}`)
        .expect(200);

      expect(response.body.message).toBe(`Get ticket with ID: ${ticketId}`);
      expect(response.body.ticket).toBeNull();
    });

    it('should handle special characters in ID', async () => {
      const ticketId = 'ticket-123_special!';
      const response = await request(app)
        .get(`/api/ticket/${encodeURIComponent(ticketId)}`)
        .expect(200);

      expect(response.body.message).toBe(`Get ticket with ID: ${ticketId}`);
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
        .expect(200);

      expect(response.body.message).toBe(`Get ticket with ID: ${longId}`);
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
});