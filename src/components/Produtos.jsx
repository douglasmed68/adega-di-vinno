import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalSync } from '../services/localSyncService.jsx';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ResetData from './ResetData';
import BarcodeScanner from './BarcodeScanner';
import SyncStatus from './SyncStatus';
import BarcodeDisplay from './BarcodeDisplay';
import barcodeService from '../services/barcodeService';

const ProductForm = ({ product, setProduct, isEdit = false }) => {
  const handleInputChange = useCallback((field, value) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  }, [setProduct]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Label htmlFor="codigo_barras">Código de Barras (EAN-13)</Label>
        <Input
          id="codigo_barras"
          value={product.codigo_barras || ''}
          onChange={(e) => handleInputChange('codigo_barras', e.target.value)}
          placeholder="Opcional. Ex: 7891234567890"
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
        <Label htmlFor="preco_venda">Preço de Venda (R$)</Label>
        <Input
          id="preco_venda"
          type="number"
          step="0.01"
          value={product.preco_venda || ''}
          onChange={(e) => handleInputChange('preco_venda', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
        />
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
        <Label htmlFor="preco_custo">Preço de Custo (R$)</Label>
        <Input
          id="preco_custo"
          type="number"
          step="0.01"
          value={product.preco_custo || ''}
          onChange={(e) => handleInputChange('preco_custo', parseFloat(e.target.value) || 0)}
          placeholder="0.00"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="estoqueMin">Estoque Mínimo</Label>
        <Input
          id="estoqueMin"
          type="number"
          value={product.estoqueMin || ''}
          onChange={(e) => handleInputChange('estoqueMin', parseInt(e.target.value) || 0)}
          placeholder="10"
        />
      </div>
      {/* Adicione mais campos conforme necessário */}
    </div>
  );
};

const Produtos = () => {
  const { produtos, addProduto, updateProduto, deleteProduto, syncStatus } = useLocalSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const initialProductState = useMemo(() => ({
    nome: '',
    codigo_barras: '',
    tipo: '',
    preco_venda: 0,
    regiao: '',
    safra: '',
    teorAlcoolico: '',
    preco_custo: 0,
    estoqueMin: 0,
    // Adicione outros campos aqui
  }), []);

  const [currentProduct, setCurrentProduct] = useState(initialProductState);

  const handleAddNew = () => {
    setEditingProduct(null);
    setCurrentProduct(initialProductState);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setCurrentProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await deleteProduto(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduto(editingProduct.id, currentProduct);
    } else {
      await addProduto(currentProduct);
    }
    setIsFormOpen(false);
    setEditingProduct(null);
    setCurrentProduct(initialProductState);
  };

  const filteredProdutos = useMemo(() => 
    produtos.filter(p => 
      (p.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.codigo_barras?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (p.tipo?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ), [produtos, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catálogo de produtos da adega.</p>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus status={syncStatus} />
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, código..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filtros podem ser adicionados aqui */}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código de Barras</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Preço de Venda</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProdutos.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.nome}</TableCell>
                  <TableCell>{product.codigo_barras}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.tipo}</Badge>
                  </TableCell>
                  <TableCell>R$ {product.preco_venda.toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(product)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Diálogo para Adicionar/Editar Produto */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
            <DialogDescription>
              Preencha os detalhes do produto abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="py-4">
              <ProductForm product={currentProduct} setProduct={setCurrentProduct} isEdit={!!editingProduct} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação para Excluir */}
      <Dialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o produto "{productToDelete?.nome}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produtos;

