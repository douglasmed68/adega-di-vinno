import { useState } from 'react'
import { Users, Plus, Star, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const Clientes = () => {
  const [clientes] = useState([
    { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999', categoria: 'Premium', totalCompras: 2250.00, ultimaCompra: '2024-10-06' },
    { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 88888-8888', categoria: 'Gold', totalCompras: 1890.00, ultimaCompra: '2024-10-05' },
    { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '(11) 77777-7777', categoria: 'Silver', totalCompras: 1560.00, ultimaCompra: '2024-10-04' }
  ])

  const getCategoryBadge = (categoria) => {
    const variants = {
      'Premium': 'bg-purple-100 text-purple-800',
      'Gold': 'bg-yellow-100 text-yellow-800',
      'Silver': 'bg-gray-100 text-gray-800'
    }
    return variants[categoria] || variants['Silver']
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-600">Gerencie sua base de clientes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold">{clientes.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Premium</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gold</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Silver</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Star className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Total Compras</TableHead>
                <TableHead>Última Compra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.nome}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {cliente.telefone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryBadge(cliente.categoria)}>
                      {cliente.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell>R$ {cliente.totalCompras.toFixed(2)}</TableCell>
                  <TableCell>{new Date(cliente.ultimaCompra).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Clientes
