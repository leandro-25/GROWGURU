const StrategyModel = require('../models/StrategyModel');
const logger = require('../middleware/logger');

class StrategyController {
  static async getStrategies(req, res) {
    try {
      const estrategias = await StrategyModel.getStrategies();
      res.json(estrategias);
    } catch (error) {
      logger.error('Erro ao buscar estratégias', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Erro ao carregar estratégias' });
    }
  }

  static async getStrategyAssets(req, res) {
    try {
      const { id } = req.params;
      const assets = await StrategyModel.getStrategyAssets(id);
      res.json(assets);
    } catch (error) {
      logger.error('Erro ao buscar ativos da estratégia', { error: error.message, stack: error.stack });
      res.status(500).json({ error: 'Erro ao carregar ativos da estratégia' });
    }
  }
}

module.exports = StrategyController;