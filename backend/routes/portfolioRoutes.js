const express = require('express');
const PortfolioController = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');
const { validate, validateQuery, schemas } = require('../middleware/validation');
const { sensitiveLimiter } = require('../middleware/security');

const router = express.Router();

// Rota para buscar carteira (protegida)
router.get('/carteira', authenticate, PortfolioController.getPortfolio);

// Rota para registrar compra (protegida) - com validação
router.post('/carteira', authenticate, sensitiveLimiter, validate(schemas.buyAsset), PortfolioController.buyAsset);

// Rota para registrar venda (protegida) - com validação
router.post('/vender', authenticate, sensitiveLimiter, validate(schemas.sellAsset), PortfolioController.sellAsset);

// Rota para obter total investido (protegida)
router.get('/total-investido', authenticate, PortfolioController.getTotalInvested);

// Rota para verificar estrutura da tabela (opcional, para debug)
router.get('/check-table-structure', PortfolioController.checkTableStructure);

module.exports = router;