/**
 * Programs API tests
 * Following Cursor Clause 4.5 Rules
 */

import request from 'supertest';
import { createApp } from '../../src/server';

describe('Programs API', () => {
  const app = createApp();

  describe('GET /api/programs', () => {
    it('should return list of programs', async () => {
      const response = await request(app)
        .get('/api/programs')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter programs by status', async () => {
      const response = await request(app)
        .get('/api/programs?status=Released')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.length > 0) {
        response.body.data.forEach((program: any) => {
          expect(program.status).toBe('Released');
        });
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/programs?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('limit', 5);
    });
  });

  describe('GET /api/programs/:id', () => {
    it('should return 404 for non-existent program', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/programs/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /api/programs', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/programs')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject invalid machine ID', async () => {
      const response = await request(app)
        .post('/api/programs')
        .send({
          name: 'Test Program',
          partNumber: 'TEST-001',
          revision: 'A',
          machineId: 'invalid-uuid',
          operation: 'Test',
          material: 'Steel',
          customer: 'Test Customer',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});


