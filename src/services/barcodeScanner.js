// Serviço de scanner de código de barras para a Adega Di Vinno
// Usando QuaggaJS para leitura de códigos de barras via câmera

class BarcodeScannerService {
  constructor() {
    this.isScanning = false
    this.stream = null
    this.scanner = null
  }

  // Verificar se o dispositivo suporta câmera
  async checkCameraSupport() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      return videoDevices.length > 0
    } catch (error) {
      console.error('Erro ao verificar suporte à câmera:', error)
      return false
    }
  }

  // Solicitar permissão da câmera
  async requestCameraPermission() {
    try {
      // Verificar se é dispositivo móvel
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: isMobile ? 'environment' : 'user', // Câmera traseira em mobile, frontal em desktop
          width: { ideal: isMobile ? 1280 : 640 },
          height: { ideal: isMobile ? 720 : 480 }
        } 
      })
      
      // Parar o stream imediatamente, só queríamos testar a permissão
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('Erro ao solicitar permissão da câmera:', error)
      return false
    }
  }

  // Iniciar scanner de código de barras
  async startScanning(videoElement, onDetected, onError) {
    try {
      if (this.isScanning) {
        throw new Error('Scanner já está ativo')
      }

      // Verificar suporte à câmera
      const hasCamera = await this.checkCameraSupport()
      if (!hasCamera) {
        throw new Error('Câmera não encontrada no dispositivo')
      }

      // Solicitar permissão
      const hasPermission = await this.requestCameraPermission()
      if (!hasPermission) {
        throw new Error('Permissão da câmera negada')
      }

      this.isScanning = true

      // Verificar se é dispositivo móvel
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Configurar Quagga (simulado - na prática usaríamos a biblioteca real)
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoElement,
          constraints: {
            width: isMobile ? 1280 : 640,
            height: isMobile ? 720 : 480,
            facingMode: isMobile ? "environment" : "user"
          }
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "codabar_reader"
          ]
        },
        locate: true,
        locator: {
          halfSample: true,
          patchSize: "medium"
        }
      }

      // Simular inicialização do Quagga
      await this.simulateQuaggaInit(videoElement, onDetected, onError)

    } catch (error) {
      this.isScanning = false
      if (onError) onError(error)
      throw error
    }
  }

  // Simular inicialização do Quagga (na prática seria Quagga.init)
  async simulateQuaggaInit(videoElement, onDetected, onError) {
    try {
      // Verificar se é dispositivo móvel
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      
      // Obter stream da câmera
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: isMobile ? 'environment' : 'user',
          width: { ideal: isMobile ? 1280 : 640 },
          height: { ideal: isMobile ? 720 : 480 }
        }
      })

      // Conectar stream ao elemento de vídeo
      videoElement.srcObject = this.stream
      videoElement.play()

      // Simular detecção de código de barras
      this.simulateBarcodeDetection(onDetected)

      console.log('Scanner de código de barras iniciado')
    } catch (error) {
      console.error('Erro ao inicializar scanner:', error)
      if (onError) onError(error)
    }
  }

  // Simular detecção de código de barras
  simulateBarcodeDetection(onDetected) {
    // Simular detecção após alguns segundos (para demonstração)
    setTimeout(() => {
      if (this.isScanning && onDetected) {
        // Códigos de exemplo para teste
        const testBarcodes = [
          '7891234567890', // EAN-13 genérico
          '7890123456789', // EAN-13 brasileiro
          '0123456789012', // UPC-A
          '123456789012'   // Código genérico
        ]
        
        const randomBarcode = testBarcodes[Math.floor(Math.random() * testBarcodes.length)]
        
        onDetected({
          codeResult: {
            code: randomBarcode,
            format: 'ean_13'
          }
        })
      }
    }, 3000) // Simular detecção após 3 segundos
  }

  // Parar scanner
  stopScanning() {
    try {
      this.isScanning = false

      // Parar stream da câmera
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop())
        this.stream = null
      }

      // Na prática seria Quagga.stop()
      console.log('Scanner de código de barras parado')
    } catch (error) {
      console.error('Erro ao parar scanner:', error)
    }
  }

  // Buscar informações do produto por código de barras
  async searchProductByBarcode(barcode) {
    try {
      // Simular busca em API de produtos
      const productInfo = await this.simulateProductAPI(barcode)
      return productInfo
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      return null
    }
  }

  // Simular API de produtos (na prática seria uma API real como OpenFoodFacts)
  async simulateProductAPI(barcode) {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Base de dados simulada de vinhos
    const wineDatabase = {
      '7891234567890': {
        nome: 'Vinho Tinto Cabernet Sauvignon Premium',
        tipo: 'Tinto',
        regiao: 'Chile',
        safra: '2020',
        teorAlcoolico: '13.5%',
        volume: '750ml',
        marca: 'Vinícola Premium',
        descricao: 'Vinho tinto encorpado com notas de frutas vermelhas'
      },
      '7890123456789': {
        nome: 'Espumante Brut Nacional',
        tipo: 'Espumante',
        regiao: 'Brasil',
        safra: '2022',
        teorAlcoolico: '12.0%',
        volume: '750ml',
        marca: 'Vinícola Nacional',
        descricao: 'Espumante brasileiro de alta qualidade'
      },
      '0123456789012': {
        nome: 'Vinho Branco Chardonnay',
        tipo: 'Branco',
        regiao: 'Argentina',
        safra: '2021',
        teorAlcoolico: '12.5%',
        volume: '750ml',
        marca: 'Bodega Argentina',
        descricao: 'Vinho branco fresco e aromático'
      }
    }

    const product = wineDatabase[barcode]
    
    if (product) {
      return {
        found: true,
        barcode,
        ...product
      }
    } else {
      // Se não encontrar, retornar estrutura básica
      return {
        found: false,
        barcode,
        nome: '',
        tipo: '',
        regiao: '',
        safra: '',
        teorAlcoolico: '',
        volume: '750ml',
        marca: '',
        descricao: 'Produto não encontrado na base de dados'
      }
    }
  }

  // Validar código de barras
  validateBarcode(barcode) {
    if (!barcode || typeof barcode !== 'string') {
      return false
    }

    // Remover espaços e caracteres especiais
    const cleanBarcode = barcode.replace(/\D/g, '')

    // Verificar comprimentos válidos
    const validLengths = [8, 12, 13, 14] // EAN-8, UPC-A, EAN-13, ITF-14
    
    if (!validLengths.includes(cleanBarcode.length)) {
      return false
    }

    // Validar dígito verificador para EAN-13
    if (cleanBarcode.length === 13) {
      return this.validateEAN13(cleanBarcode)
    }

    return true
  }

  // Validar EAN-13
  validateEAN13(barcode) {
    if (barcode.length !== 13) return false

    const digits = barcode.split('').map(Number)
    const checkDigit = digits.pop()
    
    let sum = 0
    for (let i = 0; i < digits.length; i++) {
      sum += digits[i] * (i % 2 === 0 ? 1 : 3)
    }
    
    const calculatedCheckDigit = (10 - (sum % 10)) % 10
    return calculatedCheckDigit === checkDigit
  }

  // Obter status do scanner
  getStatus() {
    return {
      isScanning: this.isScanning,
      hasStream: !!this.stream,
      isSupported: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
    }
  }
}

// Instância global do serviço
const barcodeScanner = new BarcodeScannerService()

export default barcodeScanner
