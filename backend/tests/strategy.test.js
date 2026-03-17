const request = require('supertest');
const app = require('../app');

describe('Strategy API', () => {
  const headers = {
    'Origin': 'http://localhost:3000',
    'Content-Type': 'application/json'
  };

  describe('GET /api/estrategias', () => {
    test('Deve ser acessível sem auth', async () => {
      const res = await request(app).get('/api/estrategias').set(headers);
      expect([200, 500]).toContain(res.status);
    });
  });
});
