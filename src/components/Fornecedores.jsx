import { useState } from 'react'
import { Building2, Plus, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const Fornecedores = () => {
  const [fornecedores] = useState([
    { id: 1, nome: 'Vinícola ABC', contato: 'Carlos Silva', email: 'carlos@vinicola-abc.com', telefone: '(11) 3333-3333', cidade: 'São Paulo', status: 'Ativo', ultimoPedido: '2024-10-01' },
    { id: 2, nome: 'Vinícola XYZ', contato: 'Ana Costa', email: 'ana@vinicola-xyz.com', telefone: '(11) 4444-4444', cidade: 'Campinas', status: 'Ativo', ultimoPedido: '2024-10-03' },
    { id: 3, nome: 'Vinícola Nacional', contato: 'Pedro Santos', email: 'pedro@nacional.com', telefone: '(11) 5555-5555', cidade: 'Ribeirão Preto', status: 'Ativo', ultimoPedido: '2024-10-05' }
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Fornecedores</h1>
          <p className="text-gray-600">Gerencie seus fornecedores</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fornecedores</p>
                <p className="text-2xl font-bold">{fornecedores.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{fornecedores.filter(f => f.status === 'Ativo').length}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos Mês</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Pedido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{fornecedor.nome}</p>
                      <p className="text-sm text-gray-500">{fornecedor.contato}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="mr-1 h-3 w-3" />
                        {fornecedor.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="mr-1 h-3 w-3" />
                        {fornecedor.telefone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3" />
                      {fornecedor.cidade}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {fornecedor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(fornecedor.ultimoPedido).toLocaleDateString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Fornecedores
