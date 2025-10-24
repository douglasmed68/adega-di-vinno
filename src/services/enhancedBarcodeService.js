/**
 * Serviço aprimorado para geração e validação de códigos de barras
 * Suporta múltiplos formatos e estratégias de geração
 */

class EnhancedBarcodeService {
  constructor() {
    // Prefixos para diferentes tipos de produtos
    this.prefixes = {
      wine: '789',      // Brasil - Vinhos
      beer: '790',      // Brasil - Cervejas
      spirits: '791',   // Brasil - Destilados
      liqueur: '792'    // Brasil - Licores
    }
    
    // Código da empresa (fictício para demonstração)
    this.companyCode = '1234'
    
    // Cache para códigos gerados
    this.generatedCodes = new Set()
  }

  /**
   * Gera um código EAN-13 válido baseado no tipo de produto
   * @param {Object} productData - Dados do produto
   * @returns {string} Código EAN-13 válido
   */
  generateEAN13(productData) {
    try {
      // Determinar prefixo baseado no tipo de produto
      const prefix = this.getPrefixByProductType(productData.tipo)
      
      // Gerar código único
      const uniqueCode = this.generateUniqueCode(productData)
      
      // Construir os primeiros 12 dígitos
      const code12 = prefix + this.companyCode + uniqueCode
      
      // Calcular dígito verificador
      const checkDigit = this.calculateEAN13CheckDigit(code12)
      
      // Código EAN-13 completo
      const ean13 = code12 + checkDigit
      
      // Validar o código gerado
      if (!this.validateEAN13(ean13)) {
        throw new Error('Código EAN-13 gerado é inválido')
      }
      
      // Adicionar ao cache
      this.generatedCodes.add(ean13)
      
      return ean13
    } catch (error) {
      console.error('Erro ao gerar EAN-13:', error)
      
      // Fallback: gerar código sequencial simples
      return this.generateSequentialEAN13(productData)
    }
  }

  /**
   * Determina o prefixo baseado no tipo de produto
   * @param {string} productType - Tipo do produto
   * @returns {string} Prefixo de 3 dígitos
   */
  getPrefixByProductType(productType) {
    if (!productType) return this.prefixes.wine
    
    const type = productType.toLowerCase()
    
    if (type.includes('cerveja') || type.includes('beer')) {
      return this.prefixes.beer
    } else if (type.includes('destilado') || type.includes('whisky') || 
               type.includes('vodka') || type.includes('gin') || 
               type.includes('rum') || type.includes('cachaça')) {
      return this.prefixes.spirits
    } else if (type.includes('licor') || type.includes('liqueur')) {
      return this.prefixes.liqueur
    } else {
      return this.prefixes.wine // Padrão para vinhos
    }
  }

  /**
   * Gera um código único de 5 dígitos baseado nos dados do produto
   * @param {Object} productData - Dados do produto
   * @returns {string} Código de 5 dígitos
   */
  generateUniqueCode(productData) {
    // Estratégia 1: Baseado no código do produto se existir
    if (productData.codigo) {
      const numericPart = productData.codigo.replace(/\D/g, '')
      if (numericPart) {
        return numericPart.padStart(5, '0').slice(-5)
      }
    }
    
    // Estratégia 2: Baseado no hash do nome do produto
    if (productData.nome) {
      const hash = this.simpleHash(productData.nome)
      return hash.toString().padStart(5, '0').slice(-5)
    }
    
    // Estratégia 3: Código sequencial baseado no timestamp
    const timestamp = Date.now()
    return (timestamp % 99999).toString().padStart(5, '0')
  }

  /**
   * Gera um hash simples de uma string
   * @param {string} str - String para gerar hash
   * @returns {number} Hash numérico
   */
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Converter para 32bit integer
    }
    return Math.abs(hash)
  }

  /**
   * Gera um EAN-13 sequencial como fallback
   * @param {Object} productData - Dados do produto
   * @returns {string} Código EAN-13 sequencial
   */
  generateSequentialEAN13(productData) {
    const prefix = this.getPrefixByProductType(productData.tipo)
    const timestamp = Date.now()
    const sequential = (timestamp % 99999).toString().padStart(5, '0')
    
    const code12 = prefix + this.companyCode + sequential
    const checkDigit = this.calculateEAN13CheckDigit(code12)
    
    return code12 + checkDigit
  }

  /**
   * Calcula o dígito verificador EAN-13
   * @param {string} code12 - Primeiros 12 dígitos
   * @returns {string} Dígito verificador
   */
  calculateEAN13CheckDigit(code12) {
    if (code12.length !== 12) {
      throw new Error('Código deve ter exatamente 12 dígitos')
    }
    
    const digits = code12.split('').map(d => parseInt(d, 10))
    let sum = 0
    
    for (let i = 0; i < 12; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3)
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit.toString()
  }

  /**
   * Valida um código EAN-13
   * @param {string} ean13 - Código EAN-13 completo
   * @returns {boolean} Verdadeiro se válido
   */
  validateEAN13(ean13) {
    // Verificar formato básico
    if (!/^\d{13}$/.test(ean13)) {
      return false
    }
    
    // Verificar dígito verificador
    const code12 = ean13.slice(0, 12)
    const providedCheckDigit = parseInt(ean13.slice(12), 10)
    const expectedCheckDigit = parseInt(this.calculateEAN13CheckDigit(code12), 10)
    
    return providedCheckDigit === expectedCheckDigit
  }

  /**
   * Gera código UPC-A (12 dígitos)
   * @param {Object} productData - Dados do produto
   * @returns {string} Código UPC-A válido
   */
  generateUPCA(productData) {
    try {
      // UPC-A tem 12 dígitos: 1 + 5 (fabricante) + 5 (produto) + 1 (verificador)
      const manufacturerCode = this.companyCode.slice(0, 5).padEnd(5, '0')
      const productCode = this.generateUniqueCode(productData)
      
      const code11 = '0' + manufacturerCode + productCode
      const checkDigit = this.calculateUPCACheckDigit(code11)
      
      return code11 + checkDigit
    } catch (error) {
      console.error('Erro ao gerar UPC-A:', error)
      return null
    }
  }

  /**
   * Calcula o dígito verificador UPC-A
   * @param {string} code11 - Primeiros 11 dígitos
   * @returns {string} Dígito verificador
   */
  calculateUPCACheckDigit(code11) {
    if (code11.length !== 11) {
      throw new Error('Código UPC-A deve ter exatamente 11 dígitos')
    }
    
    const digits = code11.split('').map(d => parseInt(d, 10))
    let sum = 0
    
    for (let i = 0; i < 11; i++) {
      sum += digits[i] * (i % 2 === 0 ? 3 : 1)
    }
    
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit.toString()
  }

  /**
   * Gera código Code 128 (alfanumérico)
   * @param {Object} productData - Dados do produto
   * @returns {string} Código Code 128
   */
  generateCode128(productData) {
    // Code 128 pode conter letras e números
    let code = 'ADV' // Prefixo da Adega Di Vinno
    
    if (productData.codigo) {
      code += productData.codigo.replace(/\W/g, '').toUpperCase()
    } else {
      // Gerar código baseado no nome
      const nameCode = productData.nome ? 
        productData.nome.replace(/\W/g, '').toUpperCase().slice(0, 8) : 
        'PROD'
      code += nameCode
    }
    
    // Adicionar timestamp para unicidade
    const timestamp = Date.now().toString().slice(-4)
    code += timestamp
    
    return code.slice(0, 20) // Limitar tamanho
  }

  /**
   * Gera múltiplos formatos de código de barras
   * @param {Object} productData - Dados do produto
   * @returns {Object} Códigos em diferentes formatos
   */
  generateMultipleFormats(productData) {
    return {
      ean13: this.generateEAN13(productData),
      upca: this.generateUPCA(productData),
      code128: this.generateCode128(productData),
      internal: this.generateInternalCode(productData)
    }
  }

  /**
   * Gera código interno da empresa
   * @param {Object} productData - Dados do produto
   * @returns {string} Código interno
   */
  generateInternalCode(productData) {
    let prefix = 'V' // Vinho por padrão
    
    if (productData.tipo) {
      const type = productData.tipo.toLowerCase()
      if (type.includes('cerveja')) prefix = 'C'
      else if (type.includes('destilado')) prefix = 'D'
      else if (type.includes('licor')) prefix = 'L'
      else if (type.includes('espumante')) prefix = 'E'
    }
    
    // Número sequencial baseado no timestamp
    const sequential = (Date.now() % 9999).toString().padStart(4, '0')
    
    return prefix + sequential
  }

  /**
   * Busca produto por qualquer tipo de código de barras
   * @param {string} barcode - Código de barras
   * @param {Array} products - Lista de produtos
   * @returns {Object|null} Produto encontrado
   */
  findProductByBarcode(barcode, products) {
    if (!products || products.length === 0 || !barcode) {
      return null
    }
    
    // Buscar por EAN-13
    let product = products.find(p => p.ean13 === barcode)
    if (product) return product
    
    // Buscar por UPC-A
    product = products.find(p => p.upca === barcode)
    if (product) return product
    
    // Buscar por Code 128
    product = products.find(p => p.code128 === barcode)
    if (product) return product
    
    // Buscar por código interno
    product = products.find(p => p.codigo === barcode)
    if (product) return product
    
    return null
  }

  /**
   * Valida qualquer tipo de código de barras
   * @param {string} barcode - Código de barras
   * @returns {Object} Resultado da validação
   */
  validateBarcode(barcode) {
    if (!barcode) {
      return { valid: false, type: null, message: 'Código vazio' }
    }
    
    // Verificar EAN-13
    if (/^\d{13}$/.test(barcode)) {
      const valid = this.validateEAN13(barcode)
      return {
        valid,
        type: 'EAN-13',
        message: valid ? 'Código EAN-13 válido' : 'Código EAN-13 inválido'
      }
    }
    
    // Verificar UPC-A
    if (/^\d{12}$/.test(barcode)) {
      return {
        valid: true, // Assumir válido para UPC-A por simplicidade
        type: 'UPC-A',
        message: 'Código UPC-A detectado'
      }
    }
    
    // Verificar EAN-8
    if (/^\d{8}$/.test(barcode)) {
      return {
        valid: true, // Assumir válido para EAN-8 por simplicidade
        type: 'EAN-8',
        message: 'Código EAN-8 detectado'
      }
    }
    
    // Verificar Code 128 (alfanumérico)
    if (/^[A-Z0-9]+$/.test(barcode) && barcode.length >= 6) {
      return {
        valid: true,
        type: 'Code 128',
        message: 'Código Code 128 detectado'
      }
    }
    
    return {
      valid: false,
      type: 'Desconhecido',
      message: 'Formato de código de barras não reconhecido'
    }
  }

  /**
   * Gera código de barras baseado em preferências
   * @param {Object} productData - Dados do produto
   * @param {string} preferredFormat - Formato preferido (ean13, upca, code128)
   * @returns {string} Código de barras no formato solicitado
   */
  generatePreferred(productData, preferredFormat = 'ean13') {
    switch (preferredFormat.toLowerCase()) {
      case 'upca':
        return this.generateUPCA(productData)
      case 'code128':
        return this.generateCode128(productData)
      case 'internal':
        return this.generateInternalCode(productData)
      default:
        return this.generateEAN13(productData)
    }
  }

  /**
   * Obter estatísticas dos códigos gerados
   * @returns {Object} Estatísticas
   */
  getStats() {
    return {
      totalGenerated: this.generatedCodes.size,
      prefixesUsed: Object.keys(this.prefixes),
      companyCode: this.companyCode
    }
  }

  /**
   * Limpar cache de códigos gerados
   */
  clearCache() {
    this.generatedCodes.clear()
  }
}

// Instância global do serviço
const enhancedBarcodeService = new EnhancedBarcodeService()

export default enhancedBarcodeService
