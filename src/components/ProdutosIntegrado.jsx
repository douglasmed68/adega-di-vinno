import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  Wine,
  MapPin,
  DollarSign,
  Percent,
  MoreHorizontal,
  Camera,
  Barcode,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import BarcodeScanner from './BarcodeScanner'
import SyncStatus from './SyncStatus'
import BarcodeDisplay from './BarcodeDisplay'
import productInventoryService from '../services/productInventoryService'
import modernBarcodeScanner from '../services/modernBarcodeScanner'

const ProdutosIntegrado = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Estados do formulário
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentProduct, setCurrentProduct] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  // Estados do scanner
  const [isScannerOpen, setIsScannerOpen] = useState(false)

  // Estados de visualização
  const [viewProduct, setViewProduct] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Inicializar serviço e carregar dados
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true)
        
        // Inicializar serviço
        await productInventoryService.initialize()
        
        // Carregar dados iniciais
        loadData()
        
        setError(null)
      } catch (err) {
        console.error('Erro ao inicializar:', err)
        setError('Erro ao carregar dados')
      } finally {
        setIsLoading(false)
      }
    }

    initializeService()

    // Configurar listeners para atualizações
    const handleProductsUpdate = () => loadData()
    const handleInventoryUpdate = () => loadData()
    
    window.addEventListener('adega-products-updated', handleProductsUpdate)
    window.addEventListener('adega-estoque-updated', handleInventoryUpdate)
    window.addEventListener('adega-realtime-update', handleProductsUpdate)

    return () => {
      window.removeEventListener('adega-products-updated', handleProductsUpdate)
      window.removeEventListener('adega-estoque-updated', handleInventoryUpdate)
      window.removeEventListener('adega-realtime-update', handleProductsUpdate)
    }
  }, [])

  // Carregar dados
  const loadData = useCallback(() => {
    try {
      const productsData = productInventoryService.getProducts()
      const inventoryData = productInventoryService.getInventoryItems()
      
      setProducts(productsData)
      setInventory(inventoryData)
      
      // Aplicar filtros
      applyFilters(productsData, searchTerm, filterType)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados')
    }
  }, [searchTerm, filterType])

  // Aplicar filtros
  const applyFilters = useCallback((productsData, search, type) => {
    let filtered = [...productsData]

    // Filtrar por termo de busca
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(product => 
        product.nome?.toLowerCase().includes(searchLower) ||
        product.codigo?.toLowerCase().includes(searchLower) ||
        product.marca?.toLowerCase().includes(searchLower) ||
        product.ean13?.includes(search)
      )
    }

    // Filtrar por tipo
    if (type && type !== 'todos') {
      filtered = filtered.filter(product => product.tipo === type)
    }

    setFilteredProducts(filtered)
  }, [])

  // Efeito para aplicar filtros quando searchTerm ou filterType mudam
  useEffect(() => {
    applyFilters(products, searchTerm, filterType)
  }, [products, searchTerm, filterType, applyFilters])

  // Obter informações do estoque para um produto
  const getInventoryInfo = useCallback((codigo) => {
    return inventory.find(item => item.codigo === codigo) || null
  }, [inventory])

  // Abrir formulário para novo produto
  const handleNewProduct = () => {
    setCurrentProduct({
      codigo: '',
      nome: '',
      tipo: '',
      categoria: '',
      marca: '',
      volume: '750ml',
      teorAlcoolico: '',
      safra: '',
      regiao: '',
      descricao: '',
      precoCompra: '',
      precoVenda: '',
      estoqueMin: 5,
      estoqueMax: 50,
      ean13: ''
    })
    setIsEdit(false)
    setIsDialogOpen(true)
  }

  // Abrir formulário para editar produto
  const handleEditProduct = (product) => {
    setCurrentProduct({ ...product })
    setIsEdit(true)
    setIsDialogOpen(true)
  }

  // Salvar produto
  const handleSaveProduct = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // Validações básicas
      if (!currentProduct.nome?.trim()) {
        throw new Error('Nome do produto é obrigatório')
      }

      if (!currentProduct.tipo) {
        throw new Error('Tipo do produto é obrigatório')
      }

      // Salvar produto
      await productInventoryService.saveProduct(currentProduct)
      
      // Fechar dialog
      setIsDialogOpen(false)
      setCurrentProduct({})
      
      // Recarregar dados
      loadData()
      
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
      setError(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Remover produto
  const handleRemoveProduct = async (codigo) => {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
      return
    }

    try {
      await productInventoryService.removeProduct(codigo)
      loadData()
    } catch (err) {
      console.error('Erro ao remover produto:', err)
      setError(err.message)
    }
  }

  // Visualizar produto
  const handleViewProduct = (product) => {
    setViewProduct(product)
    setIsViewDialogOpen(true)
  }

  // Lidar com produto encontrado pelo scanner
  const handleProductFound = (productData) => {
    if (productData.found) {
      // Produto encontrado - preencher formulário
      setCurrentProduct({
        codigo: '',
        nome: productData.nome || '',
        tipo: productData.tipo || 'Vinho',
        categoria: productData.categoria || 'Bebida',
        marca: productData.marca || '',
        volume: productData.volume || '750ml',
        teorAlcoolico: productData.teorAlcoolico || '',
        safra: productData.safra || '',
        regiao: productData.regiao || '',
        descricao: productData.descricao || '',
        precoCompra: '',
        precoVenda: '',
        estoqueMin: 5,
        estoqueMax: 50,
        ean13: productData.barcode
      })
    } else {
      // Produto não encontrado - preencher apenas o EAN-13
      setCurrentProduct({
        codigo: '',
        nome: '',
        tipo: 'Vinho',
        categoria: 'Bebida',
        marca: '',
        volume: '750ml',
        teorAlcoolico: '',
        safra: '',
        regiao: '',
        descricao: '',
        precoCompra: '',
        precoVenda: '',
        estoqueMin: 5,
        estoqueMax: 50,
        ean13: productData.barcode
      })
    }
    
    setIsEdit(false)
    setIsDialogOpen(true)
  }

  // Sincronizar dados manualmente
  const handleManualSync = async () => {
    try {
      setIsLoading(true)
      await productInventoryService.syncProductsWithInventory()
      loadData()
    } catch (err) {
      console.error('Erro na sincronização:', err)
      setError('Erro na sincronização')
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizar formulário de produto
  const renderProductForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          value={currentProduct.codigo || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, codigo: e.target.value }))}
          placeholder="Deixe vazio para gerar automaticamente"
          disabled={isEdit}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ean13">EAN-13</Label>
        <div className="flex gap-2">
          <Input
            id="ean13"
            value={currentProduct.ean13 || ''}
            onChange={(e) => setCurrentProduct(prev => ({ ...prev, ean13: e.target.value }))}
            placeholder="Código de barras EAN-13"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsScannerOpen(true)}
            title="Escanear código de barras"
          >
            <Barcode className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="nome">Nome do Produto</Label>
        <Input
          id="nome"
          value={currentProduct.nome || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, nome: e.target.value }))}
          placeholder="Ex: Vinho Tinto Cabernet Sauvignon"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select 
          value={currentProduct.tipo || ''} 
          onValueChange={(value) => setCurrentProduct(prev => ({ ...prev, tipo: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tinto">Vinho Tinto</SelectItem>
            <SelectItem value="Branco">Vinho Branco</SelectItem>
            <SelectItem value="Rosé">Vinho Rosé</SelectItem>
            <SelectItem value="Espumante">Espumante</SelectItem>
            <SelectItem value="Champagne">Champagne</SelectItem>
            <SelectItem value="Licor">Licor</SelectItem>
            <SelectItem value="Destilado">Destilado</SelectItem>
            <SelectItem value="Cerveja">Cerveja</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="marca">Marca</Label>
        <Input
          id="marca"
          value={currentProduct.marca || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, marca: e.target.value }))}
          placeholder="Ex: Vinícola Premium"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="volume">Volume</Label>
        <Select 
          value={currentProduct.volume || '750ml'} 
          onValueChange={(value) => setCurrentProduct(prev => ({ ...prev, volume: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="187ml">187ml</SelectItem>
            <SelectItem value="375ml">375ml</SelectItem>
            <SelectItem value="750ml">750ml</SelectItem>
            <SelectItem value="1000ml">1L</SelectItem>
            <SelectItem value="1500ml">1.5L</SelectItem>
            <SelectItem value="3000ml">3L</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="teorAlcoolico">Teor Alcoólico</Label>
        <Input
          id="teorAlcoolico"
          value={currentProduct.teorAlcoolico || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, teorAlcoolico: e.target.value }))}
          placeholder="Ex: 13.5%"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="safra">Safra</Label>
        <Input
          id="safra"
          value={currentProduct.safra || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, safra: e.target.value }))}
          placeholder="Ex: 2020"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="regiao">Região</Label>
        <Input
          id="regiao"
          value={currentProduct.regiao || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, regiao: e.target.value }))}
          placeholder="Ex: Chile - Valle Central"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="precoCompra">Preço de Compra (R$)</Label>
        <Input
          id="precoCompra"
          type="number"
          step="0.01"
          value={currentProduct.precoCompra || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, precoCompra: parseFloat(e.target.value) || '' }))}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="precoVenda">Preço de Venda (R$)</Label>
        <Input
          id="precoVenda"
          type="number"
          step="0.01"
          value={currentProduct.precoVenda || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, precoVenda: parseFloat(e.target.value) || '' }))}
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estoqueMin">Estoque Mínimo</Label>
        <Input
          id="estoqueMin"
          type="number"
          value={currentProduct.estoqueMin || 5}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, estoqueMin: parseInt(e.target.value) || 5 }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="estoqueMax">Estoque Máximo</Label>
        <Input
          id="estoqueMax"
          type="number"
          value={currentProduct.estoqueMax || 50}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, estoqueMax: parseInt(e.target.value) || 50 }))}
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={currentProduct.descricao || ''}
          onChange={(e) => setCurrentProduct(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descrição detalhada do produto..."
          rows={3}
        />
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produtos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo de produtos integrado com controle de estoque
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManualSync}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sincronizar
          </Button>
          <Button onClick={handleNewProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Status de sincronização */}
      <SyncStatus />

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, código, marca ou EAN-13..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="Tinto">Vinho Tinto</SelectItem>
                <SelectItem value="Branco">Vinho Branco</SelectItem>
                <SelectItem value="Rosé">Vinho Rosé</SelectItem>
                <SelectItem value="Espumante">Espumante</SelectItem>
                <SelectItem value="Champagne">Champagne</SelectItem>
                <SelectItem value="Licor">Licor</SelectItem>
                <SelectItem value="Destilado">Destilado</SelectItem>
                <SelectItem value="Cerveja">Cerveja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Estoque</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.status === 'OK').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.status === 'Estoque Baixo').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Falta</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventory.filter(item => item.status === 'Em Falta').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de produtos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            {filteredProducts.length} produto(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Marca</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const inventoryInfo = getInventoryInfo(product.codigo)
                return (
                  <TableRow key={product.codigo}>
                    <TableCell className="font-mono">{product.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.volume} • {product.safra}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.tipo}</Badge>
                    </TableCell>
                    <TableCell>{product.marca}</TableCell>
                    <TableCell>
                      {product.precoVenda ? `R$ ${product.precoVenda.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {inventoryInfo ? inventoryInfo.estoqueAtual || 0 : 0}
                    </TableCell>
                    <TableCell>
                      {inventoryInfo && (
                        <Badge 
                          variant={
                            inventoryInfo.status === 'OK' ? 'default' :
                            inventoryInfo.status === 'Estoque Baixo' ? 'secondary' : 'destructive'
                          }
                        >
                          {inventoryInfo.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveProduct(product.codigo)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'todos' 
                  ? 'Nenhum produto encontrado com os filtros aplicados'
                  : 'Nenhum produto cadastrado ainda'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de formulário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEdit ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {isEdit 
                ? 'Edite as informações do produto. As alterações serão sincronizadas automaticamente com o estoque.'
                : 'Adicione um novo produto ao catálogo. Ele será automaticamente adicionado ao controle de estoque.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {renderProductForm()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Salvar Alterações' : 'Adicionar Produto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          
          {viewProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Código</Label>
                  <p className="font-mono">{viewProduct.codigo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">EAN-13</Label>
                  <p className="font-mono">{viewProduct.ean13 || 'Não informado'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
                <p className="font-medium text-lg">{viewProduct.nome}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                  <p>{viewProduct.tipo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Marca</Label>
                  <p>{viewProduct.marca}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Volume</Label>
                  <p>{viewProduct.volume}</p>
                </div>
              </div>
              
              {viewProduct.ean13 && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Código de Barras</Label>
                  <BarcodeDisplay value={viewProduct.ean13} />
                </div>
              )}
              
              {viewProduct.descricao && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descrição</Label>
                  <p className="text-sm">{viewProduct.descricao}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scanner de código de barras */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductFound={handleProductFound}
      />
    </div>
  )
}

export default ProdutosIntegrado
