import React, { useState, useMemo, useCallback } from 'react';
import { useLocalSync } from '../services/localSyncService.jsx';
import SyncStatus from './SyncStatus'; // Import adicionado
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
  BarChart3,
  Wine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BarcodeScanner from './BarcodeScanner';

const Estoque = () => {
  const { produtos, estoque, addEstoque, updateEstoque, deleteEstoque, syncStatus } = useLocalSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isScannerDialogOpen, setIsScannerDialogOpen] = useState(false);
  const [scannerCode, setScannerCode] = useState('');
  
  const [newMovement, setNewMovement] = useState({
    codigo_barras: '',
    tipo: 'Entrada',
    quantidade: 0,
    documento: '',
    observacoes: ''
  });

  // Combina produtos e estoque para a visualização
  const estoqueDetalhado = useMemo(() => {
    return produtos.map(produto => {
      // Inicializa com valores padrão para estoque_min, estoque_max e localizacao
      const defaultEstoque = { 
        quantidade: 0, 
        estoque_min: 5, // Valor padrão
        estoque_max: 50, // Valor padrão
        localizacao: 'A1-01' // Valor padrão
      };
      
      const itemEstoque = estoque.find(e => e.produto_id === produto.id) || defaultEstoque;
      
      let status = 'OK';
      if (itemEstoque.quantidade <= itemEstoque.estoque_min) {
        status = 'BAIXO';
      }
      if (itemEstoque.quantidade === 0) {
        status = 'CRÍTICO';
      }

      return {
        id: produto.id,
        nome: produto.nome,
        codigo_barras: produto.codigo_barras,
        tipo: produto.tipo,
        preco_venda: produto.preco_venda,
        ...itemEstoque,
        status: status,
        valorTotal: itemEstoque.quantidade * produto.preco_venda
      };
    });
  }, [produtos, estoque]);

  const filteredEstoque = useMemo(() => {
    return estoqueDetalhado.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.codigo_barras.includes(searchTerm);
      
      let matchesFilter = true;
      if (selectedFilter === 'baixo') {
        matchesFilter = item.status === 'BAIXO' || item.status === 'CRÍTICO';
      } else if (selectedFilter === 'ok') {
        matchesFilter = item.status === 'OK';
      } else if (selectedFilter === 'critico') {
        matchesFilter = item.status === 'CRÍTICO';
      }
      
      return matchesSearch && matchesFilter;
    });
  }, [estoqueDetalhado, searchTerm, selectedFilter]);

  const getStatusBadge = (status) => {
    let variant = 'default';
    let icon = <Package className="h-4 w-4" />;
    
    if (status === 'BAIXO') {
      variant = 'warning';
      icon = <AlertTriangle className="h-4 w-4" />;
    } else if (status === 'CRÍTICO') {
      variant = 'destructive';
      icon = <AlertTriangle className="h-4 w-4" />;
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status}
      </Badge>
    );
  };

  const handleMovementChange = useCallback((field, value) => {
    setNewMovement(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleMovementSubmit = async (e) => {
    e.preventDefault();
    const { codigo_barras, tipo, quantidade, documento, observacoes } = newMovement;
    
    // O Select já garante que codigo_barras (que representa o identificador) não é vazio
    const produto = produtos.find(p => p.codigo_barras === codigo_barras);
    
    // Se o produto não for encontrado, significa que o item selecionado não existe mais (erro de estado),
    // mas o Select deve garantir que um produto válido seja escolhido.
    if (!produto) {
      alert('Erro: Produto selecionado não encontrado no catálogo.');
      return;
    }

    const itemEstoque = estoque.find(e => e.produto_id === produto.id);
    let novaQuantidade = itemEstoque ? itemEstoque.quantidade : 0;
    
    if (tipo === 'Entrada') {
      novaQuantidade += quantidade;
    } else if (tipo === 'Saída') {
      if (novaQuantidade < quantidade) {
        alert('Erro: Quantidade de saída maior que o estoque atual.');
        return;
      }
      novaQuantidade -= quantidade;
    }

    const movimento = {
      produto_id: produto.id,
      quantidade: novaQuantidade,
      // outros campos de estoque_min, max, localizacao, etc. seriam atualizados aqui
    };

    if (itemEstoque) {
      await updateEstoque(itemEstoque.id, movimento);
    } else {
      await addEstoque({
        produto_id: produto.id,
        quantidade: novaQuantidade,
        estoque_min: 5, // Valor padrão
        estoque_max: 50, // Valor padrão
        localizacao: 'A1-01', // Valor padrão
        // Outros campos...
      });
    }

    // Resetar o formulário
    setNewMovement({
      codigo_barras: '',
      tipo: 'Entrada',
      quantidade: 0,
      documento: '',
      observacoes: ''
    });
    setIsMovementDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Estoque</h1>
          <p className="text-muted-foreground">Visão detalhada e movimentação do seu estoque de vinhos.</p>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus status={syncStatus} />
          <Button onClick={() => setIsMovementDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
          <Button variant="outline" onClick={() => setIsScannerDialogOpen(true)}>
            <Scan className="mr-2 h-4 w-4" />
            Scanner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Cards de resumo de estoque */}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome ou código de barras..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ok">Estoque OK</SelectItem>
                <SelectItem value="baixo">Estoque Baixo</SelectItem>
                <SelectItem value="critico">Estoque Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Cód. Barras</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstoque.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Wine className="h-4 w-4 text-primary" />
                    {item.nome}
                  </TableCell>
                  <TableCell>{item.codigo_barras}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    {item.localizacao}
                  </TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{item.estoque_min}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>R$ {item.valorTotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo de Movimentação de Estoque */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Movimentação de Estoque</DialogTitle>
            <DialogDescription>
              Registre uma entrada ou saída de produto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMovementSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="produto_id">Produto</Label>
                <Select 
                  value={newMovement.codigo_barras} 
                  onValueChange={(value) => handleMovementChange('codigo_barras', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto (Nome ou Código)" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map(p => (
                      <SelectItem key={p.id} value={p.codigo_barras}>
                        {p.nome} ({p.codigo_barras})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Movimentação</Label>
                <Select 
                  value={newMovement.tipo} 
                  onValueChange={(value) => handleMovementChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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
                  onChange={(e) => handleMovementChange('quantidade', parseInt(e.target.value) || 0)} 
                  min="1" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento">Documento (NF, Venda ID, etc.)</Label>
                <Input 
                  id="documento" 
                  value={newMovement.documento} 
                  onChange={(e) => handleMovementChange('documento', e.target.value)} 
                  placeholder="Ex: NF-12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input 
                  id="observacoes" 
                  value={newMovement.observacoes} 
                  onChange={(e) => handleMovementChange('observacoes', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsMovementDialogOpen(false)}>Cancelar</Button>
              <Button type="submit">Registrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo do Scanner de Código de Barras */}
      <Dialog open={isScannerDialogOpen} onOpenChange={setIsScannerDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Scanner de Código de Barras</DialogTitle>
            <DialogDescription>
              Use a câmera para escanear o código de barras de um produto.
            </DialogDescription>
          </DialogHeader>
          <BarcodeScanner onDetected={(code) => {
            setScannerCode(code);
            setIsScannerDialogOpen(false);
            // Opcional: Abrir automaticamente o diálogo de movimentação com o código preenchido
            setNewMovement(prev => ({ ...prev, codigo_barras: code }));
            setIsMovementDialogOpen(true);
          }} />
          <div className="mt-4">
            <p>Código Escaneado: <span className="font-bold">{scannerCode}</span></p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Estoque;
