import React, { useState, useMemo, useCallback } from 'react';
import { useLocalSync } from '../services/localSyncService.jsx';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  User,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const NovaVendaDialog = ({ isOpen, onOpenChange }) => {
  const { produtos, clientes, vendas, estoque, addVenda } = useLocalSync();

  const initialVendaState = {
    clienteId: '',
    itens: [],
    desconto: 0,
    frete: 0,
    status: 'pendente',
    observacoes: '',
  };

  const [novaVenda, setNovaVenda] = useState(initialVendaState);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidadeProduto, setQuantidadeProduto] = useState(1);

  const estoqueCalculado = useMemo(() => {
    // Mapeia o estoque para um objeto de fácil acesso { produto_id: quantidade }
    const estoqueMap = (estoque || []).reduce((map, item) => {
      map[item.produto_id] = item.quantidade;
      return map;
    }, {});

    return (produtos || []).map(p => ({
      ...p,
      estoque: estoqueMap[p.id] || 0, // Pega o estoque real ou 0
    }));
  }, [produtos, estoque]);

  const produtoAtual = estoqueCalculado.find(p => String(p.id) === produtoSelecionado);
  
  const subtotal = useMemo(() => {
    return novaVenda.itens.reduce((total, item) => total + (item.quantidade * item.precoUnitario), 0);
  }, [novaVenda.itens]);

  const totalVenda = useMemo(() => {
    return subtotal + novaVenda.frete - novaVenda.desconto;
  }, [subtotal, novaVenda.frete, novaVenda.desconto]);

  const handleAddItem = useCallback(() => {
    if (produtoAtual && quantidadeProduto > 0) {
      const itemExistente = novaVenda.itens.find(item => item.produtoId === produtoAtual.id);

	      // Se o item já existe, atualiza a quantidade (soma)
	      if (itemExistente) {
	        setNovaVenda(prev => ({
	          ...prev,
	          itens: prev.itens.map(item =>
	            item.produtoId === produtoAtual.id
	              ? { ...item, quantidade: item.quantidade + quantidadeProduto }
	              : item
	          ),
	        }));
	      } else {
        setNovaVenda(prev => ({
          ...prev,
          itens: [
            ...prev.itens,
            {
	              produtoId: produtoAtual.id,
	              nome: produtoAtual.nome,
	              precoUnitario: produtoAtual.preco_venda,
	              quantidade: quantidadeProduto,
            },
          ],
        }));
      }

      setProdutoSelecionado('');
      setQuantidadeProduto(1);
    }
  }, [produtoAtual, quantidadeProduto, novaVenda.itens]);

	  const handleRemoveItem = useCallback((produtoId) => {
	    setNovaVenda(prev => ({
	      ...prev,
	      itens: prev.itens.filter(item => item.produtoId !== produtoId),
	    }));
	  }, []);
	
	  const handleUpdateItemQuantity = useCallback((produtoId, newQuantity) => {
	    const quantity = parseInt(newQuantity) || 0;
	    if (quantity <= 0) {
	      handleRemoveItem(produtoId);
	      return;
	    }
	
	    setNovaVenda(prev => ({
	      ...prev,
	      itens: prev.itens.map(item =>
	        item.produtoId === produtoId
	          ? { ...item, quantidade: quantity }
	          : item
	      ),
	    }));
	  }, [handleRemoveItem]);

  const handleInputChange = useCallback((field, value) => {
    setNovaVenda(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaVenda.itens.length === 0) {
      alert('Adicione pelo menos um item à venda.');
      return;
    }

    const cliente = clientes.find(c => c.id === novaVenda.clienteId);
    
    const novaVendaData = {
      id: Date.now().toString(), // ID único baseado no timestamp
      criado_em: Date.now(),
      cliente: cliente ? { id: cliente.id, nome: cliente.nome } : null,
      itens: novaVenda.itens,
      total: totalVenda,
      status: novaVenda.status,
      desconto: novaVenda.desconto,
      frete: novaVenda.frete,
      observacoes: novaVenda.observacoes,
    };

    try {
      await addVenda(novaVendaData);
      setNovaVenda(initialVendaState);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      alert('Erro ao registrar a venda. Verifique o console para mais detalhes.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" /> Nova Venda
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
            {/* Coluna 1: Informações Básicas */}
            <div className="space-y-4 col-span-1">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2"><User className="h-4 w-4" /> Cliente e Status</h3>
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente (Opcional)</Label>
                <Select 
                  value={novaVenda.clienteId} 
                  onValueChange={(value) => handleInputChange('clienteId', value)}
                >
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => (
                      <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status da Venda</Label>
                <Select 
                  value={novaVenda.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input 
                  id="observacoes" 
                  value={novaVenda.observacoes} 
                  onChange={(e) => handleInputChange('observacoes', e.target.value)} 
                  placeholder="Notas sobre a venda"
                />
              </div>
            </div>

            {/* Coluna 2: Adicionar Produto */}
            <div className="space-y-4 col-span-2">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Adicionar Produtos</h3>
              <div className="flex gap-2">
                <div className="space-y-2 flex-grow">
                  <Label htmlFor="produto">Produto</Label>
                  <Select 
                    value={produtoSelecionado} 
                    onValueChange={setProdutoSelecionado}
                  >
                    <SelectTrigger id="produto">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {estoqueCalculado.map(produto => (
                        <SelectItem key={produto.id} value={String(produto.id)}>
                          {produto.nome} (Estoque: {produto.estoque})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 w-24">
                  <Label htmlFor="quantidade">Qtd</Label>
                  <Input 
                    id="quantidade" 
                    type="number" 
                    min="1"
                    value={quantidadeProduto} 
                    onChange={(e) => setQuantidadeProduto(parseInt(e.target.value) || 0)} 
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={handleAddItem} 
                    disabled={!produtoSelecionado || quantidadeProduto <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Tabela de Itens */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="w-[100px] text-right">Qtd</TableHead>
                      <TableHead className="w-[120px] text-right">Preço Unitário</TableHead>
                      <TableHead className="w-[120px] text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {novaVenda.itens.map(item => (
                      <TableRow key={item.produtoId}>
	                        <TableCell className="font-medium">{item.nome}</TableCell>
	                        <TableCell className="text-right">
	                          <Input 
	                            type="number"
	                            min="1"
	                            className="w-16 text-right p-1 h-8"
	                            value={item.quantidade}
	                            onChange={(e) => handleUpdateItemQuantity(item.produtoId, e.target.value)}
	                          />
	                        </TableCell>
                        <TableCell className="text-right">R$ {item.precoUnitario.toFixed(2)}</TableCell>
                        <TableCell className="text-right">R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveItem(item.produtoId)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {novaVenda.itens.length === 0 && (
                      <TableRow>
                        <TableCell colSpan="5" className="text-center text-muted-foreground">
                          Nenhum item adicionado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Totais e Descontos */}
              <div className="space-y-2">
                <div className="flex justify-between font-medium">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="desconto">Desconto (R$)</Label>
                  <Input 
                    id="desconto" 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="w-32 text-right"
                    value={novaVenda.desconto} 
                    onChange={(e) => handleInputChange('desconto', parseFloat(e.target.value) || 0)} 
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="frete">Frete (R$)</Label>
                  <Input 
                    id="frete" 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="w-32 text-right"
                    value={novaVenda.frete} 
                    onChange={(e) => handleInputChange('frete', parseFloat(e.target.value) || 0)} 
                  />
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total da Venda:</span>
                  <span>R$ {totalVenda.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={novaVenda.itens.length === 0}>
              <DollarSign className="mr-2 h-4 w-4" /> Registrar Venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NovaVendaDialog;
