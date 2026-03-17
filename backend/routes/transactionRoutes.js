const express = require('express');
const TransactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { validateQuery, schemas } = require('../middleware/validation');

const router = express.Router();

// Rota para buscar transações (protegida) - com paginação e validação
router.get('/transacoes', authenticate, validateQuery(schemas.transactionQuery), TransactionController.getTransactions);

// Rota para registrar transação (protegida)
router.post('/transacoes', authenticate, TransactionController.createTransaction);

module.exports = router;