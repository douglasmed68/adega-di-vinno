import { useState, useEffect, useCallback } from 'react'
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
  Barcode
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import supabaseSync from '../services/supabaseSync'
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
  DialogTrigger,
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
import ResetData from './ResetData'
import BarcodeScanner from './BarcodeScanner'
import SyncStatus from './SyncStatus'
import BarcodeDisplay from './BarcodeDisplay'
import barcodeService from '../services/barcodeService'
import inventoryService from '../services/inventoryService'

// Componente ProductForm separado para evitar re-criação
const ProductForm = ({ product, setProduct, isEdit = false }) => {
  const handleInputChange = useCallback((field, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }))
  }, [setProduct])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="codigo">Código</Label>
        <Input
          id="codigo"
          value={product.codigo || ''}
          onChange={(e) => handleInputChange('codigo', e.target.value)}
          placeholder="Ex: V001"
          disabled={isEdit} // Não permitir editar o código de produtos existentes
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nome">Nome do Produto</Label>
        <Input
          id="nome"
          value={product.nome || ''}
          onChange={(e) => handleInputChange('nome', e.target.value)}
          placeholder="Ex: Vinho Tinto Cabernet Sauvignon"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select value={product.tipo || ''} onValueChange={(value) => handleInputChange('tipo', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tinto">Tinto</SelectItem>
            <SelectItem value="Branco">Branco</SelectItem>
            <SelectItem value="Rosé">Rosé</SelectItem>
            <SelectItem value="Espumante">Espumante</SelectItem>
            <SelectItem value="Fortificado">Fortificado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="regiao">Região/País</Label>
        <Input
          id="regiao"
          value={product.regiao || ''}
          onChange={(e) => handleInputChange('regiao', e.target.value)}
          placeholder="Ex: Chile, Argentina, Brasil"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="safra">Safra</Label>
        <Input
          id="safra"
          value={product.safra || ''}
          onChange={(e) => handleInputChange('safra', e.target.value)}
          placeholder="Ex: 2020"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="teorAlcoolico">Teor Alcoólico</Label>
        <Input
          id="teorAlcoolico"
          value={product.teorAlcoolico || ''}
          onChange={(e) => handleInputChange('teorAlcoolico', e.target.value)}
          placeholder="Ex: 13.5%"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="precoCusto">Preço de Custo (R$)</Label>
        <Input
          id="precoCusto"
          type="number"
          step="0.01"
          value={product.precoCusto || ''}
          onChange={(e) => handleInputChange('precoCusto', e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="precoVenda">Preço de Venda (R$)</Label>
        <Input
          id="precoVenda"
          type="number"
          step="0.01"
          value={product.precoVenda || ''}
          onChange={(e) => handleInputChange('precoVenda', e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fornecedor">Fornecedor</Label>
        <Input
          id="fornecedor"
          value={product.fornecedor || ''}
          onChange={(e) => handleInputChange('fornecedor', e.target.value)}
          placeholder="Ex: Vinícola ABC"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="estoqueMin">Estoque Mínimo</Label>
        <Input
          id="estoqueMin"
          type="number"
          value={product.estoqueMin || ''}
          onChange={(e) => handleInputChange('estoqueMin', e.target.value)}
          placeholder="10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="localizacao">Localização</Label>
        <Input
          id="localizacao"
          value={product.localizacao || ''}
          onChange={(e) => handleInputChange('localizacao', e.target.value)}
          placeholder="Ex: A1-01"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={product.status || 'Ativo'} onValueChange={(value) => handleInputChange('status', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Inativo">Inativo</SelectItem>
            <SelectItem value="Descontinuado">Descontinuado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Exibição do código de barras para produtos existentes */}
      {isEdit && product.ean13 && (
        <div className="col-span-2 mt-4">
          <Label>Código de Barras EAN-13</Label>
          <div className="mt-2">
            <BarcodeDisplay 
              value={product.ean13} 
              text={`EAN-13: ${product.ean13}`}
              height={80}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const Produtos = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [inventory, setInventory] = useState([])
  
  // Dados iniciais dos produtos
  const initialProducts = [
    {
      id: 1,
      codigo: 'V001',
      nome: 'Vinho Tinto Cabernet Sauvignon',
      tipo: 'Tinto',
      regiao: 'Chile',
      safra: '2020',
      teorAlcoolico: '13.5%',
      volume: '750ml',
      precoCusto: 25.00,
      precoVenda: 45.00,
      margem: 80,
      fornecedor: 'Vinícola ABC',
      estoqueMin: 10,
      localizacao: 'A1-01',
      status: 'Ativo',
      ean13: '7890000000019'
    },
    {
      id: 2,
      codigo: 'V002',
      nome: 'Vinho Branco Chardonnay',
      tipo: 'Branco',
      regiao: 'Argentina',
      safra: '2021',
      teorAlcoolico: '12.5%',
      volume: '750ml',
      precoCusto: 30.00,
      precoVenda: 55.00,
      margem: 83,
      fornecedor: 'Vinícola XYZ',
      estoqueMin: 8,
      localizacao: 'A1-02',
      status: 'Ativo',
      ean13: '7890000000028'
    },
    {
      id: 3,
      codigo: 'V003',
      nome: 'Espumante Brut',
      tipo: 'Espumante',
      regiao: 'Brasil',
      safra: '2022',
      teorAlcoolico: '12.0%',
      volume: '750ml',
      precoCusto: 35.00,
      precoVenda: 65.00,
      margem: 86,
      fornecedor: 'Vinícola Nacional',
      estoqueMin: 5,
      localizacao: 'A2-01',
      status: 'Ativo',
      ean13: '7890000000037'
    },
    {
      id: 4,
      codigo: 'V004',
      nome: 'Vinho Rosé',
      tipo: 'Rosé',
      regiao: 'França',
      safra: '2021',
      teorAlcoolico: '11.5%',
      volume: '750ml',
      precoCusto: 40.00,
      precoVenda: 75.00,
      margem: 88,
      fornecedor: 'Vinícola Francesa',
      estoqueMin: 6,
      localizacao: 'A2-02',
      status: 'Ativo',
      ean13: '7890000000046'
    },
    {
      id: 5,
      codigo: 'V005',
      nome: 'Vinho Tinto Malbec',
      tipo: 'Tinto',
      regiao: 'Argentina',
      safra: '2019',
      teorAlcoolico: '14.0%',
      volume: '750ml',
      precoCusto: 28.00,
      precoVenda: 52.00,
      margem: 86,
      fornecedor: 'Vinícola XYZ',
      estoqueMin: 12,
      localizacao: 'A1-03',
      status: 'Ativo',
      ean13: '7890000000055'
    }
  ]

  // Dados iniciais do estoque
  const initialInventory = [
    {
      codigo: 'V001',
      produto: 'Vinho Tinto Cabernet Sauvignon',
      ean13: '7890000000019',
      estoqueAtual: 25,
      estoqueMin: 10,
      estoqueMax: 50,
      ultimaEntrada: '2025-10-02',
      ultimaSaida: '2025-10-06',
      valorUnit: 45.00,
      valorTotal: 1125.00,
      status: 'OK'
    },
    {
      codigo: 'V002',
      produto: 'Vinho Branco Chardonnay',
      ean13: '7890000000028',
      estoqueAtual: 15,
      estoqueMin: 8,
      estoqueMax: 40,
      ultimaEntrada: '2025-10-04',
      ultimaSaida: '2025-10-05',
      valorUnit: 55.00,
      valorTotal: 825.00,
      status: 'OK'
    },
    {
      codigo: 'V003',
      produto: 'Espumante Brut',
      ean13: '7890000000037',
      estoqueAtual: 8,
      estoqueMin: 5,
      estoqueMax: 30,
      ultimaEntrada: '2025-09-30',
      ultimaSaida: '2025-10-06',
      valorUnit: 65.00,
      valorTotal: 520.00,
      status: 'OK'
    },
    {
      codigo: 'V004',
      produto: 'Vinho Rosé',
      ean13: '7890000000046',
      estoqueAtual: 12,
      estoqueMin: 6,
      estoqueMax: 35,
      ultimaEntrada: '2025-10-03',
      ultimaSaida: '2025-10-04',
      valorUnit: 75.00,
      valorTotal: 900.00,
      status: 'OK'
    },
    {
      codigo: 'V005',
      produto: 'Vinho Tinto Malbec',
      ean13: '7890000000055',
      estoqueAtual: 30,
      estoqueMin: 12,
      estoqueMax: 60,
      ultimaEntrada: '2025-10-05',
      ultimaSaida: '2025-10-06',
      valorUnit: 52.00,
      valorTotal: 1560.00,
      status: 'OK'
    }
  ]

  // Função para carregar produtos do localStorage
  const loadProductsFromStorage = () => {
    try {
      const savedProducts = localStorage.getItem('adega-di-vinno-products')
      if (savedProducts) {
        return JSON.parse(savedProducts)
      }
      return initialProducts
    } catch (error) {
      console.error('Erro ao carregar produtos do localStorage:', error)
      return initialProducts
    }
  }

  // Função para carregar estoque do localStorage
  const loadInventoryFromStorage = () => {
    try {
      const savedInventory = localStorage.getItem('adega-di-vinno-inventory')
      if (savedInventory) {
        return JSON.parse(savedInventory)
      }
      return initialInventory
    } catch (error) {
      console.error('Erro ao carregar estoque do localStorage:', error)
      return initialInventory
    }
  }

  // Salvar produtos no localStorage
  const saveProductsToStorage = (products) => {
    try {
      localStorage.setItem('adega-di-vinno-products', JSON.stringify(products))
      localStorage.setItem('adega-last-modified', Date.now().toString())
      
      // Disparar evento para sincronização
      window.dispatchEvent(new CustomEvent('adega-products-updated', { 
        detail: { products, lastModified: Date.now() } 
      }))
      
      // Iniciar sincronização
      supabaseSync.syncData()
      
      // Sincronizar com estoque
      const updatedInventory = inventoryService.syncAllProductsWithInventory(products, inventory)
      setInventory(updatedInventory)
      saveInventoryToStorage(updatedInventory)
    } catch (error) {
      console.error('Erro ao salvar produtos no localStorage:', error)
    }
  }

  // Salvar estoque no localStorage
  const saveInventoryToStorage = (inventory) => {
    try {
      localStorage.setItem('adega-di-vinno-inventory', JSON.stringify(inventory))
      localStorage.setItem('adega-inventory-last-modified', Date.now().toString())
    } catch (error) {
      console.error('Erro ao salvar estoque no localStorage:', error)
    }
  }

  // Estado dos produtos com persistência
  const [products, setProducts] = useState(() => loadProductsFromStorage())

  // Carregar estoque inicial
  useEffect(() => {
    const loadedInventory = loadInventoryFromStorage()
    setInventory(loadedInventory)
  }, [])

  // Sincronizar mudanças com localStorage
  useEffect(() => {
    saveProductsToStorage(products)
  }, [products])

  const [newProduct, setNewProduct] = useState({
    codigo: '',
    nome: '',
    tipo: '',
    regiao: '',
    safra: '',
    teorAlcoolico: '',
    volume: '750ml',
    precoCusto: '',
    precoVenda: '',
    fornecedor: '',
    estoqueMin: '',
    localizacao: '',
    status: 'Ativo'
  })

  // Função otimizada para atualizar newProduct
  const updateNewProduct = useCallback((updates) => {
    setNewProduct(prev => ({ ...prev, ...updates }))
  }, [])

  // Função otimizada para atualizar selectedProduct
  const updateSelectedProduct = useCallback((updates) => {
    setSelectedProduct(prev => ({ ...prev, ...updates }))
  }, [])

  const categories = ['all', 'Tinto', 'Branco', 'Rosé', 'Espumante', 'Fortificado']

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.regiao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.ean13?.includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || product.tipo === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddProduct = () => {
    // Validação dos campos obrigatórios
    if (!newProduct.codigo || !newProduct.nome || !newProduct.tipo || !newProduct.regiao) {
      alert('Por favor, preencha todos os campos obrigatórios: Código, Nome, Tipo e Região.')
      return
    }

    if (!newProduct.precoCusto || !newProduct.precoVenda) {
      alert('Por favor, preencha os preços de custo e venda.')
      return
    }

    const precoCusto = parseFloat(newProduct.precoCusto)
    const precoVenda = parseFloat(newProduct.precoVenda)

    if (precoVenda <= precoCusto) {
      alert('O preço de venda deve ser maior que o preço de custo.')
      return
    }

    // Verificar se o código já existe
    if (products.some(p => p.codigo === newProduct.codigo)) {
      alert('Já existe um produto com este código. Por favor, use um código diferente.')
      return
    }

    const id = Math.max(...products.map(p => p.id || 0), 0) + 1
    const margem = Math.round(((precoVenda - precoCusto) / precoCusto) * 100)
    
    // Gerar EAN-13 válido usando o serviço
    const ean13 = barcodeService.generateEAN13(newProduct.codigo)
    
    const productToAdd = {
      ...newProduct,
      id,
      margem,
      ean13,
      precoCusto,
      precoVenda,
      estoqueMin: parseInt(newProduct.estoqueMin) || 0
    }
    
    const updatedProducts = [...products, productToAdd]
    setProducts(updatedProducts)
    saveProductsToStorage(updatedProducts)
    
    // Resetar formulário
    setNewProduct({
      codigo: '',
      nome: '',
      tipo: '',
      regiao: '',
      safra: '',
      teorAlcoolico: '',
      volume: '750ml',
      precoCusto: '',
      precoVenda: '',
      fornecedor: '',
      estoqueMin: '',
      localizacao: '',
      status: 'Ativo'
    })
    setIsAddDialogOpen(false)
    
    alert('Produto adicionado com sucesso!')
  }

  const handleEditProduct = () => {
    // Validação dos campos obrigatórios
    if (!selectedProduct.codigo || !selectedProduct.nome || !selectedProduct.tipo || !selectedProduct.regiao) {
      alert('Por favor, preencha todos os campos obrigatórios: Código, Nome, Tipo e Região.')
      return
    }

    if (!selectedProduct.precoCusto || !selectedProduct.precoVenda) {
      alert('Por favor, preencha os preços de custo e venda.')
      return
    }

    const precoCusto = parseFloat(selectedProduct.precoCusto)
    const precoVenda = parseFloat(selectedProduct.precoVenda)

    if (precoVenda <= precoCusto) {
      alert('O preço de venda deve ser maior que o preço de custo.')
      return
    }

    // Verificar se o código já existe em outro produto
    if (products.some(p => p.codigo === selectedProduct.codigo && p.id !== selectedProduct.id)) {
      alert('Já existe outro produto com este código. Por favor, use um código diferente.')
      return
    }

    const margem = Math.round(((precoVenda - precoCusto) / precoCusto) * 100)
    
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id ? { 
        ...selectedProduct, 
        margem,
        precoCusto,
        precoVenda,
        estoqueMin: parseInt(selectedProduct.estoqueMin) || 0
      } : p
    )
    setProducts(updatedProducts)
    saveProductsToStorage(updatedProducts)
    setIsEditDialogOpen(false)
    setSelectedProduct(null)
    
    alert('Produto atualizado com sucesso!')
  }

  const handleDeleteProduct = (id) => {
    const product = products.find(p => p.id === id)
    
    if (window.confirm(`Tem certeza que deseja excluir o produto "${product?.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
      const updatedProducts = products.filter(p => p.id !== id)
      setProducts(updatedProducts)
      saveProductsToStorage(updatedProducts)
      alert('Produto excluído com sucesso!')
    }
  }

  // Função para lidar com produto escaneado
  const handleProductScanned = (scannedProduct) => {
    // Verificar se o código escaneado corresponde a um produto existente
    if (scannedProduct.ean13) {
      const existingProduct = products.find(p => p.ean13 === scannedProduct.ean13)
      
      if (existingProduct) {
        // Se o produto existe, abrir para edição
        setSelectedProduct(existingProduct)
        setIsEditDialogOpen(true)
        setIsScannerOpen(false)
        return
      }
    }
    
    // Se não encontrou produto existente ou não tem EAN-13, preencher formulário para novo produto
    const nextCode = barcodeService.generateNextProductCode(products)
    
    const productData = {
      codigo: nextCode,
      nome: scannedProduct.nome || '',
      tipo: scannedProduct.tipo || '',
      regiao: scannedProduct.regiao || '',
      safra: scannedProduct.safra || '',
      teorAlcoolico: scannedProduct.teorAlcoolico || '',
      volume: scannedProduct.volume || '750ml',
      precoCusto: '',
      precoVenda: '',
      fornecedor: scannedProduct.marca || '',
      estoqueMin: '10',
      localizacao: '',
      status: 'Ativo'
    }

    setNewProduct(productData)
    setIsScannerOpen(false)
    setIsAddDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    const variants = {
      'Ativo': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'Inativo': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      'Descontinuado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return variants[status] || variants['Ativo']
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Produtos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie o catálogo de vinhos da adega
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <ResetData />
          <Button 
            variant="outline" 
            onClick={() => setIsScannerOpen(true)}
            className="flex"
          >
            <Camera className="mr-2 h-4 w-4" />
            Scanner
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha as informações do novo vinho
              </DialogDescription>
            </DialogHeader>
            <ProductForm product={newProduct} setProduct={setNewProduct} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddProduct}>
                Adicionar Produto
              </Button>
            </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar produtos ou escanear código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.slice(1).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Catálogo de Produtos ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Preço Custo</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <TableCell className="font-medium">{product.codigo}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.nome}</p>
                          <p className="text-sm text-gray-500">{product.safra} • {product.volume}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.tipo}</Badge>
                      </TableCell>
                      <TableCell>{product.regiao}</TableCell>
                      <TableCell>R$ {product.precoCusto.toFixed(2)}</TableCell>
                      <TableCell>R$ {product.precoVenda.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Percent className="mr-1 h-3 w-3" />
                          {product.margem}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(product.status)}>
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProduct(product)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Barcode className="mr-2 h-4 w-4" />
                              Ver Código de Barras
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm 
              product={selectedProduct} 
              setProduct={setSelectedProduct} 
              isEdit={true} 
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditProduct}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedProduct.nome}</h3>
                  <p className="text-sm text-gray-500">Código: {selectedProduct.codigo}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <Wine className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Tipo:</span>
                      <span className="ml-2">{selectedProduct.tipo}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Região:</span>
                      <span className="ml-2">{selectedProduct.regiao}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Safra:</span>
                      <span className="ml-2">{selectedProduct.safra}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Teor Alcoólico:</span>
                      <span className="ml-2">{selectedProduct.teorAlcoolico}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Volume:</span>
                      <span className="ml-2">{selectedProduct.volume}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Preço de Custo:</span>
                      <span className="ml-2">R$ {selectedProduct.precoCusto.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Preço de Venda:</span>
                      <span className="ml-2">R$ {selectedProduct.precoVenda.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Margem:</span>
                      <span className="ml-2">{selectedProduct.margem}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Código de Barras</h4>
                  <BarcodeDisplay 
                    value={selectedProduct.ean13} 
                    text={`EAN-13: ${selectedProduct.ean13}`}
                  />
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium">Fornecedor:</span>
                      <span className="ml-2">{selectedProduct.fornecedor}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Estoque Mínimo:</span>
                      <span className="ml-2">{selectedProduct.estoqueMin}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Localização:</span>
                      <span className="ml-2">{selectedProduct.localizacao}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Status:</span>
                      <Badge className={`ml-2 ${getStatusBadge(selectedProduct.status)}`}>
                        {selectedProduct.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Informações de estoque */}
                  {inventory.find(item => item.codigo === selectedProduct.codigo) && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Informações de Estoque</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="font-medium">Estoque Atual:</span>
                          <span className="ml-2">
                            {inventory.find(item => item.codigo === selectedProduct.codigo)?.estoqueAtual || 0} unidades
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Última Entrada:</span>
                          <span className="ml-2">
                            {inventory.find(item => item.codigo === selectedProduct.codigo)?.ultimaEntrada || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Última Saída:</span>
                          <span className="ml-2">
                            {inventory.find(item => item.codigo === selectedProduct.codigo)?.ultimaSaida || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Valor em Estoque:</span>
                          <span className="ml-2">
                            R$ {inventory.find(item => item.codigo === selectedProduct.codigo)?.valorTotal?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fechar
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setIsEditDialogOpen(true)
                  }}
                >
                  Editar Produto
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scanner de Código de Barras */}
      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductFound={handleProductScanned}
      />
      
      {/* Botão flutuante de scanner para mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button 
          onClick={() => setIsScannerOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>

      {/* Status de Sincronização */}
      <div className="mt-6">
        <SyncStatus />
      </div>
    </div>
  )
}

export default Produtos
