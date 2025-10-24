import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = 'https://qrpgfcqsswnglkmqdmuv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycGdmY3Fzc3duZ2xrbXFkbXV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzA3OTMsImV4cCI6MjA3Njg0Njc5M30.xFtbf2GzKF9dIuRCCZYukA0dHg7LpWbjrjXryhUrA7s';

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Serviço de Sincronização com Supabase
 * Fornece funções para CRUD de dados com sincronização em tempo real
 */

// ==================== PRODUTOS ====================

export const produtosService = {
  // Obter todos os produtos
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  },

  // Obter um produto por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  },

  // Obter um produto por código
  async getByCodigo(codigo) {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('codigo', codigo)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar produto por código:', error);
      return null;
    }
  },

  // Criar um novo produto
  async create(produto) {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .insert([produto])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  // Atualizar um produto
  async update(id, produto) {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .update({
          ...produto,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar um produto
  async delete(id) {
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  },

  // Inscrever-se a mudanças em tempo real
  subscribe(callback) {
    const subscription = supabase
      .from('produtos')
      .on('*', (payload) => {
        callback(payload);
      })
      .subscribe();
    
    return subscription;
  }
};

// ==================== CLIENTES ====================

export const clientesService = {
  // Obter todos os clientes
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return [];
    }
  },

  // Obter um cliente por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }
  },

  // Criar um novo cliente
  async create(cliente) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([cliente])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  },

  // Atualizar um cliente
  async update(id, cliente) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          ...cliente,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      throw error;
    }
  },

  // Deletar um cliente
  async delete(id) {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      throw error;
    }
  }
};

// ==================== VENDAS ====================

export const vendasService = {
  // Obter todas as vendas
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*, clientes(*), itens_venda(*, produtos(*))')
        .order('data_venda', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return [];
    }
  },

  // Obter uma venda por ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .select('*, clientes(*), itens_venda(*, produtos(*))')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      return null;
    }
  },

  // Criar uma nova venda
  async create(venda) {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .insert([venda])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      throw error;
    }
  },

  // Atualizar uma venda
  async update(id, venda) {
    try {
      const { data, error } = await supabase
        .from('vendas')
        .update({
          ...venda,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      throw error;
    }
  },

  // Deletar uma venda
  async delete(id) {
    try {
      const { error } = await supabase
        .from('vendas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar venda:', error);
      throw error;
    }
  }
};

// ==================== ITENS DE VENDA ====================

export const itensVendaService = {
  // Criar um novo item de venda
  async create(item) {
    try {
      const { data, error } = await supabase
        .from('itens_venda')
        .insert([item])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar item de venda:', error);
      throw error;
    }
  },

  // Deletar um item de venda
  async delete(id) {
    try {
      const { error } = await supabase
        .from('itens_venda')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar item de venda:', error);
      throw error;
    }
  }
};

// ==================== ESTOQUE ====================

export const estoqueService = {
  // Obter todo o estoque
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*, produtos(*)')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      return [];
    }
  },

  // Obter estoque de um produto
  async getByProdutoId(produtoId) {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .eq('produto_id', produtoId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar estoque do produto:', error);
      return [];
    }
  },

  // Atualizar quantidade em estoque
  async updateQuantidade(id, quantidade) {
    try {
      const { data, error } = await supabase
        .from('estoque')
        .update({
          quantidade,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar quantidade em estoque:', error);
      throw error;
    }
  }
};

// ==================== COMPRAS ====================

export const comprasService = {
  // Obter todas as compras
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('*, fornecedores(*)')
        .order('data_compra', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      return [];
    }
  },

  // Criar uma nova compra
  async create(compra) {
    try {
      const { data, error } = await supabase
        .from('compras')
        .insert([compra])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar compra:', error);
      throw error;
    }
  },

  // Atualizar uma compra
  async update(id, compra) {
    try {
      const { data, error } = await supabase
        .from('compras')
        .update({
          ...compra,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar compra:', error);
      throw error;
    }
  }
};

// ==================== FORNECEDORES ====================

export const fornecedoresService = {
  // Obter todos os fornecedores
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return [];
    }
  },

  // Criar um novo fornecedor
  async create(fornecedor) {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert([fornecedor])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      throw error;
    }
  },

  // Atualizar um fornecedor
  async update(id, fornecedor) {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .update({
          ...fornecedor,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      throw error;
    }
  }
};

// ==================== FINANCEIRO ====================

export const financeiroService = {
  // Obter todas as transações
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('financeiro')
        .select('*')
        .order('data_transacao', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  },

  // Criar uma nova transação
  async create(transacao) {
    try {
      const { data, error } = await supabase
        .from('financeiro')
        .insert([transacao])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  }
};

// ==================== UTILITÁRIOS ====================

// Exportar o cliente Supabase para uso direto
export { supabase };

// Função para sincronizar dados locais com Supabase
export async function syncLocalDataToSupabase(localData) {
  try {
    // Sincronizar produtos
    if (localData.produtos && Array.isArray(localData.produtos)) {
      for (const produto of localData.produtos) {
        const existing = await produtosService.getByCodigo(produto.codigo);
        if (!existing) {
          await produtosService.create(produto);
        }
      }
    }

    // Sincronizar clientes
    if (localData.clientes && Array.isArray(localData.clientes)) {
      for (const cliente of localData.clientes) {
        const existing = await clientesService.getById(cliente.id);
        if (!existing) {
          await clientesService.create(cliente);
        }
      }
    }

    console.log('Dados sincronizados com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar dados:', error);
    return false;
  }
}

