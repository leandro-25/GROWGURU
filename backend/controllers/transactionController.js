const TransactionModel = require('../models/TransactionModel');
const logger = require('../middleware/logger');

class TransactionController {
  static async getTransactions(req, res) {
    try {
      const user = req.user;
      const queryParams = req.validatedQuery || req.query;
      let page = parseInt(queryParams.page) || 1;
      if (page === 0) page = 1;
      
      const result = await TransactionModel.getTransactionsByUser(user.id, {
        page,
        limit: parseInt(queryParams.limit) || 20,
        tipo: queryParams.tipo
      });

      res.json(result.data);
    } catch (error) {
      logger.error('Erro ao buscar transações:', error);
      res.status(500).json({ error: 'Erro interno' });
    }
  }

  static async createTransaction(req, res) {
    try {
      const user = req.user;
      const { valor, tipo, descricao } = req.body;
      const transacao = await TransactionModel.executeTransaction(user.id, valor, tipo, descricao);
      res.json(transacao);
    } catch (error) {
      logger.error('Erro na transação:', error);
      res.status(500).json({ error: 'Erro ao processar transação' });
    }
  }
}

module.exports = TransactionController;