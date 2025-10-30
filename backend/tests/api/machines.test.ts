/**
 * Machines API tests
 * Following Cursor Clause 4.5 Rules
 */

import request from 'supertest';
import { createApp } from '../../src/server';

describe('Machines API', () => {
  const app = createApp();

  describe('GET /api/machines', () => {
    it('should return list of machines', async () => {
      const response = await request(app)
        .get('/api/machines')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter machines by status', async () => {
      const response = await request(app)
        .get('/api/machines?status=Online')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        response.body.data.forEach((machine: any) => {
          expect(machine.status).toBe('Online');
        });
      }
    });

    it('should include program count', async () => {
      const response = await request(app)
        .get('/api/machines')
        .expect(200);

      if (response.body.data.length > 0) {
        expect(response.body.data[0]).toHaveProperty('programCount');
        expect(typeof response.body.data[0].programCount).toBe('number');
      }
    });
  });

  describe('POST /api/machines', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/machines')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid IP address', async () => {
      const response = await request(app)
        .post('/api/machines')
        .send({
          name: 'Test Machine',
          type: 'Mill',
          ipAddress: 'not-an-ip',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});


