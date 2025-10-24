import React, { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { Camera, X, CheckCircle, AlertCircle, Loader2, Smartphone, Monitor, Zap } from 'lucide-react'
import modernBarcodeScanner from '../services/modernBarcodeScanner'

const BarcodeScanner = ({ isOpen, onClose, onProductFound }) => {
  // Detectar se é dispositivo móvel
  const isMobile = modernBarcodeScanner.isMobileDevice()
  const [isScanning, setIsScanning] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detectedCode, setDetectedCode] = useState(null)
  const [productInfo, setProductInfo] = useState(null)
  const [scannerStatus, setScannerStatus] = useState(null)
  const [supportedFormats, setSupportedFormats] = useState([])
  const videoRef = useRef(null)

  // Verificar status do scanner quando o componente monta
  useEffect(() => {
    const checkStatus = async () => {
      const status = modernBarcodeScanner.getStatus()
      setScannerStatus(status)
      
      try {
        const formats = await modernBarcodeScanner.getSupportedFormats()
        setSupportedFormats(formats)
      } catch (error) {
        console.warn('Erro ao obter formatos suportados:', error)
      }
    }
    
    checkStatus()
  }, [])

  // Limpar estado quando o dialog abre/fecha
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setDetectedCode(null)
      setProductInfo(null)
      setIsLoading(false)
    } else {
      stopScanning()
    }
  }, [isOpen])

  // Iniciar scanner
  const startScanning = async () => {
    try {
      setError(null)
      setIsLoading(true)
      setDetectedCode(null)
      setProductInfo(null)

      if (!videoRef.current) {
        throw new Error('Elemento de vídeo não encontrado')
      }

      await modernBarcodeScanner.startScanning(
        videoRef.current,
        handleBarcodeDetected,
        handleScanError
      )

      setIsScanning(true)
      setIsLoading(false)
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err)
      setError(err.message)
      setIsLoading(false)
      setIsScanning(false)
    }
  }

  // Parar scanner
  const stopScanning = () => {
    try {
      modernBarcodeScanner.stopScanning()
      setIsScanning(false)
    } catch (err) {
      console.error('Erro ao parar scanner:', err)
    }
  }

  // Lidar com código de barras detectado
  const handleBarcodeDetected = async (result) => {
    try {
      const code = result.codeResult.code
      console.log('Código detectado:', code)
      
      setDetectedCode(code)
      setIsLoading(true)

      // Buscar informações do produto
      const productData = await modernBarcodeScanner.searchProductByBarcode(code)
      setProductInfo(productData)
      setIsLoading(false)

      // Parar scanner após detectar
      stopScanning()
    } catch (error) {
      console.error('Erro ao processar código detectado:', error)
      setError('Erro ao processar código de barras')
      setIsLoading(false)
    }
  }

  // Lidar com erro do scanner
  const handleScanError = (error) => {
    console.error('Erro do scanner:', error)
    setError(error.message || 'Erro no scanner')
    setIsLoading(false)
    setIsScanning(false)
  }

  // Usar produto encontrado
  const handleUseProduct = () => {
    if (productInfo && onProductFound) {
      onProductFound(productInfo)
      onClose()
    }
  }

  // Tentar novamente
  const handleRetry = () => {
    setError(null)
    setDetectedCode(null)
    setProductInfo(null)
    startScanning()
  }

  // Renderizar status do scanner
  const renderScannerStatus = () => {
    if (!scannerStatus) return null

    return (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Status do Scanner</span>
          <div className="flex items-center gap-2">
            {isMobile ? <Smartphone className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            {scannerStatus.supportsBarcodeDetector && (
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Nativo
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>
            <span className="font-medium">Câmera:</span>
            <span className={`ml-1 ${scannerStatus.isSupported ? 'text-green-600' : 'text-red-600'}`}>
              {scannerStatus.isSupported ? 'Suportada' : 'Não suportada'}
            </span>
          </div>
          <div>
            <span className="font-medium">Dispositivo:</span>
            <span className="ml-1">{isMobile ? 'Mobile' : 'Desktop'}</span>
          </div>
        </div>

        {supportedFormats.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-medium text-gray-600">Formatos suportados:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {supportedFormats.slice(0, 5).map(format => (
                <Badge key={format} variant="secondary" className="text-xs">
                  {format.toUpperCase()}
                </Badge>
              ))}
              {supportedFormats.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{supportedFormats.length - 5}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Renderizar informações do produto
  const renderProductInfo = () => {
    if (!productInfo) return null

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {productInfo.found ? 'Produto Encontrado' : 'Produto Não Encontrado'}
            </CardTitle>
            {productInfo.found ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-sm text-gray-600">Código de Barras:</span>
              <p className="font-mono text-sm">{productInfo.barcode}</p>
            </div>
            
            {productInfo.found ? (
              <>
                <div>
                  <span className="font-medium text-sm text-gray-600">Nome:</span>
                  <p className="font-medium">{productInfo.nome}</p>
                </div>
                
                {productInfo.marca && (
                  <div>
                    <span className="font-medium text-sm text-gray-600">Marca:</span>
                    <p>{productInfo.marca}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {productInfo.tipo && (
                    <div>
                      <span className="font-medium text-sm text-gray-600">Tipo:</span>
                      <p>{productInfo.tipo}</p>
                    </div>
                  )}
                  
                  {productInfo.volume && (
                    <div>
                      <span className="font-medium text-sm text-gray-600">Volume:</span>
                      <p>{productInfo.volume}</p>
                    </div>
                  )}
                  
                  {productInfo.safra && (
                    <div>
                      <span className="font-medium text-sm text-gray-600">Safra:</span>
                      <p>{productInfo.safra}</p>
                    </div>
                  )}
                  
                  {productInfo.teorAlcoolico && (
                    <div>
                      <span className="font-medium text-sm text-gray-600">Teor Alcoólico:</span>
                      <p>{productInfo.teorAlcoolico}</p>
                    </div>
                  )}
                </div>
                
                {productInfo.regiao && (
                  <div>
                    <span className="font-medium text-sm text-gray-600">Região:</span>
                    <p>{productInfo.regiao}</p>
                  </div>
                )}
                
                {productInfo.descricao && (
                  <div>
                    <span className="font-medium text-sm text-gray-600">Descrição:</span>
                    <p className="text-sm text-gray-700">{productInfo.descricao}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">
                  Produto não encontrado na base de dados
                </p>
                <p className="text-sm text-gray-500">
                  Você pode cadastrar este produto manualmente
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scanner de Código de Barras
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {renderScannerStatus()}

          {/* Área do vídeo */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-lg object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Overlay de scanning */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed rounded-lg w-48 h-24 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    Posicione o código de barras aqui
                  </span>
                </div>
              </div>
            )}
            
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">
                    {detectedCode ? 'Buscando produto...' : 'Iniciando câmera...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Código detectado */}
          {detectedCode && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-green-700">
                Código detectado: {detectedCode}
              </p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-1" />
              <p className="text-sm font-medium text-red-700 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Tentar Novamente
              </Button>
            </div>
          )}

          {/* Informações do produto */}
          {renderProductInfo()}

          {/* Botões de ação */}
          <div className="flex gap-2 pt-4">
            {!isScanning && !detectedCode && !isLoading && (
              <Button onClick={startScanning} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Iniciar Scanner
              </Button>
            )}
            
            {isScanning && (
              <Button variant="outline" onClick={stopScanning} className="flex-1">
                Parar Scanner
              </Button>
            )}
            
            {productInfo && productInfo.found && (
              <Button onClick={handleUseProduct} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Usar Produto
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>

          {/* Dicas de uso */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>• {isMobile ? 'Use a câmera traseira' : 'Posicione o código na frente da câmera'}</p>
            <p>• Mantenha boa iluminação e foque o código de barras</p>
            <p>• Aguarde alguns segundos para a detecção automática</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default BarcodeScanner
