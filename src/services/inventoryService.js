/**
 * Serviço para integração entre produtos e estoque
 */

/**
 * Sincroniza um produto com o estoque
 * @param {Object} product - Produto a ser sincronizado
 * @param {Array} inventory - Lista de itens do estoque
 * @returns {Object} Item de estoque atualizado
 */
export function syncProductWithInventory(product, inventory) {
  if (!product || !product.codigo) {
    throw new Error('Produto inválido');
  }
  
  // Verificar se o produto já existe no estoque
  const existingItem = inventory.find(item => item.codigo === product.codigo);
  
  if (existingItem) {
    // Atualizar item existente
    return {
      ...existingItem,
      produto: product.nome,
      ean13: product.ean13,
      estoqueMin: product.estoqueMin || existingItem.estoqueMin,
      valorUnit: product.precoVenda,
      valorTotal: (existingItem.estoqueAtual || 0) * product.precoVenda,
      status: getInventoryStatus(existingItem.estoqueAtual, product.estoqueMin)
    };
  } else {
    // Criar novo item de estoque
    return {
      codigo: product.codigo,
      produto: product.nome,
      ean13: product.ean13,
      estoqueAtual: 0,
      estoqueMin: product.estoqueMin || 0,
      estoqueMax: product.estoqueMin ? product.estoqueMin * 5 : 50,
      ultimaEntrada: null,
      ultimaSaida: null,
      valorUnit: product.precoVenda,
      valorTotal: 0,
      status: 'Em Falta'
    };
  }
}

/**
 * Sincroniza todos os produtos com o estoque
 * @param {Array} products - Lista de produtos
 * @param {Array} inventory - Lista de itens do estoque
 * @returns {Array} Lista de itens do estoque atualizada
 */
export function syncAllProductsWithInventory(products, inventory) {
  if (!products || !inventory) {
    return [];
  }
  
  const updatedInventory = [...inventory];
  
  // Atualizar itens existentes e adicionar novos
  products.forEach(product => {
    const index = updatedInventory.findIndex(item => item.codigo === product.codigo);
    
    if (index >= 0) {
      // Atualizar item existente
      updatedInventory[index] = syncProductWithInventory(product, updatedInventory);
    } else {
      // Adicionar novo item
      updatedInventory.push(syncProductWithInventory(product, updatedInventory));
    }
  });
  
  return updatedInventory;
}

/**
 * Registra uma movimentação de estoque
 * @param {Object} movement - Dados da movimentação
 * @param {Array} inventory - Lista de itens do estoque
 * @returns {Array} Lista de itens do estoque atualizada
 */
export function registerInventoryMovement(movement, inventory) {
  if (!movement || !movement.codigo || !movement.quantidade || !movement.tipo) {
    throw new Error('Dados de movimentação inválidos');
  }
  
  const updatedInventory = [...inventory];
  const index = updatedInventory.findIndex(item => item.codigo === movement.codigo);
  
  if (index < 0) {
    throw new Error(`Produto ${movement.codigo} não encontrado no estoque`);
  }
  
  const item = updatedInventory[index];
  const now = new Date();
  
  // Atualizar estoque conforme o tipo de movimentação
  if (movement.tipo === 'entrada') {
    item.estoqueAtual = (item.estoqueAtual || 0) + movement.quantidade;
    item.ultimaEntrada = now;
  } else if (movement.tipo === 'saida') {
    if ((item.estoqueAtual || 0) < movement.quantidade) {
      throw new Error(`Estoque insuficiente para o produto ${movement.codigo}`);
    }
    
    item.estoqueAtual = (item.estoqueAtual || 0) - movement.quantidade;
    item.ultimaSaida = now;
  }
  
  // Atualizar valor total e status
  item.valorTotal = item.estoqueAtual * item.valorUnit;
  item.status = getInventoryStatus(item.estoqueAtual, item.estoqueMin);
  
  updatedInventory[index] = item;
  return updatedInventory;
}

/**
 * Determina o status do estoque com base na quantidade atual e mínima
 * @param {number} current - Quantidade atual em estoque
 * @param {number} minimum - Quantidade mínima desejada
 * @returns {string} Status do estoque
 */
export function getInventoryStatus(current, minimum) {
  if (current === 0) {
    return 'Em Falta';
  } else if (current <= minimum) {
    return 'Estoque Baixo';
  } else {
    return 'OK';
  }
}

/**
 * Busca um item no estoque pelo código EAN-13
 * @param {string} ean13 - Código EAN-13
 * @param {Array} inventory - Lista de itens do estoque
 * @returns {Object|null} Item encontrado ou null
 */
export function findInventoryItemByEAN13(ean13, inventory) {
  if (!ean13 || !inventory) {
    return null;
  }
  
  return inventory.find(item => item.ean13 === ean13) || null;
}

export default {
  syncProductWithInventory,
  syncAllProductsWithInventory,
  registerInventoryMovement,
  getInventoryStatus,
  findInventoryItemByEAN13
};
