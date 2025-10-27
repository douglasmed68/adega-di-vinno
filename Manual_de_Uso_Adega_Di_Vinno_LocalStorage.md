# Manual de Uso do Sistema de Gestão Adega Di Vinno - Local Storage Edition

**Autor:** Manus AI
**Data:** 24 de Outubro de 2025
**Versão:** 1.0

## 1. Introdução

Este manual destina-se aos usuários do Sistema de Gestão **Adega Di Vinno**, após a migração da infraestrutura de banco de dados (Supabase) para o armazenamento local do navegador (**localStorage**).

Esta versão do sistema é ideal para uso em **um único dispositivo** ou para testes de funcionalidade, garantindo alta velocidade e independência de serviços de terceiros.

## 2. Visão Geral da Arquitetura (Local Storage)

O sistema agora utiliza o `localStorage` do seu navegador para persistir todos os dados (Produtos, Vendas, Estoque).

| Característica | Local Storage | Implicação para o Usuário |
| :--- | :--- | :--- |
| **Armazenamento** | Local no navegador (máximo de 5-10MB) | Os dados **não são** armazenados na nuvem. |
| **Sincronização** | Entre abas do mesmo navegador | Dados são compartilhados em tempo real entre abas abertas. |
| **Acesso Remoto** | Não Suportado | Não é possível acessar os mesmos dados em outro computador ou navegador. |
| **Segurança** | Depende da segurança do dispositivo | Os dados são tão seguros quanto o seu computador. |
| **Performance** | Extremamente Rápida | Operações CRUD (Criar, Ler, Atualizar, Deletar) são instantâneas. |

## 3. Funcionalidades Críticas e Uso

Todas as funcionalidades principais do sistema permanecem as mesmas, mas agora operam com o `localStorage`.

### 3.1. Produtos (CRUD)

1.  **Adicionar Produto:** Na tela "Produtos", clique em "Adicionar Produto". Preencha os campos e clique em "Salvar". O produto será armazenado instantaneamente no seu `localStorage`.
2.  **Editar/Excluir Produto:** Use o menu de ações (três pontos) ao lado do produto na tabela para editar ou excluir.

### 3.2. Estoque

O estoque é calculado dinamicamente com base na lista de **Produtos** e nas **Movimentações de Estoque**.

1.  **Nova Movimentação:** Na tela "Estoque", clique em "Nova Movimentação".
2.  **Entrada:** Use para registrar a compra de novos produtos (reposição).
3.  **Saída:** Use para registrar a saída de produtos (ex: quebra, degustação, etc., **excluindo vendas**).
4.  **Atenção:** As vendas registradas na tela "Vendas" já dão baixa automática no estoque.

### 3.3. Vendas

1.  **Nova Venda:** Na tela "Vendas", clique em "Nova Venda".
2.  **Registro:** O sistema permite adicionar múltiplos itens e registrar a venda.
3.  **Impacto no Estoque:** Ao registrar uma venda, o sistema **automaticamente** dá baixa na quantidade vendida no estoque.

## 4. Guia de Migração Futura (Cloud)

Embora o sistema esteja operando localmente, a estrutura de código foi mantida para facilitar uma futura migração para um banco de dados em nuvem (como o Supabase, Firebase ou outro serviço de sua escolha).

### 4.1. Arquivos Chave para Reversão

A lógica de sincronização foi isolada no arquivo `src/services/localSyncService.jsx`. Para migrar para a nuvem:

| Arquivo | Descrição | Ação para Reversão |
| :--- | :--- | :--- |
| `src/services/localSyncService.jsx` | Contém toda a lógica de persistência no `localStorage`. | Substituir a lógica interna pela comunicação com a API de nuvem. |
| `src/App.jsx` | Envolve a aplicação com o `LocalSyncProvider`. | Substituir `LocalSyncProvider` pelo `CloudSyncProvider` (a ser criado). |
| Componentes (`Produtos.jsx`, etc.) | Utilizam o hook `useLocalSync`. | O hook `useLocalSync` deve ser adaptado para se tornar um `useCloudSync`, mantendo a mesma interface de funções (`addProduto`, `updateProduto`, etc.). |

### 4.2. Estratégia de Transição

1.  **Criação do Serviço de Nuvem:** Crie um novo serviço (ex: `cloudSyncService.jsx`) que implemente as mesmas funções (`addProduto`, `getProdutos`, etc.) mas que se comunique com o backend de nuvem.
2.  **Substituição no `App.jsx`:** Substitua o `LocalSyncProvider` pelo `CloudSyncProvider` no `App.jsx`.
3.  **Migração de Dados:** Implemente um script de migração de uso único para ler os dados do `localStorage` e enviá-los para o banco de dados em nuvem.

## 5. Conclusão

O **Adega Di Vinno** está agora totalmente funcional em modo local. Esta arquitetura garante a continuidade do seu negócio sem dependência de serviços externos, mantendo a porta aberta para uma futura escalabilidade em nuvem.

---
*Fim do Manual de Uso.*
