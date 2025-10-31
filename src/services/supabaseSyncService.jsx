import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// Nomes das tabelas no Supabase
const TABLE_NAMES = {
  produtos: 'produtos',
  clientes: 'clientes',
  vendas: 'vendas',
  estoque: 'estoque',
  compras: 'compras',
  fornecedores: 'fornecedores',
  financeiro: 'financeiro',
};

// Funções CRUD básicas para uma tabela
const createCrudService = (tableName) => {
  return {
    getAll: async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) {
        console.error(`Erro ao carregar dados de ${tableName}:`, error);
        return [];
      }
      return data;
    },

    getById: async (id) => {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      if (error) {
        console.error(`Erro ao buscar ${tableName} com ID ${id}:`, error);
        return null;
      }
      return data;
    },

    create: async (item) => {
      const { data, error } = await supabase.from(tableName).insert([item]).select().single();
      if (error) {
        console.error(`Erro ao criar ${tableName}:`, error);
        throw error;
      }
      return data;
    },

    update: async (id, updatedItem) => {
      const { data, error } = await supabase.from(tableName).update(updatedItem).eq('id', id).select().single();
      if (error) {
        console.error(`Erro ao atualizar ${tableName} com ID ${id}:`, error);
        throw error;
      }
      return data;
    },

    delete: async (id) => {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        console.error(`Erro ao deletar ${tableName} com ID ${id}:`, error);
        throw error;
      }
      return true;
    },
  };
};

// Exportar serviços CRUD para cada tabela
export const produtosService = createCrudService(TABLE_NAMES.produtos);
export const clientesService = createCrudService(TABLE_NAMES.clientes);
export const vendasService = createCrudService(TABLE_NAMES.vendas);
export const estoqueService = createCrudService(TABLE_NAMES.estoque);
export const comprasService = createCrudService(TABLE_NAMES.compras);
export const fornecedoresService = createCrudService(TABLE_NAMES.fornecedores);
export const financeiroService = createCrudService(TABLE_NAMES.financeiro);

// ====================================================================
// Contexto para gerenciar o estado e sincronização com Supabase
// ====================================================================

const SupabaseSyncContext = createContext();

export function SupabaseSyncProvider({ children }) {
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [compras, setCompras] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [financeiro, setFinanceiro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('connecting');

  // Mapeamento de nomes de tabela para setters
  const setters = useMemo(() => ({
    [TABLE_NAMES.produtos]: setProdutos,
    [TABLE_NAMES.clientes]: setClientes,
    [TABLE_NAMES.vendas]: setVendas,
    [TABLE_NAMES.estoque]: setEstoque,
    [TABLE_NAMES.compras]: setCompras,
    [TABLE_NAMES.fornecedores]: setFornecedores,
    [TABLE_NAMES.financeiro]: setFinanceiro,
  }), []);

  // Mapeamento de nomes de tabela para services
  const services = useMemo(() => ({
    [TABLE_NAMES.produtos]: produtosService,
    [TABLE_NAMES.clientes]: clientesService,
    [TABLE_NAMES.vendas]: vendasService,
    [TABLE_NAMES.estoque]: estoqueService,
    [TABLE_NAMES.compras]: comprasService,
    [TABLE_NAMES.fornecedores]: fornecedoresService,
    [TABLE_NAMES.financeiro]: financeiroService,
  }), []);
  
  // Função para carregar todos os dados do Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    
    const tables = Object.values(TABLE_NAMES);
    const promises = tables.map(async (tableName) => {
      const service = services[tableName];
      const setter = setters[tableName];
      
      try {
        const data = await service.getAll();
        setter(data);
      } catch (e) {
        console.error(`Falha ao carregar dados da tabela ${tableName}:`, e);
      }
    });

    await Promise.all(promises);
    setLoading(false);
    setSyncStatus('synced');
  }, [services, setters]);

  // Efeito para carregar dados na montagem e configurar o Realtime
  useEffect(() => {
    fetchData();

    const tables = Object.values(TABLE_NAMES);
    const channels = tables.map(tableName => {
      const setter = setters[tableName];

      return supabase
        .channel('public:' + tableName)
        .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
          setSyncStatus('syncing');
          // Dependendo do evento, atualizamos o estado de forma otimista ou recarregamos
          if (payload.eventType === 'INSERT') {
            setter(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setter(prev => prev.map(item => (item.id === payload.new.id ? payload.new : item)));
          } else if (payload.eventType === 'DELETE') {
            setter(prev => prev.filter(item => item.id !== payload.old.id));
          }
          setSyncStatus('synced');
        })
        .subscribe();
    });

    return () => {
      // Limpa os canais ao desmontar
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchData, setters]);

  // Funções CRUD que atualizam o estado e o Supabase
  const createCrudFunctions = (tableName, service, setter) => {
    return {
      add: useCallback(async (item) => {
        const newItem = await service.create(item);
        setter(prev => [newItem, ...prev]);
        return newItem;
      }, [service, setter]),

      update: useCallback(async (id, item) => {
        const updated = await service.update(id, item);
        setter(prev => prev.map(p => String(p.id) === String(id) ? updated : p));
        return updated;
      }, [service, setter]),

      remove: useCallback(async (id) => {
        await service.delete(id);
        setter(prev => prev.filter(p => String(p.id) !== String(id)));
        return true;
      }, [service, setter]),
    };
  };

  const produtoCrud = createCrudFunctions(TABLE_NAMES.produtos, produtosService, setProdutos);
  const clienteCrud = createCrudFunctions(TABLE_NAMES.clientes, clientesService, setClientes);
  const vendaCrud = createCrudFunctions(TABLE_NAMES.vendas, vendasService, setVendas);
  const estoqueCrud = createCrudFunctions(TABLE_NAMES.estoque, estoqueService, setEstoque);
  const compraCrud = createCrudFunctions(TABLE_NAMES.compras, comprasService, setCompras);
  const fornecedorCrud = createCrudFunctions(TABLE_NAMES.fornecedores, fornecedoresService, setFornecedores);
  const financeiroCrud = createCrudFunctions(TABLE_NAMES.financeiro, financeiroService, setFinanceiro);


  const value = useMemo(() => ({
    produtos,
    clientes,
    vendas,
    estoque,
    compras,
    fornecedores,
    financeiro,
    loading,
    syncStatus,
    
    // CRUD de Produtos
    addProduto: produtoCrud.add,
    updateProduto: produtoCrud.update,
    deleteProduto: produtoCrud.remove,
    
    // CRUD de Clientes
    addCliente: clienteCrud.add,
    updateCliente: clienteCrud.update,
    deleteCliente: clienteCrud.remove,
    
    // CRUD de Vendas
    addVenda: vendaCrud.add,
    updateVenda: vendaCrud.update,
    deleteVenda: vendaCrud.remove,
    
    // CRUD de Estoque
    addEstoque: estoqueCrud.add,
    updateEstoque: estoqueCrud.update,
    deleteEstoque: estoqueCrud.remove,
    
    // CRUD de Compras
    addCompra: compraCrud.add,
    updateCompra: compraCrud.update,
    deleteCompra: compraCrud.remove,
    
    // CRUD de Fornecedores
    addFornecedor: fornecedorCrud.add,
    updateFornecedor: fornecedorCrud.update,
    deleteFornecedor: fornecedorCrud.remove,
    
    // CRUD de Financeiro
    addFinanceiro: financeiroCrud.add,
    updateFinanceiro: financeiroCrud.update,
    deleteFinanceiro: financeiroCrud.remove,
    
    // Funções de Sincronização
    fetchData,
  }), [
    produtos, clientes, vendas, estoque, compras, fornecedores, financeiro, loading, syncStatus,
    produtoCrud.add, produtoCrud.update, produtoCrud.remove,
    clienteCrud.add, clienteCrud.update, clienteCrud.remove,
    vendaCrud.add, vendaCrud.update, vendaCrud.remove,
    estoqueCrud.add, estoqueCrud.update, estoqueCrud.remove,
    compraCrud.add, compraCrud.update, compraCrud.remove,
    fornecedorCrud.add, fornecedorCrud.update, fornecedorCrud.remove,
    financeiroCrud.add, financeiroCrud.update, financeiroCrud.remove,
    fetchData,
  ]);

  return (
    <SupabaseSyncContext.Provider value={value}>
      {children}
    </SupabaseSyncContext.Provider>
  );
}

// Hook customizado para usar o contexto
export const useSupabaseSync = () => {
  return useContext(SupabaseSyncContext);
};
