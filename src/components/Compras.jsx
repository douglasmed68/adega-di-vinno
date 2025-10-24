import { useState } from 'react'
import { ShoppingBag, Plus, Truck, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const Compras = () => {
  const [compras] = useState([
    { id: 1, pedido: 'PC001', data: '2024-10-01', fornecedor: 'Vinícola ABC', produto: 'Cabernet Sauvignon', qtd: 50, valor: 1250.00, status: 'Recebido' },
    { id: 2, pedido: 'PC002', data: '2024-10-03', fornecedor: 'Vinícola XYZ', produto: 'Chardonnay', qtd: 30, valor: 900.00, status: 'Em Trânsito' },
    { id: 3, pedido: 'PC003', data: '2024-10-05', fornecedor: 'Vinícola Nacional', produto: 'Espumante', qtd: 25, valor: 875.00, status: 'Pendente' }
  ])

  const getStatusBadge = (status) => {
    const variants = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Em Trânsito': 'bg-blue-100 text-blue-800',
      'Recebido': 'bg-green-100 text-green-800'
    }
    return variants[status] || variants['Pendente']
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Compras</h1>
          <p className="text-gray-600">Gerencie pedidos e fornecedores</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Mês</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Trânsito</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recebidos</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos de Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Qtd</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compras.map((compra) => (
                <TableRow key={compra.id}>
                  <TableCell className="font-medium">{compra.pedido}</TableCell>
                  <TableCell>{new Date(compra.data).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{compra.fornecedor}</TableCell>
                  <TableCell>{compra.produto}</TableCell>
                  <TableCell>{compra.qtd}</TableCell>
                  <TableCell>R$ {compra.valor.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(compra.status)}>
                      {compra.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Compras
