import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// Chaves para o localStorage
const STORAGE_KEYS = {
  produtos: 'adega_produtos',
  clientes: 'adega_clientes',
  vendas: 'adega_vendas',
  estoque: 'adega_estoque',
  compras: 'adega_compras',
  fornecedores: 'adega_fornecedores',
  financeiro: 'adega_financeiro',
};

// Função utilitária para carregar dados do localStorage
const loadData = (key) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return [];
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error(`Erro ao carregar dados de ${key}:`, error);
    return [];
  }
};

// Função utilitária para salvar dados no localStorage e disparar evento de 'storage'
const saveData = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    // Disparar um evento de storage customizado para sincronização entre abas
    // O evento 'storage' nativo só dispara em outras abas, não na aba que o modificou.
    // Usaremos um BroadcastChannel ou um evento customizado se o BroadcastChannel não for suportado.
    // Por enquanto, faremos o básico e trataremos a sincronização no Context.
  } catch (error) {
    console.error(`Erro ao salvar dados em ${key}:`, error);
  }
};

// Funções CRUD básicas para uma tabela
const createCrudService = (key) => {
  let data = loadData(key);

  const getNextId = () => {
    const maxId = data.reduce((max, item) => Math.max(max, item.id || 0), 0);
    return maxId + 1;
  };

  return {
    getAll: async () => {
      // Simula uma chamada assíncrona
      return new Promise(resolve => setTimeout(() => resolve(data), 100));
    },

    getById: async (id) => {
      return new Promise(resolve => setTimeout(() => resolve(data.find(item => item.id === id)), 100));
    },

    create: async (item) => {
      const newItem = {
        ...item,
        id: getNextId(),
        criado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      };
      data.unshift(newItem); // Adiciona no início
      saveData(key, data);
      return newItem;
    },

    update: async (id, updatedItem) => {
      const index = data.findIndex(item => item.id === id);
      if (index === -1) throw new Error(`${key} com ID ${id} não encontrado.`);

      const itemToUpdate = data[index];
      const updated = {
        ...itemToUpdate,
        ...updatedItem,
        atualizado_em: new Date().toISOString(),
        id: itemToUpdate.id, // Garante que o ID não mude
      };
      
      data[index] = updated;
      saveData(key, data);
      return updated;
    },

    delete: async (id) => {
      data = data.filter(item => item.id !== id);
      saveData(key, data);
      return true;
    },
    
    // Método para sincronização interna (usado pelo Context)
    _syncData: (newData) => {
        data = newData;
    }
  };
};

// Exportar serviços CRUD para cada tabela
export const produtosService = createCrudService(STORAGE_KEYS.produtos);
export const clientesService = createCrudService(STORAGE_KEYS.clientes);
export const vendasService = createCrudService(STORAGE_KEYS.vendas);
export const estoqueService = createCrudService(STORAGE_KEYS.estoque);
export const comprasService = createCrudService(STORAGE_KEYS.compras);
export const fornecedoresService = createCrudService(STORAGE_KEYS.fornecedores);
export const financeiroService = createCrudService(STORAGE_KEYS.financeiro);

// ====================================================================
// Contexto para gerenciar o estado e sincronização entre abas
// ====================================================================

const LocalSyncContext = createContext();

export function LocalSyncProvider({ children }) {
  const [produtos, setProdutos] = useState(loadData(STORAGE_KEYS.produtos));
  const [clientes, setClientes] = useState(loadData(STORAGE_KEYS.clientes));
  const [vendas, setVendas] = useState(loadData(STORAGE_KEYS.vendas));
  const [estoque, setEstoque] = useState(loadData(STORAGE_KEYS.estoque));
  const [compras, setCompras] = useState(loadData(STORAGE_KEYS.compras));
  const [fornecedores, setFornecedores] = useState(loadData(STORAGE_KEYS.fornecedores));
  const [financeiro, setFinanceiro] = useState(loadData(STORAGE_KEYS.financeiro));
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');

  // Mapeamento de chaves para setters
  const setters = useMemo(() => ({
    [STORAGE_KEYS.produtos]: setProdutos,
    [STORAGE_KEYS.clientes]: setClientes,
    [STORAGE_KEYS.vendas]: setVendas,
    [STORAGE_KEYS.estoque]: setEstoque,
    [STORAGE_KEYS.compras]: setCompras,
    [STORAGE_KEYS.fornecedores]: setFornecedores,
    [STORAGE_KEYS.financeiro]: setFinanceiro,
  }), []);

  // Mapeamento de chaves para services
  const services = useMemo(() => ({
    [STORAGE_KEYS.produtos]: produtosService,
    [STORAGE_KEYS.clientes]: clientesService,
    [STORAGE_KEYS.vendas]: vendasService,
    [STORAGE_KEYS.estoque]: estoqueService,
    [STORAGE_KEYS.compras]: comprasService,
    [STORAGE_KEYS.fornecedores]: fornecedoresService,
    [STORAGE_KEYS.financeiro]: financeiroService,
  }), []);

  // Função para lidar com eventos de 'storage' de outras abas
  const handleStorageChange = useCallback((event) => {
    if (event.key && STORAGE_KEYS[event.key]) {
      const key = event.key;
      const setter = setters[key];
      const service = services[key];
      
      if (event.newValue === null) {
          // Dados removidos, o que não deve acontecer
          setter([]);
          service._syncData([]);
      } else {
          try {
              const newData = JSON.parse(event.newValue);
              setter(newData);
              service._syncData(newData); // Atualiza o estado interno do serviço CRUD
          } catch (e) {
              console.error(`Erro ao parsear dados de ${key} no evento storage:`, e);
          }
      }
      setSyncStatus('synced');
    }
  }, [setters, services]);

  // Efeito para configurar o listener de storage
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);


  // Funções CRUD que atualizam o estado e o localStorage
  const createCrudFunctions = (key, service, setter) => {
    return {
      add: useCallback(async (item) => {
        const newItem = await service.create(item);
        setter(prev => [newItem, ...prev]);
        return newItem;
      }, [service, setter]),

      update: useCallback(async (id, item) => {
        const updated = await service.update(id, item);
        setter(prev => prev.map(p => p.id === id ? updated : p));
        return updated;
      }, [service, setter]),

      remove: useCallback(async (id) => {
        await service.delete(id);
        setter(prev => prev.filter(p => p.id !== id));
        return true;
      }, [service, setter]),
    };
  };

  const produtoCrud = createCrudFunctions(STORAGE_KEYS.produtos, produtosService, setProdutos);
  const clienteCrud = createCrudFunctions(STORAGE_KEYS.clientes, clientesService, setClientes);
  const vendaCrud = createCrudFunctions(STORAGE_KEYS.vendas, vendasService, setVendas);
  const estoqueCrud = createCrudFunctions(STORAGE_KEYS.estoque, estoqueService, setEstoque);
  const compraCrud = createCrudFunctions(STORAGE_KEYS.compras, comprasService, setCompras);
  const fornecedorCrud = createCrudFunctions(STORAGE_KEYS.fornecedores, fornecedoresService, setFornecedores);
  const financeiroCrud = createCrudFunctions(STORAGE_KEYS.financeiro, financeiroService, setFinanceiro);


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

    // Serviços de busca direta (para uso fora do Context, como em Sales)
    produtosService,
    clientesService,
    vendasService,
    estoqueService,
    comprasService,
    fornecedoresService,
    financeiroService,
    
    // Placeholder para futura migração
    syncLocalDataToCloud: async () => { console.log('Sincronização com a nuvem desabilitada. Use o SupabaseProvider para habilitar.'); },
  }), [
    produtos, clientes, vendas, estoque, compras, fornecedores, financeiro, loading, syncStatus,
    produtoCrud.add, produtoCrud.update, produtoCrud.remove,
    clienteCrud.add, clienteCrud.update, clienteCrud.remove,
    vendaCrud.add, vendaCrud.update, vendaCrud.remove,
    estoqueCrud.add, estoqueCrud.update, estoqueCrud.remove,
    compraCrud.add, compraCrud.update, compraCrud.remove,
    fornecedorCrud.add, fornecedorCrud.update, fornecedorCrud.remove,
    financeiroCrud.add, financeiroCrud.update, financeiroCrud.remove,
  ]);

  return (
    <LocalSyncContext.Provider value={value}>
      {children}
    </LocalSyncContext.Provider>
  );
}

// Hook customizado para usar o contexto
export const useLocalSync = () => {
  return useContext(LocalSyncContext);
};
