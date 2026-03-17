const request = require('supertest');
const app = require('../app');

describe('Portfolio API', () => {
  const headers = {
    'Origin': 'http://localhost:3000',
    'Content-Type': 'application/json'
  };

  describe('GET /api/carteira', () => {
    test('Deve retornar erro sem auth', async () => {
      const res = await request(app).get('/api/carteira').set(headers);
      expect([401, 500]).toContain(res.status);
    });
  });

  describe('POST /api/carteira (buy)', () => {
    test('Deve retornar erro sem auth', async () => {
      const res = await request(app)
        .post('/api/carteira')
        .set(headers)
        .send({
          codigo_ativo: 'PETR4',
          quantidade: 10,
          valor_compra: 100.00,
          estrategia_id: '123e4567-e89b-12d3-a456-426614174000'
        });
      expect([401, 500]).toContain(res.status);
    });
  });

  describe('POST /api/vender (sell)', () => {
    test('Deve retornar erro sem auth', async () => {
      const res = await request(app)
        .post('/api/vender')
        .set(headers)
        .send({
          codigo_ativo: 'PETR4',
          quantidade: 5,
          estrategia_id: '123e4567-e89b-12d3-a456-426614174000'
        });
      expect([401, 500]).toContain(res.status);
    });
  });

  describe('GET /api/total-investido', () => {
    test('Deve retornar erro sem auth', async () => {
      const res = await request(app).get('/api/total-investido').set(headers);
      expect([401, 500]).toContain(res.status);
    });
  });
});
