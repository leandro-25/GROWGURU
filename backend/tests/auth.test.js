const request = require('supertest');
const app = require('../app');

describe('Auth Controller', () => {
  const headers = {
    'Origin': 'http://localhost:3000',
    'Content-Type': 'application/json'
  };

  describe('POST /api/login', () => {
    test('Deve retornar erro sem credenciais', async () => {
      const response = await request(app)
        .post('/api/login')
        .set(headers)
        .send({});
       
      expect([400, 401, 500]).toContain(response.status);
    });

    test('Deve retornar erro com email inválido', async () => {
      const response = await request(app)
        .post('/api/login')
        .set(headers)
        .send({
          email: 'invalid-email',
          password: 'password123'
        });
       
      expect([400, 401, 500]).toContain(response.status);
    });
  });

  describe('POST /api/signup', () => {
    test('Deve retornar erro sem nome', async () => {
      const response = await request(app)
        .post('/api/signup')
        .set(headers)
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
       
      expect([400, 401, 500]).toContain(response.status);
    });
  });
});
