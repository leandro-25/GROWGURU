const UserModel = require('../models/UserModel');
const supabase = require('../config/database');
const logger = require('../middleware/logger');
const ResponseFormatter = require('../utils/responseFormatter');

class UserController {
  static async getUser(req, res) {
    try {
      const user = req.user;
      const usuario = await UserModel.getUserById(user.id);
      res.json(ResponseFormatter.success(usuario));
    } catch (error) {
      logger.error('Erro ao buscar usuário:', error);
      res.status(500).json(ResponseFormatter.error('INTERNAL_ERROR', 'Erro interno'));
    }
  }

  static async updateProfile(req, res) {
    try {
      const user = req.user;
      const { nome, novaSenha } = req.body;

      if (!nome || nome.trim() === '') {
        return res.status(400).json(ResponseFormatter.error('INVALID_NAME', 'Nome obrigatório'));
      }

      await UserModel.updateUser(user.id, { nome: nome.trim() });

      if (novaSenha) {
        await supabase.auth.updateUser({ password: novaSenha.trim() });
      }

      res.json(ResponseFormatter.updated({ id: user.id, nome, email: user.email }));
    } catch (error) {
      logger.error('Erro na atualização:', error);
      res.status(500).json(ResponseFormatter.error('INTERNAL_ERROR', 'Erro ao atualizar perfil'));
    }
  }
}

module.exports = UserController;