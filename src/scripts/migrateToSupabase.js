import { supabase } from '../lib/supabase.js';

// Mapeamento de chaves do localStorage para nomes de tabela do Supabase
const MIGRATION_MAP = {
    'adega_produtos': 'produtos',
    'adega_clientes': 'clientes',
    'adega_vendas': 'vendas',
    'adega_estoque': 'estoque',
    'adega_compras': 'compras',
    'adega_fornecedores': 'fornecedores',
    'adega_financeiro': 'financeiro',
};

// Função para carregar dados do localStorage
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

// Função para migrar dados de uma chave para uma tabela
const migrateTable = async (localStorageKey, tableName) => {
    const localData = loadData(localStorageKey);
    
    if (localData.length === 0) {
        console.log(`[MIGRAÇÃO] ${tableName}: Nenhum dado encontrado no localStorage.`);
        return;
    }

    console.log(`[MIGRAÇÃO] ${tableName}: Tentando migrar ${localData.length} registros...`);

    // O Supabase gera o 'id' e as colunas de timestamp. 
    // Precisamos remover as colunas 'id', 'criado_em', 'atualizado_em' para que o Supabase as gere.
    // No entanto, se o ID for um número, vamos mantê-lo e confiar que o Supabase o converterá (se for Int8)
    // ou usaremos o ID local como um campo 'local_id' para referência futura, se necessário.
    // Como o Supabase usa UUIDs por padrão (ou Int8), vamos tentar remover o ID para evitar conflitos.

    const dataToInsert = localData.map(item => {
        // Remove as colunas que o Supabase deve gerenciar (id, timestamps)
        const { id, criado_em, atualizado_em, ...rest } = item;
        
        // Para o estoque, precisamos garantir que o produto_id seja um texto (o que era no localStorage)
        if (tableName === 'estoque') {
            return {
                ...rest,
                produto_id: String(item.produto_id),
                quantidade: Number(item.quantidade),
            };
        }
        
        return rest;
    });

    const { data, error } = await supabase
        .from(tableName)
        .insert(dataToInsert)
        .select();

    if (error) {
        console.error(`[MIGRAÇÃO] ERRO ao migrar ${tableName}:`, error.message);
        // Se o erro for de conflito de ID, tentaremos inserir com os IDs originais
        if (error.code === '23505') {
            console.warn(`[MIGRAÇÃO] Tentativa falha por conflito de ID. Tentando inserir com IDs originais...`);
            const dataWithOriginalId = localData.map(item => {
                // Mantém o ID original
                return { ...item };
            });
            
            const { data: data2, error: error2 } = await supabase
                .from(tableName)
                .insert(dataWithOriginalId)
                .select();
                
            if (error2) {
                console.error(`[MIGRAÇÃO] ERRO FINAL ao migrar ${tableName} (com IDs originais):`, error2.message);
                return;
            }
            console.log(`[MIGRAÇÃO] ${tableName}: ${data2.length} registros migrados com sucesso (com IDs originais).`);
            return;
        }
        return;
    }

    console.log(`[MIGRAÇÃO] ${tableName}: ${data.length} registros migrados com sucesso.`);
};

// Função principal de migração
export const migrateLocalDataToSupabase = async () => {
    console.log('--- INICIANDO MIGRAÇÃO DE DADOS LOCAIS PARA SUPABASE ---');
    
    // O Supabase requer que as tabelas sejam migradas em ordem de dependência (ex: Clientes antes de Vendas)
    const orderedTables = [
        'adega_clientes',
        'adega_fornecedores',
        'adega_produtos',
        'adega_estoque',
        'adega_compras',
        'adega_vendas',
        'adega_financeiro',
    ];

    for (const key of orderedTables) {
        await migrateTable(key, MIGRATION_MAP[key]);
    }

    console.log('--- MIGRAÇÃO CONCLUÍDA ---');
};

// Função exportada para uso no App.jsx

