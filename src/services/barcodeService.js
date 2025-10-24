/**
 * Serviço para geração e validação de códigos de barras EAN-13
 * Baseado no padrão brasileiro (prefixo 789)
 */

// Prefixo padrão para códigos brasileiros
const EAN_PREFIX = '789';

/**
 * Gera um código EAN-13 válido com base no código do produto
 * @param {string} productCode - Código do produto (ex: V001)
 * @returns {string} Código EAN-13 válido
 */
export function generateEAN13(productCode) {
  // Extrair o número do código do produto (ex: V001 -> 001)
  const numericPart = productCode.replace(/\D/g, '');
  
  // Preencher com zeros à esquerda até ter 9 dígitos (prefixo + 9 dígitos = 12 dígitos)
  const paddedNumeric = numericPart.padStart(9, '0');
  
  // Limitar a 9 dígitos se for maior
  const trimmedNumeric = paddedNumeric.slice(-9);
  
  // Concatenar o prefixo com o número do produto
  const code12Digits = EAN_PREFIX + trimmedNumeric;
  
  // Calcular o dígito verificador
  const checkDigit = calculateEAN13CheckDigit(code12Digits);
  
  // Retornar o código EAN-13 completo
  return code12Digits + checkDigit;
}

/**
 * Calcula o dígito verificador para um código EAN-13
 * @param {string} code12Digits - Os primeiros 12 dígitos do código EAN-13
 * @returns {string} Dígito verificador (0-9)
 */
function calculateEAN13CheckDigit(code12Digits) {
  if (code12Digits.length !== 12) {
    throw new Error('O código deve ter exatamente 12 dígitos para calcular o dígito verificador EAN-13');
  }
  
  // Converter string para array de dígitos
  const digits = code12Digits.split('').map(d => parseInt(d, 10));
  
  // Calcular a soma ponderada (posições ímpares * 1, posições pares * 3)
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  
  // Calcular o dígito verificador (complemento para o próximo múltiplo de 10)
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return checkDigit.toString();
}

/**
 * Valida se um código EAN-13 é válido
 * @param {string} ean13 - Código EAN-13 completo
 * @returns {boolean} Verdadeiro se o código for válido
 */
export function validateEAN13(ean13) {
  // Verificar se o código tem 13 dígitos e contém apenas números
  if (!/^\d{13}$/.test(ean13)) {
    return false;
  }
  
  // Extrair os primeiros 12 dígitos e o dígito verificador
  const code12Digits = ean13.slice(0, 12);
  const providedCheckDigit = parseInt(ean13.slice(12), 10);
  
  // Calcular o dígito verificador esperado
  const expectedCheckDigit = parseInt(calculateEAN13CheckDigit(code12Digits), 10);
  
  // Comparar os dígitos verificadores
  return providedCheckDigit === expectedCheckDigit;
}

/**
 * Extrai o código do produto a partir de um código EAN-13
 * @param {string} ean13 - Código EAN-13 completo
 * @returns {string} Código do produto (ex: V001)
 */
export function extractProductCodeFromEAN13(ean13) {
  // Verificar se o código é válido
  if (!validateEAN13(ean13)) {
    throw new Error('Código EAN-13 inválido');
  }
  
  // Extrair a parte numérica após o prefixo
  const numericPart = ean13.slice(3, 12);
  
  // Remover zeros à esquerda
  const trimmedNumeric = numericPart.replace(/^0+/, '');
  
  // Retornar o código do produto no formato V{número}
  return `V${trimmedNumeric.padStart(3, '0')}`;
}

/**
 * Gera um novo código de produto sequencial
 * @param {Array} existingProducts - Lista de produtos existentes
 * @returns {string} Novo código de produto (ex: V007)
 */
export function generateNextProductCode(existingProducts) {
  // Se não houver produtos, começar do V001
  if (!existingProducts || existingProducts.length === 0) {
    return 'V001';
  }
  
  // Encontrar o maior código numérico
  let maxCode = 0;
  
  existingProducts.forEach(product => {
    if (product.codigo && product.codigo.startsWith('V')) {
      const numericPart = parseInt(product.codigo.substring(1), 10);
      if (!isNaN(numericPart) && numericPart > maxCode) {
        maxCode = numericPart;
      }
    }
  });
  
  // Incrementar e formatar o novo código
  const nextCode = maxCode + 1;
  return `V${nextCode.toString().padStart(3, '0')}`;
}

/**
 * Busca um produto pelo código EAN-13
 * @param {string} ean13 - Código EAN-13 completo
 * @param {Array} products - Lista de produtos
 * @returns {Object|null} Produto encontrado ou null
 */
export function findProductByEAN13(ean13, products) {
  if (!products || products.length === 0) {
    return null;
  }
  
  // Verificar se o código é válido
  if (!validateEAN13(ean13)) {
    return null;
  }
  
  // Buscar o produto pelo código EAN-13
  return products.find(product => product.ean13 === ean13) || null;
}

export default {
  generateEAN13,
  validateEAN13,
  extractProductCodeFromEAN13,
  generateNextProductCode,
  findProductByEAN13
};
