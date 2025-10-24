import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  produtosService,
  clientesService,
  vendasService,
  estoqueService,
  comprasService,
  fornecedoresService,
  financeiroService,
  syncLocalDataToSupabase
} from '../services/supabaseSyncService';

// Criar o contexto
const SupabaseContext = createContext();

// Provider do Supabase
export function SupabaseProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle');

  // Carregar dados iniciais do Supabase
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setSyncStatus('syncing');

      // Carregar todos os dados em paralelo
      const [
        produtosData,
        clientesData,
        vendasData,
        estoqueData,
        comprasData,
        fornecedoresData,
        financeiroData
      ] = await Promise.all([
        produtosService.getAll(),
        clientesService.getAll(),
        vendasService.getAll(),
        estoqueService.getAll(),
        comprasService.getAll(),
        fornecedoresService.getAll(),
        financeiroService.getAll()
      ]);

      setProdutos(produtosData);
      setClientes(clientesData);
      setVendas(vendasData);
      setEstoque(estoqueData);
      setCompras(comprasData);
      setFornecedores(fornecedoresData);
      setFinanceiro(financeiroData);

      setSyncStatus('synced');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== PRODUTOS ====================

  const addProduto = useCallback(async (produto) => {
    try {
      const newProduto = await produtosService.create(produto);
      setProdutos(prev => [newProduto, ...prev]);
      return newProduto;
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  }, []);

  const updateProduto = useCallback(async (id, produto) => {
    try {
      const updated = await produtosService.update(id, produto);
      setProdutos(prev => prev.map(p => p.id === id ? updated : p));
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  }, []);

  const deleteProduto = useCallback(async (id) => {
    try {
      await produtosService.delete(id);
      setProdutos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }, []);

  // ==================== CLIENTES ====================

  const addCliente = useCallback(async (cliente) => {
    try {
      const newCliente = await clientesService.create(cliente);
      setClientes(prev => [newCliente, ...prev]);
      return newCliente;
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      throw error;
    }
  }, []);

  const updateCliente = useCallback(async (id, cliente) => {
    try {
      const updated = await clientesService.update(id, cliente);
      setClientes(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  }, []);

  const deleteCliente = useCallback(async (id) => {
    try {
      await clientesService.delete(id);
      setClientes(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }, []);

  // ==================== VENDAS ====================

  const addVenda = useCallback(async (venda) => {
    try {
      const newVenda = await vendasService.create(venda);
      setVendas(prev => [newVenda, ...prev]);
      return newVenda;
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  }, []);

  const updateVenda = useCallback(async (id, venda) => {
    try {
      const updated = await vendasService.update(id, venda);
      setVendas(prev => prev.map(v => v.id === id ? updated : v));
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      throw error;
    }
  }, []);

  const deleteVenda = useCallback(async (id) => {
    try {
      await vendasService.delete(id);
      setVendas(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      throw error;
    }
  }, []);

  // ==================== ESTOQUE ====================

  const updateEstoque = useCallback(async (id, quantidade) => {
    try {
      const updated = await estoqueService.updateQuantidade(id, quantidade);
      setEstoque(prev => prev.map(e => e.id === id ? updated : e));
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      throw error;
    }
  }, []);

  // ==================== COMPRAS ====================

  const addCompra = useCallback(async (compra) => {
    try {
      const newCompra = await comprasService.create(compra);
      setCompras(prev => [newCompra, ...prev]);
      return newCompra;
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      throw error;
    }
  }, []);

  const updateCompra = useCallback(async (id, compra) => {
    try {
      const updated = await comprasService.update(id, compra);
      setCompras(prev => prev.map(c => c.id === id ? updated : c));
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar compra:', error);
      throw error;
    }
  }, []);

  // ==================== FORNECEDORES ====================

  const addFornecedor = useCallback(async (fornecedor) => {
    try {
      const newFornecedor = await fornecedoresService.create(fornecedor);
      setFornecedores(prev => [newFornecedor, ...prev]);
      return newFornecedor;
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      throw error;
    }
  }, []);

  const updateFornecedor = useCallback(async (id, fornecedor) => {
    try {
      const updated = await fornecedoresService.update(id, fornecedor);
      setFornecedores(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }
  }, []);

  // ==================== FINANCEIRO ====================

  const addTransacao = useCallback(async (transacao) => {
    try {
      const newTransacao = await financeiroService.create(transacao);
      setFinanceiro(prev => [newTransacao, ...prev]);
      return newTransacao;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  }, []);

  // Sincronizar dados locais com Supabase
  const syncLocalData = useCallback(async (localData) => {
    try {
      setSyncStatus('syncing');
      await syncLocalDataToSupabase(localData);
      await loadAllData();
      setSyncStatus('synced');
    } catch (error) {
      console.error('Erro ao sincronizar dados locais:', error);
      setSyncStatus('error');
    }
  }, []);

  // Valor do contexto
  const value = {
    // Estado
    produtos,
    clientes,
    vendas,
    estoque,
    compras,
    fornecedores,
    financeiro,
    loading,
    syncStatus,

    // Ações de Produtos
    addProduto,
    updateProduto,
    deleteProduto,

    // Ações de Clientes
    addCliente,
    updateCliente,
    deleteCliente,

    // Ações de Vendas
    addVenda,
    updateVenda,
    deleteVenda,

    // Ações de Estoque
    updateEstoque,

    // Ações de Compras
    addCompra,
    updateCompra,

    // Ações de Fornecedores
    addFornecedor,
    updateFornecedor,

    // Ações de Financeiro
    addTransacao,

    // Utilitários
    syncLocalData,
    loadAllData
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Hook para usar o contexto
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase deve ser usado dentro de SupabaseProvider');
  }
  return context;
}

