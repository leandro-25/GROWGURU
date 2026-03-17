const supabase = require('../config/database');
const BaseModel = require('./BaseModel');

class TransactionModel extends BaseModel {
  static async getTransactionsByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'data',
      sortOrder = 'desc',
      tipo = null
    } = options;

    const usuarioId = await this.getUserId(userId);
    
    let query = supabase
      .from('transacoes')
      .select('id, tipo, valor, descricao, data, codigo_ativo, quantidade, valor_unitario, valor_total', { count: 'exact' })
      .eq('usuario_id', usuarioId);

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) throw error;

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
        hasMore: to < count
      }
    };
  }

  static async createTransaction(transactionData) {
    const { data, error } = await supabase
      .from('transacoes')
      .insert([transactionData])
      .select();
    if (error) throw error;
    return data;
  }

  static async executeTransaction(userId, valor, tipo, descricao) {
    const { data, error } = await supabase.rpc('executar_transacao', {
      user_id: userId,
      valor_transacao: valor,
      tipo_transacao: tipo,
      descricao_transacao: descricao || 'Operação financeira'
    });
    if (error) throw error;
    return data;
  }
}

module.exports = TransactionModel;
