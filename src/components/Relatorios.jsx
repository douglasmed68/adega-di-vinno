import { useState } from 'react'
import { BarChart3, Download, Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Relatorios = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  
  const vendasPorCategoria = [
    { categoria: 'Tinto', vendas: 45, valor: 2250 },
    { categoria: 'Branco', vendas: 32, valor: 1760 },
    { categoria: 'Rosé', vendas: 28, valor: 2100 },
    { categoria: 'Espumante', vendas: 25, valor: 1625 }
  ]

  const vendasMensais = [
    { mes: 'Jun', vendas: 15000 },
    { mes: 'Jul', vendas: 18000 },
    { mes: 'Ago', vendas: 22000 },
    { mes: 'Set', vendas: 19000 },
    { mes: 'Out', vendas: 25000 }
  ]

  const topProdutos = [
    { nome: 'Cabernet Sauvignon', vendas: 25, cor: '#8B0000' },
    { nome: 'Chardonnay', vendas: 20, cor: '#DC143C' },
    { nome: 'Malbec', vendas: 18, cor: '#B22222' },
    { nome: 'Espumante Brut', vendas: 15, cor: '#CD5C5C' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-gray-600">Análises e relatórios gerenciais</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendasPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#8B0000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={vendasMensais}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Vendas']} />
                <Line type="monotone" dataKey="vendas" stroke="#8B0000" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProdutos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nome, vendas }) => `${nome}: ${vendas}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="vendas"
                >
                  {topProdutos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Total de Vendas</span>
                <span className="text-lg font-bold text-green-600">R$ 25.000</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Produtos Vendidos</span>
                <span className="text-lg font-bold">130 unidades</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Ticket Médio</span>
                <span className="text-lg font-bold">R$ 192,31</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">Margem Média</span>
                <span className="text-lg font-bold text-blue-600">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Relatorios
