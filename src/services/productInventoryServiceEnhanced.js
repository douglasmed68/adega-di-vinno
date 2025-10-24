/**
 * Serviço integrado aprimorado de gerenciamento de produtos e estoque
 * Mantém sincronização automática entre catálogo de produtos e controle de estoque
 * Inclui geração automática de códigos de barras aprimorada
 */

import supabaseRealTimeSync from './supabaseRealTimeSync'
import enhancedBarcodeService from './enhancedBarcodeService'

class ProductInventoryServiceEnhanced {
  constructor() {
    this.listeners = []
    this.isInitialized = false
    
    // Configurar listeners para mudanças de dados
    this.setupDataListeners()
  }

  // Configurar listeners para mudanças de dados
  setupDataListeners() {
    // Listener para atualizações de produtos
    window.addEventListener('adega-products-updated', (event) => {
      this.handleProductsUpdate(event.detail)
    })

    // Listener para atualizações de vendas
    window.addEventListener('adega-vendas-updated', (event) => {
      this.handleSalesUpdate(event.detail)
    })

    // Listener para atualizações de compras
    window.addEventListener('adega-compras-updated', (event) => {
      this.handlePurchasesUpdate(event.detail)
    })

    // Listener para atualizações em tempo real
    window.addEventListener('adega-realtime-update', (event) => {
      this.handleRealtimeUpdate(event.detail)
    })
  }

  // Inicializar o serviço
  async initialize() {
    if (this.isInitialized) return true

    try {
      // Sincronizar produtos com estoque
      await this.syncProductsWithInventory()
      
      this.isInitialized = true
      this.notifyListeners({
        type: 'initialized',
        message: 'Serviço aprimorado de produtos e estoque inicializado'
      })
      
      return true
    } catch (error) {
      console.error('Erro ao inicializar serviço aprimorado de produtos/estoque:', error)
      return false
    }
  }

  // Obter todos os produtos
  getProducts() {
    try {
      return JSON.parse(localStorage.getItem('adega-di-vinno-products') || '[]')
    } catch (error) {
      console.error('Erro ao obter produtos:', error)
      return []
    }
  }

  // Obter itens do estoque
  getInventoryItems() {
    try {
      return JSON.parse(localStorage.getItem('adega-di-vinno-estoque') || '[]')
    } catch (error) {
      console.error('Erro ao obter estoque:', error)
      return []
    }
  }

  // Salvar produtos
  saveProducts(products) {
    try {
      localStorage.setItem('adega-di-vinno-products', JSON.stringify(products))
      localStorage.setItem('adega-last-modified', Date.now().toString())
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('adega-products-updated', {
        detail: { products }
      }))
      
      return true
    } catch (error) {
      console.error('Erro ao salvar produtos:', error)
      return false
    }
  }

  // Salvar itens do estoque
  saveInventoryItems(items) {
    try {
      localStorage.setItem('adega-di-vinno-estoque', JSON.stringify(items))
      localStorage.setItem('adega-last-modified', Date.now().toString())
      
      // Disparar evento de atualização
      window.dispatchEvent(new CustomEvent('adega-estoque-updated', {
        detail: { estoque: items }
      }))
      
      return true
    } catch (error) {
      console.error('Erro ao salvar estoque:', error)
      return false
    }
  }

  // Adicionar ou atualizar produto com geração automática de códigos
  async saveProduct(productData) {
    try {
      const products = this.getProducts()
      const inventory = this.getInventoryItems()
      
      // Gerar código interno se não existir
      if (!productData.codigo) {
        productData.codigo = this.generateProductCode(products)
      }

      // Gerar códigos de barras automaticamente se não existirem
      if (!productData.ean13) {
        try {
          // Usar serviço aprimorado para gerar EAN-13
          productData.ean13 = enhancedBarcodeService.generateEAN13(productData)
          
          // Gerar também outros formatos se necessário
          const additionalCodes = enhancedBarcodeService.generateMultipleFormats(productData)
          
          // Adicionar códigos adicionais ao produto
          productData.upca = additionalCodes.upca
          productData.code128 = additionalCodes.code128
          productData.codigoInterno = additionalCodes.internal
          
          console.log('Códigos de barras gerados automaticamente:', {
            ean13: productData.ean13,
            upca: productData.upca,
            code128: productData.code128,
            interno: productData.codigoInterno
          })
          
        } catch (error) {
          console.warn('Erro ao gerar códigos com serviço aprimorado, usando método simples:', error)
          productData.ean13 = this.generateSimpleEAN13(productData.codigo)
        }
      }

      // Validar código EAN-13 se fornecido
      if (productData.ean13) {
        const validation = enhancedBarcodeService.validateBarcode(productData.ean13)
        if (!validation.valid) {
          console.warn('Código EAN-13 inválido detectado:', validation.message)
          // Gerar novo código válido
          productData.ean13 = enhancedBarcodeService.generateEAN13(productData)
        }
      }

      // Verificar se é atualização ou novo produto
      const existingIndex = products.findIndex(p => p.codigo === productData.codigo)
      
      if (existingIndex >= 0) {
        // Atualizar produto existente
        products[existingIndex] = { 
          ...products[existingIndex], 
          ...productData,
          atualizadoEm: new Date().toISOString()
        }
      } else {
        // Adicionar novo produto
        products.push({
          ...productData,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        })
      }

      // Salvar produtos
      this.saveProducts(products)

      // Sincronizar com estoque
      const updatedInventory = this.syncProductWithInventory(productData, inventory)
      this.saveInventoryItems(updatedInventory)

      this.notifyListeners({
        type: 'product_saved',
        product: productData,
        message: `Produto ${productData.nome} salvo com códigos de barras gerados automaticamente`
      })

      return productData
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
      throw error
    }
  }

  // Remover produto
  async removeProduct(codigo) {
    try {
      const products = this.getProducts()
      const inventory = this.getInventoryItems()
      
      // Remover produto
      const updatedProducts = products.filter(p => p.codigo !== codigo)
      this.saveProducts(updatedProducts)

      // Remover do estoque
      const updatedInventory = inventory.filter(item => item.codigo !== codigo)
      this.saveInventoryItems(updatedInventory)

      this.notifyListeners({
        type: 'product_removed',
        codigo,
        message: `Produto ${codigo} removido com sucesso`
      })

      return true
    } catch (error) {
      console.error('Erro ao remover produto:', error)
      throw error
    }
  }

  // Buscar produto por código
  findProductByCode(codigo) {
    const products = this.getProducts()
    return products.find(p => p.codigo === codigo) || null
  }

  // Buscar produto por qualquer tipo de código de barras
  findProductByBarcode(barcode) {
    const products = this.getProducts()
    return enhancedBarcodeService.findProductByBarcode(barcode, products)
  }

  // Buscar produto por EAN-13
  findProductByEAN13(ean13) {
    const products = this.getProducts()
    return products.find(p => p.ean13 === ean13) || null
  }

  // Buscar item do estoque por código
  findInventoryItemByCode(codigo) {
    const inventory = this.getInventoryItems()
    return inventory.find(item => item.codigo === codigo) || null
  }

  // Sincronizar produto com estoque
  syncProductWithInventory(product, inventory) {
    if (!product || !product.codigo) {
      throw new Error('Produto inválido')
    }
    
    const updatedInventory = [...inventory]
    const existingIndex = updatedInventory.findIndex(item => item.codigo === product.codigo)
    
    if (existingIndex >= 0) {
      // Atualizar item existente
      const existingItem = updatedInventory[existingIndex]
      updatedInventory[existingIndex] = {
        ...existingItem,
        produto: product.nome,
        ean13: product.ean13,
        upca: product.upca,
        code128: product.code128,
        codigoInterno: product.codigoInterno,
        categoria: product.categoria,
        tipo: product.tipo,
        marca: product.marca,
        volume: product.volume,
        estoqueMin: product.estoqueMin || existingItem.estoqueMin || 5,
        estoqueMax: product.estoqueMax || existingItem.estoqueMax || 50,
        valorUnit: product.precoVenda || existingItem.valorUnit || 0,
        valorTotal: (existingItem.estoqueAtual || 0) * (product.precoVenda || existingItem.valorUnit || 0),
        status: this.getInventoryStatus(existingItem.estoqueAtual || 0, product.estoqueMin || existingItem.estoqueMin || 5),
        atualizadoEm: new Date().toISOString()
      }
    } else {
      // Criar novo item de estoque
      updatedInventory.push({
        id: Date.now().toString(),
        codigo: product.codigo,
        produto: product.nome,
        ean13: product.ean13,
        upca: product.upca,
        code128: product.code128,
        codigoInterno: product.codigoInterno,
        categoria: product.categoria,
        tipo: product.tipo,
        marca: product.marca,
        volume: product.volume,
        estoqueAtual: 0,
        estoqueMin: product.estoqueMin || 5,
        estoqueMax: product.estoqueMax || 50,
        ultimaEntrada: null,
        ultimaSaida: null,
        valorUnit: product.precoVenda || 0,
        valorTotal: 0,
        status: 'Em Falta',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      })
    }
    
    return updatedInventory
  }

  // Sincronizar todos os produtos com o estoque
  async syncProductsWithInventory() {
    try {
      const products = this.getProducts()
      const inventory = this.getInventoryItems()
      
      let updatedInventory = [...inventory]
      
      // Sincronizar cada produto
      products.forEach(product => {
        updatedInventory = this.syncProductWithInventory(product, updatedInventory)
      })
      
      // Remover itens do estoque que não têm produto correspondente
      const productCodes = products.map(p => p.codigo)
      updatedInventory = updatedInventory.filter(item => productCodes.includes(item.codigo))
      
      // Salvar estoque atualizado
      this.saveInventoryItems(updatedInventory)
      
      this.notifyListeners({
        type: 'inventory_synced',
        message: 'Estoque sincronizado com produtos'
      })
      
      return updatedInventory
    } catch (error) {
      console.error('Erro ao sincronizar produtos com estoque:', error)
      throw error
    }
  }

  // Registrar movimentação de estoque
  async registerMovement(movementData) {
    try {
      const { codigo, tipo, quantidade, motivo, observacoes } = movementData
      
      if (!codigo || !tipo || !quantidade || quantidade <= 0) {
        throw new Error('Dados de movimentação inválidos')
      }
      
      const inventory = this.getInventoryItems()
      const itemIndex = inventory.findIndex(item => item.codigo === codigo)
      
      if (itemIndex < 0) {
        throw new Error(`Produto ${codigo} não encontrado no estoque`)
      }
      
      const item = inventory[itemIndex]
      const now = new Date().toISOString()
      
      // Calcular novo estoque
      let novoEstoque = item.estoqueAtual || 0
      
      if (tipo === 'entrada') {
        novoEstoque += quantidade
        item.ultimaEntrada = now
      } else if (tipo === 'saida') {
        if (novoEstoque < quantidade) {
          throw new Error(`Estoque insuficiente para o produto ${codigo}. Disponível: ${novoEstoque}`)
        }
        novoEstoque -= quantidade
        item.ultimaSaida = now
      } else {
        throw new Error('Tipo de movimentação inválido. Use "entrada" ou "saida"')
      }
      
      // Atualizar item do estoque
      inventory[itemIndex] = {
        ...item,
        estoqueAtual: novoEstoque,
        valorTotal: novoEstoque * (item.valorUnit || 0),
        status: this.getInventoryStatus(novoEstoque, item.estoqueMin || 5),
        atualizadoEm: now
      }
      
      // Salvar estoque
      this.saveInventoryItems(inventory)
      
      // Registrar histórico de movimentação
      this.registerMovementHistory({
        id: Date.now().toString(),
        codigo,
        produto: item.produto,
        tipo,
        quantidade,
        estoqueAnterior: item.estoqueAtual || 0,
        estoqueNovo: novoEstoque,
        motivo: motivo || 'Movimentação manual',
        observacoes: observacoes || '',
        dataHora: now,
        usuario: 'Sistema'
      })
      
      this.notifyListeners({
        type: 'movement_registered',
        movement: movementData,
        newStock: novoEstoque,
        message: `Movimentação registrada: ${tipo} de ${quantidade} unidades`
      })
      
      return inventory[itemIndex]
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      throw error
    }
  }

  // Registrar histórico de movimentações
  registerMovementHistory(movement) {
    try {
      const history = JSON.parse(localStorage.getItem('adega-di-vinno-movimentacoes') || '[]')
      history.unshift(movement) // Adicionar no início da lista
      
      // Manter apenas os últimos 1000 registros
      if (history.length > 1000) {
        history.splice(1000)
      }
      
      localStorage.setItem('adega-di-vinno-movimentacoes', JSON.stringify(history))
      
      // Disparar evento
      window.dispatchEvent(new CustomEvent('adega-movimentacoes-updated', {
        detail: { movimentacoes: history }
      }))
      
    } catch (error) {
      console.error('Erro ao registrar histórico:', error)
    }
  }

  // Obter histórico de movimentações
  getMovementHistory(codigo = null, limit = 100) {
    try {
      const history = JSON.parse(localStorage.getItem('adega-di-vinno-movimentacoes') || '[]')
      
      let filtered = history
      if (codigo) {
        filtered = history.filter(m => m.codigo === codigo)
      }
      
      return filtered.slice(0, limit)
    } catch (error) {
      console.error('Erro ao obter histórico:', error)
      return []
    }
  }

  // Determinar status do estoque
  getInventoryStatus(current, minimum) {
    if (current === 0) {
      return 'Em Falta'
    } else if (current <= minimum) {
      return 'Estoque Baixo'
    } else {
      return 'OK'
    }
  }

  // Gerar código de produto
  generateProductCode(existingProducts = []) {
    const existingCodes = existingProducts.map(p => p.codigo).filter(Boolean)
    let newCode
    let counter = 1
    
    do {
      newCode = `V${counter.toString().padStart(3, '0')}`
      counter++
    } while (existingCodes.includes(newCode))
    
    return newCode
  }

  // Gerar EAN-13 simples (fallback)
  generateSimpleEAN13(productCode) {
    const prefix = '789'
    const companyCode = '1234'
    const numericCode = productCode.replace(/\D/g, '').padStart(5, '0').slice(0, 5)
    const base = prefix + companyCode + numericCode
    
    let sum = 0
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * (i % 2 === 0 ? 1 : 3)
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    return base + checkDigit
  }

  // Gerar códigos de barras para produto existente
  async generateBarcodesForProduct(codigo) {
    try {
      const product = this.findProductByCode(codigo)
      if (!product) {
        throw new Error(`Produto ${codigo} não encontrado`)
      }

      // Gerar códigos usando o serviço aprimorado
      const codes = enhancedBarcodeService.generateMultipleFormats(product)
      
      // Atualizar produto com os novos códigos
      const updatedProduct = {
        ...product,
        ean13: codes.ean13,
        upca: codes.upca,
        code128: codes.code128,
        codigoInterno: codes.internal,
        atualizadoEm: new Date().toISOString()
      }

      // Salvar produto atualizado
      await this.saveProduct(updatedProduct)

      this.notifyListeners({
        type: 'barcodes_generated',
        product: updatedProduct,
        codes,
        message: `Códigos de barras gerados para ${product.nome}`
      })

      return codes
    } catch (error) {
      console.error('Erro ao gerar códigos de barras:', error)
      throw error
    }
  }

  // Validar código de barras
  validateBarcode(barcode) {
    return enhancedBarcodeService.validateBarcode(barcode)
  }

  // Lidar com atualizações de produtos
  handleProductsUpdate(data) {
    if (data && data.products) {
      // Sincronizar com estoque quando produtos são atualizados
      setTimeout(() => {
        this.syncProductsWithInventory()
      }, 100)
    }
  }

  // Lidar com atualizações de vendas
  handleSalesUpdate(data) {
    if (data && data.vendas) {
      // Processar vendas para atualizar estoque
      this.processSalesForInventory(data.vendas)
    }
  }

  // Lidar com atualizações de compras
  handlePurchasesUpdate(data) {
    if (data && data.compras) {
      // Processar compras para atualizar estoque
      this.processPurchasesForInventory(data.compras)
    }
  }

  // Lidar com atualizações em tempo real
  handleRealtimeUpdate(data) {
    if (data) {
      // Sincronizar produtos com estoque após atualizações em tempo real
      setTimeout(() => {
        this.syncProductsWithInventory()
      }, 200)
    }
  }

  // Processar vendas para atualização de estoque
  processSalesForInventory(vendas) {
    // Esta função seria chamada quando vendas são registradas
    // para automaticamente reduzir o estoque
    console.log('Processando vendas para atualização de estoque:', vendas)
  }

  // Processar compras para atualização de estoque
  processPurchasesForInventory(compras) {
    // Esta função seria chamada quando compras são registradas
    // para automaticamente aumentar o estoque
    console.log('Processando compras para atualização de estoque:', compras)
  }

  // Adicionar listener
  addListener(listener) {
    this.listeners.push(listener)
  }

  // Remover listener
  removeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  // Notificar listeners
  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data)
      } catch (error) {
        console.error('Erro ao notificar listener:', error)
      }
    })
  }

  // Obter estatísticas do estoque
  getInventoryStats() {
    const inventory = this.getInventoryItems()
    
    const stats = {
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + (item.valorTotal || 0), 0),
      outOfStock: inventory.filter(item => item.status === 'Em Falta').length,
      lowStock: inventory.filter(item => item.status === 'Estoque Baixo').length,
      okStock: inventory.filter(item => item.status === 'OK').length
    }
    
    return stats
  }

  // Obter estatísticas dos códigos de barras
  getBarcodeStats() {
    const products = this.getProducts()
    
    const stats = {
      totalProducts: products.length,
      withEAN13: products.filter(p => p.ean13).length,
      withUPCA: products.filter(p => p.upca).length,
      withCode128: products.filter(p => p.code128).length,
      withInternalCode: products.filter(p => p.codigoInterno).length,
      enhancedServiceStats: enhancedBarcodeService.getStats()
    }
    
    return stats
  }
}

// Instância global do serviço aprimorado
const productInventoryServiceEnhanced = new ProductInventoryServiceEnhanced()

export default productInventoryServiceEnhanced
