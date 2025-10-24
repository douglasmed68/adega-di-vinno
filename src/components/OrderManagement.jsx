import React, { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  Eye,
  Printer,
  FileText,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  Package,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import OrderViewPrint from './OrderViewPrint'
import SyncStatus from './SyncStatus'

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar pedidos do localStorage
  useEffect(() => {
    loadOrders()
    
    // Listener para atualizações em tempo real
    const handleOrdersUpdate = () => loadOrders()
    window.addEventListener('adega-pedidos-updated', handleOrdersUpdate)
    
    return () => {
      window.removeEventListener('adega-pedidos-updated', handleOrdersUpdate)
    }
  }, [])

  // Aplicar filtros quando os dados ou filtros mudarem
  useEffect(() => {
    applyFilters()
  }, [orders, searchTerm, statusFilter, dateRange])

  // Carregar pedidos
  const loadOrders = useCallback(() => {
    try {
      setIsLoading(true)
      
      // Carregar pedidos do localStorage
      const storedOrders = JSON.parse(localStorage.getItem('adega-di-vinno-pedidos') || '[]')
      
      // Se não houver pedidos, criar alguns exemplos
      if (storedOrders.length === 0) {
        const sampleOrders = generateSampleOrders()
        localStorage.setItem('adega-di-vinno-pedidos', JSON.stringify(sampleOrders))
        setOrders(sampleOrders)
      } else {
        setOrders(storedOrders)
      }
      
      setError(null)
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
      setError('Erro ao carregar pedidos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Gerar pedidos de exemplo
  const generateSampleOrders = () => {
    const today = new Date()
    const sampleOrders = []
    
    for (let i = 1; i <= 15; i++) {
      const orderDate = new Date(today)
      orderDate.setDate(today.getDate() - Math.floor(Math.random() * 30))
      
      const statuses = ['Pendente', 'Confirmado', 'Preparando', 'Enviado', 'Entregue', 'Cancelado']
      const paymentMethods = ['Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro', 'Boleto']
      const customers = [
        { nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-1111', endereco: 'Rua A, 123 - São Paulo/SP' },
        { nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99999-2222', endereco: 'Rua B, 456 - São Paulo/SP' },
        { nome: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 99999-3333', endereco: 'Rua C, 789 - São Paulo/SP' },
        { nome: 'Ana Costa', email: 'ana@email.com', telefone: '(11) 99999-4444', endereco: 'Rua D, 101 - São Paulo/SP' },
        { nome: 'Carlos Souza', email: 'carlos@email.com', telefone: '(11) 99999-5555', endereco: 'Rua E, 202 - São Paulo/SP' }
      ]
      
      const products = [
        { codigo: 'V001', nome: 'Vinho Tinto Cabernet Sauvignon', preco: 45.90 },
        { codigo: 'V002', nome: 'Vinho Branco Chardonnay', preco: 38.50 },
        { codigo: 'V003', nome: 'Espumante Brut', preco: 52.00 },
        { codigo: 'V004', nome: 'Vinho Rosé Pinot Noir', preco: 41.20 },
        { codigo: 'V005', nome: 'Vinho Tinto Merlot', preco: 48.90 }
      ]
      
      // Gerar itens aleatórios
      const numItems = Math.floor(Math.random() * 4) + 1
      const items = []
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)]
        const quantity = Math.floor(Math.random() * 3) + 1
        
        items.push({
          codigo: product.codigo,
          produto: product.nome,
          quantidade: quantity,
          precoUnitario: product.preco,
          descricao: `${product.nome} - Safra 2020`
        })
      }
      
      const subtotal = items.reduce((sum, item) => sum + (item.quantidade * item.precoUnitario), 0)
      const desconto = Math.random() > 0.7 ? subtotal * 0.1 : 0
      const frete = Math.random() > 0.5 ? 15.00 : 0
      
      sampleOrders.push({
        id: `PED${i.toString().padStart(3, '0')}`,
        numero: `2024${i.toString().padStart(4, '0')}`,
        data: orderDate.toISOString(),
        cliente: customers[Math.floor(Math.random() * customers.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        formaPagamento: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        vendedor: 'Sistema',
        itens: items,
        subtotal,
        desconto,
        frete,
        total: subtotal - desconto + frete,
        observacoes: Math.random() > 0.7 ? 'Entrega rápida solicitada pelo cliente' : '',
        criadoEm: orderDate.toISOString(),
        atualizadoEm: orderDate.toISOString()
      })
    }
    
    return sampleOrders.sort((a, b) => new Date(b.data) - new Date(a.data))
  }

  // Aplicar filtros
  const applyFilters = useCallback(() => {
    let filtered = [...orders]

    // Filtro por termo de busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(order =>
        order.numero?.toLowerCase().includes(searchLower) ||
        order.cliente?.nome?.toLowerCase().includes(searchLower) ||
        order.cliente?.email?.toLowerCase().includes(searchLower) ||
        order.id?.toLowerCase().includes(searchLower)
      )
    }

    // Filtro por status
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filtro por data
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.data)
        return orderDate >= dateRange.from && orderDate <= dateRange.to
      })
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, dateRange])

  // Formatar data
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  // Formatar moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  // Obter cor do status
  const getStatusColor = (status) => {
    const colors = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Confirmado': 'bg-blue-100 text-blue-800',
      'Preparando': 'bg-orange-100 text-orange-800',
      'Enviado': 'bg-purple-100 text-purple-800',
      'Entregue': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Obter ícone do status
  const getStatusIcon = (status) => {
    const icons = {
      'Pendente': Clock,
      'Confirmado': CheckCircle,
      'Preparando': Package,
      'Enviado': Truck,
      'Entregue': CheckCircle,
      'Cancelado': AlertTriangle
    }
    const Icon = icons[status] || Clock
    return <Icon className="h-4 w-4" />
  }

  // Visualizar pedido
  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  // Calcular estatísticas
  const getStats = () => {
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const pendingOrders = orders.filter(order => order.status === 'Pendente').length
    const completedOrders = orders.filter(order => order.status === 'Entregue').length
    
    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    }
  }

  const stats = getStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Carregando pedidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie pedidos com visualização e impressão completa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* Status de sincronização */}
      <SyncStatus />

      {/* Erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregues</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por número, cliente ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Preparando">Preparando</SelectItem>
                <SelectItem value="Enviado">Enviado</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredOrders.length} pedido(s) encontrado(s)
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">
                    #{order.numero || order.id}
                  </TableCell>
                  <TableCell>
                    {formatDate(order.data)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.cliente?.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.cliente?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.formaPagamento}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(order.total)}
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
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Imprimir
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancelar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nenhum pedido encontrado com os filtros aplicados'
                  : 'Nenhum pedido encontrado'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de visualização e impressão */}
      <OrderViewPrint
        order={selectedOrder}
        isOpen={isViewDialogOpen}
        onClose={() => {
          setIsViewDialogOpen(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}

export default OrderManagement
