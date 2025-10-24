import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  Minus, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Scan,
  MapPin,
  Calendar,
  BarChart3
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const Estoque = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [isScannerDialogOpen, setIsScannerDialogOpen] = useState(false)
  const [scannerCode, setScannerCode] = useState('')
  
  const [estoque, setEstoque] = useState([
    {
      id: 1,
      codigo: 'V001',
      nome: 'Vinho Tinto Cabernet Sauvignon',
      ean13: '7890000000019',
      estoqueAtual: 25,
      estoqueMin: 10,
      estoqueMax: 50,
      valorUnitario: 45.00,
      valorTotal: 1125.00,
      localizacao: 'A1-01',
      ultimaEntrada: '2024-10-01',
      ultimaSaida: '2024-10-06',
      status: 'OK'
    },
    {
      id: 2,
      codigo: 'V002',
      nome: 'Vinho Branco Chardonnay',
      ean13: '7890000000028',
      estoqueAtual: 8,
      estoqueMin: 8,
      estoqueMax: 40,
      valorUnitario: 55.00,
      valorTotal: 440.00,
      localizacao: 'A1-02',
      ultimaEntrada: '2024-09-28',
      ultimaSaida: '2024-10-05',
      status: 'BAIXO'
    },
    {
      id: 3,
      codigo: 'V003',
      nome: 'Espumante Brut',
      ean13: '7890000000037',
      estoqueAtual: 3,
      estoqueMin: 5,
      estoqueMax: 30,
      valorUnitario: 65.00,
      valorTotal: 195.00,
      localizacao: 'A2-01',
      ultimaEntrada: '2024-09-25',
      ultimaSaida: '2024-10-06',
      status: 'CRÍTICO'
    },
    {
      id: 4,
      codigo: 'V004',
      nome: 'Vinho Rosé',
      ean13: '7890000000046',
      estoqueAtual: 12,
      estoqueMin: 6,
      estoqueMax: 35,
      valorUnitario: 75.00,
      valorTotal: 900.00,
      localizacao: 'A2-02',
      ultimaEntrada: '2024-10-02',
      ultimaSaida: '2024-10-04',
      status: 'OK'
    },
    {
      id: 5,
      codigo: 'V005',
      nome: 'Vinho Tinto Malbec',
      ean13: '7890000000055',
      estoqueAtual: 30,
      estoqueMin: 12,
      estoqueMax: 60,
      valorUnitario: 52.00,
      valorTotal: 1560.00,
      localizacao: 'A1-03',
      ultimaEntrada: '2024-10-03',
      ultimaSaida: '2024-10-06',
      status: 'OK'
    }
  ])

  const [movimentacoes, setMovimentacoes] = useState([
    {
      id: 1,
      data: '2024-10-06',
      codigo: 'V001',
      produto: 'Vinho Tinto Cabernet Sauvignon',
      tipo: 'Saída',
      quantidade: 5,
      valorUnitario: 45.00,
      valorTotal: 225.00,
      documento: 'Venda-001',
      observacoes: 'Venda balcão',
      usuario: 'Carlos',
      saldo: 25
    },
    {
      id: 2,
      data: '2024-10-05',
      codigo: 'V002',
      produto: 'Vinho Branco Chardonnay',
      tipo: 'Saída',
      quantidade: 2,
      valorUnitario: 55.00,
      valorTotal: 110.00,
      documento: 'Venda-002',
      observacoes: 'Venda delivery',
      usuario: 'Ana',
      saldo: 8
    },
    {
      id: 3,
      data: '2024-10-01',
      codigo: 'V001',
      produto: 'Vinho Tinto Cabernet Sauvignon',
      tipo: 'Entrada',
      quantidade: 30,
      valorUnitario: 25.00,
      valorTotal: 750.00,
      documento: 'NF-001',
      observacoes: 'Compra reposição',
      usuario: 'Admin',
      saldo: 30
    }
  ])

  const [newMovement, setNewMovement] = useState({
    codigo: '',
    tipo: 'Entrada',
    quantidade: '',
    valorUnitario: '',
    documento: '',
    observacoes: ''
  })

  const filteredEstoque = estoque.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.ean13.includes(searchTerm)
    
    let matchesFilter = true
    if (selectedFilter === 'baixo') {
      matchesFilter = item.status === 'BAIXO' || item.status === 'CRÍTICO'
    } else if (selectedFilter === 'ok') {
      matchesFilter = item.status === 'OK'
    } else if (selectedFilter === 'critico') {
      matchesFilter = item.status === 'CRÍTICO'
    }
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status) => {
    const variants = {
      'OK': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'BAIXO': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'CRÍTICO': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return variants[status] || variants['OK']
  }

  const handleMovement = () => {
    const produto = estoque.find(p => p.codigo === newMovement.codigo)
    if (!produto) return

    const novaMovimentacao = {
      id: Math.max(...movimentacoes.map(m => m.id)) + 1,
      data: new Date().toISOString().split('T')[0],
      codigo: newMovement.codigo,
      produto: produto.nome,
      tipo: newMovement.tipo,
      quantidade: parseInt(newMovement.quantidade),
      valorUnitario: parseFloat(newMovement.valorUnitario),
      valorTotal: parseInt(newMovement.quantidade) * parseFloat(newMovement.valorUnitario),
      documento: newMovement.documento,
      observacoes: newMovement.observacoes,
      usuario: 'Usuário Atual',
      saldo: produto.estoqueAtual + (newMovement.tipo === 'Entrada' ? parseInt(newMovement.quantidade) : -parseInt(newMovement.quantidade))
    }

    setMovimentacoes([novaMovimentacao, ...movimentacoes])
    
    // Atualizar estoque
    const novoEstoque = estoque.map(item => {
      if (item.codigo === newMovement.codigo) {
        const novoSaldo = item.estoqueAtual + (newMovement.tipo === 'Entrada' ? parseInt(newMovement.quantidade) : -parseInt(newMovement.quantidade))
        let novoStatus = 'OK'
        if (novoSaldo <= item.estoqueMin * 0.5) novoStatus = 'CRÍTICO'
        else if (novoSaldo <= item.estoqueMin) novoStatus = 'BAIXO'
        
        return {
          ...item,
          estoqueAtual: novoSaldo,
          valorTotal: novoSaldo * item.valorUnitario,
          status: novoStatus,
          [newMovement.tipo === 'Entrada' ? 'ultimaEntrada' : 'ultimaSaida']: new Date().toISOString().split('T')[0]
        }
      }
      return item
    })
    
    setEstoque(novoEstoque)
    setNewMovement({
      codigo: '',
      tipo: 'Entrada',
      quantidade: '',
      valorUnitario: '',
      documento: '',
      observacoes: ''
    })
    setIsMovementDialogOpen(false)
  }

  const handleScannerSearch = () => {
    const produto = estoque.find(p => p.ean13 === scannerCode || p.codigo === scannerCode)
    if (produto) {
      setSearchTerm(produto.codigo)
      setScannerCode('')
      setIsScannerDialogOpen(false)
    }
  }

  const totalValorEstoque = estoque.reduce((total, item) => total + item.valorTotal, 0)
  const produtosBaixoEstoque = estoque.filter(item => item.status === 'BAIXO' || item.status === 'CRÍTICO').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Controle de Estoque
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie o inventário e movimentações da adega
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Dialog open={isScannerDialogOpen} onOpenChange={setIsScannerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Scan className="mr-2 h-4 w-4" />
                Scanner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Busca por Código de Barras</DialogTitle>
                <DialogDescription>
                  Escaneie ou digite o código EAN-13 do produto
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scanner">Código EAN-13</Label>
                  <Input
                    id="scanner"
                    value={scannerCode}
                    onChange={(e) => setScannerCode(e.target.value)}
                    placeholder="7890000000019"
                    className="font-mono"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsScannerDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleScannerSearch}>
                  Buscar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Package className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Movimentação</DialogTitle>
                <DialogDescription>
                  Registre entrada ou saída de produtos do estoque
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Produto</Label>
                  <Select value={newMovement.codigo} onValueChange={(value) => setNewMovement({...newMovement, codigo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {estoque.map(produto => (
                        <SelectItem key={produto.codigo} value={produto.codigo}>
                          {produto.codigo} - {produto.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select value={newMovement.tipo} onValueChange={(value) => setNewMovement({...newMovement, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrada">Entrada</SelectItem>
                        <SelectItem value="Saída">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={newMovement.quantidade}
                      onChange={(e) => setNewMovement({...newMovement, quantidade: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                  <Input
                    id="valorUnitario"
                    type="number"
                    step="0.01"
                    value={newMovement.valorUnitario}
                    onChange={(e) => setNewMovement({...newMovement, valorUnitario: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Documento</Label>
                  <Input
                    id="documento"
                    value={newMovement.documento}
                    onChange={(e) => setNewMovement({...newMovement, documento: e.target.value})}
                    placeholder="Ex: NF-001, Venda-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={newMovement.observacoes}
                    onChange={(e) => setNewMovement({...newMovement, observacoes: e.target.value})}
                    placeholder="Observações sobre a movimentação"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleMovement}>
                  Registrar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Valor Total do Estoque
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {totalValorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total de Produtos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {estoque.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Produtos em Falta
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {produtosBaixoEstoque}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-500">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="estoque" className="space-y-4">
        <TabsList>
          <TabsTrigger value="estoque">Estoque Atual</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por produto, código ou EAN-13..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="ok">Estoque OK</SelectItem>
                    <SelectItem value="baixo">Estoque Baixo</SelectItem>
                    <SelectItem value="critico">Estoque Crítico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Stock Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventário Atual ({filteredEstoque.length} produtos)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>EAN-13</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredEstoque.map((item) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <TableCell className="font-medium">{item.codigo}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.nome}</p>
                              <p className="text-sm text-gray-500">
                                Min: {item.estoqueMin} | Max: {item.estoqueMax}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.ean13}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="font-semibold">{item.estoqueAtual}</span>
                              <span className="text-gray-500 ml-1">un</span>
                            </div>
                          </TableCell>
                          <TableCell>R$ {item.valorUnitario.toFixed(2)}</TableCell>
                          <TableCell>R$ {item.valorTotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3 text-gray-400" />
                              {item.localizacao}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Registro completo de entradas e saídas do estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Documento</TableHead>
                      <TableHead>Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((mov) => (
                      <TableRow key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-3 w-3 text-gray-400" />
                            {new Date(mov.data).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{mov.codigo}</TableCell>
                        <TableCell>{mov.produto}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {mov.tipo === 'Entrada' ? (
                              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                            )}
                            <Badge variant={mov.tipo === 'Entrada' ? 'default' : 'destructive'}>
                              {mov.tipo}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{mov.quantidade}</TableCell>
                        <TableCell>R$ {mov.valorUnitario.toFixed(2)}</TableCell>
                        <TableCell>R$ {mov.valorTotal.toFixed(2)}</TableCell>
                        <TableCell>{mov.documento}</TableCell>
                        <TableCell className="font-semibold">{mov.saldo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Estoque
