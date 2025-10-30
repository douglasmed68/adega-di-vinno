# Guia de Migração para Supabase - Adega Di Vinno

## Visão Geral

O sistema **Adega Di Vinno** foi migrado do armazenamento local (`localStorage`) para o **Supabase**, um banco de dados em nuvem baseado em PostgreSQL. Isso permite que os dados sejam sincronizados em tempo real entre múltiplos dispositivos (PC, Celular, Tablet, etc.).

## Arquivos Adicionados/Modificados

### 1. **`src/lib/supabase.js`** (NOVO)
Arquivo de configuração do cliente Supabase. Contém a URL do projeto e a chave pública (`anon`).

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qrpgfcqsswnglkmqdmuv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. **`src/services/supabaseSyncService.jsx`** (NOVO)
Substitui o `localSyncService.jsx`. Fornece as mesmas funções CRUD, mas agora conectadas ao Supabase.

**Funcionalidades:**
- **CRUD Completo:** Create, Read, Update, Delete para todas as tabelas.
- **Sincronização em Tempo Real (Realtime):** Quando um usuário faz uma alteração, todos os outros usuários conectados recebem a atualização instantaneamente.
- **Mesmo Hook:** `useSupabaseSync()` fornece a mesma interface que `useLocalSync()`.

### 3. **`src/scripts/migrateToSupabase.js`** (NOVO)
Script para migrar dados do `localStorage` para o Supabase.

**Como Usar:**
```javascript
// No console do navegador (F12 > Console):
import { migrateLocalDataToSupabase } from './scripts/migrateToSupabase.js';
await migrateLocalDataToSupabase();
```

### 4. **`src/App.jsx`** (MODIFICADO)
Substituído `LocalSyncProvider` por `SupabaseSyncProvider`.

```javascript
import { SupabaseSyncProvider } from './services/supabaseSyncService.jsx';

// ...

return (
  <SupabaseSyncProvider>
    {/* Resto do app */}
  </SupabaseSyncProvider>
);
```

---

## Passo a Passo: Ativar a Migração

### Passo 1: Verificar a Compilação

Certifique-se de que o projeto compila sem erros:

```bash
cd /home/ubuntu/adega-di-vinno
pnpm run dev
```

Se houver erros de compilação, verifique se todos os arquivos foram criados corretamente.

### Passo 2: Acessar a Aplicação

1. Acesse a URL de desenvolvimento: `http://localhost:5173/`
2. Faça login com suas credenciais.

### Passo 3: Migrar Dados do localStorage para o Supabase

**Opção A: Via Console do Navegador (Recomendado)**

1. Abra o console do navegador (F12 > Console).
2. Cole o seguinte código:

```javascript
import { migrateLocalDataToSupabase } from './src/scripts/migrateToSupabase.js';
await migrateLocalDataToSupabase();
```

3. Pressione Enter e aguarde a migração ser concluída.
4. Verifique o console para mensagens de sucesso ou erro.

**Opção B: Via Script Node.js**

Se preferir, você pode executar a migração via Node.js:

```bash
cd /home/ubuntu/adega-di-vinno
node -e "
import { migrateLocalDataToSupabase } from './src/scripts/migrateToSupabase.js';
await migrateLocalDataToSupabase();
"
```

### Passo 4: Verificar a Migração no Supabase

1. Acesse o painel do Supabase: https://supabase.com/
2. Selecione seu projeto.
3. Vá para **Table Editor** e verifique se as tabelas foram preenchidas com os dados.

### Passo 5: Testar a Sincronização em Tempo Real

1. **Abra duas abas do navegador** com a aplicação.
2. **Na primeira aba:** Crie um novo produto (Produtos > Novo Produto).
3. **Na segunda aba:** Verifique se o novo produto aparece instantaneamente (sem precisar recarregar a página).

Se o produto aparecer na segunda aba em tempo real, a sincronização está funcionando!

---

## Funcionalidades Principais

### 1. **Sincronização em Tempo Real (Realtime)**

O Supabase fornece um sistema de **Realtime** que permite que as alterações sejam propagadas instantaneamente para todos os clientes conectados.

**Como Funciona:**
- Quando você cria, atualiza ou deleta um registro, o Supabase envia um evento para todos os clientes inscritos naquela tabela.
- O `supabaseSyncService.jsx` escuta esses eventos e atualiza o estado da aplicação automaticamente.

**Exemplo:**
```
PC (Usuário A)          Supabase          Celular (Usuário B)
    |                      |                    |
    |-- Cria Produto ----->|                    |
    |                      |-- Notifica ------->|
    |                      |                    |
    |                      |<-- Atualiza Estado-|
```

### 2. **Mesmo Hook da Aplicação**

O hook `useSupabaseSync()` fornece a mesma interface que o `useLocalSync()` anterior:

```javascript
const { 
  produtos, 
  addProduto, 
  updateProduto, 
  deleteProduto,
  loading,
  syncStatus 
} = useSupabaseSync();
```

**Propriedades:**
- `produtos`: Array de produtos.
- `addProduto(item)`: Cria um novo produto.
- `updateProduto(id, item)`: Atualiza um produto existente.
- `deleteProduto(id)`: Deleta um produto.
- `loading`: Indica se os dados estão sendo carregados.
- `syncStatus`: Status da sincronização (`'connecting'`, `'syncing'`, `'synced'`).

### 3. **Migração Automática de Dados**

O script `migrateToSupabase.js` automaticamente:
1. Lê todos os dados do `localStorage`.
2. Insere os dados no Supabase.
3. Marca a migração como concluída para evitar duplicatas.

---

## Variáveis de Ambiente (Opcional)

Para maior segurança, você pode usar variáveis de ambiente em vez de hardcoding as credenciais:

**Arquivo: `.env.local`**
```
VITE_SUPABASE_URL=https://qrpgfcqsswnglkmqdmuv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

O arquivo `src/lib/supabase.js` já está configurado para ler essas variáveis:

```javascript
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qrpgfcqsswnglkmqdmuv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '...';
```

---

## Troubleshooting

### Problema: "Erro ao carregar dados do Supabase"

**Solução:**
1. Verifique se as credenciais do Supabase estão corretas em `src/lib/supabase.js`.
2. Verifique se as tabelas foram criadas no painel do Supabase.
3. Verifique se o Realtime está habilitado nas tabelas (Settings > Replication).

### Problema: "Dados não sincronizam em tempo real"

**Solução:**
1. Verifique se o Realtime está habilitado no Supabase:
   - Vá para **Settings > Replication** e ative para as tabelas que você quer sincronizar.
2. Verifique se ambas as abas estão conectadas ao Supabase (veja o console do navegador).

### Problema: "Migração não completa"

**Solução:**
1. Verifique se há dados no `localStorage`:
   - Abra o console (F12) e execute: `Object.keys(localStorage).filter(k => k.startsWith('adega_'))`
   - Se não houver dados, a migração não terá nada para fazer.
2. Verifique os logs do console para mensagens de erro.
3. Verifique se as tabelas no Supabase têm as colunas corretas.

---

## Próximas Etapas

1. **Autenticação:** Considere implementar autenticação via Supabase Auth para maior segurança.
2. **Políticas de Segurança (RLS):** Configure Row Level Security (RLS) para controlar quem pode acessar quais dados.
3. **Backups:** Configure backups automáticos no Supabase.

---

## Suporte

Para mais informações sobre o Supabase, visite: https://supabase.com/docs

Para mais informações sobre o Realtime, visite: https://supabase.com/docs/guides/realtime

