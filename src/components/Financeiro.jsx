import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Financeiro = () => {
  const [fluxoCaixa] = useState([
    { mes: 'Jun', receitas: 15000, despesas: 8000, lucro: 7000 },
    { mes: 'Jul', receitas: 18000, despesas: 9500, lucro: 8500 },
    { mes: 'Ago', receitas: 22000, despesas: 11000, lucro: 11000 },
    { mes: 'Set', receitas: 19000, despesas: 10200, lucro: 8800 },
    { mes: 'Out', receitas: 25000, despesas: 12500, lucro: 12500 }
  ])

  const [contasReceber] = useState([
    { id: 1, cliente: 'João Silva', valor: 450.00, vencimento: '2024-10-15', status: 'Pendente' },
    { id: 2, cliente: 'Maria Santos', valor: 280.00, vencimento: '2024-10-20', status: 'Pendente' },
    { id: 3, cliente: 'Pedro Costa', valor: 320.00, vencimento: '2024-10-25', status: 'Vencido' }
  ])

  const [contasPagar] = useState([
    { id: 1, fornecedor: 'Vinícola ABC', valor: 1250.00, vencimento: '2024-10-10', status: 'Pago' },
    { id: 2, fornecedor: 'Energia Elétrica', valor: 380.00, vencimento: '2024-10-15', status: 'Pendente' },
    { id: 3, fornecedor: 'Aluguel', valor: 2500.00, vencimento: '2024-10-05', status: 'Pago' }
  ])

  const getStatusBadge = (status) => {
    const variants = {
      'Pago': 'bg-green-100 text-green-800',
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Vencido': 'bg-red-100 text-red-800'
    }
    return variants[status] || variants['Pendente']
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financeiro</h1>
        <p className="text-gray-600">Controle financeiro da adega</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receitas Mês</p>
                <p className="text-2xl font-bold text-green-600">R$ 25.000</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Despesas Mês</p>
                <p className="text-2xl font-bold text-red-600">R$ 12.500</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lucro Líquido</p>
                <p className="text-2xl font-bold text-blue-600">R$ 12.500</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo Caixa</p>
                <p className="text-2xl font-bold">R$ 8.750</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fluxoCaixa}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']} />
              <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="despesas" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="receber" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
        </TabsList>

        <TabsContent value="receber">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasReceber.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium">{conta.cliente}</TableCell>
                      <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                      <TableCell>{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(conta.status)}>
                          {conta.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagar">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contasPagar.map((conta) => (
                    <TableRow key={conta.id}>
                      <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                      <TableCell>R$ {conta.valor.toFixed(2)}</TableCell>
                      <TableCell>{new Date(conta.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(conta.status)}>
                          {conta.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Financeiro
