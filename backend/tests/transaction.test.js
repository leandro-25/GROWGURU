const request = require('supertest');
const app = require('../app');

describe('Transaction API', () => {
  const headers = {
    'Origin': 'http://localhost:3000',
    'Content-Type': 'application/json'
  };

  describe('GET /api/transacoes', () => {
    test('Deve retornar erro sem auth', async () => {
      const res = await request(app).get('/api/transacoes').set(headers);
      expect([401, 500]).toContain(res.status);
    });
  });

  describe('POST /api/transacoes', () => {
    test('Deve retornar erro sem auth', async () => {
      const res = await request(app)
        .post('/api/transacoes')
        .set(headers)
        .send({
          tipo: 'compra',
          codigo_ativo: 'PETR4',
          quantidade: 10,
          preco: 100.00
        });
      expect([401, 500]).toContain(res.status);
    });
  });
});
