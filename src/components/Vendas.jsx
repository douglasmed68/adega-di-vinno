import React, { useState, useMemo } from 'react';
import { useLocalSync } from '../services/localSyncService.jsx';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import VisualizarPedido from './VisualizarPedido';
import NovaVendaDialog from './NovaVendaDialog'; // Importar o novo componente
import SyncStatus from './SyncStatus';

const Vendas = () => {
  const { produtos, clientes, vendas, addVenda, updateVenda, deleteVenda, syncStatus } = useLocalSync(); // Adicionar produtos e clientes
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewVendaDialogOpen, setIsNewVendaDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredVendas = useMemo(() => 
    vendas.filter(venda => {
      const matchesSearch = 
        (venda.id.toString().includes(searchTerm)) ||
        (venda.cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (venda.itens?.some(item => item.nome.toLowerCase().includes(searchTerm.toLowerCase())));
      
      const matchesStatus = selectedStatus === 'all' || venda.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    }), [vendas, searchTerm, selectedStatus]);

  const formatarData = (timestamp) => {
    const data = new Date(timestamp);
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const calcularTotal = (venda) => {
    const subtotal = venda.itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
    return subtotal + (venda.frete || 0) - (venda.desconto || 0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'default', icon: <Clock className="h-4 w-4" /> },
      'pago': { label: 'Pago', variant: 'default', icon: <CheckCircle className="h-4 w-4" /> },
      'enviado': { label: 'Enviado', variant: 'default', icon: <Truck className="h-4 w-4" /> },
      'entregue': { label: 'Entregue', variant: 'default', icon: <Package className="h-4 w-4" /> },
      'cancelado': { label: 'Cancelado', variant: 'destructive', icon: <AlertTriangle className="h-4 w-4" /> }
    };

    const statusInfo = statusMap[status] || statusMap.pendente;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const handleViewPedido = (pedido) => {
    setSelectedPedido(pedido);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (pedidoId, newStatus) => {
    const venda = vendas.find(v => v.id === pedidoId);
    if (venda) {
      updateVenda(pedidoId, { ...venda, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vendas</h1>
          <p className="text-gray-600">Gerencie as vendas da adega</p>
        </div>
        <div className="flex gap-2 items-center">
          <SyncStatus status={syncStatus} />
          <Button onClick={() => setIsNewVendaDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Venda
          </Button>
        </div>
      </div>
      
      {/* Adicionar o componente NovaVendaDialog */}
      <NovaVendaDialog 
        isOpen={isNewVendaDialogOpen} 
        onOpenChange={setIsNewVendaDialogOpen} 
      />

      {/* Cards de resumo */}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por cliente, produto, ID..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder="Filtrar por status" />
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendas.map(venda => (
                <TableRow key={venda.id}>
                  <TableCell className="font-mono">#{venda.id}</TableCell>
                  <TableCell>{formatarData(venda.criado_em)}</TableCell>
                  <TableCell>{venda.cliente?.nome || 'N/A'}</TableCell>
                  <TableCell>R$ {calcularTotal(venda).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(venda.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewPedido(venda)}>
                          <Eye className="mr-2 h-4 w-4" /> Visualizar
                        </DropdownMenuItem>
                        {/* Adicionar mais ações como imprimir, etc */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPedido && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido #{selectedPedido.id}</DialogTitle>
            </DialogHeader>
            <VisualizarPedido pedido={selectedPedido} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Vendas;
