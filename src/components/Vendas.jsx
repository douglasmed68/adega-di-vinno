import React, { useState, useEffect } from 'react'
import { 
  ShoppingCart, 
  Plus, 
  Search, 
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
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import VisualizarPedido from './VisualizarPedido'
import SyncStatus from './SyncStatus'
import supabaseSync from '../services/supabaseSync'

const Vendas = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [pedidos, setPedidos] = useState([])
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [vendas] = useState([
    { id: 1, data: '2024-10-06', cliente: 'João Silva', produto: 'Cabernet Sauvignon', qtd: 2, valor: 90.00, pagamento: 'Cartão', vendedor: 'Carlos' },
    { id: 2, data: '2024-10-06', cliente: 'Maria Santos', produto: 'Chardonnay', qtd: 1, valor: 55.00, pagamento: 'PIX', vendedor: 'Ana' },
    { id: 3, data: '2024-10-05', cliente: 'Pedro Costa', produto: 'Espumante Brut', qtd: 3, valor: 195.00, pagamento: 'Dinheiro', vendedor: 'Carlos' }
  ])

  // Carregar pedidos do localStorage
  const loadPedidosFromStorage = () => {
    try {
      const savedPedidos = localStorage.getItem('adega-di-vinno-vendas')
      if (savedPedidos) {
        return JSON.parse(savedPedidos)
      }
      return pedidosIniciais
    } catch (error) {
      console.error('Erro ao carregar pedidos do localStorage:', error)
      return pedidosIniciais
    }
  }

  // Salvar pedidos no localStorage
  const savePedidosToStorage = (pedidos) => {
    try {
      localStorage.setItem('adega-di-vinno-vendas', JSON.stringify(pedidos))
      
      // Disparar evento para sincronização
      window.dispatchEvent(new CustomEvent('adega-vendas-updated', { 
        detail: { vendas: pedidos, lastModified: Date.now() } 
      }))
    } catch (error) {
      console.error('Erro ao salvar pedidos no localStorage:', error)
    }
  }

  // Carregar pedidos iniciais
  useEffect(() => {
    const loadedPedidos = loadPedidosFromStorage()
    setPedidos(loadedPedidos)
    
    // Listener para atualização de dados
    const handleDataSynced = (event) => {
      if (event.detail?.vendas) {
        setPedidos(event.detail.vendas)
      }
    }
    
    window.addEventListener('adega-data-synced', handleDataSynced)
    
    return () => {
      window.removeEventListener('adega-data-synced', handleDataSynced)
    }
  }, [])

  // Filtrar pedidos
  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = 
      pedido.numero.toString().includes(searchTerm) ||
      pedido.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.itens.some(item => item.nome.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || pedido.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // Formatar data
  const formatarData = (timestamp) => {
    const data = new Date(timestamp)
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    })
  }

  // Calcular total do pedido
  const calcularTotal = (pedido) => {
    const subtotal = pedido.itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0)
    return subtotal + (pedido.frete || 0) - (pedido.desconto || 0)
  }

  // Obter status do pedido com cor
  const getStatusBadge = (status) => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'default', icon: <Clock className="h-4 w-4" /> },
      'pago': { label: 'Pago', variant: 'default', icon: <CheckCircle className="h-4 w-4" /> },
      'enviado': { label: 'Enviado', variant: 'default', icon: <Truck className="h-4 w-4" /> },
      'entregue': { label: 'Entregue', variant: 'default', icon: <Package className="h-4 w-4" /> },
      'cancelado': { label: 'Cancelado', variant: 'destructive', icon: <AlertTriangle className="h-4 w-4" /> }
    }

    const statusInfo = statusMap[status] || statusMap.pendente

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    )
  }

  // Visualizar pedido
  const handleViewPedido = (pedido) => {
    setSelectedPedido(pedido)
    setIsViewDialogOpen(true)
  }

  // Atualizar status do pedido
  const handleUpdateStatus = (pedidoId, newStatus) => {
    const updatedPedidos = pedidos.map(pedido => {
      if (pedido.id === pedidoId) {
        return { ...pedido, status: newStatus }
      }
      return pedido
    })
    
    setPedidos(updatedPedidos)
    savePedidosToStorage(updatedPedidos)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-gray-600">Gerencie as vendas da adega</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendas Hoje</p>
                <p className="text-2xl font-bold">R$ 340,00</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendas Mês</p>
                <p className="text-2xl font-bold">R$ 12.450,00</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ 113,33</p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold">{pedidos.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar pedidos por número, cliente ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Vendedor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendas.map((venda) => (
                <TableRow key={venda.id}>
                  <TableCell>{new Date(venda.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{venda.cliente}</TableCell>
                  <TableCell>{venda.produto}</TableCell>
                  <TableCell>{venda.qtd}</TableCell>
                  <TableCell>R$ {venda.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{venda.pagamento}</Badge>
                  </TableCell>
                  <TableCell>{venda.vendedor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Pedidos ({filteredPedidos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido #</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhum pedido encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredPedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.numero}</TableCell>
                    <TableCell>{formatarData(pedido.data)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{pedido.cliente.nome}</span>
                        <span className="text-xs text-gray-500">{pedido.cliente.telefone}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pedido.itens.length} itens</TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {calcularTotal(pedido).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(pedido.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewPedido(pedido)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPedido(pedido)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'pendente')}>
                              <Clock className="mr-2 h-4 w-4" />
                              Marcar como Pendente
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'pago')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'enviado')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Marcar como Enviado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'entregue')}>
                              <Package className="mr-2 h-4 w-4" />
                              Marcar como Entregue
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(pedido.id, 'cancelado')}>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Marcar como Cancelado
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status de Sincronização */}
      <div className="mt-6">
        <SyncStatus />
      </div>

      {/* Modal de Visualização de Pedido */}
      <VisualizarPedido
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        pedido={selectedPedido}
      />
    </div>
  )
}

// Dados iniciais para demonstração
const pedidosIniciais = [
  {
    id: 1,
    numero: '1001',
    data: Date.now() - 86400000, // Ontem
    cliente: {
      nome: 'João Silva',
      telefone: '(11) 98765-4321',
      email: 'joao.silva@email.com',
      endereco: 'Rua das Vinhas, 123 - São Paulo, SP'
    },
    itens: [
      {
        codigo: 'V001',
        nome: 'Vinho Tinto Cabernet Sauvignon',
        descricao: '2020 • 750ml • Chile',
        quantidade: 2,
        precoUnitario: 45.00
      },
      {
        codigo: 'V003',
        nome: 'Espumante Brut',
        descricao: '2022 • 750ml • Brasil',
        quantidade: 1,
        precoUnitario: 65.00
      }
    ],
    frete: 15.00,
    desconto: 10.00,
    formaPagamento: 'Cartão de Crédito',
    status: 'entregue',
    observacoes: 'Entregar no período da tarde.'
  },
  {
    id: 2,
    numero: '1002',
    data: Date.now() - 172800000, // 2 dias atrás
    cliente: {
      nome: 'Maria Santos',
      telefone: '(11) 91234-5678',
      email: 'maria.santos@email.com',
      endereco: 'Av. Paulista, 1000 - São Paulo, SP'
    },
    itens: [
      {
        codigo: 'V002',
        nome: 'Vinho Branco Chardonnay',
        descricao: '2021 • 750ml • Argentina',
        quantidade: 3,
        precoUnitario: 55.00
      }
    ],
    frete: 0,
    desconto: 0,
    formaPagamento: 'PIX',
    status: 'pago',
    observacoes: ''
  },
  {
    id: 3,
    numero: '1003',
    data: Date.now(), // Hoje
    cliente: {
      nome: 'Pedro Costa',
      telefone: '(11) 97777-8888',
      email: 'pedro.costa@email.com',
      endereco: 'Rua Augusta, 500 - São Paulo, SP'
    },
    itens: [
      {
        codigo: 'V004',
        nome: 'Vinho Rosé',
        descricao: '2021 • 750ml • França',
        quantidade: 1,
        precoUnitario: 75.00
      },
      {
        codigo: 'V005',
        nome: 'Vinho Tinto Malbec',
        descricao: '2019 • 750ml • Argentina',
        quantidade: 2,
        precoUnitario: 52.00
      }
    ],
    frete: 20.00,
    desconto: 15.00,
    formaPagamento: 'Dinheiro',
    status: 'pendente',
    observacoes: 'Cliente vai retirar na loja.'
  }
]

export default Vendas
