/**
 * Health endpoint tests
 * Following Cursor Clause 4.5 Rules
 */

import request from 'supertest';
import { createApp } from '../../src/server';

describe('Health Check', () => {
  const app = createApp();

  describe('GET /health', () => {
    it('should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });

    it('should include timestamp', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe('GET /non-existent', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/non-existent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Resource not found');
    });
  });
});


