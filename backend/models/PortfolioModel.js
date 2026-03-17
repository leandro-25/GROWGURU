const supabase = require('../config/database');
const BaseModel = require('./BaseModel');

class PortfolioModel extends BaseModel {
  static async getPortfolio(userId) {
    const usuarioId = await this.getUserId(userId);

    const { data, error } = await supabase
      .from('carteira_investimentos')
      .select(`
        id,
        codigo_ativo,
        quantidade,
        valor_compra,
        estrategias (id, nome),
        ativos!inner(codigo, preco_atual)
      `)
      .eq('usuario_id', usuarioId)
      .order('codigo_ativo', { ascending: true });
    if (error) throw error;
    return data;
  }

  static async buyAsset(userId, assetData) {
    const usuarioId = await this.getUserId(userId);

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, saldo')
      .eq('id', usuarioId)
      .single();

    const { codigo_ativo, quantidade, valor_compra, estrategia_id } = assetData;
    const valorTotalCompra = quantidade * valor_compra;
    const novoSaldo = parseFloat(usuario.saldo) - valorTotalCompra;

    const { data: registro } = await supabase
      .from('carteira_investimentos')
      .select('id, quantidade, valor_compra')
      .eq('usuario_id', usuarioId)
      .eq('codigo_ativo', codigo_ativo)
      .eq('estrategia_id', estrategia_id)
      .single();

    let result;
    if (!registro) {
      const { data, error } = await supabase
        .from('carteira_investimentos')
        .insert([{
          usuario_id: usuarioId,
          codigo_ativo,
          quantidade,
          valor_compra,
          estrategia_id,
          data_compra: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const quantidadeAtual = parseFloat(registro.quantidade);
      const valorAtual = parseFloat(registro.valor_compra);
      const novaQuantidade = quantidadeAtual + quantidade;
      const valorTotalAtual = quantidadeAtual * valorAtual;
      const valorTotalNovaCompra = quantidade * valor_compra;
      const novoValorMedio = (valorTotalAtual + valorTotalNovaCompra) / novaQuantidade;

      const { data, error } = await supabase
        .from('carteira_investimentos')
        .update({
          quantidade: novaQuantidade,
          valor_compra: novoValorMedio,
          data_compra: new Date().toISOString()
        })
        .eq('id', registro.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    await supabase
      .from('usuarios')
      .update({ saldo: novoSaldo })
      .eq('id', usuarioId);

    await supabase
      .from('transacoes')
      .insert([{
        usuario_id: usuarioId,
        tipo: 'compra',
        valor: -Math.abs(valorTotalCompra),
        descricao: `${quantidade} cota de ${codigo_ativo}`,
        data: new Date().toISOString(),
        codigo_ativo,
        quantidade,
        valor_unitario: valor_compra,
        valor_total: valorTotalCompra
      }]);

    return { ...result, novo_saldo: novoSaldo };
  }

  static async sellAsset(userId, sellData) {
    const usuarioId = await this.getUserId(userId);

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, saldo')
      .eq('id', usuarioId)
      .single();

    const { codigo_ativo, quantidade, estrategia_id, preco_venda } = sellData;
    const { data: registros } = await supabase
      .from('carteira_investimentos')
      .select('id, quantidade, valor_compra')
      .eq('usuario_id', usuarioId)
      .eq('codigo_ativo', codigo_ativo)
      .eq('estrategia_id', estrategia_id);

    const totalDisponivel = registros.reduce((acc, r) => acc + parseFloat(r.quantidade), 0);
    if (totalDisponivel < quantidade) {
      throw new Error('Quantidade insuficiente para venda');
    }

    const registroPrincipal = registros[0];
    const precoVenda = preco_venda || registroPrincipal.valor_compra;
    const valorTotalVenda = quantidade * precoVenda;
    const novoSaldo = parseFloat(usuario.saldo) + valorTotalVenda;

    await supabase
      .from('usuarios')
      .update({ saldo: novoSaldo })
      .eq('id', usuarioId);

    const novaQuantidade = totalDisponivel - quantidade;
    if (novaQuantidade > 0) {
      await supabase
        .from('carteira_investimentos')
        .update({ quantidade: novaQuantidade, data_compra: new Date().toISOString() })
        .eq('id', registroPrincipal.id);
    } else {
      await supabase
        .from('carteira_investimentos')
        .delete()
        .eq('id', registroPrincipal.id);
    }

    await supabase
      .from('transacoes')
      .insert([{
        usuario_id: usuarioId,
        tipo: 'venda',
        valor: valorTotalVenda,
        descricao: `${quantidade} cota de ${codigo_ativo}`,
        data: new Date().toISOString(),
        codigo_ativo,
        quantidade: -quantidade,
        valor_unitario: precoVenda,
        valor_total: valorTotalVenda
      }]);

    return { novo_saldo: novoSaldo };
  }

  static async getTotalInvested(userId) {
    const usuarioId = await this.getUserId(userId);

    const { data, error } = await supabase
      .from('carteira_investimentos')
      .select('quantidade, valor_compra')
      .eq('usuario_id', usuarioId);
    if (error) throw error;

    const total = data.reduce((acc, item) => acc + (parseFloat(item.quantidade) * parseFloat(item.valor_compra)), 0);
    return total;
  }
}

module.exports = PortfolioModel;
